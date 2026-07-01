# Publicar o sistema online (passo a passo)

> Isso deixa as 3 sócias acessando de qualquer lugar, com estoque em tempo real compartilhado.
> Tudo é grátis. Siga na ordem.

---

## Stack escolhida

| Componente | Serviço | Plano | Custo |
|---|---|---|---|
| **Banco de dados** | Supabase (Postgres) | Free | Grátis |
| **Backend (API)** | Render | Free | Grátis + hibernação (acorda em ~30s) |
| **Frontend (site)** | Netlify | Free | Grátis |
| **Versionamento** | GitHub | Free | Grátis |

---

## 1. Criar conta no GitHub (5 min)

1. Acesse **https://github.com/signup**.
2. Crie uma conta com seu e-mail.
3. Confirme no e-mail.

---

## 2. Enviar o código para GitHub (10 min)

No PowerShell, dentro da pasta `CLOSET SISTERS`:

```powershell
git init
git add .
git commit -m "Inicializar sistema CLOSET SISTERS"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/closet-sisters.git
git push -u origin main
```

Troque `SEU_USUARIO` pelo seu username no GitHub.

---

## 3. Criar banco de dados online (5 min)

1. Acesse **https://supabase.com** e clique "Start your project".
2. Entre com sua conta GitHub (autorize).
3. Crie um **novo projeto**: nome "closet-sisters", região "South America (São Paulo)".
4. **COPIE** a "Connection String" (`postgresql://...`) de "Developers" → "Connection strings".
5. **Guarde** esse valor — vai usar no passo 5.

---

## 4. Publicar o backend (Render) (10 min)

1. Acesse **https://render.com** e entre com GitHub.
2. Clique **"New +"** → **"Web Service"** → **"Deploy an existing Git repository"**.
3. Autorize Render para acessar seu repositório GitHub.
4. Selecione `closet-sisters` e clique **"Connect"**.
5. **Configure:**
   - **Name:** closet-sisters-api
   - **Environment:** Node
   - **Build command:** `npm install`
   - **Start command:** `node src/server.js`
6. Clique **"Advanced"** → **"Add Environment Variable":**
   - **Key:** `DATABASE_URL`
   - **Value:** Cole a string do Supabase (passo 3)
   - Adicione também:
     - `NODE_ENV`: `production`
     - `JWT_SECRET`: Cole um valor aleatório longo (copie de `.env.example`)
     - `CORS_ORIGINS`: `https://closetsisters.netlify.app` (vai atualizar no passo 6)
7. Clique **"Create Web Service"** e aguarde o deploy (~2 min).
8. **Copie** a URL que aparecer (ex.: `https://closet-sisters-api.onrender.com`).

---

## 5. Atualizar `.env.example` local (3 min)

No arquivo `backend/.env.example`:

```
# Atualize CORS_ORIGINS com a URL do Render do passo 4:
CORS_ORIGINS=https://closet-sisters-api.onrender.com

# E atualize DATABASE_URL com a string do Supabase:
DATABASE_URL=postgresql://seu_usuario:sua_senha@seu_host:5432/postgres
```

Commit e push:

```powershell
git add backend/.env.example
git commit -m "Atualizar URLs de produção"
git push
```

---

## 6. Publicar o frontend (Netlify) (10 min)

1. Acesse **https://netlify.com** e entre com GitHub.
2. Clique **"New site from Git"** → **"GitHub"** → Autorize → selecione `closet-sisters`.
3. **Configure:**
   - **Base directory:** `frontend`
   - **Build command:** deixar vazio
   - **Publish directory:** `frontend`
4. Clique **"Deploy site"** e aguarde (~1 min).
5. **Copie** a URL do site (ex.: `https://closet-sisters.netlify.app`).

---

## 7. Conectar frontend com backend (5 min)

No arquivo `frontend/js/api.js`, atualize:

```javascript
const BASE_URL = 'https://closet-sisters-api.onrender.com/api';
```

Commit e push:

```powershell
git add frontend/js/api.js
git commit -m "Apontar frontend para backend online"
git push
```

Netlify vai fazer redeploy automaticamente.

---

## 8. Popular o banco online (5 min)

No PowerShell, dentro de `backend/`:

```powershell
$env:DATABASE_URL="postgresql://seu_usuario:sua_senha@seu_host/postgres"
npm install
npm run seed
```

Isso cria as 3 sócias e produtos de exemplo no banco online.

---

## 9. Testar

Acesse **https://closet-sisters.netlify.app** no navegador (ou no celular):

1. Faça login com `socia1@loja.com` / `troque123`.
2. Venda uma peça.
3. Abra em outra aba/celular com outro login — o estoque deve estar **em tempo real sincronizado** entre as 3 sócias.

---

## 📝 Após publicar

- **Mudar senhas:** Crie uma tela de "Alterar senha" na Fase 2.
- **Domínio bonito:** Compre um `.com.br` (~R$ 40/ano) e aponte para Netlify.
- **Backups:** Supabase faz backups automáticos (veja em "Settings" → "Backups").
- **Monitoramento:** Render oferece logs em "Logs" no painel.

---

## Dúvidas comuns

- **"Erro CORS ao vender":** O `CORS_ORIGINS` no Render está errado. Atualize no painel de "Environment".
- **"Hibernação demora":** Sim, Render gratuito hiberna após 15 min. Ideal depois para upgrade.
- **"Quero mais espaço no banco":** Supabase gratuito oferece 500 MB (suficiente para começar).
