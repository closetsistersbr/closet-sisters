# Deploy Online — Checklist

Antes de publicar, marque tudo aqui:

## Preparação local
- [ ] Código em `CLOSET SISTERS` totalmente migrado para Postgres
- [ ] `backend/package.json` atualizado (pg no lugar de better-sqlite3)
- [ ] `backend/.env.example` atualizado com URLs Postgres
- [ ] `backend/Procfile` criado
- [ ] `.gitignore` protegendo segredos
- [ ] `docs/PUBLICAR-ONLINE.md` lido e entendido

## GitHub
- [ ] Conta criada em github.com
- [ ] Repositório `closet-sisters` criado
- [ ] Código feito `git push` para main
- [ ] `.env` (arquivo real) **NÃO** foi versionado
- [ ] Apenas `.env.example` está no repositório

## Supabase (Banco)
- [ ] Conta criada
- [ ] Projeto "closet-sisters" criado na região São Paulo
- [ ] Connection String **copiada e guardada** (vai usar no Render)
- [ ] Database criado (automático)

## Render (Backend)
- [ ] Conta criada / conectada com GitHub
- [ ] Web Service criado a partir do repositório
- [ ] Environment variables configuradas:
  - [ ] `DATABASE_URL` = string do Supabase
  - [ ] `NODE_ENV` = `production`
  - [ ] `JWT_SECRET` = valor aleatório forte
  - [ ] `CORS_ORIGINS` = URL do Netlify (vem do passo 5)
- [ ] Deploy completou (deve ver "live")
- [ ] URL do backend **copiada** (tipo `https://closet-sisters-api.onrender.com`)

## Frontend (antes de Netlify)
- [ ] `frontend/js/api.js` atualizado com URL do Render
- [ ] Arquivo comitado e feito push para GitHub

## Netlify (Frontend)
- [ ] Conta criada / conectada com GitHub
- [ ] Site criado a partir do repositório
- [ ] Base directory = `frontend`
- [ ] Publish directory = `frontend`
- [ ] Deploy completou
- [ ] URL do site **copiada** (tipo `https://closet-sisters.netlify.app`)

## Voltar no Render para sincronizar
- [ ] Voltar ao painel do Render
- [ ] Atualizar `CORS_ORIGINS` com a URL do Netlify
- [ ] Web Service reiniciou (automático ou manual)

## Banco online — seed
- [ ] No PowerShell, rodado `npm run seed` apontando para o Postgres online
- [ ] Três sócias criadas com sucesso
- [ ] Produtos de exemplo no banco

## Testes finais
- [ ] Acessar a URL do Netlify no navegador
- [ ] Fazer login com `socia1@loja.com` / `troque123`
- [ ] Tentar vender uma peça
- [ ] Abrir em outra aba/celular — estoque sincronizado?
- [ ] Dashboard mostra os números do dia
- [ ] Relatórios funcionam

## Após publicar
- [ ] Documentar os logins seguros em local seguro (não no código!)
- [ ] **Mudar as senhas** padrão (Fase 2)
- [ ] Testar com as outras 2 sócias

## Links úteis
- Backend: [https://closet-sisters-api.onrender.com/api/health](https://closet-sisters-api.onrender.com/api/health)
- Frontend: [https://closet-sisters.netlify.app](https://closet-sisters.netlify.app)
- Supabase: https://app.supabase.com
- Render: https://dashboard.render.com
- Netlify: https://app.netlify.com
