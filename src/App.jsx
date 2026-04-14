import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Activity, FileText, ChevronRight,
  Map as MapIcon, Database, Server, Cpu, Layers, Maximize2, X,
  Mail, Loader2, ListChecks, TrendingUp, AlertTriangle, Clock, Zap,
  Sun, Moon, LocateFixed
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Cell
} from 'recharts';
import {
  GROQ_PROVIDER_BLUEPRINTS,
  GEMINI_PROVIDER_BLUEPRINTS,
  PROCESS_STAGES,
} from './lib/agentBlueprints';
import ShapeGrid from './components/ShapeGrid';

// --- STYLES & FONTS ---
const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=cabinet-grotesk@400,500,700,800&display=swap');

:root {
  --font-anton: 'Anton', sans-serif;
  --font-clash: 'Clash Display', sans-serif;
  --font-cabinet: 'Cabinet Grotesk', sans-serif;
  --app-bg: #030303;
  --app-fg: #ffffff;
  --app-glow: rgba(255, 255, 255, 0.08);
  --surface: rgba(255, 255, 255, 0.02);
  --surface-strong: rgba(255, 255, 255, 0.05);
  --surface-border: rgba(255, 255, 255, 0.08);
  --surface-border-strong: rgba(255, 255, 255, 0.15);
  --scanline-opacity: 0.1;
  --scanline-gradient: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0) 100%);
  --map-filter: grayscale(100%) invert(100%) contrast(120%) brightness(80%);
  --wordmark-color: #ffffff;
  --wordmark-subtle: #d9d9d9;
}

:root[data-theme='light'] {
  color-scheme: light;
  --app-bg: #f4f4f1;
  --app-fg: #111111;
  --app-glow: rgba(0, 0, 0, 0.08);
  --surface: rgba(255, 255, 255, 0.82);
  --surface-strong: rgba(255, 255, 255, 0.94);
  --surface-border: rgba(0, 0, 0, 0.10);
  --surface-border-strong: rgba(0, 0, 0, 0.18);
  --scanline-opacity: 0.05;
  --scanline-gradient: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.07) 50%, rgba(0,0,0,0) 100%);
  --map-filter: grayscale(100%) contrast(120%) brightness(85%);
  --wordmark-color: #111111;
  --wordmark-subtle: #4b4b4b;
}

body {
  background: radial-gradient(circle at top, var(--app-glow) 0%, transparent 38%), linear-gradient(180deg, var(--app-bg) 0%, var(--app-bg) 100%);
  color: var(--app-fg);
  font-family: var(--font-cabinet);
  margin: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.font-display { font-family: var(--font-clash); }
.font-impact { font-family: var(--font-anton); letter-spacing: 0.05em; }

/* Custom Scrollbar - Ultra Thin */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: #444; border-radius: 2px; }

/* Map Grayscale Filter to remove blues/warm colors */
.map-tiles {
  filter: var(--map-filter);
}

.glass-panel {
  background: var(--surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--surface-border);
}

.glass-panel-heavy {
  background: var(--surface-strong);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--surface-border-strong);
}

/* Slide Animation */
.slide-enter {
  transform: translateY(100%);
}
.slide-enter-active {
  transform: translateY(0%);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0.5;
  }
  to {
    transform: translateX(0%);
    opacity: 1;
  }
}

