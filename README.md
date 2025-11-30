# Photo Finder

Um catálogo privado de fotos com busca semântica powered by IA. Upload em massa, processamento automático e interface moderna.

## Funcionalidades

- **Upload em Massa**: Arraste e solte milhares de fotos de uma vez
- **Busca Semântica**: Encontre fotos por descrição natural usando IA
- **Catálogo Privado**: 100% privado, sem dados enviados para terceiros
- **Interface Moderna**: Design responsivo com Tailwind CSS
- **API Integrada**: Backend em FastAPI para processamento e armazenamento

## Tecnologias

- **Frontend**: Next.js 15, React, Tailwind CSS, React Query
- **Backend**: FastAPI (Python) - esperado em `http://localhost:8000`
- **Upload**: Suporte a múltiplas imagens via drag & drop
- **Estado**: Gerenciamento com React Query para cache e sincronização

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── photos/          # API para listar fotos (com paginação)
│   │   └── upload/          # API para upload de fotos
│   ├── globals.css          # Estilos globais
│   ├── layout.js            # Layout da aplicação
│   └── page.jsx             # Página principal
├── components/
│   ├── PhotoGrid.jsx        # Grid de exibição das fotos
│   ├── SearchBar.jsx        # Barra de busca
│   └── UploadZone.jsx       # Zona de upload
```

## Pré-requisitos

- Node.js 18+
- Python 3.8+ (para o backend FastAPI)
- FastAPI backend rodando em `localhost:8000`

## Instalação e Execução

1. **Clone o repositório**:

   ```bash
   git clone <repo-url>
   cd photo-finder
   ```

2. **Instale as dependências**:

   ```bash
   npm install
   ```

3. **Configure o ambiente**:

   Copie `.env.local` e ajuste se necessário:

   ```text
   FASTAPI_URL=http://localhost:8000
   ```

4. **Inicie o backend FastAPI** (em outro terminal):

   ```bash
   # No diretório do FastAPI
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Execute o frontend**:

   ```bash
   npm run dev
   ```

6. **Acesse**: [http://localhost:3000](http://localhost:3000)

## Como Usar

1. **Upload**: Arraste fotos para a zona de upload ou clique para selecionar
2. **Visualizar**: As fotos aparecem automaticamente no grid após upload
3. **Navegar**: Use paginação para ver mais fotos
4. **Buscar**: Use a barra de busca para consultas semânticas (futuro)

## API Endpoints

- `POST /api/upload`: Envia fotos para o FastAPI
- `GET /api/photos?page=1`: Lista fotos paginadas do FastAPI

## Desenvolvimento

- **Hot Reload**: Mudanças são aplicadas automaticamente
- **Linting**: ESLint configurado
- **Build**: `npm run build` para produção

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push e abra um PR

## Licença

MIT
