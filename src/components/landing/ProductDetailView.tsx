"use client";

import LandingProductImage from "@/components/landing/LandingProductImage";
import Link from "next/link";
import { useState } from "react";
import { Bell, ExternalLink } from "lucide-react";
import Countdown from "@/components/landing/Countdown";
import DropCard from "@/components/landing/DropCard";
import { resolveOfficialLink } from "@/lib/radar/sneaker-links";
import type { DropItem, ProductDetail } from "@/types/drop";

interface ProductDetailViewProps {
  product: ProductDetail;
  related: DropItem[];
}

export default function ProductDetailView({ product, related }: ProductDetailViewProps) {
  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const officialLink = resolveOfficialLink(
    {
      newsUrl: product.newsUrl,
      lotteryUrl: product.lotteryUrl,
      brand: product.brand,
      modelName: product.title,
    },
    { allowBrandFallback: false },
  );

  return (
    <div className="px-4 py-8 lg:px-10 lg:py-10">
      <p className="text-[10px] font-bold tracking-widest text-drop-orange uppercase">
        {product.series}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-900">
            <LandingProductImage
              src={activeImage}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto">
            {product.gallery.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(src)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  activeImage === src ? "border-drop-orange" : "border-slate-700"
                }`}
              >
                <LandingProductImage src={src} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
            {product.title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{product.description}</p>

          <div className="mt-8">
            <Countdown targetDate={product.dropEndsAt} />
          </div>

          <p className="mt-8 text-3xl font-black text-white">${product.price}.00</p>

          <dl className="mt-8 space-y-3 border-t border-slate-800 pt-6">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between text-sm">
                <dt className="text-slate-500">{spec.label}</dt>
                <dd className="font-medium text-white">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/settings"
            className="btn-press mt-8 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-drop-orange py-4 text-sm font-black tracking-wider text-black uppercase transition-colors hover:bg-drop-orange-hover"
          >
            <Bell className="h-5 w-5" />
            通知を設定する
          </Link>

          {officialLink ? (
            <a
              href={officialLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-lg border border-slate-600 py-4 text-sm font-bold tracking-wider text-white uppercase transition-colors hover:border-drop-orange hover:text-drop-orange"
            >
              {officialLink.label}
              <ExternalLink className="h-5 w-5" />
            </a>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-slate-700 px-4 py-3 text-center text-xs leading-relaxed text-slate-500">
              このモデルはデモ用の架空商品です。商品固有の公式 URL
              が未設定のため、公式サイトへのリンクは表示していません。
              <Link
                href="/settings"
                className="mt-2 block font-medium text-drop-orange hover:underline"
              >
                Sneaker Radar で通知設定 →
              </Link>
            </p>
          )}

          <Link
            href="/vault"
            className="mt-4 block text-center text-xs font-medium text-slate-500 transition-colors hover:text-drop-orange"
          >
            ← カタログに戻る
          </Link>
        </div>
      </div>

      <section className="mt-16 border-t border-slate-800 pt-12">
        <h2 className="mb-6 text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
          関連ドロップ
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => (
            <DropCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
