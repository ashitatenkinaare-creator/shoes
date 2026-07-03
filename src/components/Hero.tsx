import type { Sneaker } from "../types/sneaker";
import { formatReleaseDate, PLACEHOLDER_IMAGE } from "../data/sneakers";

interface HeroProps {
  featured: Sneaker | null;
}

export default function Hero({ featured }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556906781-95a18896efac?w=1920&h=800&fit=crop')",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-8 lg:py-28">
        {featured ? (
          <>
            <div className="max-w-xl text-center lg:text-left">
              <p className="mb-3 inline-block rounded-full border border-neon/30 bg-neon/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-neon">
                Featured Drop
              </p>
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                注目の新作：
                <span className="mt-1 block text-neon">{featured.modelName}</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-zinc-300 sm:text-xl">
                発売日：{formatReleaseDate(featured.releaseDate)}
              </p>
            </div>

            <div className="relative w-full max-w-md shrink-0 lg:max-w-lg">
              <div className="absolute -inset-4 rounded-3xl bg-neon/20 blur-3xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-light shadow-2xl shadow-neon/10">
                <img
                  src={featured.imageUrl || PLACEHOLDER_IMAGE}
                  alt={featured.modelName}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-neon">
                    {featured.brand}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center lg:text-left">
            <p className="mb-3 inline-block rounded-full border border-neon/30 bg-neon/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-neon">
              SneakerDrop
            </p>
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              日本のスニーカー
              <span className="mt-1 block text-neon">発売日ダッシュボード</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-zinc-300">
              フォームからスニーカーを登録して、発売日を管理しましょう。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
