# Terra Trace - Carbon Footprint Tracking & AI Insights

Terra Trace is a lightweight, zero-dependency, and highly accessible Next.js dashboard built to help you track your carbon footprint across four pillars (Transportation, Energy, Diet, Waste) and receive personalized, actionable AI insights.

## Methodology & Calculation
The `src/utils/carbonEngine.ts` file houses the core conversion logic based on generalized baseline emission factors:
- **Transportation**: Varies by vehicle type (e.g., Car: 0.192 kg CO2/km).
- **Home Energy**: Estimated per kWh (0.233 kg CO2/kWh) and heating type.
- **Diet & Waste**: Uses standard monthly average factors.

## AI Action Planner (Groq Integration)
The AI Insights are fetched via `src/app/api/insights/route.ts`. 

To enable Groq integration:
1. Obtain a [Groq API Key](https://console.groq.com/keys).
2. Create a `.env.local` file at the root of the project:
   ```env
   GROQ_API_KEY=gsk_your_api_key_here
   ```
3. Implement the `groq-sdk` inside the `route.ts` API file to prompt the `llama3-8b-8192` model with the user's `carbonData` JSON payload. Request the model to return a JSON array of actionable items.

## Accessibility (WCAG 2.1 AA)
- High contrast "Terra Trace" theme palette (Deep Forest, Parchment, Sage).
- Full ARIA compliance (`aria-label`, `aria-valuenow`, `role="progressbar"`) for dynamic charts.
- Semantic HTML tags (`<main>`, `<section>`, `<aside>`) and explicit focus states for all interactive elements.

## Running Locally & Deployment
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. View at `http://localhost:3000`

### Zero-Dependency Edge Deployment
This application is strictly under 10MB by utilizing native Tailwind CSS and simple SVG-based rendering rather than heavy chart libraries. It is ready for one-click deployment on [Vercel](https://vercel.com) or [Render](https://render.com). Simply link your GitHub repository and add your `GROQ_API_KEY` to the environment variables.

## Testing
Run the mock validation script to verify the conversion maths:
```bash
npx tsx src/utils/calculations.test.ts
```
