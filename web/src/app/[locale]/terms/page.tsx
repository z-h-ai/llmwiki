import { getTranslations } from 'next-intl/server'
import { terms } from '@/content/terms'
import { PolicyPage } from '@/components/PolicyPage'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('termsTitle'),
    description: t('termsDescription'),
  }
}

export default function TermsPage() {
  return <PolicyPage content={terms} />
}
