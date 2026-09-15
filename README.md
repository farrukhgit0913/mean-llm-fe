# mean-llm-fe

Frontend for an **AI Assistant built with Angular, Ollama LLM, and RAG (Retrieval-Augmented Generation)**.

The application provides a modern chat interface for interacting with the AI backend and displaying AI responses, RAG context, sources, and processing status.

## 🚀 Tech Stack

* **Angular**
* **TypeScript**
* **HTML5**
* **CSS3**
* **REST API**
* **Ollama LLM**
* **RAG (Retrieval-Augmented Generation)**

## ✨ Features

* Modern AI chat interface
* Real-time conversational experience
* AI response streaming support
* RAG pipeline status display
* Retrieved source/context display
* Responsive UI
* Clean and minimal chat experience
* Integration with the MEAN + LLM backend

## 🏗️ Architecture

```text
Angular Frontend
       │
       │ HTTP / API
       ▼
Node.js + Express Backend
       │
       ├── RAG
       │
       └── Ollama LLM
```

## 📋 Prerequisites

Make sure you have:

* Node.js
* npm
* Angular CLI

Check Node.js:

```bash
node -v
npm -v
```

Check Angular CLI:

```bash
ng version
```

## 📦 Installation

Clone the repository:

```bash
git clone <FRONTEND_REPOSITORY_URL>
```

Go to the frontend directory:

```bash
cd mean-llm-fe
```

Install dependencies:

```bash
npm install
```

## ⚙️ Backend Configuration

Configure the backend API URL according to your environment.

For example:

```typescript
apiUrl = 'http://localhost:3000';
```

For production, use the appropriate production API URL.

## ▶️ Run the Application

Start the Angular development server:

```bash
ng serve
```

Or:

```bash
npm start
```

The application will be available at:

```text
http://localhost:4200
```

## 🧠 AI Chat Flow

```text
User
 │
 ▼
Angular Chat UI
 │
 ▼
Backend API
 │
 ▼
RAG Retrieval
 │
 ▼
Ollama LLM
 │
 ▼
AI Response
 │
 ▼
Angular Chat UI
```

## 📁 Project Structure

```text
mean-llm-fe/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── assets/
│   └── environments/
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🏗️ Build

Create a production build:

```bash
ng build
```

The generated files will be available in the `dist/` directory.

## 🔗 Related Project

Backend:

**mean-llm-be** — Node.js/Express backend providing the AI, RAG, and Ollama integration.

## 📄 License

This project is for learning and development purposes.
