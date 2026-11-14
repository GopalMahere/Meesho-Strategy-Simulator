# Phase 3: Financial Model Architecture & Technical Documentation
**Workbook File**: `Meesho_Commercial_Decision_Model.xlsx`  
**Builder Script**: `build_financial_model.py`  
**Test Suite**: `test_financial_model.py`  
**Standard**: 10 Modular Worksheets | 12-Month Schedule | Zero Formula Errors | Formula Density > 1,100

---

## 1. 10-Sheet Workbook Architectural Blueprint

```
+---------------------------------------------------------------------------------------------------+
|                                  WORKBOOK ARCHITECTURE MAP                                        |
+--------------------+------------------------------------+-----------------------------------------+
| Sheet Index & Name | Core Purpose & Scope               | Primary Data Feeds / Cross-Sheet Links   |
+--------------------+------------------------------------+-----------------------------------------+
| 01. Executive_     | Executive Dashboard & Scenario     | Pulls Year-1 Totals from Sheets 03-08;  |
|     Summary        | Comparison Table (Base vs L1-L4)   | Drives Top-Level KPI Ribbon & Summary   |
+--------------------+------------------------------------+-----------------------------------------+
| 02. Baseline_      | Master Parameter Repository &      | Feeds all downstream monthly schedules; |
|     Assumptions    | Evidence Provenance Tags           | Global constants for AOV, COD, RTO, CAC |
+--------------------+------------------------------------+-----------------------------------------+
| 03. Monthly_       | 12-Month Status Quo Baseline       | References Sheet 02; establishes status |
|     Baseline_Sched | Operational & Financial Forecast   | quo CM1/CM2/CM3 baseline trajectory     |
+--------------------+------------------------------------+-----------------------------------------+
| 04. Lever1_        | Buyer Platform Fee (₹7/order)      | References Sheet 03 baseline volume;    |
|     Platform_Fee   | with Elasticity Churn Dynamics     | Computes price elasticity churn & delta |
+--------------------+------------------------------------+-----------------------------------------+
| 05. Lever2_        | Valmo In-House Logistics & AI COD  | References Sheet 03; models 4-month     |
|     Valmo_Logist   | Verification with 4-Month S-Curve  | S-curve RTO reduction & CapEx amort.    |
+--------------------+------------------------------------+-----------------------------------------+
| 06. Lever3_        | Seller Ad Monetization Scaled to   | References Sheet 03; models 2-month     |
|     Seller_Ads     | 3.25% Take-Rate with Cannibaliz.   | adoption lag, attribution discount & Opex|
+--------------------+------------------------------------+-----------------------------------------+
| 07. Lever4_        | Full-Scale Combined Push (L2 + L3) | Blends Sheets 05 & 06 with 25% overlap  |
|     Combined_Push  | with 25% Overlap Damping Penalty   | damping penalty and combined CapEx      |
+--------------------+------------------------------------+-----------------------------------------+
| 08. Pilot_         | Regional Cluster Trial (Purvanchal | Independent 10M/mo cluster schedule;    |
|     BharatPulse    | Cluster) with Month-6 Gate Check   | Dual break-even hurdles & Gate Scorecard|
+--------------------+------------------------------------+-----------------------------------------+
| 09. Sensitivity_   | 2D Data Tables (Fee vs Churn,      | Formula matrices evaluating CM3 delta   |
|     Matrix         | CapEx vs RTO Reduction Rate)       | under varying market shock combinations |
+--------------------+------------------------------------+-----------------------------------------+
| 10. Auditing_      | Automated Integrity Checks &       | Boolean validation rules (=IF(...,"PASS"|
|     Checks         | Reconciliation Assertions          | ,"FAIL")); tracks zero-tolerance errors |
+--------------------+------------------------------------+-----------------------------------------+
```

---

## 2. Core Mathematical Formulations

### A. Unit Economics Waterfall Derivation
For any monthly period $t \in [1, 12]$:
1. **Delivered Orders ($Q_{del, t}$)**:
   $$Q_{del, t} = Q_{t} \times (1 - \text{RTO}_t)$$
2. **Gross Merchandise Value ($\text{GMV}_t$)**:
   $$\text{GMV}_t = Q_{t} \times \text{AOV}$$
3. **Net Platform Revenue ($\text{Rev}_t$)**:
   $$\text{Rev}_t = (\text{GMV}_t \times \text{Ad Take-Rate}_t) + (Q_{t} \times \text{Logistics Fee}) + [Q_t \times \text{Buyer Fee}_t \times (1 - \text{Exempt}_t)]$$
4. **Contribution Margin 1 ($\text{CM1}_t$)**:
   $$\text{CM1}_t = \text{Rev}_t - (Q_{t} \times \text{Prepaid Mix} \times \text{PG Cost}) - (Q_{t} \times \text{CS Cost})$$
5. **Contribution Margin 2 ($\text{CM2}_t$)**:
   $$\text{CM2}_t = \text{CM1}_t - (Q_{del, t} \times \text{Forward Freight}_t) - (Q_{t} \times \text{RTO}_t \times \text{Reverse Freight})$$
6. **Contribution Margin 3 ($\text{CM3}_t$)**:
   $$\text{CM3}_t = \text{CM2}_t - (Q_{t} \times \text{Mktg Cost}) - \text{Amortized CapEx}_t - \text{Opex}_t$$

