import { SignupForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[60%_40%]">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <Logo />
            MantrixFlow
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xl">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
      </div>
    </div>
  );
}
