# 🏋️ FitnessConnect Backend

Welcome to the FitnessConnect Backend API! This project provides the server-side functionality for connecting fitness enthusiasts with personal trainers.

## 🚀 Getting Started

### Prerequisites

- **Node.js** (see `.nvmrc` for the exact version)
- **pnpm** package manager

### Installation

#### 1. 📦 Node.js Setup

Make sure you have the correct Node.js version installed. You can find the required version in the `engines` field of `package.json` or in the `.nvmrc` file.

#### 2. 🔧 Install Dependencies

This project uses **pnpm** as package manager:

```bash
pnpm install
```

#### 3. ⚙️ Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

> 💡 **Tip**: Edit the `.env` file with your configuration values. Refer to `.env.example` for all available options.

#### 4. 🎯 Start the Development Server

```bash
pnpm start
```

## 🌐 Server Information

Once the server is running, you can access:

- **🖥️ Server URL**: `http://localhost:3000` (or the port specified in your `HTTP_PORT` environment variable)
- **📚 API Documentation**: `http://localhost:3000/docs` (Swagger UI)

## 📜 Available Scripts

- `pnpm build` - Build the project for production
- `pnpm start` - Start the development server with hot reload

## 🛠️ Development

The server runs in development mode with hot reload enabled. Any changes to the source files will automatically restart the server.

> ⚠️ **Important**: Make sure your database connection is properly configured in the `.env` file before starting the server.
