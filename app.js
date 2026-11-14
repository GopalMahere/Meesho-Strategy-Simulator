/**
 * app.js
 * ======
 * Meesho Commercial Strategy & Growth Decision Simulator Engine
 * Replicates verified 10-sheet Excel model (Project BharatPulse / Meesho) in interactive JavaScript.
 */

// Application State
const state = {
  macroScenario: "base", // downside | base | upside
  currentStrategy: "baseline", // baseline | strategyA | strategyB | strategyC | strategyD | pilot

  baseline: {
    aov: 310.0,
    monthlyOrders: 120.0, // in Millions
    codMix: 0.72,
    baseRto: 0.245,
    baseAdTakeRate: 0.0185,
    logisticsBilling: 46.50,
    fwdFreight: 42.00,
    rtoFreight: 34.00,
    pgRate: 2.20,
    csRate: 3.10,
    cac: 9.60 // direct marketing & CAC per order
  },

  strategyA: {
    platformFee: 7.00,
    ed: -1.45,
    exemptionRate: 0.08
  },

  strategyB: {
    capexCr: 6.50,
    rtoTarget: 0.175,
    fwdSaving: 4.50,
    rampMonths: 4
  },

  strategyC: {
    adTakeRate: 0.0325,
    cannibalization: 0.18,
    lagMonths: 2,
    budgetCr: 1.80
  },

  strategyD: {
    overlapDiscount: 0.25,
    budgetCr: 8.30
  },

  pilot: {
    budgetCr: 2.25,
    ordersM: 10.0,
    rtoTarget: 0.175,
    durationMonths: 6
  }
};

// Scenario presets
const scenarioPresets = {
  downside: {
    baseline: { aov: 290.0, monthlyOrders: 110.0, baseRto: 0.265 },
    strategyA: { platformFee: 8.00, ed: -1.95, exemptionRate: 0.06 },
    strategyB: { capexCr: 7.50, rtoTarget: 0.210, fwdSaving: 3.50, rampMonths: 5 },
    strategyC: { adTakeRate: 0.0250, cannibalization: 0.25, lagMonths: 3, budgetCr: 2.20 },
    strategyD: { overlapDiscount: 0.35, budgetCr: 9.70 },
    pilot: { budgetCr: 2.25, ordersM: 9.0, rtoTarget: 0.200 }
  },
  base: {
    baseline: { aov: 310.0, monthlyOrders: 120.0, baseRto: 0.245 },
    strategyA: { platformFee: 7.00, ed: -1.45, exemptionRate: 0.08 },
    strategyB: { capexCr: 6.50, rtoTarget: 0.175, fwdSaving: 4.50, rampMonths: 4 },
    strategyC: { adTakeRate: 0.0325, cannibalization: 0.18, lagMonths: 2, budgetCr: 1.80 },
    strategyD: { overlapDiscount: 0.25, budgetCr: 8.30 },
    pilot: { budgetCr: 2.25, ordersM: 10.0, rtoTarget: 0.175 }
  },
  upside: {
    baseline: { aov: 335.0, monthlyOrders: 135.0, baseRto: 0.220 },
    strategyA: { platformFee: 5.00, ed: -0.90, exemptionRate: 0.10 },
    strategyB: { capexCr: 5.50, rtoTarget: 0.155, fwdSaving: 5.50, rampMonths: 3 },
    strategyC: { adTakeRate: 0.0380, cannibalization: 0.12, lagMonths: 1, budgetCr: 1.50 },
    strategyD: { overlapDiscount: 0.15, budgetCr: 7.00 },
    pilot: { budgetCr: 2.25, ordersM: 12.0, rtoTarget: 0.155 }
  }
};

// Global chart references
let chartMonthlyTrajectory = null;
let chartStrategyBars = null;

// ============================================================================
// Core Financial Modeling Engine
// ============================================================================

function calculateBaselineMonthly() {
  const m = [];
  const b = state.baseline;
  const orders = b.monthlyOrders * 1000000;
  const gmv = orders * b.aov;
  const adRev = gmv * b.baseAdTakeRate;
  const logRev = orders * b.logisticsBilling;
  const netRev = adRev + logRev;

  const pgCost = orders * (1 - b.codMix) * b.pgRate;
  const csCost = orders * b.csRate;
  const cm1 = netRev - pgCost - csCost;

  const delivOrders = orders * (1 - b.baseRto);
  const rtoOrders = orders * b.baseRto;
  const fwdCost = delivOrders * b.fwdFreight;
  const rtoCost = rtoOrders * b.rtoFreight;
  const cm2 = cm1 - fwdCost - rtoCost;

  const cacCost = orders * b.cac;
  const netContrib = cm2 - cacCost;

  for (let i = 1; i <= 12; i++) {
    m.push({
      month: i,
      orders: orders,
      gmvCr: gmv / 10000000,
      netRevCr: netRev / 10000000,
      pgCostCr: pgCost / 10000000,
      csCostCr: csCost / 10000000,
      fwdCostCr: fwdCost / 10000000,
      rtoCostCr: rtoCost / 10000000,
      cm1Cr: cm1 / 10000000,
      cm2Cr: cm2 / 10000000,
      cacCr: cacCost / 10000000,
      initiativeSpendCr: 0.0,
      netContribCr: netContrib / 10000000,
      incrementalContribCr: 0.0,
      cm3PerOrder: netContrib / orders
    });
  }
  return m;
}

function calculateStrategyAMonthly(baseSchedule) {
  const m = [];
  const b = state.baseline;
  const sA = state.strategyA;

  // Elasticity churn
  const churnRate = sA.ed * (sA.platformFee / b.aov) * (1 - sA.exemptionRate);
  const orders = Math.round(b.monthlyOrders * 1000000 * (1 + churnRate));
  const gmv = orders * b.aov;
  const adRev = gmv * b.baseAdTakeRate;
  const logRev = orders * b.logisticsBilling;
  const feeRev = orders * sA.platformFee * (1 - sA.exemptionRate);
  const netRev = adRev + logRev + feeRev;

  const pgCost = orders * (1 - b.codMix) * b.pgRate;
  const csCost = orders * b.csRate;
  const cm1 = netRev - pgCost - csCost;

  const delivOrders = orders * (1 - b.baseRto);
  const rtoOrders = orders * b.baseRto;
  const fwdCost = delivOrders * b.fwdFreight;
  const rtoCost = rtoOrders * b.rtoFreight;
  const cm2 = cm1 - fwdCost - rtoCost;

  const cacCost = orders * b.cac;
  const netContrib = cm2 - cacCost;

  for (let i = 1; i <= 12; i++) {
    const incrContrib = (netContrib / 10000000) - baseSchedule[i - 1].netContribCr;
    m.push({
      month: i,
      orders: orders,
      gmvCr: gmv / 10000000,
      netRevCr: netRev / 10000000,
      pgCostCr: pgCost / 10000000,
      csCostCr: csCost / 10000000,
      fwdCostCr: fwdCost / 10000000,
      rtoCostCr: rtoCost / 10000000,
      cm1Cr: cm1 / 10000000,
      cm2Cr: cm2 / 10000000,
      cacCr: cacCost / 10000000,
      initiativeSpendCr: 0.0,
      netContribCr: netContrib / 10000000,
      incrementalContribCr: incrContrib,
      cm3PerOrder: netContrib / orders
    });
  }
  return m;
}

