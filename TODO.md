# Technical Debt & Todo List

## Critical
- [ ] **Infrastructure**: Set up a testing framework (Jest/Vitest) and add unit tests.
- [ ] **Security**: Move Firebase configuration (API keys, Project ID) from `src/firebase/config.ts` to environment variables (`.env`).
- [ ] **Authentication**: Upgrade from anonymous sign-in to robust auth providers (Google, Email/Password).

## Features
- [ ] **AI/RAG**: Implement actual retrieval mechanism for `validate-permit-application-against-local-codes.ts` instead of relying on manual string input.
- [ ] **Data**: verify seeding logic and ensure database security rules are updated.
