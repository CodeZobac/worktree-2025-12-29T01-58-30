import type { Metadata } from "next";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/toast";
import "./globals.css";
import "@/react-trix/styles/trix.css";

export const metadata: Metadata = {
  title: "IN Sintonia",
  description: "Organize and share your family's favorite recipes together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthSessionProvider>
          {children}
          <ToastProvider />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
