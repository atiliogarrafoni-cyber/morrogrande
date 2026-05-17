# CaféReg — Guia de Instalação e Deploy

Sistema web de controle de qualidade para café cru: registro de lotes, montagem de blends e aprovação por liga.

---

## Tecnologias usadas

- **Next.js 14** (front-end e roteamento)
- **Supabase** (banco de dados PostgreSQL na nuvem — gratuito)
- **Vercel** (hospedagem — gratuita)
- **Tailwind CSS** (estilos)

---

## PASSO 1 — Criar banco de dados no Supabase (5 minutos)

1. Acesse **https://supabase.com** e crie uma conta gratuita
2. Clique em **"New project"**, dê um nome (ex: `cafereg`) e escolha uma senha
3. Aguarde o projeto criar (1-2 minutos)
4. No menu lateral, clique em **"SQL Editor"**
5. Cole **todo o conteúdo** do arquivo `supabase_schema.sql` e clique em **"Run"**
6. Você verá as tabelas criadas: `lotes`, `ligas`, `blends`

### Pegar as credenciais:
- No menu lateral: **Settings → API**
- Copie:
  - **Project URL** → será seu `NEXT_PUBLIC_SUPABASE_URL`
  - **anon / public key** → será seu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## PASSO 2 — Publicar no GitHub (3 minutos)

1. Acesse **https://github.com** e crie uma conta gratuita (se não tiver)
2. Clique em **"New repository"**, nomeie como `cafereg`, deixe público, clique em **"Create"**
3. Instale o **Git** no seu computador se ainda não tiver: https://git-scm.com/downloads
4. Abra o terminal/prompt na pasta do projeto e execute:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/cafereg.git
git push -u origin main
```

> Substitua `SEU_USUARIO` pelo seu usuário do GitHub.

---

## PASSO 3 — Deploy na Vercel (3 minutos)

1. Acesse **https://vercel.com** e crie conta gratuita (pode entrar com o GitHub)
2. Clique em **"Add New → Project"**
3. Selecione o repositório `cafereg` que você criou
4. Na seção **"Environment Variables"**, adicione as duas variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL` → cole o valor copiado do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → cole o valor copiado do Supabase
5. Clique em **"Deploy"**
6. Aguarde 1-2 minutos — a Vercel vai gerar um link como:
   **https://cafereg-seuusuario.vercel.app**

---

## PASSO 4 — Compartilhar com a equipe

Envie o link gerado pela Vercel para toda a equipe. Todos acessam o mesmo banco de dados em tempo real, sem instalar nada.

**Exemplo de link:** `https://cafereg.vercel.app`

> Para um domínio personalizado (ex: `cafereg.suaempresa.com.br`), configure em Vercel → Settings → Domains.

---

## Atualizar o sistema no futuro

Para aplicar qualquer mudança:

```bash
git add .
git commit -m "descricao da mudanca"
git push
```

A Vercel detecta automaticamente e publica a nova versão em 1-2 minutos.

---

## Estrutura do projeto

```
cafereg/
├── src/
│   ├── app/
│   │   ├── page.tsx          → Receber lote
│   │   ├── estoque/          → Estoque + edição de lotes
│   │   ├── blend/            → Montagem e aprovação de blend
│   │   ├── historico/        → Blends aprovados
│   │   └── ligas/            → Gestão de ligas
│   ├── components/
│   │   ├── Nav.tsx           → Menu de navegação
│   │   ├── LoteForm.tsx      → Formulário de lote (criar e editar)
│   │   └── Stars.tsx         → Componente de estrelas
│   └── lib/
│       └── supabase.ts       → Cliente do banco de dados
├── supabase_schema.sql       → Script para criar o banco
└── .env.local.example        → Modelo de variáveis de ambiente
```

---

## Dúvidas frequentes

**O sistema é seguro?**
Sim. Por padrão, qualquer pessoa com o link pode ler e escrever dados. Para adicionar login com senha, me peça — é uma extensão do Supabase Auth.

**Posso usar no celular?**
Sim, o sistema é responsivo e funciona em qualquer navegador.

**Os dados ficam salvos?**
Sim. O Supabase armazena tudo no banco de dados em nuvem. Os dados não se perdem ao fechar o navegador.

**Quanto custa?**
Zero para começar. O plano gratuito do Supabase suporta até 500 MB de dados e 50.000 requisições/mês — mais que suficiente para uso diário numa empresa de médio porte.
