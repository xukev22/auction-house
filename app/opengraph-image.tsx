import { ImageResponse } from 'next/og';
import { AUCTION_DAY, AUCTION_TIME, AUCTION_WHEN, SITE_NAME } from '@/lib/event';
import { BRAND, loadHanken, loadRozha } from '@/lib/og';

// Link preview for iMessage, Discord, Slack, X, etc. Mirrors the landing page:
// the name stacked top-left, the date bottom-right.
export const alt = `${SITE_NAME}. The first lot goes under the hammer ${AUCTION_WHEN}.`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  const [rozha, hanken] = await Promise.all([loadRozha(), loadHanken()]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: '64px 72px',
        // Violet stage wash from the top-left.
        background: `radial-gradient(ellipse at 15% 0%, ${BRAND.violetGlow}, ${BRAND.night} 62%)`,
        color: BRAND.cream,
        fontFamily: 'Hanken Grotesk',
      }}
    >
      {/* A faint teal spotlight on the right, as its own layer behind the text. */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -60,
          width: 640,
          height: 640,
          borderRadius: 320,
          background: `radial-gradient(circle, ${BRAND.teal}33, transparent 70%)`,
        }}
      />

      <div
        style={{
          alignSelf: 'flex-start',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Rozha One',
          fontSize: 168,
          lineHeight: 0.82,
          letterSpacing: '-0.02em',
        }}
      >
        <span>Sonu</span>
        <span>Auction</span>
        <span>House</span>
      </div>

      {/* The preview card already shows the description, so the image carries just the date. */}
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: 40, lineHeight: 1.2 }}>
        <span>{AUCTION_DAY}</span>
        <span>{AUCTION_TIME}</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Rozha One', data: rozha, weight: 400 },
        { name: 'Hanken Grotesk', data: hanken, weight: 400 },
      ],
    },
  );
}
