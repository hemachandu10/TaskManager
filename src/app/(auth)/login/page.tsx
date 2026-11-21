import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — TaskVault",
  description: "Sign in to TaskVault to manage your saved tasks, problems, and tutorials.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <LoginForm />
    </div>
  );
}
