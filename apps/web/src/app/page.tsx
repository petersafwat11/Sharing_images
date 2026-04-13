import { PageContainer } from '@/components/layout/PageContainer';
import { UploadQueue } from '@/components/upload/UploadQueue';
import { UploadZone } from '@/components/upload/UploadZone';

export default function HomePage(): React.ReactElement {
  return (
    <PageContainer>
      <section className="flex flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-wide text-accent">
          Picflow
        </p>
        <h1 className="font-display text-page-title text-text-primary">
          Drop it. Share it.
        </h1>
        <p className="max-w-xl text-body text-text-secondary">
          A clean, fast image host. Drop an image anywhere on this page
          to get an instant shareable link. Sign up to manage your
          uploads and track views over time.
        </p>
      </section>

      <div className="mt-10 flex flex-col gap-6">
        <UploadZone />
        <UploadQueue />
      </div>
    </PageContainer>
  );
}
