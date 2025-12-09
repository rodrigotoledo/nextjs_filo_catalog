"use client";

import { useEffect, useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  UserPlus, Users, Mail, Phone, MapPin, FileText,
  Trash2, Edit, Search
} from "lucide-react";

import DocumentUploadZone from "@/components/DocumentUploadZone";
import SeedForm from "@/components/SeedForm";
import ClientForm from "@/components/ClientForm";
import SearchBar from "@/components/SearchBar";

const queryClient = new QueryClient();

function ClientsContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [editingClient, setEditingClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/clients?page=${currentPage}`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      return data;
    },
    enabled: searchResults === null, // Disable when searching
  });

  const clients = searchResults || (data?.results || []);
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
      const response = await fetch(`/api/clients-search?q=${encodeURIComponent(query)}&page=1&limit=50`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };


  // Paginação
  const nextPage = () => setCurrentPage(p => p + 1);
  const prevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  // // Populate
  // const handlePopulate = async () => {
  //   await fetch("/api/populate-clients", { method: "POST" });
  //   queryClient.invalidateQueries({ queryKey: ["clients"] });
  // };

  // // Delete
  // const deleteClient = async (id) => {
  //   if (!confirm("Tem certeza que quer excluir este cliente?")) return;
  //   await fetch(`/api/clients/${id}`, { method: "DELETE" });
  //   queryClient.invalidateQueries({ queryKey: ["clients"] });
  // };

  // Edição
  const startEdit = (client) => {
    setEditingClient(client);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingClient(null);
    setIsEditing(false);
    setOcrData(null);
  };

  // FUNÇÃO PRA LIMPAR BUSCA (a mais importante agora)
  const clearSearch = () => {
    setSearchResults(null);
    setSearchTerm("");
    setCurrentPage(1);
    refetch(); // FORÇA O REFETCH DA PÁGINA 1
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-2">Cadastro de Clientes</h1>
          <p className="text-muted">Gerencie todos os seus clientes em um só lugar</p>
        </div>

        {/* Formulário */}
        <ClientForm
          clientData={editingClient || {
            name: '', nickname: '', email: '', phone: '',
            documents: { cpf: '', rg: '', birth_date: '' },
            addresses: [{ id: 1, type: 'Pessoal', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip_code: '' }]
          }}
          onCancel={cancelEdit}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            cancelEdit();
          }}
        />

        {/* Upload OCR */}
        <div className="my-12 bg-card/50 border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Importar por Documento</h2>
          </div>
          <DocumentUploadZone
            clientId={null}
            onOcrDataExtracted={(data) => {
              setOcrData(data);
              alert("Dados extraídos com sucesso! Preenchendo automaticamente...");
            }}
          />
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
              <>
                {clients.length === 0 ? (
                  <div className="text-center py-20">
                    <Users className="w-16 h-16 mx-auto text-muted mb-4" />
                    <p className="text-muted">
                      {searchResults !== null ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
                    </p>
                  </div>
                ) : (
                <div className="space-y-6">
                  {clients.map((client) => (
                    <div key={client.id} className="bg-card border rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{client.name}</h3>
                          {client.nickname && <p className="text-sm text-muted">Apelido: {client.nickname}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(client)} className="p-2 hover:bg-muted rounded">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteClient(client.id)} className="p-2 hover:bg-red-500/10 rounded text-red-600">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>

                      {client.documents && (
                        <div className="mt-4 text-sm">
                          <strong>Documentos:</strong>{" "}
                          {client.documents.cpf} {client.documents.rg && `• RG: ${client.documents.rg}`}
                        </div>
                      )}

                      {client.addresses?.[0] && (
                        <div className="mt-4 text-sm text-muted">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          {client.addresses[0].street}, {client.addresses[0].number} - {client.addresses[0].city}/{client.addresses[0].state}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                )}
              </>

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
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientsContent />
    </QueryClientProvider>
  );
}
