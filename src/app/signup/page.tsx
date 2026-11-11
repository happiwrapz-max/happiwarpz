import { redirect } from "next/navigation";

export const metadata = {
  title: "Client Registry & Membership — Happiwrapz",
  description: "Join the Happiwrapz circle to track bespoke ribbon bouquets and save delivery addresses.",
};

export default function SignupPage() {
  redirect("/?auth=signup");
}
