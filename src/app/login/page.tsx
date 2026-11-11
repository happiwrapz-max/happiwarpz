import { redirect } from "next/navigation";

export const metadata = {
  title: "Client Portal & Sign In — Happiwrapz",
  description: "Access your Happiwrapz account, bespoke ribbon flower commissions, and saved delivery addresses in Coimbatore, Tamil Nadu.",
};

export default function LoginPage() {
  redirect("/?auth=login");
}
