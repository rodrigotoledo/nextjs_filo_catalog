"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQuery } from "@tanstack/react-query";
import UploadZone from "@/components/UploadZone";
import SearchBar from "@/components/SearchBar";
import PhotoGrid from "@/components/PhotoGrid";
import { Camera } from "lucide-react";


const queryClient = new QueryClient();

function HomeContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['photos', currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/photos-search?page=${currentPage}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      return data;
    },
    enabled: searchResults === null, // Disable when searching
  });

  const photos = searchResults || (data?.results || []);
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
      const response = await fetch(`/api/photos-search?q=${encodeURIComponent(query)}&page=1&limit=50`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const nextPage = () => setCurrentPage(prev => prev + 1);
  const prevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {/* Header da página */}
        <div className="mb-6 sm:mb-12">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4">Catálogo de Fotos</h1>
          <p className="text-xs sm:text-sm text-muted">Gerencie suas imagens com IA</p>
        </div>
        <div className="bg-card/50 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h2 className="text-lg sm:text-2xl font-semibold">Importar Fotos</h2>
          </div>
          <div className="mt-4 mb-4 sm:mt-6">
            <UploadZone />
          </div>
        </div>
        <div className="bg-card/50 sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
          <SearchBar onSearch={handleSearch} />

          <div className="max-w-4xl mx-auto mb-8 sm:mb-16">
            {isLoading ? (
              <div className="text-center py-16 sm:py-24 md:py-32">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs sm:text-sm text-muted mt-3 sm:mt-4">Carregando dados...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 sm:py-24 md:py-32">
                <p className="text-xs sm:text-sm text-muted">Erro ao carregar dados: {error.message}</p>
              </div>
            ) : isSearching ? (
              <div className="text-center py-16 sm:py-24 md:py-32">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs sm:text-sm text-muted mt-3 sm:mt-4">Buscando dados...</p>
              </div>
            ) : (
              <PhotoGrid key={searchResults ? 'search' : `page-${currentPage}`} photos={photos} />
            )}
          </div>
        </div>
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
