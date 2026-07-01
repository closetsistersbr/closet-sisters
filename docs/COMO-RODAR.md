# Como rodar o sistema (passo a passo)

> Feito para quem nunca programou. Siga na ordem. Qualquer dúvida, me chame.

## 0. Instalar o Node.js (só uma vez)
1. Acesse **https://nodejs.org** e baixe a versão **LTS** para Windows.
2. Instale clicando "Next" até o fim.
3. Para conferir, abra o **PowerShell** e digite:
   ```
   node --version
   ```
   Deve aparecer algo como `v20.x.x`.

## 1. Preparar o backend (só na primeira vez)
No PowerShell, entre na pasta do backend:
```
cd "C:\Users\gabri\Downloads\PASTA CLAUDE CODE\CLOSET SISTERS\backend"
```

Crie o arquivo de segredos a partir do modelo:
```
copy .env.example .env
```

Abra o `.env` no Bloco de Notas e troque o valor de **JWT_SECRET** por uma
frase longa e aleatória (qualquer coisa difícil de adivinhar).

Instale as dependências:
```
npm install
```

Crie o banco e os primeiros logins (3 sócias + produtos de exemplo):
```
npm run seed
```
Anote os logins mostrados (ex.: `socia1@loja.com` / `troque123`).

## 2. Ligar o backend (toda vez que for usar)
```
cd "C:\Users\gabri\Downloads\PASTA CLAUDE CODE\CLOSET SISTERS\backend"
npm start
```
Deve aparecer: `API rodando em http://localhost:3333`.
**Deixe essa janela aberta** enquanto usa o sistema.

## 3. Abrir o sistema (frontend)
A forma mais simples: instale a extensão **Live Server** no VS Code, ou rode
um servidor simples. Com o Node já instalado, em OUTRA janela do PowerShell:
```
cd "C:\Users\gabri\Downloads\PASTA CLAUDE CODE\CLOSET SISTERS\frontend"
npx serve -l 5500
```
Depois abra no navegador: **http://localhost:5500**

> Importante: o endereço do frontend (5500) já está liberado no CORS do
> backend (veja `CORS_ORIGINS` no `.env`). Se usar outra porta, ajuste lá.

## 4. Entrar
Use um dos logins criados no passo 1 (ex.: `socia1@loja.com` / `troque123`)
e **troque a senha** depois (função de troca entra na Fase 2).

---

## Dúvidas comuns
- **"Falha ao conectar"**: o backend (passo 2) não está ligado.
- **Erro de CORS**: o frontend está numa porta diferente de 5500 — ajuste o
  `.env` e reinicie o backend.
- **Quero acessar do celular/de outro lugar**: hoje roda local (no seu PC).
  Para as 3 sócias acessarem de qualquer lugar, fazemos a Fase de publicação
  online (hospedagem gratuita + banco compartilhado).
