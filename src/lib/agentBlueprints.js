const UNDERWRITING_APPROVAL_CHECKLIST = [
  'location and catastrophe exposure',
  'construction type, year built, roof condition, and maintenance',
  'occupancy, use class, and any hazardous operations',
  'protection features such as fire suppression, security, drainage, and backup power',
  'claims history, loss runs, open claims, cancellations, and non-renewals',
  'financial strength, premium payment reliability, and continuity risk',
  'code compliance, permits, inspections, and engineering findings',
  'accumulation risk, neighboring hazards, access, and egress',
  'mitigation actions, residual risk, limits, deductibles, and wording',
];

const PROMPT_HEADER = `You are a specialist insurance underwriting agent.
Before any approval decision, always assess:
${UNDERWRITING_APPROVAL_CHECKLIST.map(item => `- ${item}`).join('\n')}

Rules:
- Return strict JSON only.
- Keep every field short, factual, and dashboard-ready.
- If data is missing or unverified, use "unknown" or null.
- Do not invent facts, do not add markdown, and do not add extra prose outside the JSON object.`;

export const GROQ_PROVIDER_BLUEPRINTS = [
  {
    id: 'groq-1',
    vendor: 'groq',
    label: 'Groq Atlas Node',
    envKey: 'VITE_GROQ_API_KEY_1',
    model: 'llama-3.1-8b-instant',
    endpointBudget: 120,
    status: 'Locking parcel geometry, road edges, and land adjacency.',
    sourceGroups: ['OpenStreetMap tiles', 'Overpass geometry', 'Parcel centroid scan', 'Ingress road network'],
    jsonSchema: [
      'parcelSummary',
      'polygonFit',
      'roadAccessScore',
      'edgeConfidence',
      'mapAttribution',
    ],
    prompt: `${PROMPT_HEADER}

Role:
Fast geospatial extraction agent for property underwriting.

Focus:
Summarize the land parcel, boundary fit, adjacent roads, access constraints, and immediate landform context.

Output contract:
Return only parcel facts, map fit notes, and access notes using the keys parcelSummary, polygonFit, roadAccessScore, edgeConfidence, and mapAttribution.

Quality bar:
Be precise about location evidence, do not overstate certainty, and flag any boundary or access ambiguity.`,
  },
  {
    id: 'groq-2',
    vendor: 'groq',
    label: 'Groq Weather Node',
    envKey: 'VITE_GROQ_API_KEY_2',
    model: 'llama-3.1-8b-instant',
    endpointBudget: 140,
    status: 'Pulling rainfall history, storm tracks, and flood frequency.',
    sourceGroups: ['Climate grids', 'Rainfall extremes', 'Flood catalogs', 'River stage snapshots'],
    jsonSchema: [
      'weatherSummary',
      'rainfallExtremes',
      'floodTrend',
      'stormAnalogues',
      'nonStationarity',
    ],
    prompt: `${PROMPT_HEADER}

Role:
Climate hazard extractor for underwriting review.

Focus:
Summarize rainfall intensity, flood recurrence, storm analogues, drainage stress, and climate non-stationarity.

Output contract:
Return only weatherSummary, rainfallExtremes, floodTrend, stormAnalogues, and nonStationarity.

Quality bar:
Prefer measurable signals, mention return-period style evidence when available, and separate observed facts from inferred trend.`,
  },
  {
    id: 'groq-3',
    vendor: 'groq',
    label: 'Groq Exposure Node',
    envKey: 'VITE_GROQ_API_KEY_3',
    model: 'llama-3.1-8b-instant',
    endpointBudget: 110,
    status: 'Mapping built environment density and exposure amplification.',
    sourceGroups: ['Building footprints', 'Land use layers', 'Population density', 'Critical infrastructure'],
    jsonSchema: [
      'exposureSummary',
      'buildingDensity',
      'occupancyNotes',
      'criticalDependencies',
      'stackedExposure',
    ],
    prompt: `${PROMPT_HEADER}

Role:
Exposure accumulation agent for property underwriting.

Focus:
Assess density, occupancy, critical dependencies, nearby hazards, and stacked exposure that may increase loss severity.

Output contract:
Return only exposureSummary, buildingDensity, occupancyNotes, criticalDependencies, and stackedExposure.

Quality bar:
Call out concentration risk, shared walls, adjacency to infrastructure, and any exposure amplification that can change the approval decision.`,
  },
  {
    id: 'groq-4',
    vendor: 'groq',
    label: 'Groq Socioeconomic Node',
    envKey: 'VITE_GROQ_API_KEY_4',
    model: 'llama-3.1-8b-instant',
    endpointBudget: 130,
    status: 'Sizing replacement cost, TIV pressure, and human impact.',
    sourceGroups: ['Replacement cost grids', 'TIV inputs', 'Occupancy value bands', 'Local vulnerability data'],
    jsonSchema: [
      'tivBand',
      'replacementCost',
      'humanImpact',
      'portfolioLoad',
      'coverageNotes',
    ],
    prompt: `${PROMPT_HEADER}

Role:
Socioeconomic loss and value sizing agent.

Focus:
Estimate TIV pressure, replacement cost, human impact, business interruption pressure, and portfolio accumulation load.

Output contract:
Return only tivBand, replacementCost, humanImpact, portfolioLoad, and coverageNotes.

Quality bar:
Stay conservative, note valuation uncertainty, and distinguish insured value pressure from actual loss severity.`,
  },
];

