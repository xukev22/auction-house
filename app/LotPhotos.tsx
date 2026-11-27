'use client';

import { useState } from 'react';
import Image from 'next/image';

// A lot's photos, stacked and crossfaded. Arrows and dots only show when there's more than one.
export function LotPhotos({
  title,
  urls,
  sizes,
}: {
  title: string;
  urls: string[];
  // How wide the photo shows at each screen size, for next/image.
  sizes: string;
}) {
  const [active, setActive] = useState(0);
  const count = urls.length;
  const step = (by: number) => setActive((current) => (current + by + count) % count);

  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-cream/5">
      {urls.map((url, i) => (
        <Image
          key={url}
          src={url}
          alt={count > 1 ? `${title}, photo ${i + 1} of ${count}` : title}
          aria-hidden={i !== active}
          fill
          sizes={sizes}
          className={`object-cover transition-opacity duration-300 motion-reduce:transition-none ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {count > 1 && (
        <>
          <PhotoArrow label={`Previous photo of ${title}`} side="left" onClick={() => step(-1)} />
          <PhotoArrow label={`Next photo of ${title}`} side="right" onClick={() => step(1)} />
          <div aria-hidden className="absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
            {urls.map((url, i) => (
              <span
                key={url}
                className={`size-1.5 rounded-full shadow-[0_0_4px_rgba(22,10,34,0.8)] ${
                  i === active ? 'bg-cream' : 'bg-cream/45'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PhotoArrow({
  label,
  side,
  onClick,
}: {
  label: string;
  side: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-night/60 text-cream backdrop-blur-sm transition-colors hover:bg-night/85 ${
        side === 'left' ? 'left-2' : 'right-2'
      }`}
    >
      <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor">
        <path
          d={side === 'left' ? 'M12.5 4.5 7 10l5.5 5.5' : 'M7.5 4.5 13 10l-5.5 5.5'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
