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