function calculateStrategyBMonthly(baseSchedule) {
  const m = [];
  const b = state.baseline;
  const sB = state.strategyB;
  const orders = b.monthlyOrders * 1000000;
  const monthlyCapEx = (sB.capexCr * 10000000) / 12;

  for (let i = 1; i <= 12; i++) {
    // S-curve ramp for Valmo expansion
    const alpha = Math.min(1.0, i / sB.rampMonths);
    const effRto = b.baseRto - (alpha * (b.baseRto - sB.rtoTarget));
    const effFwdSaving = alpha * sB.fwdSaving;

    const gmv = orders * b.aov;
    const adRev = gmv * b.baseAdTakeRate;
    const logRev = orders * b.logisticsBilling;
    const netRev = adRev + logRev;

    const pgCost = orders * (1 - b.codMix) * b.pgRate;
    const csCost = orders * b.csRate;
    const cm1 = netRev - pgCost - csCost;

    const delivOrders = orders * (1 - effRto);
    const rtoOrders = orders * effRto;
    const fwdCost = delivOrders * (b.fwdFreight - effFwdSaving);
    const rtoCost = rtoOrders * b.rtoFreight;
    const cm2 = cm1 - fwdCost - rtoCost;

    const cacCost = orders * b.cac;
    const netContrib = cm2 - cacCost - monthlyCapEx;
    const incrContrib = (netContrib / 10000000) - baseSchedule[i - 1].netContribCr;

    m.push({
      month: i,
      orders: orders,
      gmvCr: gmv / 10000000,
      netRevCr: netRev / 10000000,
      pgCostCr: pgCost / 10000000,
      csCostCr: csCost / 10000000,
      fwdCostCr: fwdCost / 10000000,
      rtoCostCr: rtoCost / 10000000,
      cm1Cr: cm1 / 10000000,
      cm2Cr: cm2 / 10000000,
      cacCr: cacCost / 10000000,
      initiativeSpendCr: monthlyCapEx / 10000000,
      netContribCr: netContrib / 10000000,
      incrementalContribCr: incrContrib,
      cm3PerOrder: netContrib / orders
    });
  }
  return m;
}

function calculateStrategyCMonthly(baseSchedule) {
  const m = [];
  const b = state.baseline;
  const sC = state.strategyC;
  const orders = b.monthlyOrders * 1000000;
  const gmv = orders * b.aov;
  const monthlyOpEx = (sC.budgetCr * 10000000) / 12;

  for (let i = 1; i <= 12; i++) {
    // Adoption delay
    let effTakeRate = b.baseAdTakeRate;
    if (i > sC.lagMonths) {
      effTakeRate = sC.adTakeRate;
    } else {
      effTakeRate = b.baseAdTakeRate + ((sC.adTakeRate - b.baseAdTakeRate) * (i / (sC.lagMonths + 1)));
    }

    const grossAdRev = gmv * effTakeRate;
    const cannibalization = (grossAdRev - (gmv * b.baseAdTakeRate)) * sC.cannibalization;
    const netAdRev = grossAdRev - cannibalization;
    const logRev = orders * b.logisticsBilling;
    const netRev = netAdRev + logRev;

    const pgCost = orders * (1 - b.codMix) * b.pgRate;
    const csCost = orders * b.csRate;
    const cm1 = netRev - pgCost - csCost;

    const delivOrders = orders * (1 - b.baseRto);
    const rtoOrders = orders * b.baseRto;
    const fwdCost = delivOrders * b.fwdFreight;
    const rtoCost = rtoOrders * b.rtoFreight;
    const cm2 = cm1 - fwdCost - rtoCost;

    const cacCost = orders * b.cac;
    const netContrib = cm2 - cacCost - monthlyOpEx;
    const incrContrib = (netContrib / 10000000) - baseSchedule[i - 1].netContribCr;

    m.push({
      month: i,
      orders: orders,
      gmvCr: gmv / 10000000,
      netRevCr: netRev / 10000000,
      pgCostCr: pgCost / 10000000,
      csCostCr: csCost / 10000000,
      fwdCostCr: fwdCost / 10000000,
      rtoCostCr: rtoCost / 10000000,
      cm1Cr: cm1 / 10000000,
      cm2Cr: cm2 / 10000000,
      cacCr: cacCost / 10000000,
      initiativeSpendCr: monthlyOpEx / 10000000,
      netContribCr: netContrib / 10000000,
      incrementalContribCr: incrContrib,
      cm3PerOrder: netContrib / orders
    });
  }
  return m;
}

function calculateStrategyDMonthly(baseSchedule, schedB, schedC) {
  const m = [];
  const sD = state.strategyD;
  const monthlyCapEx = (sD.budgetCr * 10000000) / 12;

  for (let i = 0; i < 12; i++) {
    const baseM = baseSchedule[i];
    const bM = schedB[i];
    const cM = schedC[i];

    // Gross delta from B and C
    const grossDeltaB = (bM.netContribCr - baseM.netContribCr) * 10000000 + (bM.initiativeSpendCr * 10000000);
    const grossDeltaC = (cM.netContribCr - baseM.netContribCr) * 10000000 + (cM.initiativeSpendCr * 10000000);
    const grossSum = grossDeltaB + grossDeltaC;

    // Apply synergy damping penalty
    const dampedDelta = grossSum * (1 - sD.overlapDiscount);
    const netContrib = (baseM.netContribCr * 10000000) + dampedDelta - monthlyCapEx;
    const incrContrib = (netContrib / 10000000) - baseM.netContribCr;

    m.push({
      month: i + 1,
      orders: baseM.orders,
      gmvCr: baseM.gmvCr,
      netRevCr: cM.netRevCr,
      pgCostCr: baseM.pgCostCr,
      csCostCr: baseM.csCostCr,
      fwdCostCr: bM.fwdCostCr,
      rtoCostCr: bM.rtoCostCr,
      cm1Cr: cM.cm1Cr,
      cm2Cr: bM.cm2Cr,
      cacCr: baseM.cacCr,
      initiativeSpendCr: monthlyCapEx / 10000000,
      netContribCr: netContrib / 10000000,
      incrementalContribCr: incrContrib,
      cm3PerOrder: netContrib / baseM.orders
    });
  }
  return m;
}

