import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[60%_40%]">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Logo />
            MantrixFlow
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-destructive">
                Authentication Error
              </h1>
              <p className="text-muted-foreground text-sm">
                Sorry, there was an error during the authentication process.
                This could be due to an invalid or expired authentication code.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">Try Again</Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/">Go Home</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If you continue to experience issues, please contact support.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/p1.jpg"
          alt="Login Background"
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
