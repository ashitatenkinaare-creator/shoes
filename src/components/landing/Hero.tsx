import LandingProductImage from "@/components/landing/LandingProductImage";
import type { FeaturedDrop } from "@/types/drop";

interface HeroProps {
  drop: FeaturedDrop;
}

export default function Hero({ drop }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-slate-800">
      <div className="absolute inset-0">
        <LandingProductImage
          src={drop.imageUrl}
          alt=""
          fill
          priority
          className="object-cover opacity-60"
          sizes="(max-width: 1024px) 100vw, 80vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />
      </div>

      <div className="relative px-4 py-12 lg:px-10 lg:py-16">
        <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-drop-orange uppercase">
          <span className="h-2 w-2 rounded-full bg-drop-orange" aria-hidden="true" />
          {drop.tag}
        </p>
        <h1 className="mt-4 max-w-xl text-3xl font-black tracking-tight text-white uppercase sm:text-4xl lg:text-5xl">
          {drop.title}
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 lg:text-base">
          {drop.description}
        </p>
      </div>
    </section>
  );
}
