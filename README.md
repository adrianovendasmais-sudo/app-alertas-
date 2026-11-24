# Agenda e Alertas — PWA

App instalável (celular e computador) que roda no **GitHub Pages** e usa o seu **Google Apps Script + planilha** como servidor.
Os dados, usuários e senhas continuam na mesma planilha de antes.

## Conteúdo
- todos os arquivos da raiz (`index.html`, `config.js`, `api-shim.js`, `sw.js`, `manifest.webmanifest`, `*.png`) → vão para o GitHub
- `apps-script/Code.gs` → vai para o **Apps Script** (não precisa subir no GitHub, mas pode)

## Passo 1 — Atualizar o Apps Script
1. Abra a planilha **que já tem os seus dados** → **Extensões → Apps Script**.
2. Substitua todo o conteúdo do `Código.gs` pelo de `apps-script/Code.gs` e salve.
   (Mantenha também o arquivo HTML `index` que já existe lá, ele continua funcionando pelo link antigo.)
3. **Implantar → Gerenciar implantações → ✏️ editar → Versão: Nova versão**.
   Confira: **Executar como: Eu** e **Quem pode acessar: Qualquer pessoa**. Clique em **Implantar**.
4. Copie o **URL do app da web** (termina em `/exec`).
5. Teste: abra `SEU_URL/exec?api=ping` no navegador. Deve aparecer `{"ok":true,"app":"Agenda e Alertas"}`.

## Passo 2 — Subir no GitHub
1. Crie um repositório (ex.: `agenda`) e envie **todos os arquivos desta pasta** (menos a pasta `apps-script`, se preferir).
2. No repositório: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save**.
3. Em 1–2 minutos o app fica em `https://SEU-USUARIO.github.io/agenda/`.

## Passo 3 — Conectar e instalar
1. Abra o endereço do GitHub Pages. Na primeira vez o app pede o **URL do Apps Script** (o `/exec`). Cole e toque em **Conectar**.
   (Para já vir preenchido, edite `config.js` e coloque o URL em `API_URL`.)
2. Entre com o seu usuário e senha de sempre.
3. **Instalar:** no Chrome/Edge use o ícone de instalar na barra de endereço; no Android, menu ⋮ → *Instalar app*; no iPhone, Safari → Compartilhar → *Adicionar à Tela de Início*.

## Observações
- Cada vez que mudar o `Code.gs`, crie uma **Nova versão** da implantação (o URL continua o mesmo).
- Atualizou o app no GitHub e o celular mostra o antigo? Feche e abra o app duas vezes (ou aumente `V` em `sw.js`).
- Trocar o servidor num aparelho: abra o console e rode `PWA_TROCAR_SERVIDOR()`, ou limpe os dados do site.
- Segurança: o endereço `/exec` fica público, mas só aceita as funções do app e todas exigem login (exceto o próprio login). Mantenha senhas fortes.
- Os alertas por WhatsApp/e-mail continuam sendo enviados pelo Apps Script (gatilho), não pelo PWA.
