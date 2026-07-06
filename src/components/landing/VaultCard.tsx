import Link from "next/link";
import LandingProductImage from "@/components/landing/LandingProductImage";
import type { VaultItem } from "@/types/drop";

interface VaultCardProps {
  item: VaultItem;
}

export default function VaultCard({ item }: VaultCardProps) {
  const href = `/drops/${item.slug ?? item.id}`;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border bg-slate-900 transition-colors ${
        item.highlighted
          ? "border-drop-orange ring-1 ring-drop-orange/50"
          : "border-slate-800 hover:border-slate-700"
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-950">
        {item.badge && (
          <span className="absolute top-3 left-3 z-10 rounded bg-drop-orange px-2 py-0.5 text-[10px] font-black tracking-wide text-black uppercase">
            {item.badge}
          </span>
        )}
        <LandingProductImage
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-xs font-bold text-white uppercase leading-snug">{item.name}</h3>
        <p className="mt-2 text-lg font-black text-white">${item.price}.00</p>
        <Link
          href={href}
          className={`btn-press mt-4 block rounded-lg py-2.5 text-center text-xs font-black tracking-wider uppercase transition-colors ${
            item.status === "live"
              ? "bg-drop-orange text-black hover:bg-drop-orange-hover"
              : "border border-slate-600 text-white hover:border-white"
          }`}
        >
          {item.status === "live" ? "購入する" : "詳細を見る"}
        </Link>
      </div>
    </article>
  );
}
