import type { Metadata } from "next";
import LandingShell from "@/components/landing/LandingShell";
import RegistrationForm from "@/components/landing/RegistrationForm";

export const metadata: Metadata = {
  title: "Join the Drop",
  description: "SneakerDrop メンバー登録",
};

export default function RegisterPage() {
  return (
    <LandingShell>
      <RegistrationForm />
    </LandingShell>
  );
}
