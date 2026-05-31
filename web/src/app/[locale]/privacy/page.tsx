import { getTranslations } from 'next-intl/server'
import { privacy } from '@/content/privacy'
import { PolicyPage } from '@/components/PolicyPage'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('privacyTitle'),
    description: t('privacyDescription'),
  }
}

export default function PrivacyPage() {
  return <PolicyPage content={privacy} />
}
