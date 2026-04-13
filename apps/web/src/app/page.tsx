import { PageContainer } from '@/components/layout/PageContainer';

/**
 * Placeholder home page. Phase 4 replaces this with UploadZone +
 * hero copy + (for authed users) recent uploads.
 */
export default function HomePage(): React.ReactElement {
  return (
    <PageContainer>
      <section className="flex flex-col items-start gap-4">
        <h1 className="font-display text-page-title text-text-primary">
          Drop it. Share it.
        </h1>
        <p className="max-w-xl text-body text-text-secondary">
          Picflow is a clean, fast image host. Drop an image anywhere on
          this page to get an instant shareable link. Sign up to manage
          your uploads and track views over time.
        </p>
        <p className="text-caption text-text-tertiary">
          Phase 3 foundation — the upload zone lands in Phase 4.
        </p>
      </section>
    </PageContainer>
  );
}