function calculatePilotMonthly(baseSchedule) {
  const m = [];
  const b = state.baseline;
  const p = state.pilot;
  const clusterOrders = p.ordersM * 1000000;
  const clusterGmv = clusterOrders * b.aov;
  const pilotMonthlySpend = (p.budgetCr * 10000000) / 6;

  for (let i = 1; i <= 12; i++) {
    if (i <= 6) {
      // Pilot phase (6 months)
      const alpha = Math.min(1.0, i / 3);
      const effRto = b.baseRto - (alpha * (b.baseRto - p.rtoTarget));
      const effFwdSaving = alpha * 4.50;

      const adRev = clusterGmv * 0.024; // modest pilot ad uptick
      const logRev = clusterOrders * b.logisticsBilling;
      const netRev = adRev + logRev;

      const pgCost = clusterOrders * (1 - b.codMix) * b.pgRate;
      const csCost = clusterOrders * b.csRate;
      const cm1 = netRev - pgCost - csCost;

      const delivOrders = clusterOrders * (1 - effRto);
      const rtoOrders = clusterOrders * effRto;
      const fwdCost = delivOrders * (b.fwdFreight - effFwdSaving);
      const rtoCost = rtoOrders * b.rtoFreight;
      const cm2 = cm1 - fwdCost - rtoCost;

      const cacCost = clusterOrders * (b.cac * 0.85); // denser cluster CAC efficiency
      const clusterNetContrib = cm2 - cacCost - pilotMonthlySpend;

      // Base contribution for national minus cluster + cluster
      const natBaseFraction = (b.monthlyOrders - p.ordersM) / b.monthlyOrders;
      const totalNatNetContrib = (baseSchedule[i - 1].netContribCr * 10000000 * natBaseFraction) + clusterNetContrib;
      const incrContrib = (totalNatNetContrib / 10000000) - baseSchedule[i - 1].netContribCr;

      m.push({
        month: i,
        orders: b.monthlyOrders * 1000000,
        gmvCr: (b.monthlyOrders * 1000000 * b.aov) / 10000000,
        netRevCr: baseSchedule[i - 1].netRevCr + 2.5,
        pgCostCr: baseSchedule[i - 1].pgCostCr,
        csCostCr: baseSchedule[i - 1].csCostCr,
        fwdCostCr: baseSchedule[i - 1].fwdCostCr - 1.2,
        rtoCostCr: baseSchedule[i - 1].rtoCostCr - 2.8,
        cm1Cr: baseSchedule[i - 1].cm1Cr + 2.5,
        cm2Cr: baseSchedule[i - 1].cm2Cr + 6.5,
        cacCr: baseSchedule[i - 1].cacCr,
        initiativeSpendCr: pilotMonthlySpend / 10000000,
        netContribCr: totalNatNetContrib / 10000000,
        incrementalContribCr: incrContrib,
        cm3PerOrder: totalNatNetContrib / (b.monthlyOrders * 1000000)
      });
    } else {
      // Post-pilot scale or hold
      const postPilotGain = 8.5; // ongoing cluster benefit
      const netContribCr = baseSchedule[i - 1].netContribCr + postPilotGain;
      m.push({
        month: i,
        orders: b.monthlyOrders * 1000000,
        gmvCr: baseSchedule[i - 1].gmvCr,
        netRevCr: baseSchedule[i - 1].netRevCr + 3.0,
        pgCostCr: baseSchedule[i - 1].pgCostCr,
        csCostCr: baseSchedule[i - 1].csCostCr,
        fwdCostCr: baseSchedule[i - 1].fwdCostCr - 1.5,
        rtoCostCr: baseSchedule[i - 1].rtoCostCr - 3.5,
        cm1Cr: baseSchedule[i - 1].cm1Cr + 3.0,
        cm2Cr: baseSchedule[i - 1].cm2Cr + 8.0,
        cacCr: baseSchedule[i - 1].cacCr,
        initiativeSpendCr: 0.0,
        netContribCr: netContribCr,
        incrementalContribCr: postPilotGain,
        cm3PerOrder: (netContribCr * 10000000) / (b.monthlyOrders * 1000000)
      });
    }
  }
  return m;
}

// ============================================================================
// Model Aggregation & UI Synchronization
// ============================================================================

function aggregateAnnual(schedule) {
  let netRevCr = 0;
  let netContribCr = 0;
  let initiativeSpendCr = 0;
  let cm1Cr = 0;
  let cm2Cr = 0;
  let orders = 0;
  let gmvCr = 0;

  schedule.forEach(m => {
    netRevCr += m.netRevCr;
    netContribCr += m.netContribCr;
    initiativeSpendCr += m.initiativeSpendCr;
    cm1Cr += m.cm1Cr;
    cm2Cr += m.cm2Cr;
    orders += m.orders;
    gmvCr += m.gmvCr;
  });

  return {
    netRevCr,
    netContribCr,
    initiativeSpendCr,
    cm1Cr,
    cm2Cr,
    orders,
    gmvCr,
    avgCm3PerOrder: (netContribCr * 10000000) / orders
  };
}

function updateModel() {
  readControlsFromUI();

  const schedBase = calculateBaselineMonthly();
  const schedA = calculateStrategyAMonthly(schedBase);
  const schedB = calculateStrategyBMonthly(schedBase);
  const schedC = calculateStrategyCMonthly(schedBase);
  const schedD = calculateStrategyDMonthly(schedBase, schedB, schedC);
  const schedPilot = calculatePilotMonthly(schedBase);

  const schedules = {
    baseline: schedBase,
    strategyA: schedA,
    strategyB: schedB,
    strategyC: schedC,
    strategyD: schedD,
    pilot: schedPilot
  };

  const currentSched = schedules[state.currentStrategy];
  const annualCur = aggregateAnnual(currentSched);
  const annualBase = aggregateAnnual(schedBase);

  // Update Top KPIs
  updateTopKPIs(annualCur, annualBase);

  // Update Dynamic Text inside controls
  updateControlCallouts(annualCur, annualBase, schedules);

  // Render Charts
  renderMonthlyTrajectoryChart(schedBase, currentSched);
  renderStrategyBarsChart(schedules, annualBase);

  // Update Tables
  updateComparisonTable(schedules, annualBase);
  updateMonthlyTable(currentSched);
  updateSensitivityTables();
}

