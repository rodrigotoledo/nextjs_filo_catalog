"use client";

import { useState } from "react";
import { UserPlus, Users, Mail, Phone, MapPin, FileText, Plus, Trash2, Edit, Search } from "lucide-react";
import DocumentUploadZone from "../../components/DocumentUploadZone";

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

export default function ClientesPage() {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: "João Silva",
      nickname: "João",
      email: "joao@email.com",
      phone: "(11) 99999-9999",
      documents: {
        cpf: "123.456.789-00",
        rg: "12.345.678-9",
        birth_date: "1985-05-15"
      },
      addresses: [
        {
          id: 1,
          type: "Pessoal",
          street: "Rua das Flores",
          number: "123",
          complement: "Apto 45",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zip_code: "01234-567"
        }
      ]
    },
    {
      id: 2,
      name: "Maria Santos",
      nickname: "Maria",
      email: "maria@email.com",
      phone: "(21) 88888-8888",
      documents: {
        cpf: "987.654.321-00",
        rg: "98.765.432-1",
        birth_date: "1990-08-22"
      },
      addresses: [
        {
          id: 1,
          type: "Comercial",
          street: "Av. Brasil",
          number: "456",
          complement: "Sala 1201",
          neighborhood: "Centro",
          city: "Rio de Janeiro",
          state: "RJ",
          zip_code: "20000-000"
        }
      ]
    }
  ]);

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

  const [selectedClient, setSelectedClient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchClients, setSearchClients] = useState("");
  const [searchClient, setSearchClient] = useState("");

  // Filtrar clientes baseado na busca
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.email.toLowerCase().includes(searchClient.toLowerCase()) ||
    client.documents.cpf.includes(searchClient.replace(/[^\d]/g, ''))
  );

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

  const handleSubmit = (e) => {
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

    const nickname = newClient.nickname || newClient.name.split(' ')[0];

    const client = {
      id: clients.length + 1,
      ...newClient,
      nickname
    };

    setClients([...clients, client]);
    resetNewClient();
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
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4">Cadastro de Clientes</h1>
          <p className="text-xs sm:text-sm text-muted">Gerencie seus clientes</p>
        </div>

        <div className="space-y-6 sm:space-y-8 md:space-y-12">
          {/* Formulário de cadastro */}
          <div className="bg-card/50 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-2xl font-semibold">Novo Cliente</h2>
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
                      placeholder="cliente@email.com"
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
                Cadastrar Cliente
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
              clienteId={null} // Para novos clientes, será null até cadastrar
              onDocumentUploaded={(result) => {
                console.log('Documentos enviados:', result);
                // Aqui podemos adicionar lógica para associar documentos ao cliente
              }}
            />
          </div>

          {/* Lista de clientes */}
          <div className="bg-card/50 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h2 className="text-lg sm:text-2xl font-semibold">Clientes</h2>
              <span className="bg-primary text-primary-foreground px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs sm:text-sm">
                {filteredClients.length}
              </span>
            </div>

            {/* Campo de busca */}
            <div className="mb-4 sm:mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou CPF..."
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted mb-3 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-muted">
                    {searchClient ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
                  </p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div key={client.id} className="bg-background border border-border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {/* Header do cliente */}
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
        </div>
      </div>
    </div>
  );
}
