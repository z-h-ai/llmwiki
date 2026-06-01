'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { RefreshCw } from 'lucide-react'

const isLocal = process.env.NEXT_PUBLIC_MODE === 'local'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface SyncStatus {
  syncing: boolean
  new: number
  modified: number
  deleted: number
  scanned: number
  total: number
}

export function SyncBanner() {
  const t = useTranslations('sync')
  const [status, setStatus] = React.useState<SyncStatus | null>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    if (!isLocal) return

    let active = true

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/v1/sync-status`)
        if (!active) return
        const data: SyncStatus = await res.json()
        setStatus(data)
        if (data.syncing) {
          setVisible(true)
        }
      } catch {
        // API not ready yet, retry on next interval
      }
    }

    poll()
    const interval = setInterval(poll, 2000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  // Hide after syncing completes (with brief delay to show "complete" state)
  React.useEffect(() => {
    if (status && !status.syncing && visible) {
      const timer = setTimeout(() => setVisible(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [status, visible])

  if (!isLocal || !visible || !status) return null

  const parts: string[] = []
  if (status.new > 0) parts.push(t('newFiles', { count: status.new }))
  if (status.modified > 0) parts.push(t('modifiedFiles', { count: status.modified }))
  if (status.deleted > 0) parts.push(t('deletedFiles', { count: status.deleted }))

  const syncing = status.syncing

  return (
    <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-1.5 flex items-center justify-center gap-2 text-sm text-blue-700 dark:text-blue-300">
      <RefreshCw className={`size-3.5 ${syncing ? 'animate-spin' : ''}`} />
      <span>
        {syncing
          ? t('syncing', { details: parts.join(t('separator')), progress: `${status.scanned}/${status.total}` })
          : t('syncComplete')}
      </span>
    </div>
  )
}
