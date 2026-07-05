import Link from "next/link";
import LandingProductImage from "@/components/landing/LandingProductImage";
import { Timer } from "lucide-react";
import type { DropItem } from "@/types/drop";

interface DropCardProps {
  item: DropItem;
}

export default function DropCard({ item }: DropCardProps) {
  const href = item.slug ? `/drops/${item.slug}` : "#upcoming";

  return (
    <Link href={href} className="block">
      <article className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-colors hover:border-slate-700">
        <div className="relative aspect-square overflow-hidden bg-slate-950">
          {item.badge && (
            <span className="absolute top-3 left-3 z-10 rounded bg-drop-orange px-2 py-0.5 text-[10px] font-black tracking-wide text-black uppercase">
              {item.badge}
            </span>
          )}
          <span className="absolute top-3 right-3 z-10 rounded-full border border-slate-700 bg-slate-900/80 p-1.5 text-slate-400 backdrop-blur-sm">
            <Timer className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <LandingProductImage
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>

        <div className="space-y-1 p-4">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-500 uppercase">
            <span>{item.brand}</span>
            <span className="text-white">${item.price}</span>
          </div>
          <h3 className="truncate text-sm font-bold text-white uppercase">{item.name}</h3>
          <p className="text-[10px] tracking-wide text-slate-500 uppercase">
            {item.releaseDate} | {item.releaseTime}
          </p>
        </div>
      </article>
    </Link>
  );
}
