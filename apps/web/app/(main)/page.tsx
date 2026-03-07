import CanvasBoard from "@/components/canvas/CanvasBoard";
import type { Metadata } from "next";
import { baseMetadata } from "@/utils/metadata";

export const metadata: Metadata = {
  ...baseMetadata,
  title: "Sketchboard | Hand-drawn look & feel • Collaborative • Secure",
  description:
    "Create beautiful hand-drawn sketches and diagrams with real-time collaboration. End-to-end encrypted, privacy-focused collaborative whiteboard. No account required to start drawing.",
  openGraph: {
    ...baseMetadata.openGraph,
    title: "Sketchboard | Hand-drawn look & feel • Collaborative • Secure",
    description:
      "Create beautiful hand-drawn sketches and diagrams with real-time collaboration. End-to-end encrypted, privacy-focused collaborative whiteboard.",
  },
  twitter: {
    ...baseMetadata.twitter,
    title: "Sketchboard | Hand-drawn look & feel • Collaborative • Secure",
    description:
      "Create beautiful hand-drawn sketches and diagrams with real-time collaboration. End-to-end encrypted, privacy-focused collaborative whiteboard.",
  },
};

export default async function Home() {
  return (
    <CanvasBoard />
  )
}