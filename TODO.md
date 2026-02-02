# Project Status & Roadmap

## Overview
PermitPilot is a Next.js 15 application designed to streamline the building permit process using AI. It features checklist generation, document autofill, code validation, and a municipality database.

## Critical Action Items

### 1. Testing Infrastructure
- **Current Status:** Missing.
- **Action:** Install and configure `vitest` or `jest` for unit testing. Add e2e testing with Playwright.

### 2. Authentication
- **Current Status:** Basic/Dev configuration.
- **Action:** Implement robust Firebase Authentication (Email/Password, Google Auth) and secure Firestore rules.

### 3. AI Logic (RAG)
- **Current Status:** `validate-permit-application-against-local-codes.ts` accepts raw text.
- **Action:** Implement true RAG (Retrieval-Augmented Generation). Integrate a vector database to retrieve relevant building codes based on the application context, rather than requiring the user to provide them.

### 4. Data Integration
- **Current Status:** UI scaffolds exist.
- **Action:** Ensure the "Smart Municipality Database" and "Dashboard" are fully wired to the Firestore `municipalities` and `users` collections.

### 5. Deployment & CI/CD
- **Action:** Verify Firebase App Hosting configuration (`apphosting.yaml`) and set up a CI/CD pipeline for automated testing and deployment.
