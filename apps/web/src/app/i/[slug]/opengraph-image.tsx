import { ImageResponse } from 'next/og';
import { fetchImageBySlugServer } from '@/lib/api/server';

export const runtime = 'edge';
export const alt = 'Picflow shared image';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * OG image for /i/[slug]. For images with dimensions we render the
 * actual image — otherwise we fall back to a branded card with the
 * filename and the slug, so WhatsApp/Twitter/iMessage always unfurl
 * something meaningful.
 */
export default async function OpengraphImage({
  params,
}: {
  params: { slug: string };
}): Promise<ImageResponse> {
  const image = await fetchImageBySlugServer(params.slug);

  if (!image) {
    return brandedCard('Picflow', 'Image not found');
  }

  const preview = image.webpUrl ?? image.originalUrl;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#0A0A0B',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        { /* eslint-disable-next-line @next/next/no-img-element */ }
        <img
          src={preview}
          alt={image.filename}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 8,
            background: 'rgba(17,17,19,0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#F2F2F3',
            fontSize: 16,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: '#8B5CF6',
            }}
          />
          Picflow · /i/{image.slug}
        </div>
      </div>
    ),
    size,
  );
}

function brandedCard(title: string, subtitle: string): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: '#0A0A0B',
          color: '#F2F2F3',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 64,
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: '#8B5CF6',
          }}
        />
        <div style={{ fontSize: 64, fontWeight: 600, letterSpacing: -1 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: '#9898A4' }}>{subtitle}</div>
      </div>
    ),
    size,
  );
}
