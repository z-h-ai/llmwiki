import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ArrowRight, BookOpen, FileText, PenTool, Search, GitBranch } from 'lucide-react'
import { AuthRedirect } from './AuthRedirect'
import { MotionDiv, MotionP } from './LandingMotion'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]
const isLocal = process.env.NEXT_PUBLIC_MODE === 'local'
const ctaHref = isLocal ? '/wikis' : '/signup'

const WIKI_TREE = [
  { labelKey: 'overview', active: true, depth: 0 },
  { labelKey: 'treeConcepts', depth: 0, folder: true },
  { labelKey: 'treeAttention', depth: 1 },
  { labelKey: 'treeScaling', depth: 1 },
  { labelKey: 'treeEntities', depth: 0, folder: true },
  { labelKey: 'treeTransformer', depth: 1 },
  { labelKey: 'treeSources', depth: 0, folder: true },
  { labelKey: 'treeLog', depth: 0 },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'LLM Wiki',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://llmwiki.app',
  description:
    "Free, open-source implementation of Karpathy's LLM Wiki. Upload documents and build a compounding wiki directly via Claude.",
}

export default async function LandingPage() {
  const t = await getTranslations('landing')
  const tc = await getTranslations('common')

  return (
    <div className="min-h-svh bg-background text-foreground">
      <AuthRedirect />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-10 h-14 bg-background/80 backdrop-blur-sm">
        <span className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="currentColor" className="text-foreground" />
            <polyline points="11,8 21,16 11,24" fill="none" stroke="currentColor" className="text-background" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          LLM Wiki
        </span>
        <div className="flex items-center gap-5">
          <a
            href="https://github.com/lucasastorian/llmwiki"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {tc('github')}
          </a>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {tc('signIn')}
          </Link>
          <Link
            href={ctaHref}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {tc('getStarted')}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 lg:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <p className="text-sm text-muted-foreground mb-4">
              {t('openSource')}{' '}
              <a
                href="https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f"
                className="text-foreground underline underline-offset-2 decoration-foreground/30 hover:decoration-foreground transition-colors"
              >
                {t('karpathyLLMWiki')}
              </a>
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              {t('heroTitle')}
            </h1>
          </MotionDiv>

          <MotionP
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.12, ease }}
            className="mt-6 text-base sm:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed"
          >
            {t('heroSubtitle')}
          </MotionP>

          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
            className="mt-9 flex items-center justify-center gap-3"
          >
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {tc('getStarted')}
              <ArrowRight className="size-3.5 opacity-60" />
            </Link>
            <a
              href="https://github.com/lucasastorian/llmwiki"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              {tc('github')}
            </a>
          </MotionDiv>
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 lg:px-10 pb-28">
        <MotionDiv
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4, ease }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-border" />
                <div className="size-2.5 rounded-full bg-border" />
                <div className="size-2.5 rounded-full bg-border" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-muted-foreground/50 font-mono">
                  llmwiki.app
                </span>
              </div>
              <div className="w-14" />
            </div>

            <div className="flex min-h-[400px]">
              {/* Sidebar */}
              <div className="w-52 shrink-0 border-r border-border p-3 hidden sm:block">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                  <Search className="size-3 text-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground/30">{t('searchWiki')}</span>
                </div>
                <div className="space-y-0.5">
                  {WIKI_TREE.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                        item.active
                          ? 'bg-accent font-medium text-foreground'
                          : 'text-muted-foreground'
                      }`}
                      style={{ paddingLeft: `${item.depth * 14 + 8}px` }}
                    >
                      {item.folder ? (
                        <GitBranch className="size-3 opacity-40" />
                      ) : (
                        <FileText className="size-3 opacity-40" />
                      )}
                      {t(item.labelKey)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-8 sm:p-10">
                <div className="max-w-lg">
                  <h2 className="text-xl font-semibold tracking-tight mb-1">{t('overview')}</h2>
                  <p className="text-xs text-muted-foreground mb-6">
                    {t('sourcesCount')} &middot; {t('lastUpdated')}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {t.rich('previewText', {
                      sources: (chunks) => <span className="font-medium text-foreground">{chunks}</span>
                    })}
                  </p>
                  <h3 className="text-sm font-semibold mt-5 mb-2">{t('keyFindings')}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {t.rich('keyFindingsText', {
                      scalingLaws: (chunks) => <span className="font-medium text-foreground">{chunks}</span>
                    })}
                  </p>
                  <h3 className="text-sm font-semibold mt-5 mb-2">{t('recentUpdates')}</h3>
                  <ul className="space-y-1 ml-4">
                    <li className="text-sm text-muted-foreground list-disc">{t('update1')}</li>
                    <li className="text-sm text-muted-foreground list-disc">{t('update2')}</li>
                    <li className="text-sm text-muted-foreground list-disc">{t('update3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto border-t border-border" />

      {/* Three Layers */}
      <section className="px-6 lg:px-10 py-24">
        <div className="max-w-5xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('threeLayers')}</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              {t('threeLayersDesc')}
            </p>
          </MotionDiv>

          <div className="grid sm:grid-cols-3 gap-6">
            {([
              {
                icon: FileText,
                title: t('rawSources'),
                body: t('rawSourcesDesc'),
              },
              {
                icon: BookOpen,
                title: t('theWiki'),
                body: t('theWikiDesc'),
              },
              {
                icon: PenTool,
                title: t('theSchema'),
                body: t('theSchemaDesc'),
              },
            ] as const).map((item, i) => (
              <MotionDiv
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <item.icon className="size-5 text-muted-foreground mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto border-t border-border" />

      {/* How It Works */}
      <section className="px-6 lg:px-10 py-24">
        <div className="max-w-5xl mx-auto">
          <MotionDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('howItWorks')}</h2>
          </MotionDiv>

          <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
            {([
              {
                step: '01',
                title: t('ingest'),
                body: t('ingestDesc'),
              },
              {
                step: '02',
                title: t('query'),
                body: t('queryDesc'),
              },
              {
                step: '03',
                title: t('lint'),
                body: t('lintDesc'),
              },
            ] as const).map((item, i) => (
              <MotionDiv
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="text-xs font-mono text-muted-foreground/40 mb-3 block">{item.step}</span>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto border-t border-border" />

      {/* Quote */}
      <section className="px-6 lg:px-10 py-24">
        <MotionDiv
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <blockquote className="text-lg sm:text-xl leading-relaxed text-foreground/80 italic">
            &ldquo;{t('quote')}&rdquo;
          </blockquote>
          <p className="mt-5 text-sm text-muted-foreground">
            {t('quoteAuthor')}
          </p>
        </MotionDiv>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto border-t border-border" />

      {/* CTA */}
      <section className="px-6 lg:px-10 py-24">
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">{t('ctaTitle')}</h2>
          <p className="text-muted-foreground mb-8">
            {t('ctaSubtitle')}
          </p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t('getStartedFree')}
            <ArrowRight className="size-3.5 opacity-60" />
          </Link>
        </MotionDiv>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 lg:px-10 py-6 flex items-center justify-between text-xs text-muted-foreground/50">
        <span>LLM Wiki</span>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-muted-foreground transition-colors">{tc('terms')}</Link>
          <Link href="/privacy" className="hover:text-muted-foreground transition-colors">{tc('privacy')}</Link>
          <span>{tc('freeOpenSource')} &middot; Apache 2.0</span>
        </div>
      </footer>
    </div>
  )
}