function readControlsFromUI() {
  // Baseline
  state.baseline.aov = parseFloat(document.getElementById("inp-base-aov").value);
  state.baseline.monthlyOrders = parseFloat(document.getElementById("inp-base-orders").value);
  state.baseline.codMix = parseFloat(document.getElementById("inp-base-cod").value) / 100;
  state.baseline.baseRto = parseFloat(document.getElementById("inp-base-rto").value) / 100;
  state.baseline.cac = parseFloat(document.getElementById("inp-base-cac").value);

  // Strategy A
  state.strategyA.platformFee = parseFloat(document.getElementById("inp-stratA-fee").value);
  state.strategyA.ed = parseFloat(document.getElementById("inp-stratA-ed").value);
  state.strategyA.exemptionRate = parseFloat(document.getElementById("inp-stratA-exemption").value) / 100;

  // Strategy B
  state.strategyB.capexCr = parseFloat(document.getElementById("inp-stratB-capex").value);
  state.strategyB.rtoTarget = parseFloat(document.getElementById("inp-stratB-rto").value) / 100;
  state.strategyB.fwdSaving = parseFloat(document.getElementById("inp-stratB-saving").value);
  state.strategyB.rampMonths = parseInt(document.getElementById("inp-stratB-ramp").value);

  // Strategy C
  state.strategyC.adTakeRate = parseFloat(document.getElementById("inp-stratC-takerate").value) / 100;
  state.strategyC.cannibalization = parseFloat(document.getElementById("inp-stratC-cannibalization").value) / 100;
  state.strategyC.lagMonths = parseInt(document.getElementById("inp-stratC-lag").value);
  state.strategyC.budgetCr = parseFloat(document.getElementById("inp-stratC-budget").value);

  // Strategy D
  state.strategyD.overlapDiscount = parseFloat(document.getElementById("inp-stratD-overlap").value) / 100;
  state.strategyD.budgetCr = parseFloat(document.getElementById("inp-stratD-budget").value);

  // Pilot
  state.pilot.budgetCr = parseFloat(document.getElementById("inp-pilot-budget").value);
  state.pilot.ordersM = parseFloat(document.getElementById("inp-pilot-orders").value);
  state.pilot.rtoTarget = parseFloat(document.getElementById("inp-pilot-rto").value) / 100;

  // Sync display text values next to sliders
  document.getElementById("val-base-aov").innerText = `₹${state.baseline.aov.toFixed(0)}`;
  document.getElementById("val-base-orders").innerText = `${state.baseline.monthlyOrders.toFixed(0)}M`;
  document.getElementById("val-base-cod").innerText = `${(state.baseline.codMix * 100).toFixed(1)}%`;
  document.getElementById("val-base-rto").innerText = `${(state.baseline.baseRto * 100).toFixed(1)}%`;
  document.getElementById("val-base-cac").innerText = `₹${state.baseline.cac.toFixed(2)}`;

  document.getElementById("val-stratA-fee").innerText = `₹${state.strategyA.platformFee.toFixed(2)}`;
  document.getElementById("val-stratA-ed").innerText = state.strategyA.ed.toFixed(2);
  const churn = state.strategyA.ed * (state.strategyA.platformFee / state.baseline.aov) * (1 - state.strategyA.exemptionRate);
  document.getElementById("val-stratA-churn").innerText = `${(churn * 100).toFixed(1)}%`;
  document.getElementById("val-stratA-exemption").innerText = `${(state.strategyA.exemptionRate * 100).toFixed(1)}%`;

  document.getElementById("val-stratB-capex").innerText = `₹${state.strategyB.capexCr.toFixed(2)} Cr`;
  document.getElementById("val-stratB-rto").innerText = `${(state.strategyB.rtoTarget * 100).toFixed(1)}%`;
  document.getElementById("val-stratB-saving").innerText = `₹${state.strategyB.fwdSaving.toFixed(2)}`;
  document.getElementById("val-stratB-ramp").innerText = `${state.strategyB.rampMonths} Months`;

  document.getElementById("val-stratC-takerate").innerText = `${(state.strategyC.adTakeRate * 100).toFixed(2)}%`;
  document.getElementById("val-stratC-cannibalization").innerText = `${(state.strategyC.cannibalization * 100).toFixed(1)}%`;
  document.getElementById("val-stratC-lag").innerText = `${state.strategyC.lagMonths} Months`;
  document.getElementById("val-stratC-budget").innerText = `₹${state.strategyC.budgetCr.toFixed(2)} Cr`;

  document.getElementById("val-stratD-overlap").innerText = `${(state.strategyD.overlapDiscount * 100).toFixed(1)}%`;
  document.getElementById("val-stratD-budget").innerText = `₹${state.strategyD.budgetCr.toFixed(2)} Cr`;

  document.getElementById("val-pilot-budget").innerText = `₹${state.pilot.budgetCr.toFixed(2)} Cr`;
  document.getElementById("val-pilot-orders").innerText = `${state.pilot.ordersM.toFixed(1)}M`;
  document.getElementById("val-pilot-rto").innerText = `${(state.pilot.rtoTarget * 100).toFixed(1)}%`;
}

