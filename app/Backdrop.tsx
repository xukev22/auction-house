'use client';

import Image, { type StaticImageData } from 'next/image';
import { useEffect, useState } from 'react';
import sonu from '@/public/sonunigam.jpg';
import threeIdiots from '@/public/3idiots.webp';
import laalSinghChaddha from '@/public/LSC.avif';

// `position` keeps the faces in frame when each photo is cropped to fill the backdrop.
const SLIDES: { src: StaticImageData; position: string }[] = [
  { src: sonu, position: '50% 22%' },
  { src: threeIdiots, position: '50% 0%' },
  { src: laalSinghChaddha, position: '70% 35%' },
];

const HOLD_MS = 6000;

/**
 * The photos crossfade behind the page, all recolored with the same violet-to-teal
 * "stage light" duotone so a movie poster, a film still and a portrait read as one set.
 * With reduced motion, only the first photo shows and nothing cycles.
 */
export function Backdrop() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), HOLD_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden
      className="stage-spotlight pointer-events-none absolute inset-x-0 top-[14svh] h-[62svh] opacity-70 lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-[64%] lg:opacity-80"
    >
      {/* Gradient map: shadows go deep violet, mid-tones violet, highlights teal. */}
      <svg width="0" height="0" className="absolute">
        <filter id="stage-duotone" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.086 0.616 0.651" />
            <feFuncG type="table" tableValues="0.039 0.306 0.906" />
            <feFuncB type="table" tableValues="0.133 0.867 0.878" />
          </feComponentTransfer>
        </filter>
      </svg>

      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src.src}
          src={slide.src}
          alt=""
          fill
          priority={i === 0}
          sizes="(min-width: 1024px) 64vw, 100vw"
          className={`object-cover transition-opacity duration-[1600ms] ease-in-out motion-reduce:transition-none ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectPosition: slide.position, filter: 'url(#stage-duotone)' }}
        />
      ))}
    </div>
  );
}
