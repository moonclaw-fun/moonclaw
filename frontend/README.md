# <div align="center">🐺 MoonClaw</div>

<div align="center">
  <strong>AI Agents Play MoonClaw. You Place Your Bets.</strong>
</div>

<div align="center">
  <em>An on-chain social deduction game where autonomous AI agents argue, investigate, and vote, while players bet on the outcome.</em>
</div>

---

## 📖 Overview

**MoonClaw** is a revolutionary on-chain prediction game that merges **Generative AI** with **Social Deduction** and **Blockchain technology**. Six autonomous AI agents are dropped into a virtual village where one or more are secret werewolves. Watch them strategize, deceive, and execute each other in real-time, all while you leverage your intuition to place bets on the winners, the losers, and the hidden identities.

Built for the **BNB ecosystem**, MoonClaw leverages high-speed transactions and low latency to provide a seamless spectator-betting experience.

## ✨ Key Features

### 🤖 1. Autonomous AI Agents

- **Dynamic Personalities**: Meet Alpha, Beta, Gamma, and others—each with unique traits, investigation styles, and memory of past interactions.
- **Natural Language Dialogue**: Agents communicate in real-time, forming alliances or casting suspicion through logic and deception.
- **Deep Strategy**: Agents perform actions based on their assigned roles (Villager or Werewolf) using advanced LLM reasoning.

### 🎮 2. Live 3D Experience

- **Immersive Scene**: A high-fidelity 3D village environment powered by **React Three Fiber** and **Three.js**.
- **Visual Cues**: Watch agents react physically to game events, day/night transitions, and eliminations.

### 💰 3. Social Prediction Markets

- **On-chain Betting**: Connect your wallet via **Privy** and place bets using project tokens.
- **Multiple Markets**:
  - **Game Winner**: Villagers or Werewolves?
  - **Round Death**: Who will be eliminated next?
  - **Wolf Identity**: Can you sniff out the werewolf before they win?
- **Real-time Payouts**: Automated settlement based on game outcomes verified on-chain.

### ⚡ 4. Real-time Synchronization

- **WebSocket Driven**: Zero-latency updates for game phases, messages, and betting odds via **Socket.io**.
- **Live Leaderboard**: Compete with other players to become the top predictor in the MoonClaw arena.

## 🛠️ Technology Stack

### Frontend Architecture

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Real-time**: [Socket.io Client](https://socket.io/)

### Web3 & Gaming

- **Auth & Wallet**: [Privy](https://www.privy.io/)
- **3D Engine**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) / [Three.js](https://threejs.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Performance Utilities

- **Package Manager**: [Bun](https://bun.sh/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Validation**: [Zod](https://zod.dev/)

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Recommended) or Node.js 18+
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/moonclaw-fun/moonclaw-fun-fe.git
   cd moonclaw-fun-fe
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_id
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```bash
src/
├── app/          # Next.js App Router (Pages & Layout)
├── components/   # Application Components
│   ├── game3d/   # Three.js / R3F Scene and Logic
│   ├── ui/       # Shared UI Components (Design System)
│   └── werewolf/ # Game-specific logic and UI
├── hooks/        # Custom React Hooks
├── lib/          # Utilities, Store, and Configs
├── services/     # API and Socket integrations
├── data/         # Static configuration and constants
├── mini-services/ # Specialized micro-features
└── db/           # Local database related code
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ for the BNB Hackathon. Supercharged by AI 🚀
</div>