export const GEMINI_PROVIDER_BLUEPRINTS = [
  {
    id: 'gemini-1',
    vendor: 'gemini',
    label: 'Gemini Vector Node',
    envKey: 'VITE_GEMINI_API_KEY_1',
    model: 'gemini-2.5-flash',
    endpointBudget: 125,
    status: 'Finding historical analogs and vector similarity matches.',
    sourceGroups: ['Claims analogues', 'Historic loss events', 'Vector search memories', 'Embedding matches'],
    jsonSchema: [
      'analogEvents',
      'similarityBands',
      'vectorMatchReason',
      'claimLeakageRisk',
      'confidenceScore',
    ],
    prompt: `${PROMPT_HEADER}

Role:
Semantic similarity engine for claims and catastrophe analogues.

Focus:
Match the parcel profile to historical events, loss analogues, and vector memory hits that matter for approval confidence.

Output contract:
Return only analogEvents, similarityBands, vectorMatchReason, claimLeakageRisk, and confidenceScore.

Quality bar:
Show why the match matters, separate strong and weak analogues, and avoid vague similarity claims.`,
  },
  {
    id: 'gemini-2',
    vendor: 'gemini',
    label: 'Gemini Loss Node',
    envKey: 'VITE_GEMINI_API_KEY_2',
    model: 'gemini-2.5-flash-lite',
    endpointBudget: 150,
    status: 'Synthesizing exceedance curves and loss probability bands.',
    sourceGroups: ['PML curve inputs', 'AAL bands', 'Return period logic', 'Loss distribution shapes'],
    jsonSchema: [
      'aal',
      'pml100',
      'pml250',
      'expectedLossRatio',
      'exceedanceCurve',
    ],
    prompt: `${PROMPT_HEADER}

Role:
Stochastic loss modeler for property underwriting.

Focus:
Build exceedance, AAL, and PML outputs that support an approval, referral, or decline decision.

Output contract:
Return only aal, pml100, pml250, expectedLossRatio, and exceedanceCurve.

Quality bar:
Keep the curve internally consistent, note tail behavior clearly, and avoid pretending precision where the inputs are thin.`,
  },
  {
    id: 'gemini-3',
    vendor: 'gemini',
    label: 'Gemini Scenario Node',
    envKey: 'VITE_GEMINI_API_KEY_3',
    model: 'gemini-2.0-flash',
    endpointBudget: 140,
    status: 'Running climate scenario deltas and pricing sensitivity.',
    sourceGroups: ['Scenario deltas', 'Pricing stress tests', 'Hazard shifts', '+2C climate deltas'],
    jsonSchema: [
      'climateNonStationarity',
      'premiumRecommendation',
      'scenarioSensitivity',
      'riskShift',
      'loadingNotes',
    ],
    prompt: `${PROMPT_HEADER}

Role:
Climate scenario planner and pricing sensitivity analyst.

Focus:
Summarize climate shift, pricing sensitivity, loading logic, and how the scenario changes underwriting appetite.

Output contract:
Return only climateNonStationarity, premiumRecommendation, scenarioSensitivity, riskShift, and loadingNotes.

Quality bar:
Be specific about direction of change, identify which scenario assumption drives the price movement, and flag if the risk is outside appetite.`,
  },
  {
    id: 'gemini-4',
    vendor: 'gemini',
    label: 'Gemini Verdict Node',
    envKey: 'VITE_GEMINI_API_KEY_4',
    model: 'gemini-2.0-flash-lite',
    endpointBudget: 160,
    status: 'Normalizing all evidence into the insurer verdict.',
    sourceGroups: ['Decision rules', 'Mitigation requirements', 'Policy wording', 'Final underwriting view'],
    jsonSchema: [
      'verdict',
      'reasoning',
      'mitigation',
      'parametricTrigger',
      'insurerBrief',
    ],
    prompt: `${PROMPT_HEADER}

Role:
Final underwriting synthesizer and referral gate.

Focus:
Merge all evidence into a verdict, reasoning, mitigation, and parametric trigger. Use the underwriting checklist to decide whether the risk is acceptable, referable, or decline-worthy.

Output contract:
Return only verdict, reasoning, mitigation, parametricTrigger, and insurerBrief.

Quality bar:
Be decisive, conservative, and explicit about any missing approval gate. If a key underwriting factor is not verified, say so directly.`,
  },
];

