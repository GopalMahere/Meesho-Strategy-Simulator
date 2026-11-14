# Meesho Commercial Strategy & Growth Decision Simulator
## E-Commerce Unit Economics Optimization & Strategic Decision-Support Platform

[![Case Status](https://img.shields.io/badge/Status-Fully_Validated-success.svg)](#)
[![Industry](https://img.shields.io/badge/Industry-E--Commerce_%2F_Consumer_Tech-blue.svg)](#)
[![Target Roles](https://img.shields.io/badge/Target_Roles-Strategy_%26_BizOps_%7C_Product_Management_%7C_Management_Consulting-navy.svg)](#)
[![Quantitative Integrity](https://img.shields.io/badge/Test_Suite-100%25_Passing-brightgreen.svg)](#)

---

## 🌐 Live Interactive Demos (GitHub Pages)

* 🎮 **[Interactive Commercial Decision Simulator](https://gopalmahere.github.io/Meesho-Strategy-Simulator/)**
* 📊 **[12-Slide Executive Consulting Presentation](https://gopalmahere.github.io/Meesho-Strategy-Simulator/presentation.html)**
* 📁 **[Excel Financial Model (10 Sheets)](https://github.com/GopalMahere/Meesho-Strategy-Simulator/raw/main/Meesho_Commercial_Decision_Model.xlsx)**

---

## 1. Project Mission & Business Context

This platform is a **formula-driven, fully audited commercial decision-support system** engineered to resolve a critical commercial dilemma facing **Meesho** (Fashnear Technologies Pvt. Ltd.): how to transform rapid Tier-2/3+ GMV expansion into **sustainable positive Unit Contribution Margin (CM3)** without destroying the organic seller network or triggering consumer churn.

Rather than a static dashboard or theoretical slide deck, this product delivers an interactive browser-based simulation engine backed by a **10-sheet dynamic financial model** (>1,800 formulas) and an **automated assertion test suite**.

### The Strategic Dilemma
* **The Core Paradox**: Meesho commands industry-leading order volume and rapid GMV growth in Tier-2/3/4 Bharat cohorts, but unit profitability remains constrained by:
  1. **Low Average Order Value (AOV)**: ~₹300 per order across apparel, personal care, and unbranded regional goods.
  2. **High Cash-on-Delivery (COD) RTO Friction**: ~22% Return-to-Origin rate, where forward shipping (₹45) and reverse logistics (₹32) produce heavy variable losses on returned inventory.
  3. **Zero Seller Commission Heritage**: 0% marketplace commission establishes immense seller goodwill but caps platform monetization to logistics spreads and seller ad tools.

---

## 2. Unit Economics Architecture & Evaluated Strategic Levers

```
Gross Merchandise Value (GMV: ~₹300)
  │
  ├── Platform Net Revenue = Ad Take-Rate (1.8%) + Logistics Spread (₹12) + Customer Platform Fee (₹0 Baseline)
  │     │
  │     ├── Contribution Margin 1 (CM1) = Net Revenue - Payment Gateway (₹1.80) - Customer Support (₹2.40)
  │     │     │
  │     │     ├── Contribution Margin 2 (CM2) = CM1 - Forward Shipping (₹45.00) - COD RTO Loss (₹16.94)
  │     │     │     │
  │     │     │     └── Contribution Margin 3 (CM3 / Net Contribution) = CM2 - Direct Marketing / CAC (₹10.50)
```

### The 4 Strategic Levers Evaluated

| Lever | Core Mechanism | Upfront CapEx | Key Friction & Economic Trade-off |
|:---|:---|:---|:---|
| **Lever 1: Platform Fee** | Introduce ₹5–₹10 consumer platform fee | ₹0.0 Cr | Tests price elasticity ($P_{ed}$). High churn risk in Tier-2/3 price-sensitive cohorts. |
| **Lever 2: Valmo Logistics** | Expand internal logistics network (*Valmo*) + AI COD checks | ₹6.0 Cr | Reduces RTO from 22% to 15.5%; requires 3-month operational ramp before efficiency kicks in. |
| **Lever 3: Seller Ad Monetization**| Scale self-serve promoted listings & discovery engine | ₹4.0 Cr | 2-month seller adoption lag; subject to 70% commercial attribution factor. |
| **Lever 4: Combined Full Push** | Deploy Levers 2 & 3 simultaneously | ₹10.0 Cr | Severe capital exposure; penalized by an enforced **25% non-linear overlap damping penalty**. |

### The Consulting "Plot Twist" & Winning Recommendation
* **Why Aggressive Rollouts Fail in Year 1**:
  * Unilateral platform fees trigger consumer churn that offsets nominal fee income.
  * Capital-intensive logistics and ad pushes run into **operational ramp-up lags**, resulting in negative Year-1 ROI if deployed nationally all at once.
* **The Winning Strategic Recommendation: Controlled Regional Pilot ("Project BharatPulse")**:
  * **Capital Commitment**: Commit only **₹2.00 Cr** (20% of full budget) into a concentrated high-density regional cluster (e.g., UP/Bihar apparel hub).
  * **Real Option Value**: Treats the pilot as an information-acquisition mechanism to validate true RTO reduction and ad take-rate before national scale.
  * **Dual Break-Even Hurdles**:
    * *Local Cluster Hurdle*: +11.8% volume expansion required to break even strictly inside the pilot cluster.
    * *National Portfolio Benchmark*: Serves as the comparative investment standard.
  * **Month-6 Decision Gate Matrix**: Pre-defined **Red (Halt)**, **Amber (Pivot)**, and **Green (Scale)** criteria based on empirical order velocity and RTO delta.

---

## 3. Project Deliverables & Repository Map

```
meesho-commercial-strategy/
│
├── index.html                               # Interactive Browser Decision Simulator (SPA with Chart.js)
├── presentation.html                        # 12-Slide Executive Consulting Presentation Deck
├── style.css                                # Enterprise Consulting Design System (Navy / Slate / Teal)
├── app.js                                   # Real-Time Modeling Engine & Dynamic Chart Controllers
│
├── Meesho_Commercial_Decision_Model.xlsx    # 10-Sheet Master Financial Workbook (1,861 dynamic formulas)
├── build_financial_model.py                 # Python openpyxl Script Generating the Workbook
├── test_financial_model.py                  # Automated Quantitative Assertion Suite (10 Test Suites, 100% Pass)
├── validate_frontend.py                     # Automated DOM / JavaScript Linkage Audit (100% Coverage)
│
├── README.md                                # Master Project Documentation & Executive Summary
├── .gitignore                               # Clean repository exclusions
│
└── docs/
    ├── phase1-corrections-log.md            # Audit & Quantitative Reconciliation History
    ├── phase2-evidence-register.md          # 20-Parameter Sourced Register (MCA, RedSeer, Statutory)
    ├── phase3-model-documentation.md        # Technical Formula Specifications & Sensitivity Limits
    └── consulting-presentation-deck.md      # Full 12-Slide Executive Presentation Script
```

---

## 4. How to Run & Demonstrate the Deliverables

### A. Interactive Web Simulator (`index.html`)
* **Live Link**: **[https://gopalmahere.github.io/Meesho-Strategy-Simulator/](https://gopalmahere.github.io/Meesho-Strategy-Simulator/)**
* **Local Run**: Double-click `index.html` in any modern web browser. Zero server setup or Node.js build steps required.
* **Key Demonstration Workflows**:
  1. **Macro Scenario Toggles**: Switch between `Downside`, `Base Case`, and `Upside` to test macro resilience.
  2. **Strategy Selector**: Toggle between Baseline, Platform Fee, Valmo Logistics, Seller Ads, Combined Push, and **Project BharatPulse (Pilot)**.
  3. **Interactive Sliders**: Real-time stress-testing of AOV, COD %, RTO %, Platform Fee, and Ad Take-Rate with instant KPI ribbon & Chart.js recalculation.
  4. **Multi-Tab Analytics**: Deep-dive into *Financial Trajectories*, *Strategy Comparison*, *Monthly Schedule*, *Sensitivity Heatmaps*, and the *Executive Memo*.
  5. **Data Export**: Click **Export Simulation CSV** to generate a formatted snapshot of the current parameters and output schedules.

### B. Executive Slide Deck (`presentation.html`)
* **Live Link**: **[https://gopalmahere.github.io/Meesho-Strategy-Simulator/presentation.html](https://gopalmahere.github.io/Meesho-Strategy-Simulator/presentation.html)**
* **Local Run**: Double-click `presentation.html`.
* **Controls**: Navigate using `←` / `→` arrow keys, spacebar, or on-screen buttons. Features cross-linking directly back to the live simulator.

### C. Master Financial Model (`Meesho_Commercial_Decision_Model.xlsx`)
* Open in Microsoft Excel or Google Sheets.
* **10 Fully Audited Worksheets**:
  1. `Baseline_Assumptions` — Global macro parameters, cohort volumes, and operational costs.
  2. `Monthly_Baseline_Schedule` — 12-month baseline volume, GMV, and CM1/CM2/CM3 cash flows.
  3. `Lever1_Platform_Fee` — Demand elasticity curves and net churn impact.
  4. `Lever2_Valmo_Logistics` — 3PL fulfillment costs, reverse logistics, and 3-month ramp schedule.
  5. `Lever3_Seller_Ads` — Promoted listing penetration, attribution factor, and advertising revenues.
  6. `Lever4_Combined_Push` — Simultaneous deployment with 25% non-linear overlap damping penalty.
  7. `Pilot_BharatPulse` — 6-month regional pilot schedule, cluster metrics, and decision gates.
  8. `Executive_Summary` — 100% dynamic cross-sheet comparison table with rankings.
  9. `Sensitivity_Matrix` — 2D scenario matrix evaluating AOV vs. RTO rate combinations.
  10. `Auditing_Checks` — Automated boolean formula validation (`TRUE`/`FALSE`) verifying zero reconciliation breaks.

---

## 5. Automated Verification & Test Suite

The project includes strict quantitative assertions ensuring mathematical integrity:

```powershell
# Run the 10-suite financial assertion suite
python test_financial_model.py
```
* **Result**: **10 out of 10 Test Suites PASS**. Validates unit contribution reconciliation, dynamic formula syntax, scenario monotonicity, sensitivity limits, and sheet linkage.

```powershell
# Run the frontend DOM linkage verifier
python validate_frontend.py
```
* **Result**: **100% DOM ID coverage**. Verifies all 83 JavaScript DOM hooks exist across 110 unique IDs in `index.html` with zero broken references.

```powershell
# Rebuild the financial workbook from pure code
python build_financial_model.py
```
* Generates all 10 sheets with enterprise formatting (`#0D1F3C` Navy, `#00A896` Teal, formatted numbers, thin gridlines).

---

## 6. Evidence Classification Standard

Every input parameter in this model is tagged according to the four-tier credibility standard:
* `[1-VPF]` **Verified Published Fact**: Sourced from MCA statutory filings, Meesho official financial disclosures, or NPCI logistics data.
* `[2-CSE]` **Credible Secondary Estimate**: Sourced from RedSeer, Bernstein, or Morgan Stanley Indian e-commerce market intelligence.
* `[3-HCI]` **Hypothetical Company Input**: Model-specific baseline cohort assumptions explicitly labeled for stress testing.
* `[5-URN]` **Unverified Research Need**: Open assumptions flagged for empirical confirmation during the Phase-1 pilot.

---

## 7. Author & Credits

* **Author**: Gopal Mahere
* **Focus**: Commercial Strategy, Unit Economics Modeling, Product Management & BizOps
* **Platform**: Built with HTML5, CSS3, JavaScript (ES6+), Chart.js, Python (`openpyxl`), and Microsoft Excel.
