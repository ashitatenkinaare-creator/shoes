"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import {
  LANDING_PLACEHOLDER_IMAGE,
  resolveLandingImageUrl,
} from "@/lib/landing/placeholder-image";

type LandingProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined;
  alt: string;
};

export default function LandingProductImage({
  src,
  alt,
  onError,
  ...props
}: LandingProductImageProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = failed ? LANDING_PLACEHOLDER_IMAGE : resolveLandingImageUrl(src);

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
