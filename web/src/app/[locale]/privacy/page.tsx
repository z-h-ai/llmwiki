import { getTranslations } from 'next-intl/server'
import { privacyByLocale, type PrivacyLocale } from '@/content/privacy'
import { PolicyPage } from '@/components/PolicyPage'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('privacyTitle'),
    description: t('privacyDescription'),
  }
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const content = privacyByLocale[(locale as PrivacyLocale) in privacyByLocale ? locale as PrivacyLocale : 'zh']
  return <PolicyPage content={content} />
}
