// rebuild trigger v3
import Link from 'next/link';
import { Upload, Palette, Sparkles, ArrowRight } from 'lucide-react';
import { THEMES } from '@picflow/shared';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';

// Pick a diverse set of themes to show in the preview strip
const PREVIEW_SLUGS = [
  'spring-blossom',
  'astronaut',
  'forest-fairy',
  'studio-white',
  'oil-portrait',
  'cloud-kingdom',
  'safari-baby',
  'watercolor',
  'winter-wonder',
  'japanese-garden',
];

const previewThemes = THEMES.filter((t) => PREVIEW_SLUGS.includes(t.slug));

const STEPS = [
  {
    icon: Upload,
    label: 'Upload photos',
    description: 'Drop 3–10 clear photos of your baby',
  },
  {
    icon: Palette,
    label: 'Pick a theme',
    description: 'Choose from 30+ artistic styles',
  },
  {
    icon: Sparkles,
    label: 'Get 4 portraits',
    description: 'Ready in minutes, yours to keep',
  },
];

export default function HomePage(): React.ReactElement {
  return (
    <PageContainer>
      {/* ── Hero ── */}
      <section className="flex flex-col items-center gap-5 pb-10 pt-12 text-center sm:pt-20">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-border bg-accent-subtle px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-accent">
          <Sparkles className="h-3 w-3" aria-hidden />
          AI Baby Portraits
        </span>

        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-text-primary sm:text-5xl">
          Baby photos turned into{' '}
          <span className="text-accent">magical portraits</span>
        </h1>

        <p className="max-w-lg text-body text-text-secondary">
          Upload a few photos of your baby, pick an artistic style, and receive
          4 stunning portrait variants in minutes. Free themes available — no
          subscription needed.
        </p>

        <Button asChild size="lg" className="mt-2 gap-2 px-8">
          <Link href="/create">
            Start creating
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>

        <p className="text-caption text-text-tertiary">
          7 free themes · No credit card required
        </p>
      </section>

      {/* ── How it works ── */}
      <section className="mb-16">
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.label}
              className="flex flex-col items-center gap-2 rounded-xl border border-border-default bg-bg-surface p-4 text-center sm:p-5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-subtle">
                <step.icon className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary">
                Step {i + 1}
              </span>
              <p className="text-sm font-medium text-text-primary">{step.label}</p>
              <p className="hidden text-caption text-text-tertiary sm:block">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Theme preview strip ── */}
      <section className="mb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-section font-medium text-text-primary">
            30+ styles to choose from
          </h2>
          <Button variant="ghost" asChild size="sm" className="gap-1 text-accent">
            <Link href="/create">
              Browse all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-5">
          {previewThemes.map((theme) => (
            <Link
              key={theme.slug}
              href="/create"
              className="group relative overflow-hidden rounded-xl border border-border-default transition-colors duration-150 hover:border-border-strong"
              style={{ aspectRatio: '3/4' }}
            >
              {theme.previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={theme.previewUrl}
                  alt={theme.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-xs font-medium leading-tight text-white drop-shadow-sm">
                  {theme.name}
                </p>
                {theme.free && (
                  <span className="mt-0.5 inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                    Free
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="mb-16 flex flex-col items-center gap-3 rounded-xl border border-border-default bg-bg-surface py-10 text-center">
        <p className="font-display text-xl font-semibold text-text-primary">
          Ready to create your first portrait?
        </p>
        <p className="text-body text-text-secondary">
          Free themes take less than 2 minutes to generate.
        </p>
        <Button asChild className="mt-1 gap-2 px-8">
          <Link href="/create">
            <Sparkles className="h-4 w-4" aria-hidden />
            Start for free
          </Link>
        </Button>
      </section>
    </PageContainer>
  );
}
