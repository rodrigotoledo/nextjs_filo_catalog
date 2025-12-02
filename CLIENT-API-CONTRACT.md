# Cliente API Contract

Este documento define a estrutura de dados completa para operações de **create** e **update** de clientes no sistema FiloCommander.

## 📋 Estrutura de Dados - Cliente

### Campos Principais

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `number` | ❌ (apenas update) | ID único do cliente |
| `name` | `string` | ✅ | Nome completo do cliente |
| `nickname` | `string` | ❌ | Apelido/apelido do cliente |
| `email` | `string` | ✅ | E-mail do cliente |
| `phone` | `string` | ❌ | Telefone com máscara: `(11) 99999-9999` |
| `documents` | `object` | ✅ | Objeto contendo documentos |
| `addresses` | `array` | ✅ | Array de endereços (mínimo 1) |

### Objeto `documents`

| Campo | Tipo | Obrigatório | Descrição | Formato |
|-------|------|-------------|-----------|---------|
| `cpf` | `string` | ✅ | CPF do cliente | `999.999.999-99` |
| `rg` | `string` | ❌ | RG do cliente | Texto livre |
| `birth_date` | `string` | ❌ | Data de nascimento | `YYYY-MM-DD` |

### Objeto `addresses[]` (Array de Endereços)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `number` | ❌ (apenas update) | ID único do endereço |
| `type` | `string` | ✅ | Tipo: `"Pessoal"`, `"Comercial"`, `"Outro"` |
| `street` | `string` | ✅ | Nome da rua/avenida |
| `number` | `string` | ✅ | Número do endereço |
| `complement` | `string` | ❌ | Complemento (apto, sala, etc.) |
| `neighborhood` | `string` | ✅ | Bairro |
| `city` | `string` | ✅ | Cidade |
| `state` | `string` | ✅ | Estado (UF) - 2 letras maiúsculas |
| `zip_code` | `string` | ✅ | CEP com máscara: `99999-999` |

## 🚀 Operações da API

### CREATE - Novo Cliente

**Endpoint:** `POST /api/clientes`
**Payload:** Cliente sem `id` e endereços sem `id`

```json
{
  "name": "João Silva",
  "nickname": "João",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "documents": {
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "birth_date": "1985-05-15"
  },
  "addresses": [
    {
      "type": "Pessoal",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zip_code": "01234-567"
    }
  ]
}
```

### UPDATE - Cliente Existente

**Endpoint:** `PUT /api/clientes/{id}`
**Payload:** Cliente com `id` e endereços com ou sem `id`

```json
{
  "id": 1,
  "name": "João Silva",
  "nickname": "João",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "documents": {
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "birth_date": "1985-05-15"
  },
  "addresses": [
    {
      "id": 1,
      "type": "Pessoal",
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zip_code": "01234-567"
    },
    {
      "type": "Comercial",
      "street": "Av. Brasil",
      "number": "456",
      "complement": "Sala 1201",
      "neighborhood": "Centro",
      "city": "Rio de Janeiro",
      "state": "RJ",
      "zip_code": "20000-000"
    }
  ]
}
```

## 📊 Estrutura do Banco de Dados

### Tabela `clients`

```sql
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `documents`

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    rg VARCHAR(20),
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela `addresses`

```sql
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Pessoal', 'Comercial', 'Outro')),
    street VARCHAR(100) NOT NULL,
    number VARCHAR(10) NOT NULL,
    complement VARCHAR(50),
    neighborhood VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state CHAR(2) NOT NULL,
    zip_code VARCHAR(9) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ✅ Validações

### Cliente

- `name`: obrigatório, 2-100 caracteres
- `nickname`: opcional, máximo 50 caracteres
- `email`: obrigatório, formato válido de e-mail
- `phone`: opcional, formato `(XX) XXXXX-XXXX`

### Documentos

- `cpf`: obrigatório, formato `XXX.XXX.XXX-XX`, deve ser válido
- `rg`: opcional, máximo 20 caracteres
- `birth_date`: opcional, formato `YYYY-MM-DD`

### Endereços

- Pelo menos 1 endereço obrigatório
- `type`: obrigatório, valores: "Pessoal", "Comercial", "Outro"
- `street`: obrigatório, 3-100 caracteres
- `number`: obrigatório, máximo 10 caracteres
- `complement`: opcional, máximo 50 caracteres
- `neighborhood`: obrigatório, 2-50 caracteres
- `city`: obrigatório, 2-50 caracteres
- `state`: obrigatório, exatamente 2 letras maiúsculas
- `zip_code`: obrigatório, formato `XXXXX-XXX`

## 📤 Respostas da API

### Sucesso (201 Created)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "João Silva",
    "nickname": "João",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "documents": {
      "cpf": "123.456.789-00",
      "rg": "12.345.678-9",
      "birth_date": "1985-05-15"
    },
    "addresses": [
      {
        "id": 456,
        "type": "Pessoal",
        "street": "Rua das Flores",
        "number": "123",
        "complement": "Apto 45",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01234-567"
      }
    ]
  },
  "message": "Cliente criado com sucesso"
}
```

### Erro de Validação (400 Bad Request)

```json
{
  "success": false,
  "errors": {
    "name": ["Nome é obrigatório"],
    "email": ["E-mail deve ser válido"],
    "documents.cpf": ["CPF inválido"],
    "addresses.0.street": ["Logradouro é obrigatório"]
  },
  "message": "Dados inválidos"
}
```

## 🔗 Relacionamentos

- **1 Cliente** pode ter **1 Documento** (one-to-one)
- **1 Cliente** pode ter **N Endereços** (one-to-many)
- Todos os registros são **soft delete** (não removidos fisicamente)

---

**Nota:** Este contrato define a estrutura completa para integração entre frontend (Next.js) e backend (Python/FastAPI).
