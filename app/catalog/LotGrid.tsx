'use client';

import { useId, useState } from 'react';
import Image from 'next/image';

export type CatalogLot = {
  id: number;
  lotNumber: number;
  title: string;
  type: string | null;
  size: string | null;
  description: string | null;
  // Cover photo first.
  photoUrls: string[];
};

const PHOTO_SIZES = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw';

// Clothing sizes in the order people expect. Anything else (One size, 10.5) comes after.
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const sizeRank = (size: string) => {
  const i = SIZE_ORDER.indexOf(size.toUpperCase());
  return i === -1 ? SIZE_ORDER.length : i;
};

const uniqueValues = (values: (string | null)[]) => [
  ...new Set(values.filter((v): v is string => Boolean(v))),
];

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// The catalog grid with type and size toggles. Picking several in one row shows any of them;
// picking in both rows narrows to lots that match both.
export function LotGrid({ lots }: { lots: CatalogLot[] }) {
  const [types, setTypes] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const typeOptions = uniqueValues(lots.map((lot) => lot.type)).sort();
  const sizeOptions = uniqueValues(lots.map((lot) => lot.size)).sort(
    (a, b) => sizeRank(a) - sizeRank(b) || a.localeCompare(b, undefined, { numeric: true }),
  );

  const filtering = types.length > 0 || sizes.length > 0;
  const shown = lots.filter(
    (lot) =>
      (types.length === 0 || (lot.type !== null && types.includes(lot.type))) &&
      (sizes.length === 0 || (lot.size !== null && sizes.includes(lot.size))),
  );
  const clear = () => {
    setTypes([]);
    setSizes([]);
  };

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <div className="flex flex-col gap-4">
        <FilterGroup
          label="Type"
          options={typeOptions}
          selected={types}
          onToggle={(value) => setTypes((current) => toggle(current, value))}
        />
        <FilterGroup
          label="Size"
          options={sizeOptions}
          selected={sizes}
          onToggle={(value) => setSizes((current) => toggle(current, value))}
        />
        <div className="flex min-h-6 items-center gap-4 text-sm text-cream/70">
          <p aria-live="polite">
            {filtering ? `Showing ${shown.length} of ${lots.length} lots.` : ''}
          </p>
          {filtering && (
            <button
              type="button"
              onClick={clear}
              className="text-cream underline underline-offset-4 hover:text-white"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {shown.length > 0 ? (
        <ol className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 md:gap-y-12 xl:grid-cols-4">
          {shown.map((lot) => (
            <li key={lot.id} className="flex flex-col gap-3">
              <LotPhotos title={lot.title} urls={lot.photoUrls} />
              <p className="font-display text-lg leading-none md:text-xl">Lot {lot.lotNumber}</p>
              <div className="flex flex-col gap-1">
                <h2>{lot.title}</h2>
                {lot.size && (
                  <p className="text-sm text-cream/70">
                    {/* "One size" already says it; "L" needs the label. */}
                    {/size/i.test(lot.size) ? lot.size : `Size ${lot.size}`}
                  </p>
                )}
                {lot.description && <p className="text-sm text-cream/70">{lot.description}</p>}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-cream/70">No lots match those filters.</p>
      )}
    </div>
  );
}

// A lot's photos, stacked and crossfaded. Arrows and dots only show when there's more than one.
function LotPhotos({ title, urls }: { title: string; urls: string[] }) {
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
          sizes={PHOTO_SIZES}
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

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const labelId = useId();
  // One option leaves nothing to choose between.
  if (options.length < 2) return null;

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
    >
      <span id={labelId} className="text-sm text-cream/70 sm:w-10">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const on = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(option)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                on ? 'border-cream bg-cream text-night' : 'border-cream/25 hover:border-cream/60'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