function updateTopKPIs(cur, base) {
  const revElem = document.getElementById("kpi-revenue");
  const revDeltaElem = document.getElementById("kpi-revenue-delta");
  const contribElem = document.getElementById("kpi-contribution");
  const marginPctElem = document.getElementById("kpi-margin-pct");
  const incrElem = document.getElementById("kpi-incremental");
  const incrSubElem = document.getElementById("kpi-incremental-sub");
  const spendElem = document.getElementById("kpi-spend");
  const budgetUtilElem = document.getElementById("kpi-budget-util");
  const roiElem = document.getElementById("kpi-roi");
  const roiSubElem = document.getElementById("kpi-roi-sub");
  const beElem = document.getElementById("kpi-breakeven");
  const beUnitsElem = document.getElementById("kpi-breakeven-units");
  const badgeElem = document.getElementById("decision-badge");
  const decisionSubElem = document.getElementById("decision-sub");

  // Revenue
  revElem.innerText = `₹${cur.netRevCr.toFixed(1)} Cr`;
  const revDelta = ((cur.netRevCr - base.netRevCr) / base.netRevCr) * 100;
  revDeltaElem.innerText = `${revDelta >= 0 ? '+' : ''}${revDelta.toFixed(1)}% vs Base`;

  // Net Contribution
  contribElem.innerText = `₹${cur.netContribCr.toFixed(1)} Cr`;
  const cm3Margin = (cur.netContribCr / cur.netRevCr) * 100;
  marginPctElem.innerText = `CM3 Margin: ${cm3Margin.toFixed(1)}%`;

  // Incremental Contribution
  const deltaContrib = cur.netContribCr - base.netContribCr;
  incrElem.innerText = `${deltaContrib >= 0 ? '+' : ''}₹${deltaContrib.toFixed(1)} Cr`;
  incrElem.style.color = deltaContrib >= 0 ? "#166534" : "#991B1B";
  incrSubElem.innerText = state.currentStrategy === "baseline" ? "Baseline Reference" : "Annual Cash Impact";

  // Spend
  spendElem.innerText = `₹${cur.initiativeSpendCr.toFixed(2)} Cr`;
  budgetUtilElem.innerText = `Budget: ₹${cur.initiativeSpendCr.toFixed(2)} Cr`;

  // ROI & Hurdle & Badges
  badgeElem.className = "decision-badge";
  if (state.currentStrategy === "baseline") {
    roiElem.innerText = "0.00x / 0.0%";
    roiSubElem.innerText = "Status Quo Reference";
    beElem.innerText = "0.0%";
    beUnitsElem.innerText = "+0 orders needed";
    badgeElem.innerText = "BASELINE REFERENCE";
    decisionSubElem.innerText = "Status Quo Unit Bleed";
  } else if (state.currentStrategy === "strategyA") {
    roiElem.innerText = "N/A (No CapEx)";
    roiSubElem.innerText = "Volume Contraction Risk";
    beElem.innerText = "+3.5% Churn Hurdle";
    const volLost = Math.round((base.orders - cur.orders) / 1000000);
    beUnitsElem.innerText = `-${volLost}M orders destroyed`;
    badgeElem.innerText = deltaContrib < 0 ? "REJECT: VOLUME CHURN" : "VOLUME RISK: ACCRETIVE CM3";
    badgeElem.classList.add(deltaContrib < 0 ? "badge-danger" : "badge-warning");
    decisionSubElem.innerText = "Tests Tier-2/3 Price Elasticity";
  } else if (state.currentStrategy === "strategyB") {
    const grossSavings = deltaContrib + cur.initiativeSpendCr;
    const gROI = cur.initiativeSpendCr > 0 ? (grossSavings / cur.initiativeSpendCr) : 0;
    roiElem.innerText = `${gROI.toFixed(2)}x / ${((gROI - 1) * 100).toFixed(0)}%`;
    roiSubElem.innerText = "Logistics Efficiency";
    beElem.innerText = "22.8% RTO Hurdle";
    beUnitsElem.innerText = "Requires -1.7% RTO compression";
    badgeElem.innerText = deltaContrib > 0 ? "VIABLE LOGISTICS SCALE" : "CAPEX OVERRUN RISK";
    badgeElem.classList.add(deltaContrib > 0 ? "badge-success" : "badge-danger");
    decisionSubElem.innerText = "Valmo Disintermediation";
  } else if (state.currentStrategy === "strategyC") {
    const grossAdGain = deltaContrib + cur.initiativeSpendCr;
    const gROI = cur.initiativeSpendCr > 0 ? (grossAdGain / cur.initiativeSpendCr) : 0;
    roiElem.innerText = `${gROI.toFixed(2)}x / ${((gROI - 1) * 100).toFixed(0)}%`;
    roiSubElem.innerText = "Ad Monetization Accretion";
    beElem.innerText = "2.15% Ad Take-Rate";
    beUnitsElem.innerText = "Break-even vs ₹1.8 Cr OpEx";
    badgeElem.innerText = deltaContrib > 0 ? "HIGHLY ACCRETIVE" : "LOW SELLER ADOPTION";
    badgeElem.classList.add(deltaContrib > 0 ? "badge-success" : "badge-danger");
    decisionSubElem.innerText = "Regional Seller Discovery";
  } else if (state.currentStrategy === "strategyD") {
    const gROI = cur.initiativeSpendCr > 0 ? ((deltaContrib + cur.initiativeSpendCr) / cur.initiativeSpendCr) : 0;
    roiElem.innerText = `${gROI.toFixed(2)}x / ${((gROI - 1) * 100).toFixed(0)}%`;
    roiSubElem.innerText = "25% Overlap Damped";
    beElem.innerText = "+14.5% Net Hurdle";
    beUnitsElem.innerText = "High upfront capital";
    badgeElem.innerText = "HIGH CAPITAL RISK: PILOT FIRST";
    badgeElem.classList.add("badge-warning");
    decisionSubElem.innerText = "Full National Push Risk";
  } else if (state.currentStrategy === "pilot") {
    roiElem.innerText = "Real Option";
    roiSubElem.innerText = "73% Capital Preserved";
    beElem.innerText = "Terr: +11.8% | Nat: +2.5%";
    beUnitsElem.innerText = "Dual hurdle design";
    badgeElem.innerText = "⭐ RECOMMENDED: CONTROLLED PILOT";
    badgeElem.classList.add("badge-success");
    decisionSubElem.innerText = "De-Risks Valmo & Ads";
  }
}

function updateControlCallouts(cur, base, schedules) {
  // Lever 1
  const l1Annual = aggregateAnnual(schedules.strategyA);
  document.getElementById("meta-stratA-base-margin").innerText = `₹${base.avgCm3PerOrder.toFixed(2)}`;
  document.getElementById("meta-stratA-new-margin").innerText = `₹${l1Annual.avgCm3PerOrder.toFixed(2)}`;
  const volLossM = ((base.orders - l1Annual.orders) / 1000000).toFixed(1);
  document.getElementById("meta-stratA-vol-loss").innerText = `-${volLossM}M orders / yr`;

  // Lever 2
  const monthlySavingsCr = (state.baseline.monthlyOrders * 1000000 * (state.baseline.baseRto - state.strategyB.rtoTarget) * state.baseline.rtoFreight) / 10000000;
  document.getElementById("meta-stratB-savings").innerText = `₹${monthlySavingsCr.toFixed(1)} Cr / mo`;
  const payback = (state.strategyB.capexCr * 10000000) / (monthlySavingsCr * 10000000 * 12);
  document.getElementById("meta-stratB-payback").innerText = `${payback.toFixed(1)} Years`;
  document.getElementById("meta-stratB-hurdle").innerText = "22.8% RTO";

  // Lever 3
  const grossAdCr = ((state.baseline.monthlyOrders * 1000000 * state.baseline.aov * 12) * (state.strategyC.adTakeRate - state.baseline.baseAdTakeRate)) / 10000000;
  const netAdCr = grossAdCr * (1 - state.strategyC.cannibalization);
  document.getElementById("meta-stratC-grossad").innerText = `+₹${grossAdCr.toFixed(1)} Cr`;
  document.getElementById("meta-stratC-netad").innerText = `+₹${netAdCr.toFixed(1)} Cr`;
  document.getElementById("meta-stratC-hurdle").innerText = "2.15% of GMV";

  // Lever 4
  const deltaL2Cr = (aggregateAnnual(schedules.strategyB).netContribCr - base.netContribCr) + state.strategyB.capexCr;
  const deltaL3Cr = (aggregateAnnual(schedules.strategyC).netContribCr - base.netContribCr) + state.strategyC.budgetCr;
  const penaltyCr = (deltaL2Cr + deltaL3Cr) * state.strategyD.overlapDiscount;
  const netSynCr = (deltaL2Cr + deltaL3Cr) - penaltyCr;
  document.getElementById("meta-stratD-deltaL2").innerText = `+₹${deltaL2Cr.toFixed(1)} Cr`;
  document.getElementById("meta-stratD-deltaL3").innerText = `+₹${deltaL3Cr.toFixed(1)} Cr`;
  document.getElementById("meta-stratD-penalty").innerText = `-₹${penaltyCr.toFixed(1)} Cr`;
  document.getElementById("meta-stratD-netSynergy").innerText = `+₹${netSynCr.toFixed(1)} Cr`;

  // Pilot
  document.getElementById("meta-pilot-local-cm3").innerText = "+₹4.82 / order";
  document.getElementById("meta-pilot-local-hurdle").innerText = "+11.8% volume";
}

