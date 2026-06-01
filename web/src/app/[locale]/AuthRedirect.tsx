'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useUserStore } from '@/stores'

const isLocal = process.env.NEXT_PUBLIC_MODE === 'local'

export function AuthRedirect() {
  const user = useUserStore((s) => s.user)
  const router = useRouter()

  useEffect(() => {
    if (isLocal) {
      router.replace('/wikis')
      return
    }
    if (user) router.replace('/wikis')
  }, [user, router])

  return null
}
