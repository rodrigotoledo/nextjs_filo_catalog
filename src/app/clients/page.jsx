"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Edit } from "lucide-react";

import ClientForm from "@/components/ClientForm";
import SearchBar from "@/components/SearchBar";

const queryClient = new QueryClient();

function ClientsContent() {
  const [formData, setFormData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["clients", currentPage],
    queryFn: async () => {
      const res = await fetch(`/api/clients?page=${currentPage}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: searchResults === null,
  });

  const clients = searchResults || data?.results || [];

  const openForm = (client = null) => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: "",
        nickname: "",
        email: "",
        phone: "",
        documents: { cpf: "", rg: "", birth_date: "" },
        addresses: [{
          id: Date.now(),
          type: "Pessoal",
          street: "", number: "", complement: "",
          neighborhood: "", city: "", state: "", zip_code: ""
        }]
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => setFormData(null);

  // AQUI ESTÁ A FUNÇÃO QUE FALTAVA!
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = formData.id ? "PUT" : "POST";
    const url = formData.id ? `/api/clients/${formData.id}` : "/api/clients";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      queryClient.invalidateQueries({ queryKey: ["clients"] });
      closeForm();
      alert(formData.id ? "Cliente atualizado!" : "Cliente criado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar cliente");
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    const res = await fetch(`/api/clients-search?q=${encodeURIComponent(query)}&limit=50`);
    const json = await res.json();
    setSearchResults(json.results);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        <h1 className="text-4xl font-bold text-center mb-10">Clientes</h1>

        {/* FORMULÁRIO */}
        {formData && (
          <ClientForm
            clientData={formData}
            setClientData={setFormData}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isEditing={!!formData.id}
            title={formData.id ? "Editar Cliente" : "Novo Cliente"}
          />
        )}

        {/* BOTÃO NOVO CLIENTE */}
        {!formData && (
          <div className="text-center my-12">
            <button
              onClick={() => openForm()}
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-xl text-lg font-medium"
            >
              <UserPlus className="w-6 h-6" />
              Novo Cliente
            </button>
          </div>
        )}

        {/* BUSCA */}
        <div className="max-w-xl mx-auto mb-8">
          <SearchBar onSearch={handleSearch} />
          {searchResults && (
            <button onClick={() => setSearchResults(null)} className="block mx-auto mt-4 text-sm text-muted-foreground">
              Limpar busca
            </button>
          )}
        </div>

        {/* LISTA */}
        {isLoading && <p className="text-center py-20">Carregando...</p>}
        {error && <p className="text-center py-20 text-red-500">Erro ao carregar</p>}

        <div className="grid gap-6 max-w-4xl mx-auto">
          {clients.map((client) => (
            <div key={client.id} className="bg-card border rounded-xl p-6 flex justify-between items-start shadow-sm">
              <div>
                <h3 className="text-xl font-bold">{client.name}</h3>
                {client.nickname && <p className="text-sm text-muted-foreground">{client.nickname}</p>}
                <p className="text-sm">{client.email}</p>
                {client.documents?.cpf && <p className="text-sm">CPF: {client.documents.cpf}</p>}
              </div>
              <button
                onClick={() => openForm(client)}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* PAGINAÇÃO SIMPLES */}
        {!searchResults && data && data.total_pages > 1 && (
          <div className="flex justify-center gap-4 mt-12">
            <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}
              className="px-6 py-2 bg-primary text-white rounded disabled:opacity-50">
              Anterior
            </button>
            <button onClick={() => setCurrentPage(p => p+1)} disabled={currentPage === data.total_pages}
              className="px-6 py-2 bg-primary text-white rounded disabled:opacity-50">
              Próxima
            </button>
          </div>
        )}
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
