import type { Metadata } from "next";
import { CinematicAbout } from "@/components/about/cinematic-about";

export const metadata: Metadata = {
  title: "About HawkLife",
  description:
    "A cinematic product reveal for HawkLife, the connected student platform for St. Joseph's Preparatory School.",
};

export default function AboutPage() {
  return <CinematicAbout />;
}
