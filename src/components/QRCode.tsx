'use client';

import { useEffect, useState } from 'react';
import type { SVGProps } from 'react';

// A very basic QR code generator for a given URL string.
// This is a simplified implementation for demonstration.
function generateQrCodePath(url: string, size: number, margin: number): string {
  // A simple QR code pattern for the URL. This is NOT a valid QR code.
  // It's a visual placeholder.
  let path = '';
  const moduleSize = (size - margin * 2) / 25;
  
  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 25; col++) {
      const isBlack = (row * col + url.length) % 2 === 0 || 
                      (row < 7 && col < 7) || 
                      (row < 7 && col > 17) || 
                      (row > 17 && col < 7);
      if (isBlack) {
        const x = margin + col * moduleSize;
        const y = margin + row * moduleSize;
        path += `M${x},${y}h${moduleSize}v${moduleSize}h-${moduleSize}z `;
      }
    }
  }
  return path;
}


export function QRCode(props: SVGProps<SVGSVGElement>) {
  const [qrPath, setQrPath] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    // This ensures window is defined, as it's only available on the client.
    const currentOrigin = window.location.origin;
    setOrigin(currentOrigin);
    const size = 256;
    const margin = 10;
    setQrPath(generateQrCodePath(currentOrigin, size, margin));
  }, []);

  if (!qrPath) {
    return (
      <div 
        style={{ width: 256, height: 256 }} 
        className="bg-muted animate-pulse rounded-lg"
        aria-label="Loading QR Code"
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        width="256"
        height="256"
        className="rounded-lg bg-white p-2 shadow-lg"
        {...props}
      >
        <path d={qrPath} fill="black" />
      </svg>
      {origin && (
        <a href={origin} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground underline">
          {origin}
        </a>
      )}
    </div>
  );
}
