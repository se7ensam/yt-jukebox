import type { SVGProps } from 'react';

export function TubeQueueLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="TubeQueue Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="50" height="35" rx="8" y="7.5" fill="hsl(var(--primary))" />
      <polygon points="18,17 18,33 35,25" fill="hsl(var(--primary-foreground))" />
      <text
        x="58"
        y="32"
        fontFamily="'PT Sans', sans-serif"
        fontSize="28"
        fontWeight="bold"
        fill="url(#logo-gradient)"
        className="font-headline"
      >
        TubeQueue
      </text>
    </svg>
  );
}
