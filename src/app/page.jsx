"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQuery } from "@tanstack/react-query";
import UploadZone from "@/components/UploadZone";
import SearchBar from "@/components/SearchBar";
import PhotoGrid from "@/components/PhotoGrid";
import SeedForm from "@/components/SeedForm";

const queryClient = new QueryClient();

function HomeContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

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
    setIsSearching(true);
    setSearchResults(null); // Clear current results
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
      alert('Erro na busca: ' + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const nextPage = () => setCurrentPage(prev => prev + 1);
  const prevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));

  const handlePopulate = async (term) => {
    const response = await fetch('/api/populate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ term }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Populate failed');
    }
    const result = await response.json();
    // Invalidate photos to refetch
    queryClient.invalidateQueries({ queryKey: ['photos'], exact: false });
    return result;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {/* Header da página */}
        <div className="mb-6 sm:mb-12">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4">Catálogo de Fotos</h1>
          <p className="text-xs sm:text-sm text-muted">Gerencie suas imagens com IA</p>
        </div>

        <SearchBar onSearch={handleSearch} />
        <div className="mt-4 sm:mt-6">
          <SeedForm onPopulate={handlePopulate} />
        </div>
        <div className="mt-4 sm:mt-6">
          <UploadZone />
        </div>
        {isLoading ? (
          <div className="text-center py-16 sm:py-24 md:py-32">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm text-muted mt-3 sm:mt-4">Carregando fotos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 sm:py-24 md:py-32">
            <p className="text-xs sm:text-sm text-muted">Erro ao carregar fotos: {error.message}</p>
          </div>
        ) : isSearching ? (
          <div className="text-center py-16 sm:py-24 md:py-32">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm text-muted mt-3 sm:mt-4">Buscando fotos...</p>
          </div>
        ) : (
          <PhotoGrid key={searchResults ? 'search' : `page-${currentPage}`} photos={photos} />
        )}
        {searchResults ? (
          <div suppressHydrationWarning className="text-center mt-4 sm:mt-8">
            <p className="text-xs sm:text-sm text-muted mb-2 sm:mb-4">Encontrados: {searchResults.length}</p>
            <button
              onClick={() => setSearchResults(null)}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-secondary text-secondary-foreground rounded text-sm sm:text-base"
            >
              Limpar busca
            </button>
          </div>
        ) : !isLoading && !error && !isSearching && (
          <div suppressHydrationWarning className="flex justify-center mt-4 sm:mt-8 space-x-2 sm:space-x-4">
            <button
              onClick={prevPage}
              disabled={!has_prev}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded disabled:opacity-50 text-sm sm:text-base"
            >
              Anterior
            </button>
            <span className="px-2 py-2 sm:px-4 text-xs sm:text-sm">Página {page} de {total_pages} ({total})</span>
            <button
              onClick={nextPage}
              disabled={!has_next}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded disabled:opacity-50 text-sm sm:text-base"
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
