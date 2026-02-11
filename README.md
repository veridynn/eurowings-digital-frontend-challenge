# ![Eurowings][eurowings-logo] Eurowings Digital Frontend Challenge

This repository is structured as a working coding challenge submission and
demonstrates a small web application that consumes a mocked PriceOffer API to
display flight offers with client-side origin and destination filtering.

## 📋 Challenge Checklist

- [x] Create a simple mock HTTP endpoint returning static PriceOffer JSON data
- [ ] Build a mobile-first Vue application that fetches and displays all offers
- [ ] Implement client-side filtering by origin and destination
- [ ] Ensure accessibility using semantic HTML and proper form labeling
- [ ] Add basic automated tests for filtering logic and main component rendering

## 🧰 Tech Stack

![vue-ts-nuxtjs-vite-nodejs-bun][tech-stack-icons]

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
bun run generate:offers
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

### Mock data

Generate 50 mock PriceOffer records using Faker:

```bash
bun run generate:offers
```

> [!Note]
> This writes JSON to `data/price-offers.json`, which is returned by `GET /api/price-offers`.

[tech-stack-icons]: https://skillicons.dev/icons?i=vue,ts,nuxtjs,vite,nodejs,bun
[eurowings-logo]: https://www.eurowings.com/favicon.ico
