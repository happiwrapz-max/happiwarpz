import BotanicalAuthCard from "@/components/auth/BotanicalAuthCard";

export const metadata = {
  title: "Sign In — Happiwrapz Gift Atelier",
  description: "Access your Happiwrapz account, active order requests, and saved addresses.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#E3E8E3] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 selection:bg-[#E10600]/15 selection:text-[#E10600]">
      <BotanicalAuthCard initialMode="login" />
    </div>
  );
}
