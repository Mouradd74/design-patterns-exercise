# Design Patterns Exercise

A small interactive exercise for a software engineering session on GoF design patterns. Attendees work through 8 TypeScript challenges set in a fictional online store's payment-and-notification system, covering creational, structural, and behavioral patterns. Each answer is scored immediately, and a results screen shows the final score with a per-challenge breakdown.

The app is built with Vite, React, and TypeScript. Styling is plain CSS in `src/styles.css`; there are no UI libraries, no backend, and no data storage.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
```

The production build is written to `dist/`. To preview the built app locally:

```bash
npm run preview
```

## Assumptions

- No personal data is collected; the exercise has no name field.
- Progress and answers live only in React state. Refreshing the page resets the exercise.
- Each challenge is answered once and then locked; there is no back navigation.
- Scoring is one point per challenge, with no partial credit. Every challenge has exactly one correct option.
- Challenge order and option order are fixed; nothing is randomized.
- The two judgment challenges are categorized as follows: "Do we need a pattern?" is Behavioral, and "Which pattern is this?" is Structural.
- Code snippets are illustrative and are not compiled or executed.
- No backend, database, login, or leaderboard is included.
- The app targets modern evergreen browsers on laptops and phones. Node.js 20.19+ or 22.12+ is required for the current Vite version.

## How to deploy on Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the GitHub repository.
3. Keep the framework preset **Vite**.
4. Set the build command to `npm run build` and the output directory to `dist`.
5. Deploy. No environment variables are needed.
