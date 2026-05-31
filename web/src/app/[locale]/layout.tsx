import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { OpenReplayTracker } from "@/components/OpenReplay";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL("https://llmwiki.app"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://llmwiki.app",
      siteName: "LLM Wiki",
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "LLM Wiki" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og.png"],
    },
  };
}

const themeScript = `
  (function() {
    try {
      var storageKey = 'theme';
      var stored = localStorage.getItem(storageKey);
      var isValid = stored === 'light' || stored === 'dark';
      var theme = isValid ? stored : 'light';

      if (!isValid) {
        localStorage.setItem(storageKey, theme);
      }

      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
    } catch (e) {
      document.documentElement.classList.add('light');
      document.documentElement.style.colorScheme = 'dark';
    }
  })();
`;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'zh' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
          suppressHydrationWarning
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="theme"
          >
            {children}
            <Toaster richColors />
            <OpenReplayTracker />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
