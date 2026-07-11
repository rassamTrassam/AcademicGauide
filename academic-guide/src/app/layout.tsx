import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingCompareDock } from "@/components/FloatingCompareDock";
import { ThemeProvider } from "@/components/ThemeProvider";
import { createClient } from "@/utils/supabase/server";
export const metadata: Metadata = {
  title: {
    default: "الدليل الأكاديمي اليمني | استكشف البرامج الجامعية",
    template: "%s | الدليل الأكاديمي اليمني",
  },
  description:
    "منصة شاملة للطلاب اليمنيين للبحث في البرامج التعليمية والجامعات ومقارنتها وتقييمها.",
  keywords: ["جامعات يمنية", "تعليم", "بكالوريوس", "ماجستير", "برامج دراسية"],
  openGraph: {
    locale: "ar_YE",
    type: "website",
    siteName: "الدليل الأكاديمي اليمني",
  },
};

import { AuthModal } from "@/components/AuthModal";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-arabic min-h-dvh flex flex-col">
        <ThemeProvider>
          <Navbar initialUser={user} />
          <main className="flex-1">{children}</main>
          <FloatingCompareDock />
          <Footer />
          <AuthModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
