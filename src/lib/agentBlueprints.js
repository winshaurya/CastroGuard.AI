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
    prompt: `You are a fast geospatial extraction agent.
Return strict JSON only.
Goal: summarize the land parcel, boundary fit, adjacent roads, and immediate landform context.
Use short field values, no markdown, no prose outside JSON.
Include only parcel facts, map fit notes, and access notes.`,
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
    prompt: `You are a climate hazard extractor.
Return strict JSON only.
Summarize rainfall intensity, flood recurrence, storm analogues, and non-stationarity.
Keep every field short, concrete, and model-ready.`,
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
    prompt: `You are an exposure accumulation agent.
Return strict JSON only.
Focus on density, occupancy, critical dependencies, and stacked exposure.
Use concise values that can feed dashboard cards directly.`,
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
    prompt: `You are a socioeconomic loss and value sizing agent.
Return strict JSON only.
Estimate TIV pressure, replacement cost, people impact, and portfolio load.
Do not add narrative outside the JSON object.`,
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
    prompt: `You are a semantic similarity engine.
Return strict JSON only.
Match the parcel profile to historical events, claim analogues, and vector memory hits.
Give compact evidence fields that can be rendered in the dashboard.`,
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
    prompt: `You are a stochastic loss modeler.
Return strict JSON only.
Build concise exceedance, AAL, and PML outputs for the insurer dashboard.
Avoid narrative text outside the object.`,
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
    prompt: `You are a climate scenario planner.
Return strict JSON only.
Summarize climate shift, pricing sensitivity, and loading notes.
Keep outputs short and dashboard ready.`,
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
    prompt: `You are the final underwriting synthesizer.
Return strict JSON only.
Merge all evidence into a verdict, reasoning, mitigation, and parametric trigger.
Use a direct insurer tone, no markdown, no extra text.`,
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
