import BotanicalAuthCard from "@/components/auth/BotanicalAuthCard";

export const metadata = {
  title: "Create Account — Happiwrapz Gift Atelier",
  description: "Join Happiwrapz to track bespoke ribbon flower commissions and save gift addresses.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#E3E8E3] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 selection:bg-[#E10600]/15 selection:text-[#E10600]">
      <BotanicalAuthCard initialMode="signup" />
    </div>
  );
}
