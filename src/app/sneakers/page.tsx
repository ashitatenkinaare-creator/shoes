"use client";

import ErrorBanner from "@/components/ErrorBanner";
import FilterTabs from "@/components/FilterTabs";
import SneakerForm from "@/components/form/SneakerForm";
import SneakerHeader from "@/components/sneakers/SneakerHeader";
import SneakerList from "@/components/sneakers/SneakerList";
import { useSneakers } from "@/hooks/useSneakers";

export default function SneakersPage() {
  const {
    filteredSneakers,
    loading,
    error,
    filter,
    setFilter,
    handleCreate,
    handleToggleNotify,
    handleDelete,
    isRegisteredEmpty,
  } = useSneakers();

  return (
    <div className="min-h-screen bg-slate-900">
      <SneakerHeader />

      <main className="mx-auto max-w-[640px] px-3 py-5 md:px-4 md:py-8">
        {error && <ErrorBanner message={error} />}

        <SneakerForm onSubmit={handleCreate} />

        <section className="mt-6 space-y-3 md:mt-8 md:space-y-4">
          <FilterTabs value={filter} onChange={setFilter} />
          <SneakerList
            sneakers={filteredSneakers}
            loading={loading}
            isRegisteredEmpty={isRegisteredEmpty}
            onToggleNotify={handleToggleNotify}
            onDelete={handleDelete}
          />
        </section>
      </main>
    </div>
  );
}
