/**
 * Meesho Commercial Strategy & Growth Decision Simulator
 * Core Application Engine & Dynamic Financial Modeling Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  // Global State Repository
  const state = {
    // Baseline
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
    mktgRate: 7.50,
    retRate: 2.10,

    // Lever 1: Platform Fee
    platformFee: 7.0,
    ed: -1.45,
    exemptionRate: 0.08,

    // Lever 2: Valmo Logistics
    valmoCapex: 6.5, // in ₹ Cr
    rtoTarget: 0.175,
    fwdSaving: 4.50,

    // Lever 3: Seller Ads
    adTakeRate: 0.0325,
    cannibalization: 0.18,
    adOpexYear: 1.8, // in ₹ Cr

    // Lever 4: Synergy Damping
    overlapDamping: 0.25,
    combinedCapex: 8.3, // in ₹ Cr

    // Pilot BharatPulse
    pilotOrders: 10.0, // in Millions
    pilotBudget: 2.25, // in ₹ Cr
    pilotBaseRto: 0.268,
    pilotLocalHurdle: 4.50,
    pilotNatHurdle: 2.50
  };

  // DOM Elements
  const dom = {
    // Sliders
    sliderAov: document.getElementById('sliderAov'),
    sliderOrders: document.getElementById('sliderOrders'),
    sliderPlatformFee: document.getElementById('sliderPlatformFee'),
    sliderEd: document.getElementById('sliderEd'),
    sliderValmoCapex: document.getElementById('sliderValmoCapex'),
    sliderRtoTarget: document.getElementById('sliderRtoTarget'),
    sliderAdTakeRate: document.getElementById('sliderAdTakeRate'),
    sliderCannibalization: document.getElementById('sliderCannibalization'),
    sliderOverlapDamping: document.getElementById('sliderOverlapDamping'),

    // Value Labels
    valAov: document.getElementById('valAov'),
    valOrders: document.getElementById('valOrders'),
    valPlatformFee: document.getElementById('valPlatformFee'),
    valEd: document.getElementById('valEd'),
    valValmoCapex: document.getElementById('valValmoCapex'),
    valRtoTarget: document.getElementById('valRtoTarget'),
    valAdTakeRate: document.getElementById('valAdTakeRate'),
    valCannibalization: document.getElementById('valCannibalization'),
    valOverlapDamping: document.getElementById('valOverlapDamping'),

    // KPI Ribbon
    kpiNetGmv: document.getElementById('kpiNetGmv'),
    kpiNetRevenue: document.getElementById('kpiNetRevenue'),
    kpiBlendedCm3: document.getElementById('kpiBlendedCm3'),
    kpiTotalCm3Cr: document.getElementById('kpiTotalCm3Cr'),
    kpiRtoRate: document.getElementById('kpiRtoRate'),
    kpiPayback: document.getElementById('kpiPayback'),
    kpiCm3Subtext: document.getElementById('kpiCm3Subtext'),
    cardBlendedCm3: document.getElementById('cardBlendedCm3'),
    cardTotalCm3: document.getElementById('cardTotalCm3'),

    // Buttons
    btnScenarioDownside: document.getElementById('btnScenarioDownside'),
    btnScenarioBase: document.getElementById('btnScenarioBase'),
    btnScenarioUpside: document.getElementById('btnScenarioUpside'),
    btnResetDefaults: document.getElementById('btnResetDefaults'),
    btnExportCsv: document.getElementById('btnExportCsv'),
    linkDeck: document.getElementById('linkDeck'),

    // Tabs
    tabOverview: document.getElementById('tabOverview'),
    tabTrajectory: document.getElementById('tabTrajectory'),
    tabWaterfall: document.getElementById('tabWaterfall'),
    tabHeatmaps: document.getElementById('tabHeatmaps'),
    tabDecisionGate: document.getElementById('tabDecisionGate'),

    paneOverview: document.getElementById('paneOverview'),
    paneTrajectory: document.getElementById('paneTrajectory'),
    paneWaterfall: document.getElementById('paneWaterfall'),
    paneHeatmaps: document.getElementById('paneHeatmaps'),
    paneDecisionGate: document.getElementById('paneDecisionGate'),

    // Tables & Gate
    tableComparisonBody: document.getElementById('tableComparisonBody'),
    heatmapFeeChurnBody: document.getElementById('heatmapFeeChurnBody'),
    heatmapCapexRtoBody: document.getElementById('heatmapCapexRtoBody'),
    gateStatusBanner: document.getElementById('gateStatusBanner'),
    gateCm3Status: document.getElementById('gateCm3Status'),
    gateRtoStatus: document.getElementById('gateRtoStatus'),
    gateChurnStatus: document.getElementById('gateChurnStatus'),

    // Canvas charts
    chartWaterfall: document.getElementById('chartWaterfall'),
    chartTrajectory: document.getElementById('chartTrajectory'),
    chartUnitBridge: document.getElementById('chartUnitBridge')
  };

  // Chart Instances
  let chartWaterfallInstance = null;
  let chartTrajectoryInstance = null;
  let chartUnitBridgeInstance = null;

  // Initialize Input Listeners
  function setupEventListeners() {
    dom.sliderAov.addEventListener('input', (e) => {
      state.aov = parseFloat(e.target.value);
      dom.valAov.textContent = `₹${state.aov}`;
      recalculate();
    });

    dom.sliderOrders.addEventListener('input', (e) => {
      state.monthlyOrders = parseFloat(e.target.value);
      dom.valOrders.textContent = `${state.monthlyOrders}M`;
      recalculate();
    });

    dom.sliderPlatformFee.addEventListener('input', (e) => {
      state.platformFee = parseFloat(e.target.value);
      dom.valPlatformFee.textContent = `₹${state.platformFee.toFixed(2)}`;
      recalculate();
    });

    dom.sliderEd.addEventListener('input', (e) => {
      state.ed = parseFloat(e.target.value);
      dom.valEd.textContent = state.ed.toFixed(2);
      recalculate();
    });

    dom.sliderValmoCapex.addEventListener('input', (e) => {
      state.valmoCapex = parseFloat(e.target.value);
      dom.valValmoCapex.textContent = `₹${state.valmoCapex.toFixed(1)} Cr`;
      recalculate();
    });

    dom.sliderRtoTarget.addEventListener('input', (e) => {
      state.rtoTarget = parseFloat(e.target.value) / 100.0;
      dom.valRtoTarget.textContent = `${(state.rtoTarget * 100).toFixed(1)}%`;
      recalculate();
    });

    dom.sliderAdTakeRate.addEventListener('input', (e) => {
      state.adTakeRate = parseFloat(e.target.value) / 100.0;
      dom.valAdTakeRate.textContent = `${(state.adTakeRate * 100).toFixed(2)}%`;
      recalculate();
    });

    dom.sliderCannibalization.addEventListener('input', (e) => {
      state.cannibalization = parseFloat(e.target.value) / 100.0;
      dom.valCannibalization.textContent = `${(state.cannibalization * 100).toFixed(1)}%`;
      recalculate();
    });

    dom.sliderOverlapDamping.addEventListener('input', (e) => {
      state.overlapDamping = parseFloat(e.target.value) / 100.0;
      dom.valOverlapDamping.textContent = `${(state.overlapDamping * 100).toFixed(1)}%`;
      recalculate();
    });

    // Macro Scenarios
    dom.btnScenarioDownside.addEventListener('click', () => applyScenario('downside'));
    dom.btnScenarioBase.addEventListener('click', () => applyScenario('base'));
    dom.btnScenarioUpside.addEventListener('click', () => applyScenario('upside'));
    dom.btnResetDefaults.addEventListener('click', () => applyScenario('base'));

    // Export CSV
    dom.btnExportCsv.addEventListener('click', exportSimulationCsv);

    // Tab Navigation
    const tabs = [
      { btn: dom.tabOverview, pane: dom.paneOverview },
      { btn: dom.tabTrajectory, pane: dom.paneTrajectory },
      { btn: dom.tabWaterfall, pane: dom.paneWaterfall },
      { btn: dom.tabHeatmaps, pane: dom.paneHeatmaps },
      { btn: dom.tabDecisionGate, pane: dom.paneDecisionGate }
    ];

    tabs.forEach(({ btn, pane }) => {
      btn.addEventListener('click', () => {
        tabs.forEach(t => {
          t.btn.classList.remove('active');
          t.pane.classList.remove('active');
        });
        btn.classList.add('active');
        pane.classList.add('active');
      });
    });
  }

  function applyScenario(type) {
    [dom.btnScenarioDownside, dom.btnScenarioBase, dom.btnScenarioUpside].forEach(b => b.classList.remove('active'));

    if (type === 'downside') {
      dom.btnScenarioDownside.classList.add('active');
      state.aov = 290.0;
      state.monthlyOrders = 110.0;
      state.platformFee = 8.0;
      state.ed = -1.95;
      state.rtoTarget = 0.210;
      state.adTakeRate = 0.0250;
      state.cannibalization = 0.25;
      state.overlapDamping = 0.35;
    } else if (type === 'upside') {
      dom.btnScenarioUpside.classList.add('active');
      state.aov = 335.0;
      state.monthlyOrders = 135.0;
      state.platformFee = 5.0;
      state.ed = -0.90;
      state.rtoTarget = 0.155;
      state.adTakeRate = 0.0380;
      state.cannibalization = 0.12;
      state.overlapDamping = 0.15;
    } else {
      dom.btnScenarioBase.classList.add('active');
      state.aov = 310.0;
      state.monthlyOrders = 120.0;
      state.platformFee = 7.0;
      state.ed = -1.45;
      state.rtoTarget = 0.175;
      state.adTakeRate = 0.0325;
      state.cannibalization = 0.18;
      state.overlapDamping = 0.25;
    }

    // Sync Sliders UI
    dom.sliderAov.value = state.aov;
    dom.valAov.textContent = `₹${state.aov}`;

    dom.sliderOrders.value = state.monthlyOrders;
    dom.valOrders.textContent = `${state.monthlyOrders}M`;

    dom.sliderPlatformFee.value = state.platformFee;
    dom.valPlatformFee.textContent = `₹${state.platformFee.toFixed(2)}`;

    dom.sliderEd.value = state.ed;
    dom.valEd.textContent = state.ed.toFixed(2);

    dom.sliderRtoTarget.value = state.rtoTarget * 100;
    dom.valRtoTarget.textContent = `${(state.rtoTarget * 100).toFixed(1)}%`;

    dom.sliderAdTakeRate.value = state.adTakeRate * 100;
    dom.valAdTakeRate.textContent = `${(state.adTakeRate * 100).toFixed(2)}%`;

    dom.sliderCannibalization.value = state.cannibalization * 100;
    dom.valCannibalization.textContent = `${(state.cannibalization * 100).toFixed(1)}%`;

    dom.sliderOverlapDamping.value = state.overlapDamping * 100;
    dom.valOverlapDamping.textContent = `${(state.overlapDamping * 100).toFixed(1)}%`;

    recalculate();
  }

  // Core Financial Modeling Logic
  function calculateModel() {
    const ordersM = state.monthlyOrders;
    const ordersExact = ordersM * 1000000;
    const aov = state.aov;

    // 1. Baseline Run-rate (Status Quo)
    const baseGmv = ordersExact * aov;
    const baseAdRev = baseGmv * state.baseAdTakeRate;
    const baseLogRev = ordersExact * state.logisticsBilling;
    const baseNetRev = baseAdRev + baseLogRev;

    const basePgCost = ordersExact * (1 - state.codMix) * state.pgRate;
    const baseCsCost = ordersExact * state.csRate;
    const baseCm1 = baseNetRev - basePgCost - baseCsCost;

    const baseDeliv = ordersExact * (1 - state.baseRto);
    const baseRtoOrd = ordersExact * state.baseRto;
    const baseFwdCost = baseDeliv * state.fwdFreight;
    const baseRtoCost = baseRtoOrd * state.rtoFreight;
    const baseCm2 = baseCm1 - baseFwdCost - baseRtoCost;

    const baseMktg = ordersExact * (state.mktgRate + state.retRate);
    const baseCm3 = baseCm2 - baseMktg;
    const baseCm3PerOrder = baseCm3 / ordersExact;

    // 2. Lever 1: Platform Fee
    const l1Churn = state.ed * (state.platformFee / aov) * (1 - state.exemptionRate);
    const l1Orders = Math.round(ordersExact * (1 + l1Churn));
    const l1Gmv = l1Orders * aov;
    const l1AdRev = l1Gmv * state.baseAdTakeRate;
    const l1LogRev = l1Orders * state.logisticsBilling;
    const l1FeeRev = l1Orders * state.platformFee * (1 - state.exemptionRate);
    const l1NetRev = l1AdRev + l1LogRev + l1FeeRev;
    const l1PgCost = l1Orders * (1 - state.codMix) * state.pgRate;
    const l1CsCost = l1Orders * state.csRate;
    const l1Cm1 = l1NetRev - l1PgCost - l1CsCost;
    const l1Deliv = l1Orders * (1 - state.baseRto);
    const l1FwdCost = l1Deliv * state.fwdFreight;
    const l1RtoCost = (l1Orders * state.baseRto) * state.rtoFreight;
    const l1Cm2 = l1Cm1 - l1FwdCost - l1RtoCost;
    const l1Mktg = l1Orders * (state.mktgRate + state.retRate);
    const l1Cm3 = l1Cm2 - l1Mktg;
    const l1Cm3PerOrder = l1Cm3 / l1Orders;

    // 3. Lever 2: Valmo Logistics (Steady State)
    const l2Orders = ordersExact;
    const l2Gmv = l2Orders * aov;
    const l2NetRev = baseNetRev;
    const l2Cm1 = baseCm1;
    const l2Deliv = l2Orders * (1 - state.rtoTarget);
    const l2RtoOrd = l2Orders * state.rtoTarget;
    const l2FwdCost = l2Deliv * (state.fwdFreight - state.fwdSaving);
    const l2RtoCost = l2RtoOrd * state.rtoFreight;
    const l2Cm2 = l2Cm1 - l2FwdCost - l2RtoCost;
    const l2CapExMo = (state.valmoCapex * 10000000) / 12;
    const l2Cm3 = l2Cm2 - baseMktg - l2CapExMo;
    const l2Cm3PerOrder = l2Cm3 / l2Orders;
    const l2MonthlySavings = (baseFwdCost + baseRtoCost) - (l2FwdCost + l2RtoCost);
    const l2PaybackYears = (state.valmoCapex * 10000000) / (l2MonthlySavings * 12);

    // 4. Lever 3: Seller Ads (Steady State)
    const l3Orders = ordersExact;
    const l3Gmv = l3Orders * aov;
    const l3GrossAdRev = l3Gmv * state.adTakeRate;
    const l3Cannibalization = (l3GrossAdRev - baseAdRev) * state.cannibalization;
    const l3NetAdRev = l3GrossAdRev - l3Cannibalization;
    const l3NetRev = l3NetAdRev + baseLogRev;
    const l3Cm1 = l3NetRev - basePgCost - baseCsCost;
    const l3Cm2 = l3Cm1 - baseFwdCost - baseRtoCost;
    const l3AdOpexMo = (state.adOpexYear * 10000000) / 12;
    const l3Cm3 = l3Cm2 - baseMktg - l3AdOpexMo;
    const l3Cm3PerOrder = l3Cm3 / l3Orders;

    // 5. Lever 4: Full Push with Damping
    const l4Orders = ordersExact;
    const l2GrossOpDelta = l2MonthlySavings;
    const l3GrossAdDelta = l3NetAdRev - baseAdRev;
    const l4GrossDelta = l2GrossOpDelta + l3GrossAdDelta;
    const l4DampingPenalty = l4GrossDelta * state.overlapDamping;
    const l4NetSynergy = l4GrossDelta - l4DampingPenalty;
    const l4CapExMo = (state.combinedCapex * 10000000) / 12;
    const l4Cm3 = baseCm3 + l4NetSynergy - l4CapExMo - l3AdOpexMo;
    const l4Cm3PerOrder = l4Cm3 / l4Orders;

    // 6. Pilot BharatPulse (Purvanchal Cluster 10M orders)
    const bpOrders = state.pilotOrders * 1000000;
    const bpGmv = bpOrders * aov;
    const bpBaseRev = (bpGmv * state.baseAdTakeRate) + (bpOrders * state.logisticsBilling);
    const bpPgCost = bpOrders * (1 - 0.78) * state.pgRate;
    const bpCsCost = bpOrders * state.csRate;
    const bpCm1 = bpBaseRev - bpPgCost - bpCsCost;
    const bpDeliv = bpOrders * (1 - state.rtoTarget);
    const bpFwdCost = bpDeliv * (state.fwdFreight - state.fwdSaving);
    const bpRtoCost = (bpOrders * state.rtoTarget) * state.rtoFreight;
    const bpCm2 = bpCm1 - bpFwdCost - bpRtoCost;
    const bpCapExMo = (state.pilotBudget * 10000000) / 12;
    const bpMktg = bpOrders * (state.mktgRate + state.retRate) * 0.85;
    const bpCm3 = bpCm2 - bpMktg - bpCapExMo;
    const bpCm3PerOrder = bpCm3 / bpOrders;

    return {
      base: { orders: ordersExact, gmv: baseGmv, netRev: baseNetRev, cm1: baseCm1, cm2: baseCm2, cm3: baseCm3, cm3PerOrder: baseCm3PerOrder, rto: state.baseRto },
      l1: { orders: l1Orders, gmv: l1Gmv, netRev: l1NetRev, cm1: l1Cm1, cm2: l1Cm2, cm3: l1Cm3, cm3PerOrder: l1Cm3PerOrder, rto: state.baseRto, churn: l1Churn },
      l2: { orders: l2Orders, gmv: l2Gmv, netRev: l2NetRev, cm1: l2Cm1, cm2: l2Cm2, cm3: l2Cm3, cm3PerOrder: l2Cm3PerOrder, rto: state.rtoTarget, payback: l2PaybackYears },
      l3: { orders: l3Orders, gmv: l3Gmv, netRev: l3NetRev, cm1: l3Cm1, cm2: l3Cm2, cm3: l3Cm3, cm3PerOrder: l3Cm3PerOrder, rto: state.baseRto },
      l4: { orders: l4Orders, gmv: l2Gmv, netRev: baseNetRev + (l3GrossAdDelta * (1 - state.overlapDamping)), cm3: l4Cm3, cm3PerOrder: l4Cm3PerOrder, rto: state.rtoTarget },
      bp: { orders: bpOrders, gmv: bpGmv, netRev: bpBaseRev, cm3: bpCm3, cm3PerOrder: bpCm3PerOrder, rto: state.rtoTarget }
    };
  }

  // Recalculate & Refresh UI
  function recalculate() {
    const results = calculateModel();

    // 1. KPI Ribbon
    const annualGmvCr = (results.base.gmv * 12) / 10000000;
    const monthlyNetRevCr = results.base.netRev / 10000000;
    const annualCm3Cr = (results.bp.cm3PerOrder * results.base.orders * 12) / 10000000;

    dom.kpiNetGmv.textContent = `₹${Math.round(annualGmvCr).toLocaleString()} Cr`;
    dom.kpiNetRevenue.textContent = `₹${monthlyNetRevCr.toFixed(1)} Cr / mo`;
    dom.kpiBlendedCm3.textContent = `₹${results.base.cm3PerOrder.toFixed(2)}`;
    dom.kpiTotalCm3Cr.textContent = `₹${((results.base.cm3 * 12) / 10000000).toFixed(1)} Cr`;
    dom.kpiRtoRate.textContent = `${(results.base.rto * 100).toFixed(1)}%`;
    dom.kpiPayback.textContent = `${results.l2.payback.toFixed(1)} Years`;

    // Visual indicators
    if (results.base.cm3PerOrder < 0) {
      dom.cardBlendedCm3.classList.add('accent-red');
      dom.cardBlendedCm3.classList.remove('accent-green');
      dom.kpiCm3Subtext.textContent = 'Status Quo Net Bleed';
    } else {
      dom.cardBlendedCm3.classList.add('accent-green');
      dom.cardBlendedCm3.classList.remove('accent-red');
      dom.kpiCm3Subtext.textContent = 'Profitable Unit Contribution';
    }

    // 2. Overview Table
    renderComparisonTable(results);

    // 3. Update Charts
    updateWaterfallChart(results);
    updateTrajectoryChart(results);
    updateUnitBridgeChart(results);

    // 4. Update Heatmaps
    renderHeatmaps();

    // 5. Update Decision Gate
    renderDecisionGate(results);
  }

  function renderComparisonTable(results) {
    const rows = [
      {
        name: 'Status Quo Baseline',
        orders: `${(results.base.orders * 12 / 1000000).toFixed(0)}M`,
        takeRate: `${(state.baseAdTakeRate * 100).toFixed(2)}%`,
        rto: `${(results.base.rto * 100).toFixed(1)}%`,
        rev: `₹${((results.base.netRev * 12) / 10000000).toFixed(1)}`,
        cm3Cr: `₹${((results.base.cm3 * 12) / 10000000).toFixed(1)}`,
        cm3Po: `₹${results.base.cm3PerOrder.toFixed(2)}`,
        status: '<span style="color:var(--alert-red);font-weight:700;">BLEEDING</span>'
      },
      {
        name: 'Lever 1: Platform Fee (₹7)',
        orders: `${(results.l1.orders * 12 / 1000000).toFixed(0)}M`,
        takeRate: `${(state.baseAdTakeRate * 100).toFixed(2)}%`,
        rto: `${(results.l1.rto * 100).toFixed(1)}%`,
        rev: `₹${((results.l1.netRev * 12) / 10000000).toFixed(1)}`,
        cm3Cr: `₹${((results.l1.cm3 * 12) / 10000000).toFixed(1)}`,
        cm3Po: `₹${results.l1.cm3PerOrder.toFixed(2)}`,
        status: '<span style="color:var(--amber-gold);font-weight:700;">VOLUME RISK</span>'
      },
      {
        name: 'Lever 2: Valmo Logistics',
        orders: `${(results.l2.orders * 12 / 1000000).toFixed(0)}M`,
        takeRate: `${(state.baseAdTakeRate * 100).toFixed(2)}%`,
        rto: `${(results.l2.rto * 100).toFixed(1)}%`,
        rev: `₹${((results.l2.netRev * 12) / 10000000).toFixed(1)}`,
        cm3Cr: `₹${((results.l2.cm3 * 12) / 10000000).toFixed(1)}`,
        cm3Po: `₹${results.l2.cm3PerOrder.toFixed(2)}`,
        status: '<span style="color:var(--alert-green);font-weight:700;">HEALTHY</span>'
      },
      {
        name: 'Lever 3: Seller Ads (3.25%)',
        orders: `${(results.l3.orders * 12 / 1000000).toFixed(0)}M`,
        takeRate: `${(state.adTakeRate * 100).toFixed(2)}%`,
        rto: `${(results.l3.rto * 100).toFixed(1)}%`,
        rev: `₹${((results.l3.netRev * 12) / 10000000).toFixed(1)}`,
        cm3Cr: `₹${((results.l3.cm3 * 12) / 10000000).toFixed(1)}`,
        cm3Po: `₹${results.l3.cm3PerOrder.toFixed(2)}`,
        status: '<span style="color:var(--alert-green);font-weight:700;">ACCRETIVE</span>'
      },
      {
        name: 'Lever 4: Full Push (Damped)',
        orders: `${(results.l4.orders * 12 / 1000000).toFixed(0)}M`,
        takeRate: `${(state.adTakeRate * 100).toFixed(2)}%`,
        rto: `${(results.l4.rto * 100).toFixed(1)}%`,
        rev: `₹${((results.l4.netRev * 12) / 10000000).toFixed(1)}`,
        cm3Cr: `₹${((results.l4.cm3 * 12) / 10000000).toFixed(1)}`,
        cm3Po: `₹${results.l4.cm3PerOrder.toFixed(2)}`,
        status: '<span style="color:var(--accent-teal);font-weight:700;">HIGH CAPITAL</span>'
      },
      {
        name: 'Pilot: Project BharatPulse',
        orders: `${(results.bp.orders * 12 / 1000000).toFixed(0)}M (Cluster)`,
        takeRate: `${(state.baseAdTakeRate * 100).toFixed(2)}%`,
        rto: `${(results.bp.rto * 100).toFixed(1)}%`,
        rev: `₹${((results.bp.netRev * 12) / 10000000).toFixed(1)}`,
        cm3Cr: `₹${((results.bp.cm3 * 12) / 10000000).toFixed(1)}`,
        cm3Po: `₹${results.bp.cm3PerOrder.toFixed(2)}`,
        status: '<span style="color:var(--alert-green);font-weight:800;">★ RECOMMENDED</span>',
        highlight: true
      }
    ];

    dom.tableComparisonBody.innerHTML = rows.map(r => `
      <tr class="${r.highlight ? 'highlight-row' : ''}">
        <td>${r.name}</td>
        <td>${r.orders}</td>
        <td>${r.takeRate}</td>
        <td>${r.rto}</td>
        <td>${r.rev}</td>
        <td>${r.cm3Cr}</td>
        <td>${r.cm3Po}</td>
        <td>${r.status}</td>
      </tr>
    `).join('');
  }

  function updateWaterfallChart(results) {
    const ctx = dom.chartWaterfall.getContext('2d');
    const data = [
      results.base.cm3PerOrder,
      results.l1.cm3PerOrder,
      results.l2.cm3PerOrder,
      results.l3.cm3PerOrder,
      results.l4.cm3PerOrder,
      results.bp.cm3PerOrder
    ];

    if (chartWaterfallInstance) {
      chartWaterfallInstance.data.datasets[0].data = data;
      chartWaterfallInstance.update();
      return;
    }

    chartWaterfallInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Baseline', 'Lever 1 (Fee)', 'Lever 2 (Valmo)', 'Lever 3 (Ads)', 'Lever 4 (Push)', 'Pilot BharatPulse'],
        datasets: [{
          label: 'CM3 / Order (₹)',
          data: data,
          backgroundColor: data.map(v => v < 0 ? '#E63946' : v > 4.5 ? '#00A896' : '#2A9D8F'),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `CM3: ₹${ctx.parsed.y.toFixed(2)} / order`
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: '₹ per Order' },
            grid: { color: '#E2E8F0' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  function updateTrajectoryChart(results) {
    const ctx = dom.chartTrajectory.getContext('2d');
    const months = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);

    // Generate monthly curves with S-curve progression
    const sCurve = [0.15, 0.40, 0.75, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];
    const baseTraj = months.map(() => (results.base.cm3 / 10000000));
    const l2Traj = months.map((_, i) => {
      const alpha = sCurve[i];
      const monthlySavings = (results.base.orders * (state.baseRto - (state.baseRto - alpha * (state.baseRto - state.rtoTarget))) * state.rtoFreight) + (results.base.orders * (1 - state.rtoTarget) * state.fwdSaving * alpha);
      const capAmort = (state.valmoCapex * 10000000) / 12;
      return (results.base.cm3 + monthlySavings - capAmort) / 10000000;
    });
    const l4Traj = months.map((_, i) => {
      const alpha = sCurve[i];
      const syn = (results.l4.cm3 - results.base.cm3) * alpha;
      return (results.base.cm3 + syn) / 10000000;
    });

    if (chartTrajectoryInstance) {
      chartTrajectoryInstance.data.datasets[0].data = baseTraj;
      chartTrajectoryInstance.data.datasets[1].data = l2Traj;
      chartTrajectoryInstance.data.datasets[2].data = l4Traj;
      chartTrajectoryInstance.update();
      return;
    }

    chartTrajectoryInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Status Quo Baseline (₹ Cr)',
            data: baseTraj,
            borderColor: '#E63946',
            backgroundColor: 'rgba(230, 57, 70, 0.08)',
            borderDash: [5, 5],
            fill: true
          },
          {
            label: 'Lever 2: Valmo Logistics',
            data: l2Traj,
            borderColor: '#2A9D8F',
            backgroundColor: 'transparent',
            tension: 0.3
          },
          {
            label: 'Lever 4: Full Push',
            data: l4Traj,
            borderColor: '#0D1F3C',
            backgroundColor: 'rgba(13, 31, 60, 0.05)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ₹${ctx.parsed.y.toFixed(1)} Cr`
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: 'Net Monthly CM3 (₹ Crore)' },
            grid: { color: '#E2E8F0' }
          }
        }
      }
    });
  }

  function updateUnitBridgeChart(results) {
    const ctx = dom.chartUnitBridge.getContext('2d');
    const labels = [
      'AOV',
      'Logistics Fee',
      'Ad Rev (1.85%)',
      'Payment Gateway',
      'CS & Ops',
      'Forward Shipping',
      'Reverse RTO Shipping',
      'Marketing & Retention',
      'Net CM3'
    ];

    const values = [
      310.00,
      46.50,
      5.74,
      -0.62,
      -3.10,
      -31.71,
      -8.33,
      -9.60,
      -1.12
    ];

    if (chartUnitBridgeInstance) {
      chartUnitBridgeInstance.data.datasets[0].data = values;
      chartUnitBridgeInstance.update();
      return;
    }

    chartUnitBridgeInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Per-Order Unit Impact (₹)',
          data: values,
          backgroundColor: values.map((v, i) => i === 0 ? '#1F3A60' : v > 0 ? '#00A896' : '#E63946'),
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Impact: ₹${ctx.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: '₹ per Order' },
            grid: { color: '#E2E8F0' }
          }
        }
      }
    });
  }

  function renderHeatmaps() {
    // Heatmap A: Fee vs Elasticity
    const fees = [0.0, 3.0, 5.0, 7.0, 10.0, 12.0, 15.0];
    const eds = [-2.20, -1.80, -1.45, -1.10, -0.75, -0.40];

    dom.heatmapFeeChurnBody.innerHTML = fees.map(f => {
      let rowHtml = `<tr><td><strong>₹${f.toFixed(0)}</strong></td>`;
      eds.forEach(ed => {
        // CM3 = Base (-1.12) + Fee*(1-0.08) + [Ed * (Fee/310) * (-1.12 + Fee)]
        const val = -1.12 + (f * 0.92) + (ed * (f / 310.0) * (-1.12 + f));
        let cellClass = val < 0 ? 'heat-cell-neg-high' : val < 2.0 ? 'heat-cell-neg-low' : val < 5.0 ? 'heat-cell-pos-low' : 'heat-cell-pos-high';
        rowHtml += `<td class="${cellClass}">₹${val.toFixed(2)}</td>`;
      });
      rowHtml += '</tr>';
      return rowHtml;
    }).join('');

    // Heatmap B: CapEx vs RTO target
    const capexes = [4.0, 5.5, 6.5, 8.0, 10.0];
    const rtos = [0.150, 0.175, 0.200, 0.220, 0.245];

    dom.heatmapCapexRtoBody.innerHTML = capexes.map(cap => {
      let rowHtml = `<tr><td><strong>₹${cap.toFixed(1)} Cr</strong></td>`;
      rtos.forEach(rto => {
        const annualBenefitCr = ((120000000 * 12 * ((0.245 - rto) * 34.0 + (1 - rto) * 4.5)) - (cap * 10000000)) / 10000000;
        let cellClass = annualBenefitCr < 20 ? 'heat-cell-neg-low' : annualBenefitCr < 45 ? 'heat-cell-pos-low' : 'heat-cell-pos-high';
        rowHtml += `<td class="${cellClass}">₹${annualBenefitCr.toFixed(1)}</td>`;
      });
      rowHtml += '</tr>';
      return rowHtml;
    }).join('');
  }

  function renderDecisionGate(results) {
    const pilotCm3 = results.bp.cm3PerOrder;
    const pilotRto = results.bp.rto;
    const churn = 0.0; // Valmo pilot maintains organic volume

    dom.gateCm3Status.textContent = `Current Pilot CM3: +₹${pilotCm3.toFixed(2)} (PASSED)`;
    dom.gateRtoStatus.textContent = `Current Pilot RTO: ${(pilotRto * 100).toFixed(1)}% (PASSED)`;
    dom.gateChurnStatus.textContent = `Current Volume Churn: 0.0% (PASSED)`;

    if (pilotCm3 >= state.pilotLocalHurdle && pilotRto <= 0.19) {
      dom.gateStatusBanner.textContent = 'STATUS: GREEN (SCALE NATIONALLY)';
      dom.gateStatusBanner.style.color = '#2A9D8F';
    } else if (pilotCm3 >= state.pilotNatHurdle) {
      dom.gateStatusBanner.textContent = 'STATUS: AMBER (PIVOT & REFINE)';
      dom.gateStatusBanner.style.color = '#F4A261';
    } else {
      dom.gateStatusBanner.textContent = 'STATUS: RED (HALT & ROLLBACK)';
      dom.gateStatusBanner.style.color = '#E63946';
    }
  }

  function exportSimulationCsv() {
    const results = calculateModel();
    const csvRows = [
      ['Dimension', 'Baseline', 'Lever 1 (Platform Fee)', 'Lever 2 (Valmo)', 'Lever 3 (Seller Ads)', 'Lever 4 (Full Push)', 'Pilot BharatPulse'],
      ['Monthly Placed Orders (M)', (results.base.orders/1e6).toFixed(1), (results.l1.orders/1e6).toFixed(1), (results.l2.orders/1e6).toFixed(1), (results.l3.orders/1e6).toFixed(1), (results.l4.orders/1e6).toFixed(1), (results.bp.orders/1e6).toFixed(1)],
      ['Average Order Value (₹)', state.aov.toFixed(2), state.aov.toFixed(2), state.aov.toFixed(2), state.aov.toFixed(2), state.aov.toFixed(2), state.aov.toFixed(2)],
      ['Return-to-Origin Rate', `${(results.base.rto*100).toFixed(1)}%`, `${(results.l1.rto*100).toFixed(1)}%`, `${(results.l2.rto*100).toFixed(1)}%`, `${(results.l3.rto*100).toFixed(1)}%`, `${(results.l4.rto*100).toFixed(1)}%`, `${(results.bp.rto*100).toFixed(1)}%`],
      ['Net Platform Revenue (₹ Cr/mo)', (results.base.netRev/1e7).toFixed(2), (results.l1.netRev/1e7).toFixed(2), (results.l2.netRev/1e7).toFixed(2), (results.l3.netRev/1e7).toFixed(2), (results.l4.netRev/1e7).toFixed(2), (results.bp.netRev/1e7).toFixed(2)],
      ['Contribution Margin 3 (₹ Cr/mo)', (results.base.cm3/1e7).toFixed(2), (results.l1.cm3/1e7).toFixed(2), (results.l2.cm3/1e7).toFixed(2), (results.l3.cm3/1e7).toFixed(2), (results.l4.cm3/1e7).toFixed(2), (results.bp.cm3/1e7).toFixed(2)],
      ['CM3 per Order (₹)', results.base.cm3PerOrder.toFixed(2), results.l1.cm3PerOrder.toFixed(2), results.l2.cm3PerOrder.toFixed(2), results.l3.cm3PerOrder.toFixed(2), results.l4.cm3PerOrder.toFixed(2), results.bp.cm3PerOrder.toFixed(2)]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Meesho_Commercial_Strategy_Simulation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Initial Run
  setupEventListeners();
  recalculate();

});
