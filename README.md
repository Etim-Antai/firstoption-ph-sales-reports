# FirstOption Solar | Sales Intelligence Dashboard

A production-grade, business intelligence web application built for **FirstOption Solar Energy Company** in Nigeria. Designed to monitor top-line sales revenue, inventory equipment demand, invoice activity, and customer acquisition across Nigerian Naira (₦) transactions.

---

## 1. Project Overview & Features

* **Visual Fidelity:** Replicates the exact company design language:
  * Brand Palette: Deep Navy (`#10243A`), Teal Accent (`#0D9488`), Sky Blue (`#60A5FA`), and Slate Light (`#F5F7FA`).
  * Dedicated left navigation bar with active state pills and glowing status dots.
  * Real-time KPI snapshot cards with verified metrics.
* **Overview Dashboard:**
  * Interactive Recharts **Revenue Over Time** monotone area chart with gradient fills and currency tooltips.
  * **Customer Category Breakdown** donut chart with share percentages.
  * **Top-Selling Products** ranking with switchable metrics (Revenue vs. Units Sold).
  * **Sales by Day of Week** bar chart identifying peak transaction days.
  * **New vs. Returning Customer** retention comparison.
* **Global Dynamic Filtering:**
  * Filter across all metrics by Date Range (From / To), Year, Month, Customer Category, Customer Status, and Search terms.
* **Sales Records Management (CRUD):**
  * Sortable, searchable, and paginated 13-column sales table.
  * Add, Edit, and Delete sales transactions with automatic `Quantity × Rate = Total` calculation.
  * Filtered CSV Export.
* **Smart Excel & CSV Register Import:**
  * Powered by SheetJS (`.xlsx`, `.xls`, `.csv`).
  * Header auto-normalization (supporting variations like `Invoice_Number` / `Invoice Number`, `Staus`, `REMARK`).
  * Pre-import preview table showing valid rows, invalid rows, and calculated total discrepancies.
  * Downloadable rejected rows CSV report with specific rejection reasons.
  * Downloadable clean CSV template for staff members.
  * Duplicate detection protecting against accidental re-imports.
* **Customer Analytics:**
  * Top 10 customers by revenue and units.
  * Repeat purchase rate and average revenue per customer.
  * Interactive customer drilldown drawer displaying complete invoice and transaction history.
* **Product Analytics:**
  * Product performance directory with average selling rate calculations.
  * Part number audit alert flagging inconsistent item descriptions.
  * Explicit profitability disclaimer notice.
* **Security & Authentication:**
  * Role-Based Access Control: **Administrator** (full CRUD & import) vs **Viewer** (read-only analytics).
  * Supabase PostgreSQL Row Level Security (RLS) policies.
  * Graceful fallback to Local Sandbox mode for instant demonstration without any paid setup.

---

## 2. Technology Stack (100% Free-Tier Architecture)

* **Frontend:** React 18, TypeScript, Vite 5, Tailwind CSS
* **Charts & Visualizations:** Recharts
* **Icons:** Lucide React
* **Spreadsheet Processing:** SheetJS (`xlsx`)
* **Testing:** Vitest, React Testing Library, JSDOM
* **Backend & Database:** Supabase (PostgreSQL with RLS)
* **Hosting:** GitHub Pages
* **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)

> **Cost Guarantee:** No Render, no paid servers, no external Python instances required. This setup operates completely within standard free tiers on Supabase and GitHub.

---

## 3. Getting Started Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer)
* npm (bundled with Node.js)

