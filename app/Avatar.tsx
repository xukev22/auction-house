import Image from 'next/image';

// A Google profile photo, or the first letter of their name when there isn't one.
export function Avatar({
  url,
  name,
  size = 32,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  return url ? (
    <Image
      src={url}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-violet/40 text-sm"
      style={{ width: size, height: size }}
    >
      {name.charAt(0)}
    </span>
  );
}
