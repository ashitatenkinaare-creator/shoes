"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { RADAR_PLACEHOLDER_IMAGE, sanitizeRadarImageUrl } from "@/lib/radar/placeholder-image";

type RadarProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined;
  alt: string;
};

export default function RadarProductImage({ src, alt, onError, ...props }: RadarProductImageProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = failed ? RADAR_PLACEHOLDER_IMAGE : sanitizeRadarImageUrl(src);

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      onError={(event) => {
        if (!failed) setFailed(true);
        onError?.(event);
      }}
    />
  );
}
