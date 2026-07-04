"use client";

import { useState, type FormEvent } from "react";
import { Calendar, Footprints, Tag } from "lucide-react";
import FormField from "@/components/form/FormField";

interface SneakerFormProps {
  onSubmit: (input: {
    modelName: string;
    brand: string;
    releaseDate: string;
  }) => Promise<string | null>;
}

export default function SneakerForm({ onSubmit }: SneakerFormProps) {
  const [modelName, setModelName] = useState("");
  const [brand, setBrand] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!modelName.trim()) {
      setError("モデル名を入力してください");
      return;
    }
    if (!brand.trim()) {
      setError("ブランドを入力してください");
      return;
    }
    if (!releaseDate) {
      setError("発売日を入力してください");
      return;
    }

    setSubmitting(true);
    const submitError = await onSubmit({
      modelName: modelName.trim(),
      brand: brand.trim(),
      releaseDate,
    });
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setModelName("");
    setBrand("");
    setReleaseDate("");
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-lg shadow-black/20 md:p-6">
      <h2 className="text-base font-semibold text-slate-100">スニーカー登録</h2>

      <form onSubmit={handleSubmit} className="mt-3 space-y-3 md:mt-4 md:space-y-4">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-4">
          <FormField
            id="brand"
            label="ブランド"
            icon={Tag}
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Nike"
          />
          <FormField
            id="modelName"
            label="モデル名"
            icon={Footprints}
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="Air Jordan 1"
          />
          <FormField
            id="releaseDate"
            label="発売日"
            icon={Calendar}
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-press min-h-[48px] w-full rounded-lg bg-indigo-500 px-4 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-500/30 transition-[transform,background-color,box-shadow] duration-150 ease-out hover:bg-indigo-400 hover:shadow-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none md:min-h-0 md:py-2.5 md:text-sm"
        >
          {submitting ? "登録中..." : "登録する"}
        </button>
      </form>
    </section>
  );
}
