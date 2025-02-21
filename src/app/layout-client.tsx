"use client";

import { GlobalSettingModal } from "@/components/layouts/global-setting-modal";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/react";
import { PropsWithChildren, Suspense } from "react";

export default function LayoutClient({ children }: PropsWithChildren) {
  return (
    <Suspense>
      <ThemeProvider attribute="data-theme" defaultTheme="system">
        <NuqsAdapter>
          {children}
          <GlobalSettingModal />
        </NuqsAdapter>
      </ThemeProvider>
    </Suspense>
  );
}
