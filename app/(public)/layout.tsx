import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </nav>

        <main className="animate-in fade-in zoom-in-95 duration-500">
          {children}
        </main>

        <footer className="mt-12 pt-8 border-t border-orange-200/50 text-center text-sm text-gray-500 animate-in fade-in duration-700 delay-500">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Link href="/privacy" className="hover:text-orange-600 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-orange-600 transition-colors">
              Terms of Service
            </Link>
          </div>
          <p>© {new Date().getFullYear()} IN Sintonia. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
