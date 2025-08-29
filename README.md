# 🚀 Agiliza - Painel Administrativo Web

Este é o painel administrativo web do sistema Agiliza, desenvolvido para gerenciar manifestos, usuários, serviços e configurações do sistema mobile.

## ✨ Funcionalidades

### 🔐 Autenticação
- Login com email ou CPF/CNPJ
- Sistema de tokens JWT
- Proteção de rotas
- Gerenciamento de sessão

### 📊 Dashboard
- Visão geral do sistema
- Estatísticas em tempo real
- Manifestos recentes
- Ações rápidas

### 📋 Gestão de Manifestos
- Listagem com filtros avançados
- Criação de novos manifestos
- Edição e atualização
- Controle de status
- Visualização detalhada
- Busca por descrição, usuário ou cidade

### 👥 Gestão de Usuários
- Listagem de usuários
- Criação de novos usuários
- Edição de perfis
- Controle de permissões

### ⚙️ Configurações
- Personalização da empresa
- Cores e branding
- Logo e identidade visual

## 🛠️ Tecnologias

- **Frontend**: React 19 + TypeScript
- **Estilização**: Tailwind CSS 4
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form + Yup
- **HTTP Client**: Axios
- **Ícones**: Lucide React
- **UI Components**: Headless UI
- **Build Tool**: Vite

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Backend Laravel rodando (ver [Agiliza Backend](../Agiliza))

### Passos para instalação

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd "Agiliza Front Web"

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do projeto:
VITE_API_URL=http://localhost:8000/api

# 4. Execute a aplicação em modo de desenvolvimento
npm run dev

# 5. Acesse a aplicação
# http://localhost:5173
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000/api
```

### Configuração do Backend

Certifique-se de que o backend Laravel esteja rodando e acessível na URL configurada em `VITE_API_URL`.

## 📱 Uso

### Login
1. Acesse a aplicação
2. Use as credenciais de administrador:
   - **Email**: `admin@agiliza.com`
   - **Senha**: `password`

### Navegação
- **Dashboard**: Visão geral do sistema
- **Manifestos**: Gerenciamento de manifestos
- **Usuários**: Gestão de usuários
- **Serviços**: Configuração de serviços
- **Categorias**: Organização de categorias
- **Tipos**: Definição de tipos de serviço
- **Empresa**: Configurações da empresa

### Gerenciamento de Manifestos
1. Acesse a seção "Manifestos"
2. Use os filtros para encontrar manifestos específicos
3. Clique em "Novo Manifesto" para criar
4. Use as ações para visualizar, editar ou excluir

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface
│   └── Layout.tsx      # Layout principal
├── contexts/            # Contextos React
│   └── AuthContext.tsx # Contexto de autenticação
├── pages/               # Páginas da aplicação
│   ├── Dashboard.tsx   # Página principal
│   ├── Login.tsx       # Página de login
│   └── Manifests.tsx   # Gestão de manifestos
├── services/            # Serviços de API
│   └── api.ts          # Cliente HTTP
├── types/               # Definições TypeScript
│   └── index.ts        # Interfaces e tipos
├── App.tsx              # Componente principal
└── main.tsx            # Ponto de entrada
```

## 🔌 API Integration

A aplicação se integra com a API Laravel através do serviço `api.ts`, que inclui:

- Autenticação JWT
- CRUD para todas as entidades
- Tratamento de erros
- Interceptors para tokens
- Tipagem TypeScript completa

## 🎨 Design System

### Cores
- **Primária**: Azul (#2563eb)
- **Secundária**: Cinza (#6b7280)
- **Sucesso**: Verde (#10b981)
- **Aviso**: Amarelo (#f59e0b)
- **Erro**: Vermelho (#ef4444)

### Componentes
- **Button**: Botões com variantes e estados
- **Input**: Campos de entrada com validação
- **Card**: Containers para conteúdo
- **Modal**: Janelas modais responsivas
- **Table**: Tabelas com ordenação e filtros

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (até 767px)

## 🚀 Deploy

### Build de Produção

```bash
npm run build
```

### Servidor de Produção

```bash
npm run preview
```

## 🧪 Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Verificação de código
```

### Estrutura de Desenvolvimento

1. **Componentes**: Crie componentes reutilizáveis em `src/components/`
2. **Páginas**: Adicione novas páginas em `src/pages/`
3. **Tipos**: Defina interfaces em `src/types/`
4. **Serviços**: Implemente chamadas de API em `src/services/`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte técnico, entre em contato com a equipe de desenvolvimento.

**Desenvolvido com ❤️ pela equipe Agiliza**
