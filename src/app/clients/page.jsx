"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Users, Mail, Phone, MapPin, FileText, Plus, Trash2, Edit, Search } from "lucide-react";
import DocumentUploadZone from "../../components/DocumentUploadZone";
import SeedForm from "../../components/SeedForm";

const queryClient = new QueryClient();

// Custom input mask functions
const applyMask = (value, mask) => {
  let result = '';
  let valueIndex = 0;

  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    if (mask[i] === '9') {
      if (/\d/.test(value[valueIndex])) {
        result += value[valueIndex];
        valueIndex++;
      }
    } else {
      result += mask[i];
      if (value[valueIndex] === mask[i]) {
        valueIndex++;
      }
    }
  }

  return result;
};

const MaskedInput = ({ mask, value, onChange, ...props }) => {
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const maskedValue = applyMask(rawValue, mask);
    onChange({ target: { value: maskedValue } });
  };

  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
    />
  );
};

function ClientsContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchClient, setSearchClient] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/clients?page=${currentPage}`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      return data;
    },
    enabled: !searchResults, // Disable when searching
  });

  const clients = searchResults || (data?.clients || []);
  const { total = 0, page = 1, total_pages = 1, has_next = false, has_prev = false } = data || {};

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      setCurrentPage(1);
      return;
    }
    setIsSearching(true);
    setSearchResults(null); // Clear current results
    try {
      const response = await fetch(`/api/clients?search=${encodeURIComponent(query)}&page=1&limit=50`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.clients || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Erro na busca: ' + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const nextPage = () => setCurrentPage(prev => prev + 1);
  const prevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));

  const handlePopulateClients = async () => {
    const response = await fetch('/api/populate-clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Populate failed');
    }
    const result = await response.json();
    // Invalidate clients to refetch
    queryClient.invalidateQueries({ queryKey: ['clients'], exact: false });
    return result;
  };

  const [newClient, setNewClient] = useState({
    name: "",
    nickname: "",
    email: "",
    phone: "",
    documents: {
      cpf: "",
      rg: "",
      birth_date: ""
    },
    addresses: [
      {
        id: 1,
        type: "Pessoal",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zip_code: ""
      }
    ]
  });

  // Função para buscar clients da API

  // Função para atualizar client via API
  const updateClient = async (clientId, clientData) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar client');
      }

      const updatedClient = await response.json();
      setClients(prev => prev.map(client =>
        client.id === clientId ? updatedClient : client
      ));
      return updatedClient;
    } catch (err) {
      throw err;
    }
  };

  // Função para deletar client via API
  const deleteClient = async (clientId) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar client');
      }

      setClients(prev => prev.filter(client => client.id !== clientId));
    } catch (err) {
      throw err;
    }
  };

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newClient.name.trim() || !newClient.email.trim()) {
      alert('Nome e e-mail são obrigatórios!');
      return;
    }

    const cleanCPF = newClient.documents.cpf.replace(/[^\d]/g, '');
    if (!cleanCPF || cleanCPF.length !== 11) {
      alert('CPF deve ter 11 dígitos!');
      return;
    }

    if (!validateCPF(newClient.documents.cpf)) {
      alert('CPF inválido!');
      return;
    }

    try {
      const clientData = {
        ...newClient,
        nickname: newClient.nickname || newClient.name.split(' ')[0]
      };

      await createClient(clientData);
      resetNewClient();
      alert('Client criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar client: ' + error.message);
    }
  };

  const resetNewClient = () => {
    setNewClient({
      name: "",
      nickname: "",
      email: "",
      phone: "",
      documents: {
        cpf: "",
        rg: "",
        birth_date: ""
      },
      addresses: [
        {
          id: 1,
          type: "Pessoal",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zip_code: ""
        }
      ]
    });
  };

  const addAddress = () => {
    const newAddress = {
      id: newClient.addresses.length + 1,
      type: "Comercial",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: ""
    };
    setNewClient({
      ...newClient,
      addresses: [...newClient.addresses, newAddress]
    });
  };

  const removeAddress = (addressId) => {
    if (newClient.addresses.length > 1) {
      setNewClient({
        ...newClient,
        addresses: newClient.addresses.filter(end => end.id !== addressId)
      });
    }
  };

  const updateAddress = (addressId, field, value) => {
    setNewClient({
      ...newClient,
      addresses: newClient.addresses.map(end =>
        end.id === addressId ? { ...end, [field]: value } : end
      )
    });
  };

  const handleNameChange = (name) => {
    const nickname = newClient.nickname || name.split(' ')[0];
    setNewClient({
      ...newClient,
      name,
      nickname
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {/* Header da página */}
        <div className="mb-6 sm:mb-12">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4">Cadastro de Clients</h1>
          <p className="text-xs sm:text-sm text-muted">Gerencie seus clients</p>
        </div>

        {/* SeedForm para popular banco de dados */}
        <SeedForm
          title="Popular Banco de Dados"
          description="Adicione clients de exemplo ao banco de dados para testar o sistema"
          onPopulate={handlePopulateClients}
          buttonOnly={true}
        />

        {/* Estados de loading e error */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted">Carregando clients...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">Erro: {error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        ) : isSearching ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted">Buscando clients...</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8 md:space-y-12">
          {/* Formulário de cadastro */}
          <div className="bg-card/50 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-2xl font-semibold">Novo Client</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Dados Básicos */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Dados Básicos
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newClient.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                      placeholder="Nome completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">
                      Apelido
                    </label>
                    <input
                      type="text"
                      value={newClient.nickname}
                      onChange={(e) => setNewClient({...newClient, nickname: e.target.value})}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                      placeholder="Como será chamado"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                      placeholder="client@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Documentos
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">
                      CPF <span className="text-red-500">*</span>
                    </label>
                    <MaskedInput
                      mask="99999999999"
                      value={newClient.documents.cpf}
                      onChange={(e) => setNewClient({
                        ...newClient,
                        documents: {...newClient.documents, cpf: e.target.value}
                      })}
                      type="text"
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                      placeholder="00000000000"
                      required
                      maxLength="11"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">RG</label>
                    <input
                      type="text"
                      value={newClient.documents.rg}
                      onChange={(e) => setNewClient({
                        ...newClient,
                        documents: {...newClient.documents, rg: e.target.value}
                      })}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                      placeholder="00.000.000-0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Data Nascimento</label>
                    <input
                      type="date"
                      value={newClient.documents.birth_date}
                      onChange={(e) => setNewClient({
                        ...newClient,
                        documents: {...newClient.documents, birth_date: e.target.value}
                      })}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Endereços */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereços
                  </h3>
                  <button
                    type="button"
                    onClick={addAddress}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar
                  </button>
                </div>

                {newClient.addresses.map((address, index) => (
                  <div key={address.id} className="bg-background/50 border border-border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Endereço {index + 1}</h4>
                      {newClient.addresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAddress(address.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs sm:text-sm font-medium mb-1">Tipo</label>
                        <select
                          value={address.type}
                          onChange={(e) => updateAddress(address.id, 'type', e.target.value)}
                          className="select-theme w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg text-sm sm:text-base cursor-pointer"
                        >
                          <option value="Pessoal">Pessoal</option>
                          <option value="Comercial">Comercial</option>
                          <option value="Entrega">Entrega</option>
                          <option value="Cobrança">Cobrança</option>
                        </select>

                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs sm:text-sm font-medium mb-1">Logradouro</label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => updateAddress(address.id, 'street', e.target.value)}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Número</label>
                        <input
                          type="text"
                          value={address.number}
                          onChange={(e) => updateAddress(address.id, 'number', e.target.value)}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                          placeholder="123"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Complemento</label>
                        <input
                          type="text"
                          value={address.complement}
                          onChange={(e) => updateAddress(address.id, 'complement', e.target.value)}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                          placeholder="Apto, Sala, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Bairro</label>
                        <input
                          type="text"
                          value={address.neighborhood}
                          onChange={(e) => updateAddress(address.id, 'neighborhood', e.target.value)}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                          placeholder="Centro"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Cidade</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => updateAddress(address.id, 'city', e.target.value)}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                          placeholder="São Paulo"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">Estado</label>
                        <select
                          value={address.state}
                          onChange={(e) => updateAddress(address.id, 'state', e.target.value)}
                          className="select-theme w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg text-sm sm:text-base cursor-pointer"
                        >
                          <option value="" className="bg-background text-foreground">Selecione</option>
                          <option value="AC" className="bg-background text-foreground">Acre</option>
                          <option value="AL" className="bg-background text-foreground">Alagoas</option>
                          <option value="AP" className="bg-background text-foreground">Amapá</option>
                          <option value="AM" className="bg-background text-foreground">Amazonas</option>
                          <option value="BA" className="bg-background text-foreground">Bahia</option>
                          <option value="CE" className="bg-background text-foreground">Ceará</option>
                          <option value="DF" className="bg-background text-foreground">Distrito Federal</option>
                          <option value="ES" className="bg-background text-foreground">Espírito Santo</option>
                          <option value="GO" className="bg-background text-foreground">Goiás</option>
                          <option value="MA" className="bg-background text-foreground">Maranhão</option>
                          <option value="MT" className="bg-background text-foreground">Mato Grosso</option>
                          <option value="MS" className="bg-background text-foreground">Mato Grosso do Sul</option>
                          <option value="MG" className="bg-background text-foreground">Minas Gerais</option>
                          <option value="PA" className="bg-background text-foreground">Pará</option>
                          <option value="PB" className="bg-background text-foreground">Paraíba</option>
                          <option value="PR" className="bg-background text-foreground">Paraná</option>
                          <option value="PE" className="bg-background text-foreground">Pernambuco</option>
                          <option value="PI" className="bg-background text-foreground">Piauí</option>
                          <option value="RJ" className="bg-background text-foreground">Rio de Janeiro</option>
                          <option value="RN" className="bg-background text-foreground">Rio Grande do Norte</option>
                          <option value="RS" className="bg-background text-foreground">Rio Grande do Sul</option>
                          <option value="RO" className="bg-background text-foreground">Rondônia</option>
                          <option value="RR" className="bg-background text-foreground">Roraima</option>
                          <option value="SC" className="bg-background text-foreground">Santa Catarina</option>
                          <option value="SP" className="bg-background text-foreground">São Paulo</option>
                          <option value="SE" className="bg-background text-foreground">Sergipe</option>
                          <option value="TO" className="bg-background text-foreground">Tocantins</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-1">
                          CEP <span className="text-red-500">*</span>
                        </label>
                        <MaskedInput
                          mask="99999-999"
                          value={address.zip_code}
                          onChange={(e) => updateAddress(address.id, 'zip_code', e.target.value)}
                          type="text"
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                          placeholder="00000-000"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                Cadastrar Client
              </button>
            </form>
          </div>

          {/* Upload de Documentos */}
          <div className="bg-card/50 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-2xl font-semibold">Importar por Documentos</h2>
            </div>

            <DocumentUploadZone
              clientId={null} // Para novos clients, será null até cadastrar
              onDocumentUploaded={(result) => {
                console.log('Documentos enviados:', result);
                // Aqui podemos adicionar lógica para associar documentos ao client
              }}
            />
          </div>

          {/* Campo de busca */}
          <div className="max-w-4xl mx-auto mb-8 sm:mb-16">
            <div className="relative group">
              <input
                type="text"
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchClient);
                  }
                }}
                placeholder="Buscar por nome, e-mail ou CPF..."
                className="w-full px-4 py-3 text-base sm:text-lg md:text-xl bg-card border border-border rounded-xl sm:rounded-2xl
                           focus:border-primary/60 focus:outline-none
                           placeholder-muted transition-all duration-200
                           shadow-lg sm:shadow-2xl"
              />

              <button
                onClick={() => handleSearch(searchClient)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-4
                           hover:bg-border rounded-lg sm:rounded-xl transition-all duration-200
                           group-focus-within:bg-border"
              >
                <Search className="w-5 h-5 sm:w-7 sm:h-7 text-muted group-hover:text-foreground transition-colors" />
              </button>
            </div>

            {/* Dica sutil quando o campo estiver vazio */}
            {!searchClient && (
              <p className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-muted">
                Digite qualquer coisa • Busca por nome, e-mail ou CPF
              </p>
            )}
          </div>

            <div className="space-y-3 sm:space-y-4">
              {clients.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted mb-3 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-muted">
                    {searchClient ? "Nenhum client encontrado" : "Nenhum client ainda"}
                  </p>
                </div>
              ) : (
              clients.map((client) => (
                <div key={client.id} className="bg-background border border-border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {/* Header do client */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-lg">{client.name}</h3>
                      {client.nickname && client.nickname !== client.name.split(' ')[0] && (
                        <p className="text-xs sm:text-sm text-muted">Apelido: {client.nickname}</p>
                      )}
                    </div>
                    <button className="p-1 hover:bg-muted rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contato */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Documentos */}
                  {(client.documents.cpf || client.documents.rg || client.documents.birth_date) && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-muted flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Documentos
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {client.documents.cpf && (
                          <div>
                            <span className="text-muted">CPF:</span>
                            <span className="ml-1 truncate">{client.documents.cpf}</span>
                          </div>
                        )}
                        {client.documents.rg && (
                          <div>
                            <span className="text-muted">RG:</span>
                            <span className="ml-1 truncate">{client.documents.rg}</span>
                          </div>
                        )}
                        {client.documents.birth_date && (
                          <div>
                            <span className="text-muted">Nasc:</span>
                            <span className="ml-1 truncate">{new Date(client.documents.birth_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Endereço principal */}
                  {client.addresses && client.addresses.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Endereço Principal
                      </h4>
                      <div className="bg-background/50 border border-border/50 rounded p-2 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-muted">{client.addresses[0].type}</span>
                          {client.addresses.length > 1 && (
                            <span className="text-muted">+{client.addresses.length - 1} outros</span>
                          )}
                        </div>
                        <div className="space-y-0.5 text-muted">
                          <div className="truncate">{client.addresses[0].street}, {client.addresses[0].number}</div>
                          {client.addresses[0].complement && <div className="truncate">{client.addresses[0].complement}</div>}
                          <div className="truncate">{client.addresses[0].neighborhood}, {client.addresses[0].city} - {client.addresses[0].state}</div>
                          {client.addresses[0].zip_code && <div className="truncate">CEP: {client.addresses[0].zip_code}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
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
        ) : !isLoading && !error && data && !searchResults && !isSearching && (
          <div suppressHydrationWarning className="flex justify-center mt-4 sm:mt-8 space-x-2 sm:space-x-4">
            <button
              onClick={prevPage}
              disabled={!has_prev}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded disabled:opacity-50 text-sm sm:text-base"
            >
              Anterior
            </button>
            <span className="px-2 py-2 sm:px-4 text-xs sm:text-sm">
              Página {page} de {total_pages} ({total})
            </span>
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

export default function ClientsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientsContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
