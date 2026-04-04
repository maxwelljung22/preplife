// app/page.tsx
import { redirect } from "next/navigation";
import { HomePage } from "@/components/home/home-page";
import { getSession } from "@/lib/session";

export const metadata = {
  title: "HawkLife — St. Joseph's Preparatory School",
  description:
    "The official student platform for St. Joseph's Preparatory School. Manage clubs, track NHS hours, view events, and more.",
};

export default async function RootPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/dashboard");
  }
  return <HomePage />;
}
