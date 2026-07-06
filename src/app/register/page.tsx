import type { Metadata } from "next";
import LandingShell from "@/components/landing/LandingShell";
import RegistrationForm from "@/components/landing/RegistrationForm";

export const metadata: Metadata = {
  title: "会員登録",
  description: "SneakerDrop メンバー登録",
};

export default function RegisterPage() {
  return (
    <LandingShell>
      <RegistrationForm />
    </LandingShell>
  );
}
