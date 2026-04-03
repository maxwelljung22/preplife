// app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HomePage } from "@/components/home/home-page";

export const metadata = {
  title: "PrepLife — St. Joseph's Preparatory School",
  description:
    "The official student platform for St. Joseph's Preparatory School. Manage clubs, track NHS hours, view events, and more.",
};

export default async function RootPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return <HomePage />;
}
