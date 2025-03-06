# Contributing to Typer-99

Thank you for your interest in contributing to Typer-99! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Project Structure](#project-structure)

## Code of Conduct

By participating in this project, you agree to uphold our Code of Conduct:

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js v16 or higher
- npm v7 or higher
- Git

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/typer99.git
   cd typer99
   ```

3. Add the original repository as a remote:
   ```bash
   git remote add upstream https://github.com/original-owner/typer99.git
   ```

4. Install dependencies for both frontend and backend:
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

5. Create a branch for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes in your feature branch
2. Run tests to ensure your changes do not break existing functionality:
   ```bash
   npm test
   ```

3. Start the development servers to test your changes:
   ```bash
   npm run dev:all
   ```

4. Commit your changes with a descriptive commit message:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request from your forked repository to the original repository

## Pull Request Guidelines

When submitting a pull request:

1. Fill out the pull request template completely
2. Link any relevant issues
3. Include screenshots or recordings for UI changes
4. Make sure all tests pass
5. Update documentation as needed
6. Keep PRs focused on a single change
7. Rebase your branch before submitting

### PR Review Process

1. At least one maintainer must approve your PR
2. CI checks must pass
3. Documentation must be up to date
4. Code must follow project standards

## Coding Standards

### Frontend (TypeScript/React)

- Use functional components with hooks instead of class components
- Use TypeScript types for all props and state
- Follow the naming conventions:
  - Components: PascalCase
  - Files: PascalCase.tsx for components
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Interfaces/Types: PascalCase (prefixed with 'I' for interfaces is optional)
- Use Tailwind CSS for styling
- Import order:
  1. External libraries
  2. Internal components
  3. Hooks
  4. Types
  5. Styles

### Backend (Node.js/Express)

- Use CommonJS modules
- Use async/await for asynchronous operations
- Follow the naming conventions:
  - Files: kebab-case.js
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE
  - Classes: PascalCase
- Use JSDoc for documentation

## Testing

### Frontend Testing

- Use Jest for unit tests
- Test hooks with `@testing-library/react-hooks`
- Test components with `@testing-library/react`
- Place test files next to the file they test with `.test.tsx` suffix

### Backend Testing

- Use Jest for unit and integration tests
- Place tests in the `server/tests` directory
- Follow the naming convention: `filename.test.js`

### Running Tests

- Run all tests: `npm test`
- Run frontend tests: `npm run test:frontend`
- Run backend tests: `npm run test:server`
- Run tests in watch mode: `npm run test:watch`

## Documentation

- Update the documentation when making changes
- Use JSDoc for inline documentation
- Follow Markdown conventions for documentation files
- Place documentation in the `Docs` directory

## Project Structure

Understanding the project structure will help you contribute effectively:

```
typer99/
├── src/                        # Frontend source code
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   └── types/                  # TypeScript definitions
├── server/                     # Backend source code
│   ├── wordlists/              # Word lists for game texts
│   ├── utils/                  # Utility functions
│   ├── tests/                  # Server tests
│   ├── index.js                # Server entry point
│   └── socket.js               # Socket.IO handlers
├── public/                     # Static assets
├── Docs/                       # Documentation
└── (config files)              # Various configuration files
```

### Key Areas

1. **Frontend Components**: `src/components/`
   - UI components for the application
   - Each component should be focused on a single responsibility

2. **React Hooks**: `src/hooks/`
   - Custom hooks for state management and logic
   - Socket communication hooks
   - Game mechanics hooks

3. **Server Logic**: `server/`
   - Socket.IO event handlers
   - Game mechanics
   - Player management

4. **Game Mechanics**: 
   - Frontend: `src/hooks/useGame.ts`, `src/hooks/useTyping.ts`
   - Backend: `server/socket.js`

## Getting Help

If you need help with contributing, you can:

- Join our Discord server
- Open an issue with the "question" label
- Contact the maintainers directly

Thank you for contributing to Typer-99!
