import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const baseMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Sketchboard",
    template: "%s | Sketchboard",
  },
  description:
    "Sketchboard is a collaborative whiteboard tool for drawing and brainstorming together in real time.",
  icons: {
    icon: "/images/icons/logo.png",
    apple: "/images/icons/logo.png",
  },
  applicationName: "Sketchboard",
};

export const generateRoomMetadata: Metadata = {
  title: "Join Room | Sketchboard",
  description: "Join a collaborative drawing room on Sketchboard.",
};
