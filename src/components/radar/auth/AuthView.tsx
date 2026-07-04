import AuthForm from "@/components/radar/auth/AuthForm";

export default function AuthView() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col justify-center py-8">
      <AuthForm />
    </div>
  );
}
