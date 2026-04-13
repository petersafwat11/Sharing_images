import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { ImageViewer } from '@/components/images/ImageViewer';
import { fetchImageBySlugServer } from '@/lib/api/server';
import { shareUrl } from '@/lib/config';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const image = await fetchImageBySlugServer(params.slug);
  if (!image) return { title: 'Not found' };

  const url = shareUrl(image.slug);
  const previewUrl = image.webpUrl ?? image.originalUrl;

  return {
    title: image.filename,
    description: `Shared on Picflow — ${image.filename}`,
    openGraph: {
      type: 'article',
      url,
      title: image.filename,
      description: `Shared on Picflow — ${image.filename}`,
      images: [
        {
          url: previewUrl,
          width: image.width ?? 1200,
          height: image.height ?? 630,
          alt: image.filename,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: image.filename,
      images: [previewUrl],
    },
  };
}

export default async function ImageViewPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const image = await fetchImageBySlugServer(params.slug);
  if (!image) notFound();

  return (
    <PageContainer padded={false} className="py-8 md:py-12">
      <ImageViewer image={image} />
    </PageContainer>
  );
}
