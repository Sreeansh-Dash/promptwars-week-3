# EcoPulse 🌿 — AI-Driven Carbon Footprint Tracker

EcoPulse is a premium, high-fidelity, and highly accessible carbon footprint calculator, action tracker, and predictive AI insights dashboard. Engineered with a **local-first sandbox architecture** and optimized to run entirely under a strict **10MB repository limit**, EcoPulse gives users private control over their ecological footprints without compromising on immersive aesthetics or accessibility.

---

## 🚀 Novelty & Premium Features

- **Local-First Sandbox Environment:** All user carbon metrics, unlocked badges, tracking histories, and daily check-in streaks are persisted entirely client-side via browser `localStorage`. No external databases, third-party cookies, or trackers are utilized, guaranteeing total data sovereignty.
- **Organic Auroral Shader Canvas:** Immersive, GPU-accelerated WebGL shader background animating interactive, natural green auroras in real-time. Decorative elements are built to support responsive visual resizing while remaining invisible to screen readers.
- **Groq-Powered Narrative Insights:** Migrated to the high-efficiency, low-latency **`llama-3.1-8b-instant`** model. When carbon metrics are logged, the application returns a structured, predictive Markdown report analyzing emissions and outlining concrete, tailored reduction targets.
- **Zero-Dependency Markdown Renderer:** A lightweight, built-in string parser formats Groq's markdown output (headers, lists, bold text, numbered lists) natively, keeping package bundle sizes minimal and preventing standard cross-site scripting (XSS) risks.
- **Dynamic Badge Gamification:** Includes a responsive achievements center where badges start fully locked. As users input their real-world parameters, badges (like *Solar Flare* and *Transit Titan*) check criteria client-side and unlock dynamically.
- **Custom Habit Builder:** Users can input custom eco-habits, set their estimated CO₂ savings with an accessible range slider, delete items, and toggle completions to increase streaks.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14+ (App Router, Server-side API Router)
- **Programming Language:** TypeScript (Strictly Typed)
- **Styling:** Tailwind CSS (Custom extended design system with semantic dark-palette tokens)
- **AI Integration:** Groq SDK (`groq-sdk` executing `llama-3.1-8b-instant` prompts)
- **State Management:** Lightweight React Context API (`useReducer` state store)
- **Data Validation:** Zod Schema Validation (`zod`)
- **Unit Testing Suite:** Jest & `ts-jest` for calculation engines
- **Typography & Icons:** Plus Jakarta Sans & Google Material Symbols

---

## 📁 Domain-Driven Design (DDD) Architecture

The repository isolates business logic, infrastructure synchronization, and UI components into clearly separated domains:

```
├── src/
│   ├── app/                    # Next.js App Router (Layouts, pages, and API handlers)
│   │   ├── api/insights/       # Groq AI route proxy with circuit-breaker protection
│   │   ├── globals.css         # Typography scale definitions & global glassmorphic utilities
│   │   └── layout.tsx          # Font loading and global provider configuration
│   ├── core/                   # Pure business logic layer
│   │   ├── engine/             # Carbon math calculations and Jest test suites
│   │   ├── validation/         # Strict Zod schemas validating states and payloads
│   │   └── types/              # Static TypeScript interface contracts
│   ├── infrastructure/         # External adapters and storage sync logic
│   │   ├── ai/                 # Groq client singleton configuration and prompt builders
│   │   └── storage/            # Local-first Context provider, state reducer, and hydration adapter
│   └── presentation/           # Accessible presentation components
│       ├── BadgeGrid.tsx       # Dynamic achievements grid rendering SVG milestones
│       ├── CarbonCalculator.tsx# Step-by-step wizard capturing transportation, energy, diet, and waste
│       ├── EmissionsChart.tsx  # Custom SVG category chart compared to global averages
│       ├── ShaderCanvas.tsx    # WebGL organic aurora visual canvas
│       └── ShareModal.tsx      # centered absolute overlay copy-paste dialog
```

---

## 🛡️ Enterprise-Grade Security Protocols

