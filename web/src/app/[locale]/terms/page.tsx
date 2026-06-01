import { getTranslations } from 'next-intl/server'
import { termsByLocale, type PolicyLocale } from '@/content/terms'
import { PolicyPage } from '@/components/PolicyPage'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('termsTitle'),
    description: t('termsDescription'),
  }
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const content = termsByLocale[(locale as PolicyLocale) in termsByLocale ? locale as PolicyLocale : 'zh']
  return <PolicyPage content={content} />
}