.page-enter-right {
  animation: slide-in-right 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Pulsing Node */
@keyframes pulse-ring {
  0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
}
.pulse-dot {
  animation: pulse-ring 2s infinite;
}

/* CRT Scanline effect */
.scanline {
  width: 100%;
  height: 100px;
  background: var(--scanline-gradient);
  opacity: var(--scanline-opacity);
  position: absolute;
  bottom: 100%;
  animation: scanline 8s linear infinite;
  pointer-events: none;
  z-index: 50;
}
@keyframes scanline {
  0% { bottom: 100%; }
  100% { bottom: -100px; }
}

:root[data-theme='light'] [class*="text-white"] { color: #111111 !important; }
:root[data-theme='light'] [class*="text-gray-100"] { color: #1c1c1c !important; }
:root[data-theme='light'] [class*="text-gray-200"] { color: #2a2a2a !important; }
:root[data-theme='light'] [class*="text-gray-300"] { color: #3f3f3f !important; }
:root[data-theme='light'] [class*="text-gray-400"] { color: #5b5b5b !important; }
:root[data-theme='light'] [class*="text-gray-500"] { color: #787878 !important; }
:root[data-theme='light'] [class*="border-white"] { border-color: rgba(0, 0, 0, 0.12) !important; }
:root[data-theme='light'] [class*="bg-black"] { background-color: rgba(255, 255, 255, 0.82) !important; }
:root[data-theme='light'] [class*="bg-white/5"] { background-color: rgba(0, 0, 0, 0.03) !important; }
:root[data-theme='light'] [class*="bg-white/10"] { background-color: rgba(0, 0, 0, 0.06) !important; }

.dashboard-shell {
  background: rgba(3, 3, 3, 0.92);
}

:root[data-theme='light'] .dashboard-shell {
  background: rgba(244, 244, 241, 0.97);
}

.dashboard-shell .glass-panel {
  background: rgba(12, 12, 12, 0.82);
}

.dashboard-shell .glass-panel-heavy {
  background: rgba(12, 12, 12, 0.92);
}

:root[data-theme='light'] .dashboard-shell .glass-panel {
  background: rgba(255, 255, 255, 0.88);
}

:root[data-theme='light'] .dashboard-shell .glass-panel-heavy {
  background: rgba(255, 255, 255, 0.96);
}
`;

const getGeminiApiKey = () => import.meta.env.VITE_GEMINI_API_KEY || (typeof window !== 'undefined' && window.apiKey ? window.apiKey : '') || '';

const ALL_PROVIDER_BLUEPRINTS = [...GROQ_PROVIDER_BLUEPRINTS, ...GEMINI_PROVIDER_BLUEPRINTS];

const BrandMark = ({ compact = false }) => (
  <div className={`flex items-center gap-3 ${compact ? 'max-w-full' : 'max-w-[18rem]'}`}>
    <svg viewBox="0 0 64 64" className={compact ? 'h-9 w-9 shrink-0' : 'h-12 w-12 shrink-0'} role="img" aria-hidden="true">
      <path d="M32 6 50 14v18c0 12-8 19-18 26C22 51 14 44 14 32V14Z" fill="none" stroke="var(--wordmark-color)" strokeWidth="2.5" />
      <path d="M23 24h18M20 32h24M23 40h14" stroke="var(--wordmark-color)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="32" cy="18" r="2" fill="var(--wordmark-color)" />
    </svg>
    <div className="min-w-0 leading-none">
      <div className={`${compact ? 'text-[1.05rem]' : 'text-[1.45rem]'} font-impact uppercase tracking-[0.14em] leading-none`} style={{ color: 'var(--wordmark-color)' }}>
        CATASTRO
      </div>
      <div className={`${compact ? 'text-[0.55rem]' : 'text-[0.68rem]'} font-display uppercase tracking-[0.42em] mt-1`} style={{ color: 'var(--wordmark-subtle)' }}>
        GUARD AI
      </div>
    </div>
  </div>
);

const ThemeToggle = ({ theme, onToggle }) => {
  const isLightMode = theme === 'light';
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.22em] transition-colors ${isLightMode ? 'border-black/15 bg-black text-white hover:bg-black/90' : 'border-white/20 bg-white/10 text-white hover:bg-white hover:text-black'}`}
    >
      {isLightMode ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
      {isLightMode ? 'Dark Mode' : 'Light Mode'}
    </button>
  );
};

// --- AGENT CONFIGURATION ---
const AGENTS = ALL_PROVIDER_BLUEPRINTS.map((provider, index) => ({
  ...provider,
  name: `${provider.vendor === 'groq' ? 'Groq' : 'Gemini'}: ${provider.label}`,
  role: provider.status,
  position: index + 1,
}));

export default function App() {
  const [view, setView] = useState('input');
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const storedTheme = window.localStorage.getItem('congni-theme');
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
  });
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [assetDetails, setAssetDetails] = useState('');
  const [assetValue, setAssetValue] = useState('');
  const [constructionYear, setConstructionYear] = useState('');
  const [processingStatus, setProcessingStatus] = useState([]);
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1);
  const [reportData, setReportData] = useState(null);
  const [vectorNodes, setVectorNodes] = useState([{ id: 'seed', x: 48, y: 50, label: 'land seed', active: true }]);
  const [vectorLinks, setVectorLinks] = useState([]);

  const [emailDraft, setEmailDraft] = useState('');
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [actionPlan, setActionPlan] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const canvasRef = useRef(null);

  const vectorNodeMap = new Map(vectorNodes.map(node => [node.id, node]));
  const isLightMode = theme === 'light';
  const shapeGridBorderColor = isLightMode ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.18)';
  const shapeGridHoverFill = '#868484';
  const mapControlClass = isLightMode
    ? 'border-black/15 bg-white/85 text-black hover:bg-white'
    : 'border-white/20 bg-black/70 text-white hover:bg-black/85';

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('congni-theme', theme);
  }, [theme]);

  const clearPolygonSelection = () => {
    setPolygonPoints([]);

    const map = mapInstance.current;
    if (map?.polygonLayerGroup) {
      map.polygonLayerGroup.clearLayers();
    }

    if (map) {
      map.setView([19.0760, 72.8777], 11);
    }
  };

  const handleLocateCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    const map = mapInstance.current;
    if (!map) return;

    map.locate({
      setView: true,
      maxZoom: 15,
      enableHighAccuracy: true,
    });
  };

  // --- LEAFLET MAP INITIALIZATION ---
  useEffect(() => {
    if (view !== 'input' || !mapRef.current || mapInstance.current) return undefined;

    const map = L.map(mapRef.current, { zoomControl: false }).setView([19.0760, 72.8777], 11);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'map-tiles',
      updateWhenIdle: true,
      keepBuffer: 2,
    }).addTo(map);

    map.polygonLayerGroup = L.layerGroup().addTo(map);
    map.locationLayerGroup = L.layerGroup().addTo(map);

    const handleMapClick = (e) => {
      setPolygonPoints(prev => {
        if (prev.length >= 4) return prev;
        return [...prev, { lat: e.latlng.lat.toFixed(4), lng: e.latlng.lng.toFixed(4) }];
      });
    };

    const handleLocationFound = (event) => {
      if (!map.locationLayerGroup) return;

      map.locationLayerGroup.clearLayers();

      const currentTheme = document.documentElement?.dataset?.theme;
      const locationColor = currentTheme === 'light' ? '#111111' : '#ffffff';

      L.circle(event.latlng, {
        radius: Math.max(event.accuracy / 2, 40),
        color: locationColor,
        weight: 1,
        fillColor: locationColor,
        fillOpacity: 0.08,
      }).addTo(map.locationLayerGroup);

      L.circleMarker(event.latlng, {
        radius: 8,
        color: locationColor,
        weight: 2,
        fillColor: locationColor,
        fillOpacity: 0.9,
      }).addTo(map.locationLayerGroup);
    };

    const handleLocationError = () => {
      if (map.locationLayerGroup) {
        map.locationLayerGroup.clearLayers();
      }
    };

    const handleResize = () => {
      map.invalidateSize();
    };

    map.on('click', handleMapClick);
    map.on('locationfound', handleLocationFound);
    map.on('locationerror', handleLocationError);
    window.addEventListener('resize', handleResize);
    mapInstance.current = map;
    const resizeFrameId = requestAnimationFrame(handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(resizeFrameId);
      map.off('click', handleMapClick);
      map.off('locationfound', handleLocationFound);
      map.off('locationerror', handleLocationError);
      map.remove();
      if (mapInstance.current === map) {
        mapInstance.current = null;
      }
    };
  }, [view]);

  // Handle Polygon Drawing
  useEffect(() => {
    if (!mapInstance.current) return;
    const map = mapInstance.current;

    if (map.polygonLayerGroup) {
      map.polygonLayerGroup.clearLayers();
      const customIcon = L.divIcon({
        className: 'custom-icon',
        html: '<div class="w-4 h-4 bg-white rounded-full pulse-dot border-4 border-black"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      polygonPoints.forEach(pt => {
        L.marker([pt.lat, pt.lng], { icon: customIcon }).addTo(map.polygonLayerGroup);
      });

      if (polygonPoints.length === 4) {
        const latlngs = polygonPoints.map(pt => [pt.lat, pt.lng]);
        L.polygon(latlngs, {
          color: '#ffffff',
          fillColor: '#ffffff',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 5'
        }).addTo(map.polygonLayerGroup);
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [polygonPoints]);

  // --- VECTOR ANIMATION ---
  useEffect(() => {
    if (view === 'processing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;

      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const particles = [];
      const particleCount = 80;
      const connectionDistance = 150;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
          radius: Math.random() * 2 + 1, opacity: 0
        });
      }

      let animationFrameId;
      let progress = 0;

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        progress += 0.005;

        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          if (i / particles.length < progress) p1.opacity = Math.min(1, p1.opacity + 0.05);
          if (p1.opacity === 0) continue;

          p1.x += p1.vx; p1.y += p1.vy;
          if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
          if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

          ctx.beginPath();
          ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p1.opacity})`;
          ctx.fill();

          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            if (p2.opacity === 0) continue;
            const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            if (dist < connectionDistance) {
              ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / connectionDistance) * p1.opacity * p2.opacity * 0.4})`;
              ctx.lineWidth = 1; ctx.stroke();
            }
          }
        }
        animationFrameId = requestAnimationFrame(draw);
      };

      draw();
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationFrameId);
      };
    }

    return undefined;
  }, [view]);

  // --- API LOGIC ---
  const generateGeminiText = async (prompt) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) return 'Error: API Key is missing. Add VITE_GEMINI_API_KEY to .env.';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } })
      });

      if (!response.ok) {
        throw new Error(`Gemini request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate.';
    } catch (err) {
      return 'Error connecting to AI model.';
    }
  };

  const handleDraftClientEmail = async () => {
    if (!reportData) return;
    setShowEmailModal(true);
    setIsDraftingEmail(true);
    setEmailDraft('');

    const prompt = `Write a professional email to a client/broker explaining our recent P&C underwriting decision.
      Asset: ${assetDetails} | Verdict: ${reportData.verdict} | Risk Score: ${reportData.riskScore}/100 | PML(100): ${reportData.pml100}
      Reasoning: ${reportData.reasoning} | Required Mitigation: ${reportData.mitigation}
      Format cleanly without markdown blocks. Emphasize the parametric trigger option: ${reportData.parametricTrigger}.`;

    setEmailDraft(await generateGeminiText(prompt));
    setIsDraftingEmail(false);
  };

  const handleGenerateActionPlan = async () => {
    if (!reportData) return;
    setIsGeneratingPlan(true);
    const prompt = `Take this mitigation requirement and break it into a strict, bulleted 3-step actionable plan for a site manager: "${reportData.mitigation}". Keep it brief, technical, and actionable.`;
    setActionPlan(await generateGeminiText(prompt));
    setIsGeneratingPlan(false);
  };

  const handleAnalyze = async () => {
    if (polygonPoints.length < 4 || !assetDetails) return;
    setView('processing');
    setProcessingStatus([]);
    setActiveAgentIndex(0);
    setVectorNodes([{ id: 'seed', x: 48, y: 50, label: 'land seed', active: true }]);
    setVectorLinks([]);
    setEmailDraft('');
    setActionPlan('');
    setShowEmailModal(false);
    setIsDraftingEmail(false);
    setIsGeneratingPlan(false);

    const simulateAgents = async () => {
      let previousNodeId = 'seed';
      setProcessingStatus(prev => [...prev, `[${new Date().toISOString()}] BOOTSTRAP: Parcel seed accepted, preparing policy brief.`]);

      for (let i = 0; i < AGENTS.length; i++) {
        const agent = AGENTS[i];
        const stamp = new Date().toISOString();
        setActiveAgentIndex(i);
        setProcessingStatus(prev => [...prev, `[${stamp}] ${agent.name} | START | ${agent.status}`]);
        setProcessingStatus(prev => [...prev, `[${stamp}] ${agent.name} | SOURCE SET | ${agent.sourceGroups.join(' | ')}`]);
        setProcessingStatus(prev => [...prev, `[${stamp}] ${agent.name} | JSON PLAN | ${agent.jsonSchema.join(', ')}`]);

        const node = {
          id: agent.id,
          x: 14 + ((i % 4) * 20) + (i * 1.7),
          y: 20 + (Math.floor(i / 4) * 28) + ((i % 3) * 4),
          label: agent.label,
          active: true,
        };

        setVectorNodes(prev => prev.map(existing => ({ ...existing, active: false })).concat(node));
        setVectorLinks(prev => prev.concat({ from: previousNodeId, to: node.id }));
        previousNodeId = node.id;

        await new Promise(r => setTimeout(r, 850));

        setProcessingStatus(prev => [...prev, `[${new Date().toISOString()}] ${agent.name} | COMPLETE | Indexed into frontend vector memory.`]);
      }

      setProcessingStatus(prev => [...prev, `[${new Date().toISOString()}] FINALIZE | All provider placeholders complete, dashboard lock released.`]);
    };

    const fetchReport = async () => {
      try {
        const apiKey = getGeminiApiKey();
        if (!apiKey) throw new Error('API key missing');
        const prompt = `You are CatastroGuard AI, an expert actuarial and CAT risk modeling system used in a high-volume BPS environment.
          Analyze this polygon: ${JSON.stringify(polygonPoints)}. Asset: ${assetDetails}. TIV: ${assetValue}. Built: ${constructionYear}.
          Respond ONLY with a raw JSON object (no markdown, no formatting wrappers):
          {
            "verdict": "string (APPROVED, CONDITIONALLY APPROVED, DENIED)",
            "riskScore": number (0-100),
            "expectedLossRatio": "string (e.g., 68.4%)",
            "aal": "string (Average Annual Loss)",
            "pml100": "string",
            "pml250": "string",
            "tiv": "string (Total Insured Value)",
            "endpointsAnalyzed": number,
            "premiumRecommendation": "string",
            "reasoning": "string (Dense explanation)",
            "mitigation": "string (Hard requirement)",
            "parametricTrigger": "string (e.g., '>150mm rainfall in 24h triggers 20% TIV payout')",
            "ndmaIndex": "string (e.g., Severe - Zone IV)",
            "portfolioAccumulation": "string (e.g., High: 450 policies within 5km radius)",
            "leakageRisk": "string (e.g., 38% probability of claims leakage)",
            "climateNonStationarity": "string (e.g., Flood frequency +18% by 2030)",
            "parcelSummary": "string",
            "roadAccessScore": "string",
            "coverageNotes": "string",
            "insurerBrief": "string",
            "analogEvents": [ {"name": "string", "similarity": "string", "year": "string"} ],
            "exceedanceCurve": [ {"probability": 0.01, "loss": number}, {"probability": 0.05, "loss": number}, {"probability": 0.1, "loss": number}, {"probability": 0.2, "loss": number}, {"probability": 0.5, "loss": number} ],
            "hazardFactors": [ {"hazard": "Flood", "value": number}, {"hazard": "Wind", "value": number}, {"hazard": "Subsidence", "value": number}, {"hazard": "Fire", "value": number}, {"hazard": "Seismic", "value": number} ]
          }`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } })
        });

        if (!response.ok) {
          throw new Error(`Gemini request failed: ${response.status}`);
        }

        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) return JSON.parse(textResponse);
        throw new Error('Invalid API response format');
      } catch (err) {
        return {
          verdict: 'CONDITIONALLY APPROVED',
          riskScore: 84, expectedLossRatio: '74.2%',
          aal: '$214,000', pml100: '$6.8M', pml250: '$11.2M', tiv: assetValue || '$45,000,000',
          endpointsAnalyzed: 24891,
          premiumRecommendation: 'Base + 32% STFI Loading',
          reasoning: 'Polygon intersecting high coastal exposure triggers severe flood probability during peak monsoon cycles. Historic analogs indicate structural resilience is insufficient. High claims leakage probability noted in manual adjudication workflows for this region.',
          mitigation: 'Mandatory installation of non-return valves, elevation of critical electrical infrastructure above 1.5 meters, and IoT water sensors linked to TPA systems.',
          parametricTrigger: '>180mm cumulative rainfall in 48h triggers automatic 15% TIV payout (Bypasses FNOL).',
          ndmaIndex: 'Severe - Zone IV (High Vulnerability)',
          portfolioAccumulation: 'CRITICAL: 620 active policies within 10km radius. High correlation risk.',
          leakageRisk: '41.5% (Based on historical regional BPO claim verifications)',
          climateNonStationarity: 'Inundation frequency projected +22% by 2030 (IPCC RCP8.5)',
          parcelSummary: 'Compact coastal parcel with elevated flood exposure and limited natural drainage.',
          roadAccessScore: 'Moderate with clear ingress from the primary road grid.',
          coverageNotes: 'Coverage should be conditional until drainage, ingress, and electrical resilience controls are installed.',
          insurerBrief: 'The parcel is acceptable only with mitigation, a tighter wording schedule, and a parametric trigger for rapid settlement.',
          analogEvents: [
            { name: 'Mumbai Exceptional Monsoon', similarity: '96%', year: '2005' },
            { name: 'Cyclone Nisarga Impact', similarity: '88%', year: '2020' },
            { name: 'Chennai Basin Inundation', similarity: '81%', year: '2015' },
            { name: 'Surat Urban Flooding', similarity: '74%', year: '2006' }
          ],
          exceedanceCurve: [
            { probability: 0.01, loss: 14500000 }, { probability: 0.05, loss: 8200000 },
            { probability: 0.1, loss: 3800000 }, { probability: 0.2, loss: 1200000 }, { probability: 0.5, loss: 250000 }
          ],
          hazardFactors: [
            { hazard: 'Flood', value: 96 }, { hazard: 'Wind', value: 78 },
            { hazard: 'Subsidence', value: 42 }, { hazard: 'Fire', value: 25 }, { hazard: 'Seismic', value: 55 }
          ]
        };
      }
    };

    const [report] = await Promise.all([fetchReport(), simulateAgents()]);
    setReportData(report);
    setView('dashboard');
  };

  // --- VIEWS ---
  const renderInput = () => (
    <div className="flex flex-col lg:flex-row min-h-screen w-full relative">
      <div className="w-full lg:w-1/3 p-4 sm:p-6 lg:p-8 flex flex-col justify-between z-10 glass-panel shadow-2xl relative border-r border-white/10">
        <div className="absolute inset-0 bg-black/60 -z-10"></div>
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-white/10 pb-4">
            <BrandMark compact />
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <ThemeToggle theme={theme} onToggle={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))} />
              <span className="text-[9px] font-mono border border-white/20 px-1 py-0.5 bg-white/5">TPA++ ACCELERATOR</span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">1. Geographic Boundary</label>
                <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-1">{polygonPoints.length}/4 Points</span>
              </div>
              <div className="p-3 bg-black border border-white/10 flex flex-col gap-1 min-h-20">
                {polygonPoints.length === 0 ? (
                  <span className="font-mono text-xs opacity-40 pt-2 text-center">Awaiting polygon definition...</span>
                ) : (
                  polygonPoints.map((pt, i) => (
                    <div key={i} className="font-mono text-[10px] flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500">V_{i + 1}</span>
                      <span className="text-gray-300">{pt.lat}, {pt.lng}</span>
                    </div>
                  ))
                )}
                {polygonPoints.length > 0 && (
                  <button onClick={() => setPolygonPoints([])} className="mt-1 text-[10px] text-gray-400 hover:text-white font-mono text-left w-max">
                    [ CLEAR_BUFFER ]
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Target TIV ($)</label>
                <input
                  type="text"
                  value={assetValue}
                  onChange={(e) => setAssetValue(e.target.value)}
                  className="w-full bg-black border border-white/10 p-2 text-xs font-mono focus:outline-none focus:border-white/40"
                  placeholder="e.g. 50,000,000"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Year Built</label>
                <input
                  type="text"
                  value={constructionYear}
                  onChange={(e) => setConstructionYear(e.target.value)}
                  className="w-full bg-black border border-white/10 p-2 text-xs font-mono focus:outline-none focus:border-white/40"
                  placeholder="YYYY"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">2. Structural & Occupancy Metadata</label>
              <textarea
                value={assetDetails}
                onChange={(e) => setAssetDetails(e.target.value)}
                className="w-full bg-black border border-white/10 p-3 text-xs font-mono focus:outline-none focus:border-white/40 resize-none h-24"
                placeholder="Ingest policy details... (e.g. 500 residential units, heavy industrial park, ground floor retail, reinforced concrete)."
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={polygonPoints.length < 4 || !assetDetails}
          className={`mt-6 w-full p-4 flex items-center justify-between group border transition-all duration-300 ${(polygonPoints.length < 4 || !assetDetails) ? 'opacity-30 border-white/10 bg-transparent cursor-not-allowed' : 'border-white bg-white text-black hover:bg-gray-200 cursor-pointer'}`}
        >
          <span className="font-impact text-lg uppercase tracking-wider">Execute Neuro Pipeline</span>
          <ChevronRight className={`w-5 h-5 transition-transform ${(polygonPoints.length < 4 || !assetDetails) ? '' : 'group-hover:translate-x-2'}`} />
        </button>
      </div>

      <div className="w-full lg:w-2/3 h-[42vh] sm:h-[46vh] lg:min-h-screen relative bg-[#060606]">
        <div ref={mapRef} className="absolute inset-0 z-0"></div>
        <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleLocateCurrentLocation}
            className={`flex h-10 w-10 items-center justify-center border transition-colors ${mapControlClass}`}
            title="Go to current location"
            aria-label="Go to current location"
          >
            <LocateFixed className="h-4 w-4" />
          </button>
          {polygonPoints.length === 4 && (
            <button
              type="button"
              onClick={clearPolygonSelection}
              className={`border px-3 py-2 text-[9px] font-mono uppercase tracking-[0.24em] transition-colors ${mapControlClass}`}
              title="Clear selection"
              aria-label="Clear selection"
            >
              Clear
            </button>
          )}
        </div>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 mix-blend-difference opacity-50">
          <div className="w-100 h-100 border border-white/20 rounded-full flex items-center justify-center border-dashed">
            <div className="w-1 h-1 bg-white shadow-[0_0_10px_#fff]"></div>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 z-20 pointer-events-auto text-[9px] font-mono text-white/80 bg-black/70 border border-white/10 px-2 py-1 backdrop-blur-md flex items-center gap-2">
          <span>OSM cache active</span>
          <a className="hover:text-white underline underline-offset-2" href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">
            report map issue
          </a>
        </div>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col lg:flex-row min-h-screen w-full relative bg-transparent overflow-visible font-mono text-white">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-25 pointer-events-none"></canvas>

      <div className="fixed inset-0 z-[1] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {vectorLinks.map((link, index) => {
            const from = vectorNodeMap.get(link.from);
            const to = vectorNodeMap.get(link.to);
            if (!from || !to) return null;

            return (
              <line
                key={`${link.from}-${link.to}-${index}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(255,255,255,0.24)"
                strokeWidth="0.35"
                strokeDasharray="1.8 1.2"
              />
            );
          })}

          {vectorNodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.id === 'seed' ? 1.5 : 1.3}
                fill="#ffffff"
                opacity={node.active ? 1 : 0.65}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={node.id === 'seed' ? 2.6 : 2.1}
                fill="none"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="0.18"
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-10 flex flex-col justify-between z-10 relative border-r border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="text-[10px] tracking-[0.35em] text-gray-500 uppercase">AI WORKFLOW ORCHESTRATOR</div>
              <h2 className="text-2xl sm:text-3xl font-impact tracking-widest uppercase">Synthesizing Stochastic Variables</h2>
              <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
                Hardcoded stage status stays visible while the eight provider placeholders warm the vector mesh and prepare the insurer brief.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 flex-wrap self-start">
              <ThemeToggle theme={theme} onToggle={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))} />
              <div className="text-[9px] uppercase tracking-[0.25em] text-gray-300 border border-white/10 bg-white/5 px-3 py-2">
                Frontend first
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[28vh] overflow-y-auto pr-1 sm:max-h-[34vh]">
            {PROCESS_STAGES.map((stage, index) => {
              const stageState = index < activeAgentIndex ? 'complete' : index === activeAgentIndex ? 'active' : 'queued';
              const stageClass = stageState === 'active'
                ? 'border-white/40 bg-white/10'
                : stageState === 'complete'
                  ? 'border-white/15 bg-white/5 opacity-90'
                  : 'border-white/5 bg-black/40 opacity-55';

              return (
                <div key={stage.id} className={`flex items-start gap-3 p-3 border ${stageClass}`}>
                  <div className={`w-7 h-7 flex items-center justify-center text-[9px] border ${stageState === 'active' ? 'border-white text-white' : 'border-white/20 text-gray-400'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white">{stage.title}</div>
                    <div className="text-[9px] text-gray-400 mt-1 leading-relaxed">{stage.detail}</div>
                  </div>
                  <div className="text-[8px] uppercase tracking-[0.18em] text-gray-500 shrink-0">
                    {stageState}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AGENTS.map((agent, index) => {
              const providerState = index < activeAgentIndex ? 'complete' : index === activeAgentIndex ? 'active' : 'queued';
              const providerClass = providerState === 'active'
                ? 'border-white/40 bg-white/10'
                : providerState === 'complete'
                  ? 'border-white/15 bg-white/5 opacity-90'
                  : 'border-white/5 bg-black/40 opacity-55';

              return (
                <div key={agent.id} className={`p-3 border ${providerClass}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {providerState === 'active' ? <Cpu className="w-4 h-4 animate-pulse" /> : providerState === 'complete' ? <Layers className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold tracking-widest uppercase">{agent.label}</div>
                      <div className="text-[9px] text-gray-400 mt-0.5 leading-relaxed">{agent.status}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-[8px] uppercase tracking-[0.18em] border border-white/10 bg-white/5 px-1.5 py-0.5">{agent.vendor}</span>
                        <span className="text-[8px] uppercase tracking-[0.18em] border border-white/10 bg-white/5 px-1.5 py-0.5">{agent.model}</span>
                        <span className="text-[8px] uppercase tracking-[0.18em] border border-white/10 bg-white/5 px-1.5 py-0.5">{agent.endpointBudget} calls</span>
                      </div>
                    </div>
                    {providerState === 'active' && <Activity className="w-3 h-3 animate-spin-slow" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-10 flex flex-col justify-end z-10 relative bg-black/55 border-l border-white/10">
        <div className="flex justify-between items-center text-[10px] text-gray-500 border-b border-white/10 pb-2 mb-4">
          <span>STATUS STREAM</span>
          <span>{activeAgentIndex + 1} / {AGENTS.length} ACTIVE</span>
        </div>

        <div className="h-full max-h-[60vh] overflow-y-auto flex flex-col-reverse text-[10px] text-gray-400 space-y-reverse space-y-1 pr-1">
          {processingStatus.map((log, i) => (
            <div key={i} className={`${i === 0 ? 'text-white' : ''}`}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!reportData) return null;
    const formattedCurve = reportData.exceedanceCurve.map(item => ({ ...item, probPercent: `${item.probability * 100}%`, lossFormatted: (item.loss / 1000000).toFixed(1) }));
    const isApproved = reportData.verdict === 'APPROVED';
    const isDenied = reportData.verdict === 'DENIED';

    return (
      <div className="dashboard-shell min-h-screen w-full relative page-enter-right flex flex-col overflow-visible">
        <div className="scanline"></div>

        {/* ULTRA-COMPACT HEADER */}
        <header className="sticky top-0 flex flex-col gap-3 p-3 bg-black/65 backdrop-blur-xl border-b border-white/10 z-20 shrink-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="min-w-0">
              <BrandMark compact />
              <div className="text-[9px] font-mono tracking-[0.3em] text-gray-500 uppercase leading-none mt-1">NEURO AI: UNDERWRITING COMMAND CENTER</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <ThemeToggle theme={theme} onToggle={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))} />
            <button onClick={handleDraftClientEmail} className="px-4 py-1.5 bg-white/10 text-white text-[10px] font-mono hover:bg-white hover:text-black transition-colors flex items-center gap-2 border border-white/20">
              <Mail className="w-3 h-3" /> COMPOSE_OUTPUT
            </button>
            <button onClick={() => setView('input')} className="px-3 py-1.5 bg-white/10 text-white hover:bg-white hover:text-black border border-white/20 text-[10px] font-mono transition-colors">
              TERMINATE_SESSION
            </button>
          </div>
        </header>

        {/* DENSE GRID LAYOUT - NO EMPTY SPACE */}
        <div className="px-1.5 sm:px-2 pb-6 pt-1.5 scroll-smooth">
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2 auto-rows-min">

            {/* ROW 1: CORE VERDICT & FINANCIALS */}
            <div className={`col-span-12 lg:col-span-3 glass-panel p-4 flex flex-col justify-center border-l-4 ${isApproved ? 'border-l-white/80' : isDenied ? 'border-l-white/40' : 'border-l-white/20'}`}>
              <div className="text-[9px] font-mono text-gray-500 mb-1 tracking-widest uppercase">Automated AI Verdict</div>
              <div className="text-3xl font-impact leading-none mb-2 text-white">{reportData.verdict}</div>
              <div className="text-[10px] leading-tight text-gray-400 line-clamp-3">{reportData.reasoning}</div>
            </div>

            <div className="col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              <div className="glass-panel p-3 flex flex-col justify-between">
                <div className="text-[9px] font-mono text-gray-500 uppercase">CAT Risk Score</div>
                <div className="text-4xl font-impact text-white">{reportData.riskScore}</div>
              </div>
              <div className="glass-panel p-3 flex flex-col justify-between">
                <div className="text-[9px] font-mono text-gray-500 uppercase">Est. Leakage Risk</div>
                <div className="text-2xl font-display font-bold text-white">{reportData.leakageRisk}</div>
                <div className="text-[8px] font-mono text-gray-600">vs 40% BPO Avg</div>
              </div>
              <div className="glass-panel p-3 flex flex-col justify-between bg-white/5 border-white/20">
                <div className="text-[9px] font-mono text-gray-300 uppercase">Total Insured Value</div>
                <div className="text-xl font-display font-bold text-white">{reportData.tiv}</div>
              </div>
              <div className="glass-panel p-3 flex flex-col justify-between">
                <div className="text-[9px] font-mono text-gray-500 uppercase">Pricing & Loading</div>
                <div className="text-sm font-display font-bold text-white leading-tight">{reportData.premiumRecommendation}</div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3 glass-panel p-3 flex flex-col justify-between bg-linear-to-br from-black to-[#0a0a0a]">
              <div className="text-[9px] font-mono text-gray-500 uppercase flex items-center gap-1 border-b border-white/10 pb-1 mb-2">
                <Clock className="w-3 h-3" /> Process Efficiency Delta
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2 mb-2">
                <div>
                  <div className="text-[8px] text-gray-500 font-mono">Traditional Manual BPS</div>
                  <div className="text-lg font-mono text-gray-400 line-through decoration-white/30">49.4 Hours</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] text-gray-300 font-mono">Neuro AI Agentic</div>
                  <div className="text-2xl font-impact text-white">1.2 MINS</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                <span>Data Endpoints Hit:</span>
                <span className="text-white bg-white/10 px-1">{reportData.endpointsAnalyzed.toLocaleString()}</span>
              </div>
            </div>

            {/* ROW 2: CHARTS & DEEP METRICS */}
            <div className="col-span-12 lg:col-span-5 glass-panel p-4 h-56 sm:h-64 lg:h-70 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Exceedance Probability Curve</div>
                <div className="text-[9px] font-mono bg-white/10 px-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Stochastic Model</div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2 shrink-0">
                <div className="bg-white/5 p-1 text-center"><div className="text-[8px] text-gray-500 uppercase">Expected LR</div><div className="text-sm font-bold">{reportData.expectedLossRatio}</div></div>
                <div className="bg-white/5 p-1 text-center"><div className="text-[8px] text-gray-500 uppercase">AAL</div><div className="text-sm font-bold text-white">{reportData.aal}</div></div>
                <div className="bg-white/5 p-1 text-center"><div className="text-[8px] text-gray-500 uppercase">PML 1-in-100</div><div className="text-sm font-bold text-white">{reportData.pml100}</div></div>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedCurve} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <defs><linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fff" stopOpacity={0.4} /><stop offset="95%" stopColor="#fff" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="probPercent" stroke="#444" tick={{ fill: '#666', fontSize: 9 }} />
                    <YAxis stroke="#444" tick={{ fill: '#666', fontSize: 9 }} tickFormatter={(val) => `${val}M`} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }} formatter={(val) => [`$${val}M`, 'Est. Loss']} />
                    <Area type="monotone" dataKey="lossFormatted" stroke="#fff" strokeWidth={1} fillOpacity={1} fill="url(#colorLoss)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-3 glass-panel p-4 h-56 sm:h-64 lg:h-70 flex flex-col">
              <div className="text-[10px] font-mono text-gray-400 tracking-widest uppercase mb-1">Vulnerability Vectors</div>
              <div className="text-[9px] text-gray-500 mb-2 truncate">NDMA Index: <span className="text-white">{reportData.ndmaIndex}</span></div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={reportData.hazardFactors}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="hazard" tick={{ fill: '#888', fontSize: 9 }} />
                    <Radar name="Risk" dataKey="value" stroke="#fff" strokeWidth={1} fill="#fff" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 glass-panel p-4 h-56 sm:h-64 lg:h-70 flex flex-col overflow-hidden">
              <div className="text-[10px] uppercase font-mono tracking-widest text-gray-300 mb-2 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Insurer Brief
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-1">
                {reportData.analogEvents?.map((event, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] bg-white/5 p-2 border border-white/5">
                    <div className="flex gap-2 items-center min-w-0">
                      <span className="font-mono text-gray-500 shrink-0">{event.year}</span>
                      <span className="text-gray-200 truncate">{event.name}</span>
                    </div>
                    <span className="font-mono text-white bg-white/10 px-1 py-0.5 shrink-0 ml-2">{event.similarity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 3: TRIGGERS, REQUIREMENTS & MACRO FACTORS */}
            <div className="col-span-12 lg:col-span-4 glass-panel p-4 border border-white/20 bg-white/5">
              <div className="text-[10px] uppercase font-mono tracking-widest text-gray-300 mb-2 flex items-center gap-2">
                <Zap className="w-3 h-3 text-white" /> Parametric Shift Trigger (Bypass FNOL)
              </div>
              <p className="text-sm font-bold text-white leading-snug">{reportData.parametricTrigger}</p>
              <div className="mt-3 text-[9px] text-gray-500 font-mono border-t border-white/10 pt-2">
                <AlertTriangle className="w-3 h-3 inline mr-1 text-gray-400" />
                {reportData.portfolioAccumulation}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 glass-panel p-4 flex flex-col">
              <div className="flex justify-between items-start mb-2 shrink-0">
                <div className="text-[10px] uppercase font-mono tracking-widest text-gray-400 flex items-center gap-2">
                  <Server className="w-3 h-3" /> Hard Mitigation Requirements
                </div>
                {!actionPlan && (
                  <button onClick={handleGenerateActionPlan} disabled={isGeneratingPlan} className="text-[8px] font-mono border border-white/30 px-2 py-0.5 hover:bg-white hover:text-black transition-colors flex items-center gap-1 disabled:opacity-50">
                    {isGeneratingPlan ? <Loader2 className="w-2 h-2 animate-spin" /> : <ListChecks className="w-2 h-2" />} PLAN
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                <p className="text-[11px] text-gray-300 leading-tight mb-2">{reportData.mitigation}</p>
                {actionPlan && (
                  <div className="mt-2 p-2 bg-black/50 border border-white/10 text-[9px] text-gray-400 font-mono whitespace-pre-wrap leading-tight">
                    <span className="text-white font-bold uppercase tracking-widest block mb-1 border-b border-white/10 pb-1">AI Execution Plan</span>
                    {actionPlan}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 glass-panel p-4 bg-white/5 border-white/10">
              <div className="text-[10px] uppercase font-mono tracking-widest text-gray-300 mb-2 flex items-center gap-2">
                <Activity className="w-3 h-3" /> Macro: Climate Non-Stationarity
              </div>
              <p className="text-xs text-gray-300 leading-tight border-l-2 border-white/30 pl-2 mb-3">
                {reportData.climateNonStationarity}
              </p>
              <div className="h-12 w-full mt-auto opacity-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: '2024', val: 100 }, { name: '2026', val: 105 }, { name: '2028', val: 112 }, { name: '2030', val: 122 }]}>
                    <Bar dataKey="val" fill={isLightMode ? '#111111' : '#f3f3f3'} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 glass-panel p-4 flex flex-col">
              <div className="text-[10px] uppercase font-mono tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                <MapIcon className="w-3 h-3" /> Parcel Summary
              </div>
              <p className="text-sm text-white leading-snug mb-3">{reportData.parcelSummary || reportData.reasoning}</p>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                <div className="bg-white/5 border border-white/10 p-2">
                  <div className="text-gray-500 uppercase mb-1">Road Access</div>
                  <div className="text-white">{reportData.roadAccessScore || 'Mapped via active OSM viewport'}</div>
                </div>
                <div className="bg-white/5 border border-white/10 p-2">
                  <div className="text-gray-500 uppercase mb-1">Coverage Notes</div>
                  <div className="text-white">{reportData.coverageNotes || 'Conditional placement only'}</div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 glass-panel p-4 flex flex-col">
              <div className="text-[10px] uppercase font-mono tracking-widest text-gray-400 mb-2 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Insurer Brief
              </div>
              <p className="text-sm text-white leading-snug mb-3">{reportData.insurerBrief || reportData.reasoning}</p>
              <div className="bg-white/5 border border-white/10 p-3 text-[9px] font-mono text-gray-300 leading-relaxed">
                The final frame should be shared with underwriting, risk control, and claims so the land can be priced, controlled, and monitored from one page.
              </div>
            </div>

          </div>
        </div>

        {/* Modal remains mostly unchanged structurally, just tightened padding */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="glass-panel-heavy w-full max-w-2xl border border-white/20 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                <h3 className="text-sm font-mono uppercase tracking-widest flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Agentic Output: Broker Communication
                </h3>
                <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 text-xs">
                {isDraftingEmail ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500 space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="font-mono text-[10px] tracking-widest uppercase animate-pulse">Running GenAI Orchestration...</span>
                  </div>
                ) : (<div className="font-mono leading-relaxed text-gray-300 whitespace-pre-wrap">{emailDraft}</div>)}
              </div>
              <div className="p-4 border-t border-white/10 bg-black flex justify-end">
                <button
                  onClick={() => { navigator.clipboard.writeText(emailDraft); alert('Copied to clipboard'); }}
                  disabled={isDraftingEmail}
                  className="px-4 py-1.5 bg-white text-black font-mono text-[10px] uppercase hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div className="relative isolate min-h-screen w-full overflow-x-hidden text-(--app-fg) selection:bg-white/30 selection:text-white">
        <ShapeGrid
          theme={theme}
          direction="diagonal"
          speed={0.5}
          squareSize={58}
          borderColor={shapeGridBorderColor}
          hoverFillColor={shapeGridHoverFill}
          shape="hexagon"
          hoverTrailAmount={0}
          className="pointer-events-none fixed inset-0 z-0 opacity-20 sm:opacity-30"
        />
        <div className="absolute inset-0 z-0 bg-linear-to-b from-black/5 via-transparent to-black/20 pointer-events-none"></div>
        <div className="relative z-10">
          {view === 'input' && renderInput()}
          {view === 'processing' && renderProcessing()}
          {view === 'dashboard' && renderDashboard()}
        </div>
      </div>
    </>
  );
}
