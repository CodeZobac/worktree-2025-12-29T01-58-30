import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import BlurText from "@/components/BlurText";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <BlurText
              text="IN Sintonia"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-4xl font-bold text-gray-900 mb-2"
            />
            <p className="text-gray-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Organize and share your family's favorite recipes together
            </p>
          </div>

          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <GoogleSignInButton />
          </div>

          <p className="text-center text-sm text-gray-500 mt-6 animate-in fade-in duration-700 delay-700">
            Sign in to start sharing recipes with your family
          </p>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500 animate-in fade-in duration-700 delay-1000">
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-orange-600 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-orange-600 transition-colors">
            Terms of Service
          </Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} IN Sintonia. All rights reserved.</p>
      </footer>
    </div>
  );
}
