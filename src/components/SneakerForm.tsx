import { useState } from "react";
import type { FormEvent } from "react";
import type { Brand } from "../types/sneaker";
import type { CreateSneakerInput } from "../types/sneaker";
import { BRANDS } from "../data/sneakers";

interface SneakerFormProps {
  onSubmit: (input: CreateSneakerInput) => Promise<string | null>;
}

const initialForm = {
  model_name: "",
  brand: "Nike" as Brand,
  release_date: "",
  price: "",
  image_url: "",
};

export default function SneakerForm({ onSubmit }: SneakerFormProps) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const price = Number(form.price);
    if (!form.model_name.trim()) {
      setError("モデル名を入力してください");
      return;
    }
    if (!form.release_date) {
      setError("発売日を入力してください");
      return;
    }
    if (!Number.isInteger(price) || price <= 0) {
      setError("価格は正の整数で入力してください");
      return;
    }

    setSubmitting(true);
    const submitError = await onSubmit({
      model_name: form.model_name.trim(),
      brand: form.brand,
      release_date: form.release_date,
      price,
      image_url: form.image_url.trim() || null,
    });
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setForm(initialForm);
    setSuccess(true);
  };

  return (
    <section className="rounded-2xl border border-border-dark bg-surface p-6 shadow-lg shadow-black/40">
      <h2 className="text-lg font-black tracking-tight text-white">
        スニーカー登録
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        新しいスニーカー情報をデータベースに追加します
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="model_name" className="mb-1.5 block text-sm font-medium text-zinc-300">
            モデル名 <span className="text-neon">*</span>
          </label>
          <input
            id="model_name"
            type="text"
            value={form.model_name}
            onChange={(e) => setForm((prev) => ({ ...prev, model_name: e.target.value }))}
            placeholder="Air Jordan 1 Retro High OG"
            className="w-full rounded-xl border border-border-dark bg-surface-light px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="brand" className="mb-1.5 block text-sm font-medium text-zinc-300">
              ブランド <span className="text-neon">*</span>
            </label>
            <select
              id="brand"
              value={form.brand}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, brand: e.target.value as Brand }))
              }
              className="w-full rounded-xl border border-border-dark bg-surface-light px-4 py-2.5 text-sm text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
            >
              {BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="release_date" className="mb-1.5 block text-sm font-medium text-zinc-300">
              発売日 <span className="text-neon">*</span>
            </label>
            <input
              id="release_date"
              type="date"
              value={form.release_date}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, release_date: e.target.value }))
              }
              className="w-full rounded-xl border border-border-dark bg-surface-light px-4 py-2.5 text-sm text-white focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-zinc-300">
              価格（円） <span className="text-neon">*</span>
            </label>
            <input
              id="price"
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="24200"
              className="w-full rounded-xl border border-border-dark bg-surface-light px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
            />
          </div>

          <div>
            <label htmlFor="image_url" className="mb-1.5 block text-sm font-medium text-zinc-300">
              画像URL
            </label>
            <input
              id="image_url"
              type="url"
              value={form.image_url}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, image_url: e.target.value }))
              }
              placeholder="https://..."
              className="w-full rounded-xl border border-border-dark bg-surface-light px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-neon/30 bg-neon/10 px-4 py-2 text-sm text-neon">
            スニーカーを登録しました
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-neon py-3 text-sm font-bold text-black transition-colors hover:bg-neon-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "登録中..." : "スニーカーを登録"}
        </button>
      </form>
    </section>
  );
}