// ============================================================================
// Charts Rendering
// ============================================================================

function renderMonthlyTrajectoryChart(baseSchedule, currentSchedule) {
  const ctx = document.getElementById("chart-monthly-traj").getContext("2d");
  const labels = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
  const baseData = baseSchedule.map(m => m.netContribCr);
  const curData = currentSchedule.map(m => m.netContribCr);

  if (chartMonthlyTrajectory) {
    chartMonthlyTrajectory.destroy();
  }

  chartMonthlyTrajectory = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Status Quo Baseline (Bleed)",
          data: baseData,
          borderColor: "#E63946",
          borderDash: [5, 5],
          backgroundColor: "rgba(230, 57, 70, 0.08)",
          fill: false,
          tension: 0.1,
          pointRadius: 3
        },
        {
          label: `Selected: ${getStrategyName(state.currentStrategy)}`,
          data: curData,
          borderColor: "#00A896",
          backgroundColor: "rgba(0, 168, 150, 0.12)",
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointBackgroundColor: "#00A896"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 10, weight: 600 } } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ₹${context.raw.toFixed(2)} Cr`;
            }
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: "Net CM3 (₹ Crore / Month)", font: { size: 10 } },
          ticks: { font: { size: 9 } }
        },
        x: { ticks: { font: { size: 9 } } }
      }
    }
  });
}

function renderStrategyBarsChart(schedules, annualBase) {
  const ctx = document.getElementById("chart-strategy-bars").getContext("2d");
  const stratKeys = ["baseline", "strategyA", "strategyB", "strategyC", "strategyD", "pilot"];
  const stratLabels = ["Baseline", "Lever 1 (Fee)", "Lever 2 (Valmo)", "Lever 3 (Ads)", "Lever 4 (Push)", "⭐ Pilot First"];

  const deltaContribData = stratKeys.map(k => {
    const ann = aggregateAnnual(schedules[k]);
    return parseFloat((ann.netContribCr - annualBase.netContribCr).toFixed(2));
  });

  const spendData = stratKeys.map(k => {
    const ann = aggregateAnnual(schedules[k]);
    return parseFloat(ann.initiativeSpendCr.toFixed(2));
  });

  if (chartStrategyBars) {
    chartStrategyBars.destroy();
  }

  chartStrategyBars = new Chart(ctx, {
    type: "bar",
    data: {
      labels: stratLabels,
      datasets: [
        {
          label: "Incremental Contribution (Δ ₹ Cr)",
          data: deltaContribData,
          backgroundColor: deltaContribData.map(v => v >= 0 ? "#00A896" : "#E63946"),
          borderRadius: 4
        },
        {
          label: "Initiative CapEx / Spend (₹ Cr)",
          data: spendData,
          backgroundColor: "#F59E0B",
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 10, weight: 600 } } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ₹${context.raw.toFixed(2)} Cr`;
            }
          }
        }
      },
      scales: {
        y: {
          title: { display: true, text: "₹ Crore", font: { size: 10 } },
          ticks: { font: { size: 9 } }
        },
        x: { ticks: { font: { size: 9 } } }
      }
    }
  });
}

// ============================================================================
// Tables & Grid Views
// ============================================================================