export const PROCESS_STAGES = [
  {
    id: 'stage-1',
    title: 'Boundary lock',
    detail: 'Normalize the polygon, validate parcel edges, and anchor the map view.',
  },
  {
    id: 'stage-2',
    title: 'OpenStreetMap cache',
    detail: 'Load active viewport tiles and keep them cached for repeat viewing.',
  },
  {
    id: 'stage-3',
    title: 'Hazard sweep',
    detail: 'Check rainfall, flood routing, elevation, and climate non-stationarity.',
  },
  {
    id: 'stage-4',
    title: 'Exposure mesh',
    detail: 'Map building density, access, occupancy, and nearby critical assets.',
  },
  {
    id: 'stage-5',
    title: 'Portfolio load',
    detail: 'Estimate TIV pressure, human impact, and correlated accumulation.',
  },
  {
    id: 'stage-6',
    title: 'Vector matching',
    detail: 'Compare the parcel against historical analogs and semantic matches.',
  },
  {
    id: 'stage-7',
    title: 'Loss synthesis',
    detail: 'Build exceedance curves, PML bands, and pricing signals.',
  },
  {
    id: 'stage-8',
    title: 'Dashboard render',
    detail: 'Merge evidence into the insurer brief and slide into the final page.',
  },
];

export const DASHBOARD_FIELD_BLUEPRINTS = [
  'verdict',
  'riskScore',
  'expectedLossRatio',
  'aal',
  'pml100',
  'pml250',
  'tiv',
  'premiumRecommendation',
  'reasoning',
  'mitigation',
  'parametricTrigger',
  'ndmaIndex',
  'portfolioAccumulation',
  'leakageRisk',
  'climateNonStationarity',
  'analogEvents',
  'exceedanceCurve',
  'hazardFactors',
  'parcelSummary',
  'roadAccessScore',
  'coverageNotes',
  'insurerBrief',
];

/*
export async function runProviderBlueprint(provider, context) {
  const apiKey = import.meta.env[provider.envKey];
  if (!apiKey) {
    return null;
  }

  const requestPayload = provider.vendor === 'groq'
    ? {
        model: provider.model,
        messages: [
          { role: 'system', content: provider.prompt },
          { role: 'user', content: JSON.stringify(context) },
        ],
        temperature: 0.1,
      }
    : {
        contents: [{ parts: [{ text: `${provider.prompt}\n\nContext:\n${JSON.stringify(context)}` }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      };

  const endpoint = provider.vendor === 'groq'
    ? 'https://api.groq.com/openai/v1/chat/completions'
    : `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(provider.vendor === 'groq' ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(requestPayload),
  });

  const json = await response.json();
  return json;
}
*/
