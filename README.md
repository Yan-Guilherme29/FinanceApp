# 💰 FinanceApp

> App mobile de gestão financeira pessoal — simples, visual e rápido.

![React Native](https://img.shields.io/badge/React_Native-0.81-blue?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK_54-black?style=flat-square&logo=expo)
![Platform](https://img.shields.io/badge/Platform-Android_|_iOS-green?style=flat-square)

---

## 📱 Sobre o projeto

O FinanceApp nasceu para resolver um problema real: organizar ganhos e gastos de forma simples e visual, sem perder tempo. Desenvolvido para quem mora fora do país e precisa controlar finanças em múltiplas moedas.

### ✨ Funcionalidades

- **Dashboard** — resumo mensal de ganhos, gastos e saldo com navegação entre meses
- **Gráfico de pizza** — visualização de gastos por categoria
- **Meta de poupança** — defina uma % dos ganhos para guardar e acompanhe o progresso
- **Adicionar lançamentos** — rápido e simples, com suporte a múltiplas moedas
- **Categorias personalizadas** — crie suas próprias categorias com emoji
- **Histórico** — busca, filtros por tipo e agrupamento por data
- **Configurações** — ajuste a meta de poupança e a moeda padrão
- **Suporte a múltiplas moedas** — EUR, USD, BRL, GBP

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.81 | Framework mobile |
| Expo | SDK 54 | Toolchain e módulos nativos |
| Zustand | ^4.5 | Gerenciamento de estado |
| React Navigation | ^6.1 | Navegação entre telas |
| expo-secure-store | - | Armazenamento seguro local |
| expo-speech | - | Base para entrada por voz |
| react-native-gifted-charts | ^1.4 | Gráficos |
| @expo/vector-icons | - | Ícones Ionicons |
| @react-native-community/slider | - | Slider de meta de poupança |

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- Node.js instalado
- Expo Go instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Yan-Guilherme29/FinanceApp.git
cd FinanceApp

# Instale as dependências
npm install --legacy-peer-deps

# Rode o projeto
npx expo start
```

Escaneie o QR Code com o Expo Go e o app abre no seu celular!

Para acessar de qualquer rede (fora de casa):
```bash
npx expo start --tunnel
```

---

## 📁 Estrutura do projeto

```
FinanceApp/
├── src/
│   ├── database/
│   │   └── database.js          # Funções de acesso aos dados (SecureStore)
│   ├── store/
│   │   └── useStore.js          # Estado global (Zustand)
│   ├── screens/
│   │   ├── DashboardScreen.js   # Tela principal com resumo e gráficos
│   │   ├── AddTransactionScreen.js  # Adicionar ganho/gasto
│   │   ├── HistoryScreen.js     # Histórico com filtros e busca
│   │   └── SettingsScreen.js    # Configurações
│   ├── components/              # Componentes reutilizáveis (futuro)
│   └── utils/                   # Funções utilitárias (futuro)
├── App.js                       # Navegação principal
├── app.json                     # Configuração Expo
└── package.json
```

---

## 🗺️ Roadmap

### ✅ v1.0 — Concluído
- [x] Dashboard com resumo mensal
- [x] Adicionar ganhos e gastos
- [x] Categorias personalizadas
- [x] Histórico com filtros e busca
- [x] Meta de poupança com progresso visual
- [x] Suporte a múltiplas moedas
- [x] Configurações

### 🔜 v1.1 — Próximas features
- [ ] Entrada por voz completa
- [ ] Seletor de data visual
- [ ] Notificação diária de lembrete
- [ ] Gráfico de evolução semanal

### 🚀 v2.0 — Expansão futura
- [ ] Sincronização em nuvem (Supabase)
- [ ] Login e múltiplos usuários
- [ ] IA para análise de padrões de gastos
- [ ] Publicação na Play Store e App Store

---

## 👨‍💻 Desenvolvedor

**Yan Guilherme**
- GitHub: [@Yan-Guilherme29](https://github.com/Yan-Guilherme29)

---

## 📄 Licença

Este projeto é de uso privado.
