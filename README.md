# Typer-99

A battle royale typing game where speed and accuracy determine your fate. Race against other players to type the fastest and most accurately in this real-time multiplayer typing competition.

![image](https://github.com/user-attachments/assets/1fb8d66b-738b-496c-9170-ca4977709313)


## Overview

Typer-99 is a real-time multiplayer typing game built with Next.js and Socket.IO. Players can compete against each other or AI opponents in various game modes, testing their typing speed and accuracy. The game features a battle royale mode where players can send word attacks to opponents, adding a strategic element to the competition.

## Game Modes

- **1v1**: Direct competition between two players - first to finish the text wins
- **Free-for-All**: Up to 10 players racing to finish the text first
- **Battle Royale**: Type faster to attack other players with extra words
- **Practice**: Play against AI opponents with adjustable difficulty

## Key Features

- **Real-time Multiplayer**: Compete against players around the world
- **Live Progress Tracking**: See everyone's progress, WPM, and accuracy in real-time
- **Performance Metrics**: Detailed statistics on your typing performance
- **Customizable Themes**: Multiple themes available with options to create your own
- **Responsive Design**: Play on desktop or tablets with a responsive interface

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/fishylunar/typer99.git
   cd typer99
   ```

2. Install dependencies:
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. Start the development servers:
   ```bash
   npm run dev:all
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Documentation

For detailed information about Typer-99, please check our documentation:

- [Installation Guide](/Docs/installation.md) - Detailed setup instructions
- [User Guide](/Docs/user-guide.md) - Learn how to play the game
- [Game Mechanics](/Docs/game-mechanics.md) - Detailed explanation of game mechanics
- [Architecture Overview](/Docs/architecture.md) - Technical architecture of the application
- [Frontend Documentation](/Docs/frontend.md) - Details about the Next.js frontend
- [Backend Documentation](/Docs/backend.md) - Details about the Socket.IO server
- [API Reference](/Docs/api-reference.md) - Socket.IO events documentation
- [Component Reference](/Docs/component-reference.md) - Frontend component documentation
- [Theme Customization](/Docs/themes.md) - Guide to customizing game themes
- [Contributing Guide](/Docs/contributing.md) - How to contribute to the project
- [Known Issues](/Docs/known-bugs.md) - List of known bugs and workarounds
- [Roadmap](/Docs/future-features.md) - Planned features and improvements

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.IO
- **Real-time Communication**: Socket.IO
- **Styling**: Tailwind CSS with custom theming

## License

MIT
