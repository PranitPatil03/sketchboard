"use server";

import { z } from "zod";
import client from "@repo/db/client";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

function generateAccessToken(userId: string, email: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is ABSOLUTELY REQUIRED and not set");
  }
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export async function joinRoom(data: { id: string }) {
  try {
    const room = await client.room.findUnique({
      where: { id: data.id },
    });

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "User not authenticated" };
    }

    const accessToken = generateAccessToken(session.user.id, session.user.email);

    (await cookies()).set("accessToken", accessToken, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      secure: false,
    });

    return {
      success: true,
      room: room,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid room code format" };
    }
    console.error("Failed to join room:", error);
    return { success: false, error: "Failed to join room" };
  }
}

export async function createRoom() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "User not found" };
    }

    const room = await client.room.create({
      data: {
        adminId: session.user.id,
      },
    });

    return {
      success: true,
      room,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid room name format",
        errorMessage: error.message,
      };
    }
    console.error("Failed to create room:", error);
    return { success: false, error: "Failed to create room" };
  }
}

export async function getRoom(data: { id: string }) {
  try {
    const room = await client.room.findUnique({
      where: { id: data.id },
      include: { Shape: true },
    });

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "User not authenticated" };
    }

    const accessToken = generateAccessToken(session.user.id, session.user.email);

    (await cookies()).set("accessToken", accessToken, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      secure: false,
    });

    return {
      success: true,
      room: room,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid room code format" };
    }
    console.error("Failed to join room:", error);
    return { success: false, error: "Failed to join room" };
  }
}

export async function deleteRoom(data: { id: string }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Authentication required" };
    }

    const room = await client.room.findUnique({
      where: { id: data.id },
      include: { admin: true },
    });

    if (!room) {
      return { success: false, error: "Room not found" };
    }

    if (room.adminId !== session.user.id) {
      return {
        success: false,
        error: "Unauthorized: Only the room creator can delete this room",
      };
    }

    await client.shape.deleteMany({
      where: { roomId: room.id },
    });

    await client.room.delete({
      where: { id: room.id },
    });

    return { success: true, message: "Room deleted successfully" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid room name format" };
    }
    console.error("Failed to delete room:", error);
    return { success: false, error: "Failed to delete room" };
  }
}

export async function getUserRooms() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "User not authenticated" };
    }

    const rooms = await client.room.findMany({
      where: { adminId: session.user.id },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, rooms };
  } catch (error) {
    console.error("Failed to fetch user rooms:", error);
    return { success: false, error: "Failed to fetch user rooms" };
  }
}
