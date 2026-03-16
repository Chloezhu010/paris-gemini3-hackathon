"use client";

import { useState, useCallback } from "react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ImageLightbox({ src, alt, className, style }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`cursor-zoom-in ${className ?? ""}`}
        style={style}
        onClick={handleOpen}
      />
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl cursor-zoom-out"
            onClick={handleClose}
          />
        </div>
      )}
    </>
  );
}
