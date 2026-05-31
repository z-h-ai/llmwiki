import { getTranslations } from 'next-intl/server'
import { LoginForm } from './LoginForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('loginTitle'),
    description: t('loginDescription'),
    openGraph: {
      title: t('loginTitle'),
      description: t('loginDescription'),
    },
  }
}

export default function LoginPage() {
  return <LoginForm />
}
