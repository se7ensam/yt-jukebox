'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function QRCode() {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    // This ensures window is defined, as it's only available on the client.
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      setOrigin(currentOrigin);
    }
  }, []);

  if (!origin) {
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
       <div className="rounded-lg bg-white p-4 shadow-lg">
          <QRCodeSVG value={origin} size={224} />
        </div>
      {origin && (
        <a href={origin} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground underline">
          {origin}
        </a>
      )}
    </div>
  );
}
