# Deploy Online — Guia de Cliques (AGORA)

Siga exatamente. Não pule nada. Qualquer erro, me chama.

---

## PASSO 1: Criar conta GitHub (3 min)

1. Abra no navegador: **https://github.com/signup**
2. Preencha:
   - **Username:** escolha um (ex.: `closet-sisters-admin`)
   - **Email:** `ghmfigueiredo@gmail.com`
   - **Senha:** crie uma forte
3. Clique **"Create account"**
4. **Confirme seu e-mail** (vai receber no Gmail)
5. Pronto! GitHub criado.

---

## PASSO 2: Criar repositório GitHub (2 min)

1. Ainda logado no GitHub, clique no **+** (canto superior direito)
2. Clique **"New repository"**
3. Preencha:
   - **Repository name:** `closet-sisters` (use exatamente esse nome)
   - **Description:** Sistema de gestão da loja
   - **Public** (deixar público)
4. Clique **"Create repository"**
5. **Copie** a URL que aparecer (tipo: `https://github.com/SEU_USUARIO/closet-sisters.git`)

---

## PASSO 3: Fazer git push do código (2 min)

No PowerShell (já dentro de `CLOSET SISTERS`):

```powershell
cd "C:\Users\gabri\Downloads\PASTA CLAUDE CODE\CLOSET SISTERS"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/closet-sisters.git
git push -u origin main
```

**TROQUE `SEU_USUARIO` pelo seu username do GitHub.**

Se pedir senha, **gere um token**:
1. GitHub → Settings (canto direito, icon de usuário)
2. Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token
4. Scope: marque `repo`
5. Copie o token
6. Cole no PowerShell (quando pedir senha)

---

## PASSO 4: Criar banco Supabase (5 min)

1. Abra: **https://supabase.com**
2. Clique **"Start your project"**
3. Entre com **GitHub** (autorize)
4. Crie um novo projeto:
   - **Project name:** `closet-sisters`
   - **Region:** South America (São Paulo)
   - Clique **"Create new project"**
5. Aguarde ~2 min
6. Quando carregar, vá em **"Developers"** (barra lateral) → **"Connection strings"**
7. Vá para **"URI"** tab
8. **COPIE** a string inteira (começa com `postgresql://...`)
9. **Cole em um arquivo de texto** — vai usar no Render

---

## PASSO 5: Publicar Backend no Render (10 min)

1. Abra: **https://render.com**
2. Clique **"Sign up"** → **"Continue with GitHub"** → autorize
3. Na dashboard, clique **"New +"** → **"Web Service"**
4. Clique **"Deploy an existing Git repository"**
5. Procure e selecione `closet-sisters` → clique **"Connect"**
6. Configure:
   - **Name:** `closet-sisters-api`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Branch:** main
7. Clique **"Advanced"**
8. Clique **"Add Environment Variable"** e preencha:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (cole a string do Supabase) |
| `JWT_SECRET` | (gere uma senha longa: `your-super-secret-key-change-this-please-12345`) |
| `CORS_ORIGINS` | `http://localhost:5500` (vai atualizar depois) |

9. Clique **"Create Web Service"**
10. Aguarde o deploy (deve levar ~2 min, ícone verde = pronto)
11. **COPIE** a URL que aparecer no topo (ex.: `https://closet-sisters-api.onrender.com`)
12. **Cole em um arquivo de texto**

---

## PASSO 6: Atualizar CORS no Render (vai fazer depois)

Faremos isso após o Netlify estar pronto. Por agora, deixa como está.

---

## PASSO 7: Publicar Frontend no Netlify (10 min)

1. Abra: **https://netlify.com**
2. Clique **"Sign up"** → **"Continue with GitHub"** → autorize
3. Clique **"Add new site"** → **"Import an existing project"**
4. Autorize Netlify no GitHub
5. Selecione `closet-sisters`
6. Na tela "Site settings":
   - **Base directory:** `frontend`
   - **Build command:** (deixe vazio)
   - **Publish directory:** `frontend`
7. Clique **"Deploy site"**
8. Aguarde ~1 min (ícone verde = pronto)
9. **COPIE** a URL do site (ex.: `https://closet-sisters.netlify.app`)
10. **Cole em um arquivo de texto**

---

## PASSO 8: Voltar no Render e atualizar CORS (2 min)

1. Volte ao painel do Render
2. Clique em `closet-sisters-api`
3. Vá em **"Environment"**
4. Edite `CORS_ORIGINS`:
   - **Antes:** `http://localhost:5500`
   - **Depois:** `https://closet-sisters.netlify.app` (a URL do Netlify)
5. Clique **"Save"**
6. O serviço reinicia automaticamente (aguarde verde)

---

## PASSO 9: Atualizar frontend para apontar para backend online (3 min)

No arquivo `frontend/js/api.js`:

**Encontre:**
```javascript
const BASE_URL = 'http://localhost:3333/api';
```

**Troque por:**
```javascript
const BASE_URL = 'https://closet-sisters-api.onrender.com/api';
```

Salve, faça commit e push:

```powershell
cd "C:\Users\gabri\Downloads\PASTA CLAUDE CODE\CLOSET SISTERS"
git add frontend/js/api.js
git commit -m "Apontar frontend para backend online"
git push
```

**Netlify vai fazer redeploy automaticamente** (~30s).

---

## PASSO 10: Popular o banco com dados iniciais (5 min)

No PowerShell:

```powershell
cd "C:\Users\gabri\Downloads\PASTA CLAUDE CODE\CLOSET SISTERS\backend"

# Defina a URL do banco
$env:DATABASE_URL="(cole aqui a string do Supabase)"

# Instale dependências
npm install

# Rode o seed (cria 3 sócias + produtos de exemplo)
npm run seed
```

Se tudo der certo, você vê:
```
Usuária criada: socia1@loja.com (senha: troque123)
Usuária criada: socia2@loja.com (senha: troque123)
Usuária criada: socia3@loja.com (senha: troque123)
Seed concluído!
```

---

## PASSO 11: Testar no navegador (5 min)

1. Abra a URL do Netlify (ex.: `https://closet-sisters.netlify.app`)
2. Faça login: `socia1@loja.com` / `troque123`
3. **Teste:**
   - Ir para "Produtos" → vê os produtos de exemplo?
   - Ir para "Vendas" → vender uma peça?
   - Abrir em outra aba com outro login (socia2) → estoque sincronizado?
   - Dashboard → números aparecem?

Se tudo funcionar, **PARABÉNS! Sistema está online!** 🎉

---

## Se algo quebrar

Diga-me exatamente:
1. Qual passo (1-11)?
2. Qual erro apareceu (se houver)?
3. Vou arrumar.

---

## Próximos passos

- **Mudar as senhas** (Fase 2)
- **Fase 2:** financeiro completo, fornecedores, fidelidade
- **Fase 3:** integrações (WhatsApp, Correios, marketplaces)
