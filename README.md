# ![Eurowings Digtial Logo][eurowings-digital-logo] Eurowings Digital Frontend Challenge

This repository is structured as a working coding challenge submission and
demonstrates a small web application that consumes a mocked Flights API to
display flights with client-side filtering.

## 📸 Screenshot

<!-- NOTE: made with https://app.screenhance.com/create?template=device-float -->

![Flightly showcase](docs/images/flightly-showcase.png)

## 🧠 Approach

🚧 WIP 🚧

## 📋 Challenge Checklist

- [x] Create a simple mock HTTP endpoint returning static Flights JSON data
  - [x] Script for generating mocked data
  - [x] Serve the mocked data through an API
- [x] Build a mobile-first application that fetches and displays all flights
  - [x] Fetch flight data from the API
  - [x] Display all returned flights in a structured list
  - [x] Design a responsive layout from mobile screens up
  - [x] Show loading and error states while fetching data
- [x] Implement client-side filtering by origin, destination, departureDate,
      and returnDate
  - [x] Add filter inputs for origin, destination, departure date, and return date
  - [x] Implement client-side filtering
  - [x] Show active filters
  - [x] Add sorting options
  - [x] Reset filters to show all flights again
- [x] Ensure accessibility using semantic HTML and proper form labeling
- [x] Add basic automated tests for filtering logic and main component rendering
  - [x] Unit tests to validate core functionality and filtering logic
  - [x] Component tests to smoke-test basic rendering and key UI states
  - [x] End-to-end tests to verify the main user journey from data load to
        filtering results

## ✨ Extras

🚧 WIP 🚧

## 🧰 Tech Stack

![vue-ts-nuxtjs-vite-nodejs-bun-tailwind-vitest-playwright][tech-stack-icons]

- `Vue 3`
- `TypeScript`
- `Nuxt 4`
- `Vite` (bundler)
- `Node.js` (runtime)
- `Bun` (scripts and package manager)

## 🪄 Setup

> [!IMPORTANT]
> Requires Bun `≥ 1.3.9` and Node.js ≥ `24.13.1` installed.

### Install dependencies

```bash
bun install
```

### Generate mock data

```bash
bun run mockdata:flights
```

### Start local development

```bash
bun run dev
```

## 📜 Scripts

### Development server

Start the development server on `http://localhost:3000`:

```bash
bun run dev
```

### Production

Build the application for production:

```bash
bun run build
```

Locally preview production build:

```bash
bun run preview
```

Generate a static version of the app:

```bash
bun run generate
```

### Tests

Run the automated tests:

```bash
bun run test
```

Run tests in watch mode:

```bash
bun run test:watch
```

Run tests with coverage:

```bash
bun run test:coverage
```

Run end-to-end tests:

```bash
bun run test:e2e
```

Run end-to-end tests with Playwright UI mode:

```bash
bun run test:e2e:ui
```

Run end-to-end tests in headed mode:

```bash
bun run test:e2e:headed
```

### Mock data

Generate 50 mock PriceOffer records using Faker:

```bash
bun run mockdata:flights
```

> [!Note]
> This writes JSON to `data/flights.json`, which is returned by `GET /api/flights`.

[tech-stack-icons]: https://go-skill-icons.vercel.app/api/icons?i=vue,ts,nuxtjs,vite,nodejs,bun,tailwind,vitest,playwright
[eurowings-digital-logo]: https://eurowings-digital.de/ewd-logo-small.svg