function updateComparisonTable(schedules, base) {
  const tbody = document.getElementById("tbody-comparison");
  tbody.innerHTML = "";

  const rows = [
    { name: "Baseline (Status Quo)", key: "baseline", case: "Status Quo Unit Bleed" },
    { name: "Lever 1: Platform Fee (₹7)", key: "strategyA", case: `Ed = ${state.strategyA.ed.toFixed(2)}` },
    { name: "Lever 2: Valmo Logistics", key: "strategyB", case: `RTO &rarr; ${(state.strategyB.rtoTarget * 100).toFixed(1)}%, ₹${state.strategyB.capexCr} Cr CapEx` },
    { name: "Lever 3: Seller Ads", key: "strategyC", case: `Take-Rate &rarr; ${(state.strategyC.adTakeRate * 100).toFixed(2)}%` },
    { name: "Lever 4: Combined Push", key: "strategyD", case: `Overlap Penalty = ${(state.strategyD.overlapDiscount * 100).toFixed(0)}%` },
    { name: "⭐ Pilot BharatPulse (6-Mo)", key: "pilot", case: "Purvanchal UP/Bihar Cluster" }
  ];

  rows.forEach(r => {
    const ann = aggregateAnnual(schedules[r.key]);
    const delta = ann.netContribCr - base.netContribCr;
    const spend = ann.initiativeSpendCr;
    let grossROI = "N/A";
    let netROI = "N/A";

    if (r.key === "pilot") {
      grossROI = "Real Option";
      netROI = "Risk-Capped";
    } else if (spend > 0) {
      const gROI = (delta + spend) / spend;
      grossROI = `${gROI.toFixed(2)}x`;
      netROI = `${((gROI - 1.0) * 100).toFixed(0)}%`;
    }

    let hurdle = "0.0%";
    if (r.key === "pilot") {
      hurdle = "Cluster: +11.8% | Nat: +2.5%";
    } else if (spend > 0) {
      hurdle = `+${((spend / base.netRevCr) * 100).toFixed(2)}% Rev`;
    } else if (r.key === "strategyA") {
      hurdle = "+3.5% Churn";
    }

    let decision = "Approved";
    if (r.key === "baseline") decision = "Baseline Reference";
    else if (r.key === "pilot") decision = "⭐ RECOMMENDED: Controlled Risk";
    else if (r.key === "strategyA") decision = delta < 0 ? "REJECT: Destroys Volume" : "VOLUME RISK: HIGH CHURN";
    else if (delta < -20) decision = "REJECT: Destroys Capital";
    else if (r.key === "strategyD") decision = "PILOT FIRST: High Capital Risk";
    else decision = "VIABLE SCALE-UP";

    const tr = document.createElement("tr");
    tr.className = r.key === "pilot" ? "highlight-row" : "";
    tr.innerHTML = `
      <td><strong>${r.name}</strong></td>
      <td>${r.case}</td>
      <td>₹${ann.netRevCr.toFixed(1)} Cr</td>
      <td>₹${ann.netContribCr.toFixed(1)} Cr</td>
      <td class="${delta >= 0 ? 'text-success' : 'text-danger'}"><strong>${delta >= 0 ? '+' : ''}₹${delta.toFixed(1)} Cr</strong></td>
      <td>₹${spend.toFixed(2)} Cr</td>
      <td>${grossROI}</td>
      <td>${netROI}</td>
      <td>${hurdle}</td>
      <td><span class="decision-badge ${decision.includes('RECOMMENDED') ? 'badge-success' : (decision.includes('REJECT') ? 'badge-danger' : 'badge-warning')}">${decision}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function updateMonthlyTable(sched) {
  const tbody = document.getElementById("tbody-monthly");
  tbody.innerHTML = "";

  const specs = [
    { label: "Monthly Orders (Millions)", fmt: v => (v / 1000000).toFixed(1) + "M", key: "orders", sum: false },
    { label: "Gross GMV (₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "gmvCr", sum: true },
    { label: "Net Platform Revenue (₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "netRevCr", sum: true },
    { label: "Payment Gateway Cost (₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "pgCostCr", sum: true },
    { label: "Customer Support Ops (₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "csCostCr", sum: true },
    { label: "Contribution Margin 1 (CM1 ₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "cm1Cr", sum: true },
    { label: "Forward Shipping Cost (₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "fwdCostCr", sum: true },
    { label: "Reverse RTO Freight Loss (₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "rtoCostCr", sum: true },
    { label: "Contribution Margin 2 (CM2 ₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "cm2Cr", sum: true },
    { label: "Direct Marketing & CAC (₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "cacCr", sum: true },
    { label: "Initiative CapEx / Spend (₹ Cr)", fmt: v => `₹${v.toFixed(2)}`, key: "initiativeSpendCr", sum: true },
    { label: "Net Contribution (CM3 ₹ Cr)", fmt: v => `₹${v.toFixed(1)}`, key: "netContribCr", sum: true },
    { label: "Δ CM3 vs Baseline (₹ Cr)", fmt: v => `${v >= 0 ? '+' : ''}₹${v.toFixed(1)}`, key: "incrementalContribCr", sum: true }
  ];

  specs.forEach(s => {
    const tr = document.createElement("tr");
    let html = `<td><strong>${s.label}</strong></td>`;
    let total = 0;

    sched.forEach(m => {
      const val = m[s.key];
      total += val;
      html += `<td>${s.fmt(val)}</td>`;
    });

    html += `<td><strong>${s.sum ? s.fmt(total) : "—"}</strong></td>`;
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
}

function updateSensitivityTables() {
  // Table 1: Platform Fee vs Elasticity
  const tPrice = document.getElementById("sens-table-price");
  const fees = [3.0, 5.0, 7.0, 9.0, 12.0];
  const peds = [-2.20, -1.80, -1.45, -1.10, -0.75];

  let hHtml = "<thead><tr><th>Fee (₹) \\ Elasticity</th>";
  peds.forEach(p => { hHtml += `<th>Ed = ${p.toFixed(2)}</th>`; });
  hHtml += "</tr></thead><tbody>";

  const b = state.baseline;
  const baseNet = b.monthlyOrders * 1000000 * 12 * -1.12 / 10000000;

  fees.forEach(fee => {
    hHtml += `<tr><td><strong>₹${fee.toFixed(0)}</strong></td>`;
    peds.forEach(ped => {
      const churn = ped * (fee / b.aov) * (1 - 0.08);
      const orders = b.monthlyOrders * 1000000 * (1 + churn);
      const newCm3 = orders * 12 * (-1.12 + fee * 0.92) / 10000000;
      const delta = newCm3 - baseNet;

      let cls = "sens-val-green";
      if (delta < 0) cls = "sens-val-red";
      else if (delta < 50) cls = "sens-val-amber";

      hHtml += `<td class="${cls}">${delta >= 0 ? '+' : ''}₹${delta.toFixed(0)} Cr</td>`;
    });
    hHtml += "</tr>";
  });
  hHtml += "</tbody>";
  tPrice.innerHTML = hHtml;

  // Table 2: Valmo CapEx vs Target RTO
  const tDist = document.getElementById("sens-table-dist");
  const capexes = [4.0, 6.5, 9.0, 12.0];
  const rtos = [0.15, 0.175, 0.20, 0.225, 0.245];

  let dHtml = "<thead><tr><th>CapEx (₹ Cr) \\ Target RTO</th>";
  rtos.forEach(r => { dHtml += `<th>${(r * 100).toFixed(1)}%</th>`; });
  dHtml += "</tr></thead><tbody>";

  capexes.forEach(cap => {
    dHtml += `<tr><td><strong>₹${cap.toFixed(1)} Cr</strong></td>`;
    rtos.forEach(r => {
      const orders = b.monthlyOrders * 1000000;
      const monthlySavings = (orders * (b.baseRto - r) * b.rtoFreight) + (orders * (1 - r) * 4.5);
      const annualNetBenefit = (monthlySavings * 12 / 10000000) - cap;

      let cls = "sens-val-green";
      if (annualNetBenefit < 0) cls = "sens-val-red";
      else if (annualNetBenefit < 30) cls = "sens-val-amber";

      dHtml += `<td class="${cls}">${annualNetBenefit >= 0 ? '+' : ''}₹${annualNetBenefit.toFixed(0)} Cr</td>`;
    });
    dHtml += "</tr>";
  });
  dHtml += "</tbody>";
  tDist.innerHTML = dHtml;
}

// ============================================================================
// UI Interactions & Navigation
// ============================================================================

function selectStrategy(strategyKey) {
  state.currentStrategy = strategyKey;

  // Update strategy tabs
  const tabIds = ["baseline", "strategyA", "strategyB", "strategyC", "strategyD", "pilot"];
  tabIds.forEach(k => {
    const btn = document.getElementById(`tab-strat-${k}`);
    if (btn) btn.classList.remove("active");
    const group = document.getElementById(`controls-${k}`);
    if (group) group.classList.remove("active");
  });

  const activeBtn = document.getElementById(`tab-strat-${strategyKey}`);
  if (activeBtn) activeBtn.classList.add("active");
  const activeGroup = document.getElementById(`controls-${strategyKey}`);
  if (activeGroup) activeGroup.classList.add("active");

  // Update panel title
  const titles = {
    baseline: "Baseline Business Parameters",
    strategyA: "Lever 1: Buyer Platform Fee & Elasticity",
    strategyB: "Lever 2: Valmo Logistics Network & RTO",
    strategyC: "Lever 3: Seller Ad Discovery & Monetization",
    strategyD: "Lever 4: Combined Full-Scale Push",
    pilot: "Project BharatPulse: Controlled Regional Pilot"
  };
  const descs = {
    baseline: "Status quo unit economics for Meesho Tier-2/3 operations.",
    strategyA: "Monetize checkout fee vs demand elasticity friction.",
    strategyB: "Disintermediate 3PLs and compress COD RTO rate.",
    strategyC: "Expand self-serve promoted listings across unbranded regional sellers.",
    strategyD: "Execute Valmo and Ads simultaneously with 25% overlap damping.",
    pilot: "Controlled 6-month trial in Purvanchal (Eastern UP/Bihar) with decision gates."
  };

  document.getElementById("panel-title").innerText = titles[strategyKey] || "Strategy Parameters";
  document.getElementById("panel-desc").innerText = descs[strategyKey] || "";

  updateModel();
}

function setScenario(scenarioKey) {
  state.macroScenario = scenarioKey;

  // Toggle buttons
  document.getElementById("btn-scenario-downside").classList.remove("active");
  document.getElementById("btn-scenario-base").classList.remove("active");
  document.getElementById("btn-scenario-upside").classList.remove("active");
  document.getElementById(`btn-scenario-` + scenarioKey).classList.add("active");

  const preset = scenarioPresets[scenarioKey];
  if (preset) {
    // Apply baseline
    state.baseline.aov = preset.baseline.aov;
    state.baseline.monthlyOrders = preset.baseline.monthlyOrders;
    state.baseline.baseRto = preset.baseline.baseRto;

    // Apply strategy A
    state.strategyA.platformFee = preset.strategyA.platformFee;
    state.strategyA.ed = preset.strategyA.ed;
    state.strategyA.exemptionRate = preset.strategyA.exemptionRate;

    // Apply strategy B
    state.strategyB.capexCr = preset.strategyB.capexCr;
    state.strategyB.rtoTarget = preset.strategyB.rtoTarget;
    state.strategyB.fwdSaving = preset.strategyB.fwdSaving;
    state.strategyB.rampMonths = preset.strategyB.rampMonths;

    // Apply strategy C
    state.strategyC.adTakeRate = preset.strategyC.adTakeRate;
    state.strategyC.cannibalization = preset.strategyC.cannibalization;
    state.strategyC.lagMonths = preset.strategyC.lagMonths;
    state.strategyC.budgetCr = preset.strategyC.budgetCr;

    // Apply strategy D
    state.strategyD.overlapDiscount = preset.strategyD.overlapDiscount;
    state.strategyD.budgetCr = preset.strategyD.budgetCr;

    // Apply pilot
    state.pilot.budgetCr = preset.pilot.budgetCr;
    state.pilot.ordersM = preset.pilot.ordersM;
    state.pilot.rtoTarget = preset.pilot.rtoTarget;

    syncControlsToUI();
  }

  updateModel();
}

function syncControlsToUI() {
  document.getElementById("inp-base-aov").value = state.baseline.aov;
  document.getElementById("inp-base-orders").value = state.baseline.monthlyOrders;
  document.getElementById("inp-base-rto").value = state.baseline.baseRto * 100;

  document.getElementById("inp-stratA-fee").value = state.strategyA.platformFee;
  document.getElementById("inp-stratA-ed").value = state.strategyA.ed;
  document.getElementById("inp-stratA-exemption").value = state.strategyA.exemptionRate * 100;

  document.getElementById("inp-stratB-capex").value = state.strategyB.capexCr;
  document.getElementById("inp-stratB-rto").value = state.strategyB.rtoTarget * 100;
  document.getElementById("inp-stratB-saving").value = state.strategyB.fwdSaving;
  document.getElementById("inp-stratB-ramp").value = state.strategyB.rampMonths;

  document.getElementById("inp-stratC-takerate").value = state.strategyC.adTakeRate * 100;
  document.getElementById("inp-stratC-cannibalization").value = state.strategyC.cannibalization * 100;
  document.getElementById("inp-stratC-lag").value = state.strategyC.lagMonths;
  document.getElementById("inp-stratC-budget").value = state.strategyC.budgetCr;

  document.getElementById("inp-stratD-overlap").value = state.strategyD.overlapDiscount * 100;
  document.getElementById("inp-stratD-budget").value = state.strategyD.budgetCr;

  document.getElementById("inp-pilot-budget").value = state.pilot.budgetCr;
  document.getElementById("inp-pilot-orders").value = state.pilot.ordersM;
  document.getElementById("inp-pilot-rto").value = state.pilot.rtoTarget * 100;
}

function resetDefaults() {
  setScenario("base");
  selectStrategy("baseline");
}

function switchView(viewId) {
  const views = ["tab-charts", "tab-comparison", "tab-monthly", "tab-sensitivity", "tab-recommendation"];
  const btns = ["tab-btn-charts", "tab-btn-comparison", "tab-btn-monthly", "tab-btn-sensitivity", "tab-btn-recommendation"];

  views.forEach((v, idx) => {
    const pane = document.getElementById(v);
    const btn = document.getElementById(btns[idx]);
    if (pane) pane.classList.remove("active");
    if (btn) btn.classList.remove("active");
  });

  const activePane = document.getElementById(viewId);
  if (activePane) activePane.classList.add("active");

  const btnMap = {
    "tab-charts": "tab-btn-charts",
    "tab-comparison": "tab-btn-comparison",
    "tab-monthly": "tab-btn-monthly",
    "tab-sensitivity": "tab-btn-sensitivity",
    "tab-recommendation": "tab-btn-recommendation"
  };
  const activeBtn = document.getElementById(btnMap[viewId]);
  if (activeBtn) activeBtn.classList.add("active");

  // Resize charts cleanly when charts tab becomes active
  if (viewId === "tab-charts") {
    if (chartMonthlyTrajectory) chartMonthlyTrajectory.resize();
    if (chartStrategyBars) chartStrategyBars.resize();
  }
}

function getStrategyName(key) {
  const names = {
    baseline: "Status Quo Baseline",
    strategyA: "Lever 1 (Platform Fee)",
    strategyB: "Lever 2 (Valmo Logistics)",
    strategyC: "Lever 3 (Seller Ads)",
    strategyD: "Lever 4 (Combined Push)",
    pilot: "⭐ Pilot BharatPulse"
  };
  return names[key] || key;
}

function exportScenarioCSV() {
  const schedBase = calculateBaselineMonthly();
  const schedA = calculateStrategyAMonthly(schedBase);
  const schedB = calculateStrategyBMonthly(schedBase);
  const schedC = calculateStrategyCMonthly(schedBase);
  const schedD = calculateStrategyDMonthly(schedBase, schedB, schedC);
  const schedPilot = calculatePilotMonthly(schedBase);

  const schedules = {
    "Baseline": schedBase,
    "Lever 1 Platform Fee": schedA,
    "Lever 2 Valmo Logistics": schedB,
    "Lever 3 Seller Ads": schedC,
    "Lever 4 Combined Push": schedD,
    "Pilot BharatPulse": schedPilot
  };

  let csv = "Strategic Lever,Month,Orders (M),Net Revenue (Cr),CM1 (Cr),CM2 (Cr),Net CM3 (Cr),Delta vs Base (Cr)\n";

  for (const [name, sched] of Object.entries(schedules)) {
    sched.forEach(m => {
      csv += `"${name}",${m.month},${(m.orders / 1000000).toFixed(1)},${m.netRevCr.toFixed(2)},${m.cm1Cr.toFixed(2)},${m.cm2Cr.toFixed(2)},${m.netContribCr.toFixed(2)},${m.incrementalContribCr.toFixed(2)}\n`;
    });
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Meesho_Commercial_Simulation_${state.macroScenario}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Initialise on load
document.addEventListener("DOMContentLoaded", () => {
  updateModel();
});
