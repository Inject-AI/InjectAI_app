# Inject AI

Inject AI is an advanced AI-powered tool designed to enhance cryptocurrency analysis and tracking, providing real-time insights and market trends.

## Features

- Real-time cryptocurrency market data powered by AI
- User-friendly interface with Tailwind CSS
- Backend powered by Node.js and TypeScript
- Database configuration using Drizzle ORM

## Installation

### Prerequisites
- **Node.js** (Latest LTS version recommended)
- **Git** (Optional but recommended)
- **Package Manager** (`npm` or `yarn`)

### Steps to Install

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Inject-AI/InjectAI_app.git
   cd InjectAI_app
   ```

2. **Install dependencies**:
   ```bash
   npm install  # or yarn install
   ```

3. **Set up environment variables**:
   - Create a `.env` file in the root directory.
   - Add necessary API keys and configurations (refer to `.env.example` if available).

## Usage

### Start the Development Server
```bash
npm run dev  # or yarn dev
```
This will start a local development server.

### Build for Production
```bash
npm run build  # or yarn build
```
This will generate optimized production files.

### Run in Production Mode
```bash
npm start  # or yarn start
```

## Configuration

The project includes:
- **Drizzle ORM** (`drizzle.config.ts`) for database configuration.
- **Tailwind CSS** for styling (`tailwind.config.ts`).
- **PostCSS support** (`postcss.config.js`).

## Contributing

Contributions are welcome! Follow these steps:
1. Fork the repository.
2. Create a new branch (`feature-branch`).
3. Commit changes and push.
4. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

---
