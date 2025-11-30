"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQuery } from "@tanstack/react-query";
import UploadZone from "@/components/UploadZone";
import SearchBar from "@/components/SearchBar";
import PhotoGrid from "@/components/PhotoGrid";

const queryClient = new QueryClient();

function HomeContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['photos', currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/photos?page=${currentPage}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      console.log('Photos data:', data);
      return data;
    },
    enabled: !searchResults, // Disable when searching
  });

  const photos = searchResults || (data?.photos || []);
  const { total, page, total_pages, has_next, has_prev } = data || {};

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      setCurrentPage(1);
      return;
    }
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Erro na busca: ' + error.message);
    }
  };

  const nextPage = () => setCurrentPage(prev => prev + 1);
  const prevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));

  return (
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
        <SearchBar onSearch={handleSearch} />
        <UploadZone />
        {isLoading ? (
          <div className="text-center py-32">
            <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted mt-4">Carregando fotos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-32">
            <p className="text-muted">Erro ao carregar fotos: {error.message}</p>
          </div>
        ) : (
          <PhotoGrid photos={photos} />
        )}
        {searchResults ? (
          <div className="text-center mt-8">
            <p className="text-muted mb-4">Resultados da busca ({searchResults.length} encontrados)</p>
            <button
              onClick={() => setSearchResults(null)}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={prevPage}
              disabled={!has_prev}
              className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-4 py-2">Página {page} de {total_pages} (Total: {total})</span>
            <button
              onClick={nextPage}
              disabled={!has_next}
              className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
