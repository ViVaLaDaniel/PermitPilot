# Analysis Report / Отчет об анализе

## Project Purpose / Назначение проекта
**PermitPilot (nextn)** is an AI-powered assistant for construction permits. It helps users generate checklists, autofill documents, and validate applications using AI.
**PermitPilot (nextn)** — это AI-ассистент для получения разрешений на строительство.

## Key Findings / Основные выводы

### 1. Missing Tests / Отсутствие тестов
- **Critical**: The project has zero tests.
- **Action**: Install Vitest/Jest and write unit tests for `src/ai/flows`.

### 2. Security Issues / Безопасность
- **Critical**: Firebase credentials are hardcoded in `src/firebase/config.ts`.
- **Action**: Move keys to environment variables (`.env`).

### 3. Authentication / Авторизация
- The UI only supports anonymous sign-in.
- **Action**: Implement Email/Password login UI (backend support exists).

### 4. Missing Features / Недостающий функционал
- "Smart Municipality Database" is static. The AI update mechanism described in docs is missing.

### 5. Tech Stack / Стек
- Next.js 15
- Firebase (Firestore, Auth)
- Genkit (AI)
- Tailwind + Shadcn/UI
