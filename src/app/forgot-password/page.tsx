import { redirect } from "next/navigation";

export const metadata = {
  title: "Password Recovery — Happiwrapz",
  description: "Reset your password securely to access your Happiwrapz account.",
};

export default function ForgotPasswordPage() {
  redirect("/?auth=forgot");
}
