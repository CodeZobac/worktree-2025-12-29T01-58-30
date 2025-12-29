import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import BlurText from "@/components/BlurText";

export default async function LoginPage() {
  const session = await auth();

  // Redirect if already logged in
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <BlurText
              text="Family Recipes"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-4xl font-bold text-gray-900 mb-2"
            />
            <p className="text-gray-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Share and discover your family's favorite recipes
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
    </div>
  );
}
