"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import UploadZone from "@/components/UploadZone";
import SearchBar from "@/components/SearchBar";
import PhotoGrid from "@/components/PhotoGrid";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        {/* Header minimalista e poderoso */}
        <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-5xl font-bold text-center tracking-tight">
              Catálogo Privado
            </h1>
            <p className="text-center mt-3 text-muted">
              Busca semântica com IA • Upload em massa • 100% privado
            </p>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <SearchBar />
          <UploadZone />
          <PhotoGrid photos={[]} />
        </div>
      </div>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
