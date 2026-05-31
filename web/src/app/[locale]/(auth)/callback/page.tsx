"use client";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useEffect } from "react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error("Code exchange failed:", error);
          router.push("/login");
        } else {
          router.push("/wikis");
        }
      });
    } else {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_IN") {
          router.push("/wikis");
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">{t("completingSignIn")}</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackContent />
    </Suspense>
  );
}
