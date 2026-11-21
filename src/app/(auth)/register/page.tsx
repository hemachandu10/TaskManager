import { RegisterForm } from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — TaskVault",
  description: "Register for TaskVault to save unfinished coding problems and learning materials.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <RegisterForm />
    </div>
  );
}
