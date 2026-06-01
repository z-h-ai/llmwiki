'use client'

import { SyncBanner } from '@/components/layout/SyncBanner'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh overflow-hidden bg-background flex flex-col">
      <SyncBanner />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