### B. Lever 1: Price Elasticity Function
$$\Delta Q_t = Q_{0, t} \times \left[ E_d \times \frac{\text{Platform Fee}}{\text{AOV}} \right] \times (1 - \text{Exempt Rate})$$
$$Q_{\text{L1}, t} = Q_{0, t} + \Delta Q_t$$

### C. Lever 2: S-Curve Logistics Optimization
Let the operational ramp progress factor $\alpha_t \in [0, 1]$ where $\alpha_1 = 0.15, \alpha_2 = 0.40, \alpha_3 = 0.75, \alpha_{\ge 4} = 1.00$:
$$\text{RTO}_t = \text{RTO}_{\text{base}} - \alpha_t \times (\text{RTO}_{\text{base}} - \text{RTO}_{\text{target}})$$
$$\text{Forward Freight}_t = \text{Forward}_{\text{base}} - \alpha_t \times \Delta \text{Freight Saving}$$
$$\text{Amortized CapEx}_t = \frac{\text{Total Valmo CapEx}}{12}$$

### D. Lever 3: Ad Take-Rate S-Curve & Attribution Discount
Let seller ad adoption factor $\beta_t \in [0, 1]$ where $\beta_1 = 0.00, \beta_2 = 0.30, \beta_3 = 0.70, \beta_{\ge 4} = 1.00$:
$$\text{Ad Take-Rate}_t = \text{AdTR}_{\text{base}} + \beta_t \times (\text{AdTR}_{\text{target}} - \text{AdTR}_{\text{base}}) \times (1 - \text{Cannibalization Factor})$$
$$\text{Ad Infrastructure Opex}_t = ₹15,00,000 \quad (\text{₹0.15 Cr/mo})$$

### E. Lever 4: Cross-Leverage Overlap Damping Formulation
$$\text{Gross Operational Delta}_t = \Delta \text{CM2}_{\text{L2}, t} + \Delta \text{CM2}_{\text{L3}, t}$$
$$\text{Damped Operational Delta}_t = \text{Gross Operational Delta}_t \times (1 - \text{Damping Factor}_{0.25})$$
$$\text{Net CM3}_{\text{L4}, t} = \text{CM3}_{\text{Base}, t} + \text{Damped Operational Delta}_t - \text{Combined CapEx Amortization}_t - \text{Ad Opex}_t$$

---

## 3. Data Dictionary of Cell References

| Parameter / Metric | Worksheet Reference | Cell Coordinate | Formula Format |
|:---|:---|:---|:---|
| AOV Baseline | `Baseline_Assumptions` | `C6` | Raw input: `310.00` |
| Baseline Orders / Mo | `Baseline_Assumptions` | `C7` | Raw input: `120000000` |
| Baseline COD Mix | `Baseline_Assumptions` | `C8` | Raw input: `0.72` |
| Baseline RTO Rate | `Baseline_Assumptions` | `C9` | Raw input: `0.245` |
| Forward Freight Cost | `Baseline_Assumptions` | `C12` | Raw input: `42.00` |
| Reverse RTO Freight | `Baseline_Assumptions` | `C13` | Raw input: `34.00` |
| Baseline CM3 / Order | `Executive_Summary` | `D12` | Dynamic formula `=Monthly_Baseline_Schedule!N25` |
| Lever 1 CM3 / Order | `Executive_Summary` | `E12` | Dynamic formula `=Lever1_Platform_Fee!N25` |
| Lever 2 CM3 / Order | `Executive_Summary` | `F12` | Dynamic formula `=Lever2_Valmo_Logistics!N25` |
| Lever 3 CM3 / Order | `Executive_Summary` | `G12` | Dynamic formula `=Lever3_Seller_Ads!N25` |
| Lever 4 CM3 / Order | `Executive_Summary` | `H12` | Dynamic formula `=Lever4_Combined_Push!N25` |
| Pilot BharatPulse CM3 | `Executive_Summary` | `I12` | Dynamic formula `=Pilot_BharatPulse!N25` |

---

## 4. Test Suite Execution Protocol

The automated test suite (`test_financial_model.py`) executes 10 test modules via Python:
1. `test_01_sheet_inventory`: Asserts all 10 sheet names are present.
2. `test_02_formula_error_scan`: Checks every single cell across all worksheets for `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`.
3. `test_03_formula_count`: Asserts total dynamic formula count $\ge 1,100$.
4. `test_04_baseline_waterfall_reconciliation`: Reconciles Gross GMV down to Net CM3 with exact arithmetic tolerances.
5. `test_05_lever1_elasticity_direction`: Asserts that adding a fee reduces volume and increases gross revenue.
6. `test_06_lever2_ramp_and_capex`: Asserts 4-month S-curve progression and CapEx inclusion.
7. `test_07_lever3_ad_take_rate`: Asserts attribution discount dampens raw ad take-rate.
8. `test_08_lever4_damping_penalty`: Asserts L4 delta < (L2 delta + L3 delta) by exactly 25% damping.
9. `test_09_pilot_cluster_hurdle`: Asserts Month-6 gate logic and dual hurdle outputs.
10. `test_10_sensitivity_continuity`: Asserts 2D sensitivity table monotonicity and edge-case stability.
