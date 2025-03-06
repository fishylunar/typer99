# Typer-99 Installation Guide

This guide provides detailed instructions for setting up the Typer-99 development environment on your local machine.

## Prerequisites

Before you begin, ensure your system meets the following requirements:

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **Git**: Any recent version
- **Operating System**: Windows, macOS, or Linux

You can check your current versions with these commands:

```bash
node --version
npm --version
git --version
```

## Installation Steps

### 1. Clone the Repository

Clone the Typer-99 repository from GitHub and navigate to the project directory:

```bash
git clone https://github.com/yourusername/typer99.git
cd typer99
```

### 2. Install Frontend Dependencies

Install the Next.js frontend dependencies:

```bash
npm install
```

### 3. Install Backend Dependencies

Navigate to the server directory and install the Socket.IO server dependencies:

```bash
cd server
npm install
cd ..
```

### 4. Environment Configuration

#### Frontend Environment

Create a `.env.local` file in the root directory with the following content:

```plain
NEXT_PUBLIC_SOCKET_URL=http://localhost:3004
```

#### Backend Environment (Optional)

If needed, create a `.env` file in the `server` directory:

```plain
PORT=3004
NODE_ENV=development
```

### 5. Start Development Servers

The project includes npm scripts to start both the frontend and backend servers simultaneously:

```bash
npm run dev:all
```

This will start:
- Next.js frontend on http://localhost:3003
- Socket.IO server on http://localhost:3004

Alternatively, you can start them separately:

```bash
# Start just the frontend
npm run dev

# Start just the backend
npm run server
```

### 6. Verify Installation

Open your browser and navigate to http://localhost:3003. You should see the Typer-99 homepage. Create a game to verify that the Socket.IO connection works correctly.

## Docker Setup (Alternative)

If you prefer using Docker, follow these steps:

1. Ensure Docker and Docker Compose are installed on your machine
2. Build and start the containers:

```bash
docker-compose up --build
```

This will start both the frontend and backend services in containers.

## Troubleshooting

If you encounter any issues during installation:

### Socket.IO Connection Problems

- Ensure the Socket.IO server is running on port 3004
- Check browser console for connection errors
- Verify that CORS is properly configured in the server

### Dependency Issues

If you encounter npm dependency errors:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Port Conflicts

If port 3003 or 3004 is already in use:

- Change the port in Next.js config for the frontend
- Update the PORT environment variable for the backend
- Update the NEXT_PUBLIC_SOCKET_URL to match the new backend port

## Next Steps

Now that you have Typer-99 installed, check out these resources:

- [User Guide](/Docs/user-guide.md) - Learn how to play the game
- [Contributing Guide](/Docs/contributing.md) - How to contribute to the project
- [Architecture Overview](/Docs/architecture.md) - Understand the project structure

For any additional help, please create an issue on GitHub.
