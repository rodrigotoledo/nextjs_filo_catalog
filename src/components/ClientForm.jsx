"use client";

import { useEffect } from "react";
import { UserPlus, FileText, MapPin, Plus, Trash2 } from "lucide-react";

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

export default function ClientForm({
  clientData,
  setClientData,
  onSubmit,
  onCancel,
  isEditing = false,
  title = "Novo Cliente",
  ocrData = null
}) {
  // Processar dados OCR quando recebidos
  useEffect(() => {
    if (ocrData && !isEditing) { // Só preencher automaticamente se não estiver editando
      console.log('Processando dados OCR:', ocrData);

      const updatedData = { ...clientData };

      // Preencher nome se encontrado
      if (ocrData.name && !clientData.name) {
        updatedData.name = ocrData.name;
        updatedData.nickname = ocrData.name.split(' ')[0];
      }

      // Preencher CPF se encontrado
      if (ocrData.cpf && !clientData.documents.cpf) {
        updatedData.documents = {
          ...updatedData.documents,
          cpf: ocrData.cpf
        };
      }

      // Preencher RG se encontrado
      if (ocrData.rg && !clientData.documents.rg) {
        updatedData.documents = {
          ...updatedData.documents,
          rg: ocrData.rg
        };
      }

      // Preencher data de nascimento se encontrada
      if (ocrData.birth_date && !clientData.documents.birth_date) {
        updatedData.documents = {
          ...updatedData.documents,
          birth_date: ocrData.birth_date
        };
      }

      // Preencher endereço se encontrado
      if (ocrData.address && clientData.addresses.length === 1 && !clientData.addresses[0].street) {
        const address = clientData.addresses[0];
        updatedData.addresses = [{
          ...address,
          street: ocrData.address.street || address.street,
          number: ocrData.address.number || address.number,
          neighborhood: ocrData.address.neighborhood || address.neighborhood,
          city: ocrData.address.city || address.city,
          state: ocrData.address.state || address.state,
          zip_code: ocrData.address.zip_code || address.zip_code
        }];
      }

      setClientData(updatedData);
    }
  }, [ocrData, isEditing, clientData, setClientData]);

  const handleNameChange = (name) => {
    const nickname = clientData.nickname || name.split(' ')[0];
    setClientData({
      ...clientData,
      name,
      nickname
    });
  };

  const addAddress = () => {
    const newAddress = {
      id: clientData.addresses.length + 1,
      type: "Comercial",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: ""
    };
    setClientData({
      ...clientData,
      addresses: [...clientData.addresses, newAddress]
    });
  };

  const removeAddress = (addressId) => {
    setClientData({
      ...clientData,
      addresses: clientData.addresses.filter(addr => addr.id !== addressId)
    });
  };

  const updateAddress = (addressId, field, value) => {
    setClientData({
      ...clientData,
      addresses: clientData.addresses.map(addr =>
        addr.id === addressId ? { ...addr, [field]: value } : addr
      )
    });
  };

  return (
    <div className="bg-card/50 border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        <h2 className="text-lg sm:text-2xl font-semibold">{title}</h2>
        {isEditing && onCancel && (
          <button
            onClick={onCancel}
            className="ml-auto px-3 py-1 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 text-sm"
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
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
                value={clientData.name || ''}
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
                value={clientData.nickname || ''}
                onChange={(e) => setClientData({...clientData, nickname: e.target.value})}
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
                value={clientData.email || ''}
                onChange={(e) => setClientData({...clientData, email: e.target.value})}
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
                value={clientData.phone || ''}
                onChange={(e) => setClientData({...clientData, phone: e.target.value})}
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
                value={clientData.documents.cpf || ''}
                onChange={(e) => setClientData({
                  ...clientData,
                  documents: {...clientData.documents, cpf: e.target.value}
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
                value={clientData.documents.rg || ''}
                onChange={(e) => setClientData({
                  ...clientData,
                  documents: {...clientData.documents, rg: e.target.value}
                })}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                placeholder="00.000.000-0"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Data Nascimento</label>
              <input
                type="date"
                value={clientData.documents.birth_date || ''}
                onChange={(e) => setClientData({
                  ...clientData,
                  documents: {...clientData.documents, birth_date: e.target.value}
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

          {clientData.addresses.map((address, index) => (
            <div key={address.id} className="bg-background/50 border border-border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Endereço {index + 1}</h4>
                {clientData.addresses.length > 1 && (
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
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base cursor-pointer select-theme"
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
                    value={address.street || ''}
                    onChange={(e) => updateAddress(address.id, 'street', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Número</label>
                  <input
                    type="text"
                    value={address.number || ''}
                    onChange={(e) => updateAddress(address.id, 'number', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Complemento</label>
                  <input
                    type="text"
                    value={address.complement || ''}
                    onChange={(e) => updateAddress(address.id, 'complement', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                    placeholder="Apto, Sala, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Bairro</label>
                  <input
                    type="text"
                    value={address.neighborhood || ''}
                    onChange={(e) => updateAddress(address.id, 'neighborhood', e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base"
                    placeholder="Centro"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Cidade</label>
                  <input
                    type="text"
                    value={address.city || ''}
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
                    className="select-theme w-full px-3 py-2 sm:px-4 sm:py-3 bg-background border border-border rounded-lg focus:border-primary/60 focus:outline-none text-sm sm:text-base cursor-pointer"
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

        <div className="flex gap-3">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            {isEditing ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