### Installation & Launch
```bash
# 1. Navigate to the project directory
cd "C:\Users\FIRST OPTION\Desktop\reports"

# 2. Install dependencies (if not already installed)
npm install

# 3. Run automated calculation and import tests
npm test

# 4. Start the local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 4. Supabase Setup & Database Migrations

### Step 1: Create a Free Project on Supabase
1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project** and choose a project name (e.g., `firstoption-solar`).
3. Set your database password and select the region nearest to you.

### Step 2: Run Database Schema & Security Migrations
1. In your Supabase project dashboard, open the **SQL Editor** from the left navigation.
2. Open the file [`supabase/migrations/20261021000000_initial_schema.sql`](file:///C:/Users/FIRST%20OPTION/Desktop/reports/supabase/migrations/20261021000000_initial_schema.sql).
3. Copy its entire content, paste it into the Supabase SQL Editor, and click **Run**.
   * This creates `sales_transactions`, `import_batches`, `user_profiles`, performance indexes, and Row Level Security (RLS) policies.

### Step 3: Seed Company Sales Data (203 Verified Transactions)
1. In the Supabase **SQL Editor**, click **New Query**.
2. Open [`supabase/seed.sql`](file:///C:/Users/FIRST%20OPTION/Desktop/reports/supabase/seed.sql).
3. Copy and paste the seed SQL and click **Run**.
   * All 203 verified company transactions totaling ₦57,031,710 will be loaded directly into your PostgreSQL database.

### Step 4: Configure Environment Variables
1. In your project directory, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. In your Supabase Dashboard, navigate to **Project Settings** → **API**.
3. Copy your **Project URL** and **anon public key**:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
   ```
4. Restart Vite (`npm run dev`). Your dashboard is now connected live to Supabase!

### Step 5: Creating the First Administrator Account
1. Open your dashboard in the browser and sign up or sign in.
2. The trigger `on_auth_user_created` in the migration automatically grants the **admin** role to the first registered user.
3. Subsequent accounts default to **viewer** role. You can promote additional staff to admin in Supabase under `user_profiles` table:
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE email = 'staff@firstoptionsolar.ng';
   ```

---

## 5. Deployment to GitHub Pages

This project includes a complete GitHub Actions deployment pipeline at [`.github/workflows/deploy.yml`](file:///C:/Users/FIRST%20OPTION/Desktop/reports/.github/workflows/deploy.yml).

### Steps to Deploy:
1. Initialize a Git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: complete FirstOption Solar Sales Intelligence Dashboard"
   ```
2. Create a GitHub repository (e.g., `reports` or `firstoption-solar-dashboard`) under your GitHub account (`Etim-Antai`).
3. Add the remote and push to `main`:
   ```bash
   git remote add origin https://github.com/Etim-Antai/reports.git
   git branch -M main
   git push -u origin main
   ```
4. **Enable GitHub Pages in Repository Settings:**
   * In GitHub, go to **Settings** → **Pages**.
   * Under **Build and deployment** → **Source**, select **GitHub Actions**.
5. **(Optional) Add Supabase Secrets:**
   * In GitHub, go to **Settings** → **Secrets and variables** → **Actions**.
   * Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
6. Push a commit or trigger the workflow manually in the **Actions** tab. The dashboard will automatically build and publish to your GitHub Pages URL!

---

## 6. Testing & Quality Assurance Summary

| Feature Tested | Test File | Status |
| :--- | :--- | :--- |
| Baseline KPI Math (Revenue, Units, Invoices, Orders) | `calculations.test.ts` | **Passed (100%)** |
| Multi-filter Combinations (Date, Year, Category, Status) | `calculations.test.ts` | **Passed (100%)** |
| Monthly Chronological Revenue Aggregation | `calculations.test.ts` | **Passed (100%)** |
| Customer Category Share Normalization | `calculations.test.ts` | **Passed (100%)** |
| Flexible Header Normalization (`Invoice_Number`, `Staus`) | `importParser.test.ts` | **Passed (100%)** |
| Multi-format Date Parsing (`M/D/YYYY`, `YYYY-MM-DD`) | `importParser.test.ts` | **Passed (100%)** |
| Nigerian Naira Currency Formatting (₦) | `importParser.test.ts` | **Passed (100%)** |
| Rejected Rows CSV Export with Error Reporting | `importParser.test.ts` | **Passed (100%)** |
| Production TypeScript Build (`tsc && vite build`) | Production CLI | **Passed (0 Errors)** |
