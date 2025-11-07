# Piano Pads

Aplicativo de pads musicais com controle de volume e mixagem.

## Ambientes

### Produção
```bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
```

### QA (com logs e versão visível)
```bash
npm run dev:qa     # Desenvolvimento com logs
npm run build:qa   # Build para QA
```

## Variáveis de Ambiente

- `.env` - Ambiente de produção (padrão)
- `.env.qa` - Ambiente de QA com logs e versão habilitados

## Versionamento Automático

O projeto está configurado para **incrementar automaticamente a versão** a cada commit:

- ✅ **Automático**: Ao fazer `git commit`, a versão patch é incrementada (ex: 1.2.1 → 1.2.2)
- ✅ **Git Hook**: Usa `.git/hooks/pre-commit` para executar antes do commit
- ✅ **Incluído no commit**: O `package.json` atualizado é automaticamente adicionado

### Comandos Manuais (Opcionais)

Se preferir controlar manualmente:

```bash
npm run version:patch  # 1.2.1 → 1.2.2 (bugfix)
npm run version:minor  # 1.2.1 → 1.3.0 (nova feature)
npm run version:major  # 1.2.1 → 2.0.0 (breaking change)
```

### Como Funciona

1. Você faz alterações no código
2. Executa `git add .`
3. Executa `git commit -m "sua mensagem"`
4. **O hook pre-commit é acionado automaticamente**:
   - Incrementa a versão patch
   - Adiciona `package.json` ao commit
5. Commit é finalizado com a nova versão

## Funcionalidades

- 🎹 Pads de piano com múltiplas notas
- 🎚️ Controle individual de volume por faixa
- 🔇 Mute/Unmute por faixa
- 📱 Layout responsivo (portrait/landscape)
- 🔒 Wake Lock para manter a tela ativa
- 📊 Console de logs (apenas em QA)
- 🏷️ Exibição de versão (apenas em QA)

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Nota sobre Tailwind

Este repositório teve a configuração do Tailwind removida (arquivos de configuração e diretivas CSS). Se você estiver migrando do Tailwind para CSS puro, execute localmente os comandos abaixo para remover os pacotes das dependências instaladas e reconstruir o projeto:

```bash
# remover pacotes do Tailwind/PostCSS instalados localmente
npm uninstall tailwindcss postcss autoprefixer

# reinstalar dependências e rodar dev/build
npm install
npm run dev    # ou npm run build
```

Observação: os componentes ainda podem usar classes utilitárias do Tailwind (por exemplo: `className="flex items-center ..."`). Esses utilitários não terão efeito após a remoção do Tailwind. Posso ajudar a substituir as classes Tailwind por classes CSS ou criar um conjunto de utilitários CSS mínimo para o projeto — diga qual abordagem prefere.