1. **Strict Zod Payload Validation:** Every state modification and request payload must pass validation schemas (`src/core/validation/validation.ts`) before being processed, completely filtering out corrupt, malicious, or malformed data.
2. **Server-Side API Proxy Router:** The Groq API is called exclusively via a secure server route (`src/app/api/insights/route.ts`). This ensures your `GROQ_API_KEY` remains completely hidden on the server side and is never exposed to the client browser.
3. **5000ms Circuit Breaker Timeout:** To prevent API rate-limits, service outages, or slow responses from hanging the client, the route races the Groq request against a 5-second timeout. If the request times out, it gracefully falls back to a high-quality static Markdown report.
4. **Local State Sanitization:** State values fetched from `localStorage` are automatically parsed and verified upon hydration. If validation fails (due to manual tempering or store schema upgrades), the store resets to default zero values.

---

## ♿ Web Accessibility (WCAG 2.1 AA Compliance)

EcoPulse has been built from the ground up to ensure complete inclusion and compatibility with assistive technologies:

- **Accessible Typography Scale:** Custom typography rules defined in `globals.css` scale all labels, body copy, and headings to comfortable, larger sizes (e.g. 1.5rem for sub-headers, 1rem for body text), eliminating microscopic font sizes.
- **Contrast Ratios:** Utilizes a carefully selected dark palette combining deep greens and teal accents with bright high-contrast text colors (`#d4e4fa`) matching WCAG 2.1 AA guidelines.
- **Tabular Data Fallbacks:** The SVG-based emissions comparison chart is accompanied by a visually hidden screen reader table (`.sr-only`) containing all raw numerical emissions data, giving non-visual users access to the same analytics.
- **Visual Presentation Hiding:** The WebGL aurora decorative canvas (`ShaderCanvas.tsx`) and custom chart SVGs use `aria-hidden="true"` so screen readers ignore non-semantic visual presentation layers.
- **Keyboard Navigation Focus:** Active buttons, checkboxes, range sliders, and inputs feature clear focus indicators (`focus-visible:ring-2 focus-visible:ring-primary`) ensuring seamless keyboard-only navigation.
- **Semantic HTML5 Outline:** Structured using meaningful tags such as `<aside>` for the sidebar, `<header>` for tickers, `<main>` for dashboards, and `<section>` for specific modules.

---

## 🛠️ Local Installation & Testing

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup Instructions
1. Clone the repository and install the dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=gsk_your_groq_api_key_here
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Running Automated Test Suites
Execute Jest testing:
```bash
npm test
```
This triggers the 5 engine test cases in `carbonMath.test.ts` to verify calculated values across multiple commuter profiles (Gas Car Commuter, Eco Warrior, Transit Commuter, Cylicst, and High Carbon Consumer).

---

## 🌐 Deployment Guidelines

This application is fully optimized for serverless, containerized, and virtual private server (VPS) environments.

### 1. Deploying to Vercel (Recommended)
Vercel is the native platform for Next.js and provides instant global edge delivery:
1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Log in to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
3. Import the repository. Vercel will auto-detect the Next.js framework.
4. Expand **Environment Variables** and add:
   - **Key:** `GROQ_API_KEY`
   - **Value:** `gsk_your_groq_api_key_here`
5. Click **Deploy**. Vercel will compile, build, and publish your project dynamically.

### 2. Deploying to Netlify
1. Log in to Netlify and click **Import from Git**.
2. Select your repository.
3. Configure the build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `.next`
4. Under **Site Configuration** -> **Environment variables**, click **Add Variable**:
   - **Key:** `GROQ_API_KEY`
   - **Value:** `gsk_your_groq_api_key_here`
5. Click **Deploy Site**.

### 3. Containerized Deployment (Docker)
For self-hosting inside containers:

1. Create a `Dockerfile` in the root:
   ```dockerfile
   FROM node:18-alpine AS base
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   ENV GROQ_API_KEY=gsk_your_groq_api_key_here
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. Build and run the Docker image:
   ```bash
   docker build -t ecopulse .
   docker run -p 3000:3000 --env-file .env.local ecopulse
   ```

### 4. Deploying to a Linux VPS (Ubuntu/PM2/Nginx)
To host on a VPS (e.g. DigitalOcean, AWS EC2, Linode):
1. SSH into your server, install Node.js, and clone your repository.
2. Install PM2 globally:
   ```bash
   sudo npm install -y pm2 -g
   ```
3. Create your local production configuration file `.env` in the root and add your `GROQ_API_KEY`.
4. Build the application:
   ```bash
   npm install
   npm run build
   ```
5. Start the server daemon with PM2:
   ```bash
   pm2 start npm --name "ecopulse" -- start
   pm2 save
   pm2 startup
   ```
6. Set up an Nginx reverse proxy configuration (`/etc/nginx/sites-available/default`):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
7. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```
