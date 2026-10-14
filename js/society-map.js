// ============================================================
//  society-map.js — SHIVAM DUPLEX 3D Spatial Interactive Map
//  Real Geography Layout based on Google Maps Satellite View
//  (Near D Mart Rd / Kapurai Police Station area, Vadodara)
//  Features:
//  - 40 Duplexes arranged in 5 Lines (શેરીઓ)
//  - Line Allocation to Committee Members with House Highlights
//  - 16 Interactive Streetlights (💡) with Day/Night Lighting Mode
//  - Shivam Duplex Park, Temple & Main Security Gate
//  - Interactive House & Streetlight Inspector Drawer
// ============================================================

const SOCIETY_LINES = [
  {
    id: "line-1",
    name: "લાઈન ૧ (ઉત્તર શેરી / North Lane)",
    duplexes: ["01","02","03","04","05","06","07","08"],
    incharge: {
      name: "શ્રી રાજેશભાઈ પટેલ",
      house: "૦૪",
      phone: "9825012341",
      role: "કારોબારી સભ્ય (લાઈન ૧ મેન્ટર)"
    },
    color: "#60a5fa"
  },
  {
    id: "line-2",
    name: "લાઈન ૨ (પશ્ચિમ શેરી ૧ / West Lane 1)",
    duplexes: ["09","10","11","12","13","14","15","16"],
    incharge: {
      name: "શ્રી વિનોદભાઈ શાહ",
      house: "૧૧",
      phone: "9825011002",
      role: "૧ ઉપ-પ્રમુખ (લાઈન ૨ ઇન્ચાર્જ)"
    },
    color: "#f59e0b"
  },
  {
    id: "line-3",
    name: "લાઈન ૩ (પશ્ચિમ શેરી ૨ / West Lane 2)",
    duplexes: ["17","18","19","20","21","22","23","24"],
    incharge: {
      name: "શ્રી અલ્પેશભાઈ દેસાઈ",
      house: "૨૧",
      phone: "9825011003",
      role: "૧ મંત્રી & શ્રી સુરેશભાઈ શાહ (D-24)"
    },
    color: "#34d399"
  },
  {
    id: "line-4",
    name: "લાઈન ૪ (મધ્ય શેરી / Central Lane)",
    duplexes: ["25","26","27","28","29","30","31","32"],
    incharge: {
      name: "શ્રી મુકેશભાઈ પંડ્યા",
      house: "૩૧",
      phone: "9825011004",
      role: "૧ ખજાનચી (લાઈન ૪ ઇન્ચાર્જ)"
    },
    color: "#a78bfa"
  },
  {
    id: "line-5",
    name: "લાઈન ૫ (પાર્ક શેરી / Parkside Lane)",
    duplexes: ["33","34","35","36","37","38","39","40"],
    incharge: {
      name: "શ્રી સંજયભાઈ બારોટ & શ્રી નરેન્દ્રભાઈ રાણા",
      house: "૩૪ & ૩૮",
      phone: "9825011010",
      role: "કારોબારી સભ્યો (પાર્કિંગ & બગીચો)"
    },
    color: "#f472b6"
  }
];

// Committee VIP houses to highlight
const COMMITTEE_HOUSES = {
  "01": { title: "૧ પ્રમુખ (CHAIRMAN)", name: "શ્રી રમેશભાઈ પટેલ", icon: "👑", badgeClass: "badge-chairman", phone: "9825011001", portfolio: "સોસાયટીના મુખ્ય વડા" },
  "04": { title: "કારોબારી સભ્ય", name: "શ્રી રાજેશભાઈ પટેલ", icon: "⚖️", badgeClass: "badge-committee", phone: "9825012341", portfolio: "ક્લસ્ટર ૧ મેન્ટર (લાઈન ૧)" },
  "06": { title: "કારોબારી સભ્ય", name: "શ્રી પ્રદીપભાઈ પટેલ", icon: "💧", badgeClass: "badge-committee", phone: "9825011005", portfolio: "પાણી પુરવઠો & બોરવેલ" },
  "11": { title: "૧ ઉપ-પ્રમુખ (VICE-CHAIR)", name: "શ્રી વિનોદભાઈ શાહ", icon: "🤝", badgeClass: "badge-vice", phone: "9825011002", portfolio: "સહાયક વડા & લાઈન ૨ ઇન્ચાર્જ" },
  "14": { title: "કારોબારી સભ્ય", name: "શ્રી હરેશભાઈ જોશી", icon: "🛡️", badgeClass: "badge-committee", phone: "9825011006", portfolio: "સિક્યુરિટી & ગેટ કંટ્રોલ" },
  "18": { title: "કારોબારી સભ્ય", name: "શ્રી દીપકભાઈ પંચાલ", icon: "🧹", badgeClass: "badge-committee", phone: "9825011007", portfolio: "સ્વચ્છતા & સફાઈ" },
  "21": { title: "૧ મંત્રી (SECRETARY)", name: "શ્રી અલ્પેશભાઈ દેસાઈ", icon: "📋", badgeClass: "badge-secretary", phone: "9825011003", portfolio: "રોજબરોજ વહીવટ & લાઈન ૩ ઇન્ચાર્જ" },
  "23": { title: "કારોબારી સભ્ય", name: "શ્રી ભાવિનભાઈ શાહ", icon: "💡", badgeClass: "badge-committee", phone: "9825011008", portfolio: "લાઈટો & ઈલેક્ટ્રિકલ" },
  "24": { title: "કારોબારી સભ્ય", name: "શ્રી સુરેશભાઈ શાહ", icon: "⚖️", badgeClass: "badge-committee", phone: "9825012342", portfolio: "ક્લસ્ટર ૨ મેન્ટર" },
  "27": { title: "કારોબારી સભ્ય", name: "શ્રી જીતેન્દ્રભાઈ ત્રિવેદી", icon: "🌺", badgeClass: "badge-committee", phone: "9825011009", portfolio: "તહેવાર & સાંસ્કૃતિક ઉજવણી" },
  "31": { title: "૧ ખજાનચી (TREASURER)", name: "શ્રી મુકેશભાઈ પંડ્યા", icon: "🏦", badgeClass: "badge-treasurer", phone: "9825011004", portfolio: "મેઈન્ટેનન્સ & બેંક હિસાબો" },
  "34": { title: "કારોબારી સભ્ય", name: "શ્રી સંજયભાઈ બારોટ", icon: "🚗", badgeClass: "badge-committee", phone: "9825011010", portfolio: "પાર્કિંગ વ્યવસ્થા" },
  "38": { title: "કારોબારી સભ્ય", name: "શ્રી નરેન્દ્રભાઈ રાણા", icon: "🌳", badgeClass: "badge-committee", phone: "9825011011", portfolio: "બગીચો & પર્યાવરણ" }
};

// 16 Streetlights positioned along society roads
const STREETLIGHTS = [
  { id: "SL-01", line: "line-1", name: "મુખ્ય પ્રવેશદ્વાર સ્ટ્રીટ લાઈટ", loc: "Main Security Gate Entry (D Mart Rd)", x: 260, y: 70, status: "Active (45W LED)" },
  { id: "SL-02", line: "line-1", name: "લાઈન ૧ ઉત્તર જંકશન લાઈટ", loc: "Line 1 North-West Corner", x: 190, y: 130, status: "Active (45W LED)" },
  { id: "SL-03", line: "line-1", name: "લાઈન ૧ મધ્ય લાઈટ", loc: "Line 1 Central Road", x: 340, y: 140, status: "Active (45W LED)" },
  { id: "SL-04", line: "line-2", name: "સેન્ટ્રલ સર્કલ ઉત્તર લાઈટ", loc: "Central Circle Crossroad North", x: 380, y: 220, status: "Active (45W LED)" },
  { id: "SL-05", line: "line-2", name: "લાઈન ૨ પશ્ચિમ લાઈટ", loc: "Line 2 West End Corner", x: 140, y: 220, status: "Active (45W LED)" },
  { id: "SL-06", line: "line-2", name: "શિવ મંદિર એપ્રોચ લાઈટ", loc: "Line 2 near Temple Path", x: 90, y: 280, status: "Active (45W LED)" },
  { id: "SL-07", line: "line-3", name: "લાઈન ૩ પશ્ચિમ લાઈટ", loc: "Line 3 West End", x: 120, y: 360, status: "Active (45W LED)" },
  { id: "SL-08", line: "line-3", name: "લાઈન ૩ મધ્ય લાઈટ", loc: "Line 3 Central Road", x: 240, y: 370, status: "Active (45W LED)" },
  { id: "SL-09", line: "line-3", name: "સેન્ટ્રલ સર્કલ દક્ષિણ લાઈટ", loc: "Central Circle South Crossroad", x: 390, y: 340, status: "Active (45W LED)" },
  { id: "SL-10", line: "line-4", name: "લાઈન ૪ ઉત્તર લાઈટ", loc: "Line 4 Entrance Road", x: 490, y: 260, status: "Active (45W LED)" },
  { id: "SL-11", line: "line-4", name: "લાઈન ૪ સેન્ટ્રલ લાઈટ", loc: "Line 4 Mid Block", x: 530, y: 350, status: "Active (45W LED)" },
  { id: "SL-12", line: "line-4", name: "લાઈન ૪ દક્ષિણ લાઈટ", loc: "Line 4 South Junction", x: 440, y: 440, status: "Active (45W LED)" },
  { id: "SL-13", line: "line-5", name: "શિવમ ડુપ્લેક્સ પાર્ક ગેટ લાઈટ", loc: "Park Main Entrance", x: 670, y: 360, status: "Active (60W High-Mast LED)" },
  { id: "SL-14", line: "line-5", name: "પાર્ક વોકિંગ ટ્રેક લાઈટ", loc: "Inside Central Garden Lawn", x: 740, y: 440, status: "Active (45W LED)" },
  { id: "SL-15", line: "line-5", name: "લાઈન ૫ દક્ષિણ જંકશન લાઈટ", loc: "Line 5 South-West Entrance", x: 310, y: 520, status: "Active (45W LED)" },
  { id: "SL-16", line: "line-5", name: "સોસાયટી અંતિમ છેડો લાઈટ", loc: "Line 5 South Boundary Gate", x: 250, y: 640, status: "Active (45W LED)" }
];

// Coordinates for all 40 duplex blocks matching society street geometry
const DUPLEX_COORDS = {
  // Line 1: North Lane (D-01 to D-08)
  "01": { x: 220, y: 90, w: 42, h: 32, line: "line-1" },
  "02": { x: 268, y: 96, w: 42, h: 32, line: "line-1" },
  "03": { x: 316, y: 104, w: 42, h: 32, line: "line-1" },
  "04": { x: 364, y: 112, w: 42, h: 32, line: "line-1" },
  "05": { x: 200, y: 140, w: 42, h: 32, line: "line-1" },
  "06": { x: 248, y: 146, w: 42, h: 32, line: "line-1" },
  "07": { x: 296, y: 154, w: 42, h: 32, line: "line-1" },
  "08": { x: 344, y: 162, w: 42, h: 32, line: "line-1" },

  // Line 2: West Lane 1 (D-09 to D-16)
  "09": { x: 80,  y: 200, w: 42, h: 32, line: "line-2" },
  "10": { x: 128, y: 204, w: 42, h: 32, line: "line-2" },
  "11": { x: 176, y: 208, w: 42, h: 32, line: "line-2" },
  "12": { x: 224, y: 212, w: 42, h: 32, line: "line-2" },
  "13": { x: 74,  y: 248, w: 42, h: 32, line: "line-2" },
  "14": { x: 122, y: 252, w: 42, h: 32, line: "line-2" },
  "15": { x: 170, y: 256, w: 42, h: 32, line: "line-2" },
  "16": { x: 218, y: 260, w: 42, h: 32, line: "line-2" },

  // Line 3: West Lane 2 (D-17 to D-24)
  "17": { x: 90,  y: 310, w: 42, h: 32, line: "line-3" },
  "18": { x: 138, y: 314, w: 42, h: 32, line: "line-3" },
  "19": { x: 186, y: 318, w: 42, h: 32, line: "line-3" },
  "20": { x: 234, y: 322, w: 42, h: 32, line: "line-3" },
  "21": { x: 96,  y: 358, w: 42, h: 32, line: "line-3" },
  "22": { x: 144, y: 362, w: 42, h: 32, line: "line-3" },
  "23": { x: 192, y: 366, w: 42, h: 32, line: "line-3" },
  "24": { x: 240, y: 370, w: 42, h: 32, line: "line-3" },

  // Line 4: Central Lane (D-25 to D-32)
  "25": { x: 420, y: 190, w: 42, h: 32, line: "line-4" },
  "26": { x: 468, y: 200, w: 42, h: 32, line: "line-4" },
  "27": { x: 516, y: 210, w: 42, h: 32, line: "line-4" },
  "28": { x: 564, y: 220, w: 42, h: 32, line: "line-4" },
  "29": { x: 430, y: 270, w: 42, h: 32, line: "line-4" },
  "30": { x: 478, y: 280, w: 42, h: 32, line: "line-4" },
  "31": { x: 526, y: 290, w: 42, h: 32, line: "line-4" },
  "32": { x: 574, y: 300, w: 42, h: 32, line: "line-4" },

  // Line 5: Parkside Lane (D-33 to D-40)
  "33": { x: 380, y: 410, w: 42, h: 32, line: "line-5" },
  "34": { x: 428, y: 424, w: 42, h: 32, line: "line-5" },
  "35": { x: 476, y: 438, w: 42, h: 32, line: "line-5" },
  "36": { x: 524, y: 452, w: 42, h: 32, line: "line-5" },
  "37": { x: 260, y: 490, w: 42, h: 32, line: "line-5" },
  "38": { x: 280, y: 536, w: 42, h: 32, line: "line-5" },
  "39": { x: 260, y: 580, w: 42, h: 32, line: "line-5" },
  "40": { x: 230, y: 624, w: 42, h: 32, line: "line-5" }
};

let mapNightMode = false;
let activeLineFilter = "all";
let highlightedFlat = null;

// Initialize Society Map
window.initSocietyMap = function(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  renderMapInterface(container);
  setupMapEventListeners();
};

function renderMapInterface(container) {
  container.innerHTML = `
    <div class="society-map-wrapper ${mapNightMode ? 'night-mode' : 'day-mode'}">
      <!-- Map Header & Controls -->
      <div class="map-controls-bar">
        <div class="map-title-wrap">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:24px;">🗺️</span>
            <div>
              <div style="font-size:17px;font-weight:900;color:#ffffff;">શિવમ ડુપ્લેક્સ 3D સોસાયટી મેપ</div>
              <div style="font-size:12px;color:var(--misty-sky);">Satellite Layout · Streetlights · Lines &amp; Committee Guardians</div>
            </div>
          </div>
        </div>

        <div class="map-toolbar-actions">
          <!-- House Selector -->
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:12px;font-weight:700;color:var(--misty-sky);">ઘર શોધો:</span>
            <select id="map-flat-select" class="map-select-pill">
              <option value="">બધા ઘરો (All 40)</option>
              ${Object.keys(DUPLEX_COORDS).sort().map(f => `<option value="${f}">ડુપ્લેક્સ ${f}</option>`).join("")}
            </select>
          </div>

          <!-- Line Filter -->
          <div class="map-line-pills">
            <button class="map-pill-btn active" data-line="all">બધી શેરીઓ</button>
            <button class="map-pill-btn" data-line="line-1">લાઈન ૧ (ઉત્તર)</button>
            <button class="map-pill-btn" data-line="line-2">લાઈન ૨ (પશ્ચિમ ૧)</button>
            <button class="map-pill-btn" data-line="line-3">લાઈન ૩ (પશ્ચિમ ૨)</button>
            <button class="map-pill-btn" data-line="line-4">લાઈન ૪ (મધ્ય)</button>
            <button class="map-pill-btn" data-line="line-5">લાઈન ૫ (પાર્ક)</button>
          </div>

          <!-- Night / Day Lighting Toggle -->
          <button id="btn-toggle-night" class="map-pill-btn night-toggle-btn" title="Toggle Night & Streetlight Glow">
            ${mapNightMode ? '☀️ દિવસ મોડ (Day)' : '🌙 રાત્રિ મોડ & લાઈટો (Night)'}
          </button>
        </div>
      </div>

      <!-- Line Incharge Alert Banner -->
      <div id="map-line-incharge-banner" class="map-incharge-banner" style="display:none;"></div>

      <!-- SVG Map Canvas -->
      <div class="map-canvas-container">
        <svg id="society-svg-canvas" viewBox="0 0 880 720" class="society-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <!-- Gradients -->
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#24323f"/>
              <stop offset="100%" stop-color="#1a252f"/>
            </linearGradient>
            <linearGradient id="parkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(168,181,138,0.3)"/>
              <stop offset="100%" stop-color="rgba(34,197,94,0.18)"/>
            </linearGradient>
            <radialGradient id="lightCone" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(253,224,71,0.95)"/>
              <stop offset="40%" stop-color="rgba(250,204,21,0.5)"/>
              <stop offset="100%" stop-color="rgba(250,204,21,0)"/>
            </radialGradient>
            <filter id="glowGold" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>

          <!-- Society Boundary Polygon (Matches Google Maps Outline) -->
          <path d="M 240,40 Q 280,35 340,65 L 450,110 Q 520,160 550,220 L 610,260 Q 640,290 730,320 Q 820,380 840,450 Q 820,530 750,530 Q 670,490 620,440 L 460,430 Q 380,480 340,560 Q 280,680 230,700 Q 180,670 190,580 Q 210,480 240,440 L 170,420 Q 80,410 60,340 Q 40,250 80,180 Q 140,110 240,40 Z"
                class="society-boundary-path"/>

          <!-- Society Roads & Streets -->
          <!-- Main Entrance Road from D Mart Rd -->
          <path d="M 260,40 L 260,130 Q 300,160 380,190 L 390,340 L 440,440 L 320,530 L 260,680" class="society-road main-road"/>
          <!-- Line 1 Road -->
          <path d="M 190,135 L 370,135" class="society-road sub-road road-line-1"/>
          <!-- Line 2 Road -->
          <path d="M 70,240 L 240,240" class="society-road sub-road road-line-2"/>
          <!-- Line 3 Road -->
          <path d="M 80,350 L 250,350" class="society-road sub-road road-line-3"/>
          <!-- Line 4 Road -->
          <path d="M 400,240 L 590,250" class="society-road sub-road road-line-4"/>
          <!-- Line 5 Road to Park -->
          <path d="M 420,380 L 680,390" class="society-road sub-road road-line-5"/>

          <!-- Shivam Duplex Central Park (East Wing) -->
          <g class="society-landmark" id="landmark-park" onclick="openLandmarkModal('park')">
            <path d="M 640,340 Q 750,320 810,380 Q 830,460 760,500 Q 680,490 630,420 Z" class="park-polygon"/>
            <text x="720" y="420" class="landmark-text park-text">🌳 શિવમ ડુપ્લેક્સ પાર્ક</text>
            <text x="720" y="438" class="landmark-subtext">(Central Green Lawn)</text>
          </g>

          <!-- Lord Shiva Mandir (West Wing) -->
          <g class="society-landmark" id="landmark-temple" onclick="openLandmarkModal('temple')">
            <rect x="35" y="270" width="45" height="40" rx="8" class="temple-box"/>
            <text x="57" y="296" text-anchor="middle" font-size="18">🛕</text>
            <text x="57" y="324" text-anchor="middle" class="landmark-micro-text">શિવ મંદિર</text>
          </g>

          <!-- Main Entrance Security Gate -->
          <g class="society-landmark" id="landmark-gate" onclick="openLandmarkModal('gate')">
            <rect x="230" y="45" width="60" height="24" rx="6" class="gate-box"/>
            <text x="260" y="61" text-anchor="middle" class="gate-text">🚪 મુખ્ય ગેટ (D Mart Rd)</text>
          </g>

          <!-- Duplex Houses Group -->
          <g id="duplex-houses-group">
            ${renderDuplexRectangles()}
          </g>

          <!-- Streetlights Layer -->
          <g id="streetlights-group">
            ${renderStreetlightElements()}
          </g>
        </svg>

        <!-- Map Legend Floating Strip -->
        <div class="map-legend-overlay">
          <div class="legend-item"><span class="legend-dot" style="background:#fde047;box-shadow:0 0 8px #fde047;"></span> 👑 કમિટી હોદ્દેદારનું ઘર</div>
          <div class="legend-item"><span class="legend-dot" style="background:#60a5fa;"></span> 🏡 સામાન્ય ડુપ્લેક્સ</div>
          <div class="legend-item"><span class="legend-dot" style="background:#fbbf24;border-radius:50%;"></span> 💡 સ્ટ્રીટ લાઈટ (Active)</div>
          <div class="legend-item"><span class="legend-dot" style="background:#22c55e;"></span> 🌳 સોસાયટી બગીચો</div>
        </div>
      </div>
    </div>

    <!-- Inspector Modal / Drawer for House or Streetlight -->
    <div id="map-inspector-modal" class="map-modal-overlay hidden">
      <div class="map-modal-card">
        <div class="map-modal-header">
          <div id="inspector-title" style="font-size:18px;font-weight:900;color:#fff;">વિગતો</div>
          <button type="button" class="modal-close" onclick="closeMapInspector()">✕</button>
        </div>
        <div id="inspector-body" class="map-modal-body"></div>
      </div>
    </div>
  `;
}

function renderDuplexRectangles() {
  return Object.keys(DUPLEX_COORDS).map(flat => {
    const c = DUPLEX_COORDS[flat];
    const isComm = COMMITTEE_HOUSES[flat];
    const lineObj = SOCIETY_LINES.find(l => l.id === c.line);
    const borderColor = isComm ? "#fde047" : (lineObj ? lineObj.color : "#94a3b8");

    return `
      <g class="duplex-unit-node ${isComm ? 'comm-unit' : ''} ${c.line}"
         id="duplex-node-${flat}"
         data-flat="${flat}"
         data-line="${c.line}"
         onclick="openHouseInspector('${flat}')">
        <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="6"
              class="duplex-rect ${isComm ? 'duplex-comm-rect' : ''}"
              style="stroke:${borderColor};"/>
        <text x="${c.x + c.w/2}" y="${c.y + c.h/2 + 4}" class="duplex-label">
          ${isComm ? isComm.icon + ' ' : ''}${flat}
        </text>
      </g>
    `;
  }).join("");
}

function renderStreetlightElements() {
  return STREETLIGHTS.map(sl => `
    <g class="streetlight-node ${sl.line}" id="sl-node-${sl.id}" onclick="openStreetlightInspector('${sl.id}')">
      <!-- Glow cone in night mode -->
      <circle cx="${sl.x}" cy="${sl.y}" r="26" class="sl-light-halo" style="display:${mapNightMode ? 'block' : 'none'};"/>
      <!-- Pole head -->
      <circle cx="${sl.x}" cy="${sl.y}" r="7" class="sl-bulb"/>
      <text x="${sl.x}" y="${sl.y + 3.5}" text-anchor="middle" font-size="9" font-weight="900" fill="#1e293b">💡</text>
    </g>
  `).join("");
}

function setupMapEventListeners() {
  // Flat picker
  const flatSelect = document.getElementById("map-flat-select");
  if (flatSelect) {
    flatSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val) {
        highlightDuplex(val);
        openHouseInspector(val);
      } else {
        clearHighlights();
      }
    });
  }

  // Line filter buttons
  document.querySelectorAll(".map-line-pills button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".map-line-pills button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const line = btn.dataset.line;
      activeLineFilter = line;
      filterByLine(line);
    });
  });

  // Night Mode Toggle
  const nightBtn = document.getElementById("btn-toggle-night");
  if (nightBtn) {
    nightBtn.addEventListener("click", () => {
      mapNightMode = !mapNightMode;
      const wrap = document.querySelector(".society-map-wrapper");
      if (wrap) {
        wrap.classList.toggle("night-mode", mapNightMode);
        wrap.classList.toggle("day-mode", !mapNightMode);
      }
      nightBtn.innerHTML = mapNightMode ? '☀️ દિવસ મોડ (Day)' : '🌙 રાત્રિ મોડ & લાઈટો (Night)';
      document.querySelectorAll(".sl-light-halo").forEach(halo => {
        halo.style.display = mapNightMode ? 'block' : 'none';
      });
    });
  }

  // Backdrop click and Escape key to close inspector
  const inspectorModal = document.getElementById("map-inspector-modal");
  if (inspectorModal) {
    inspectorModal.addEventListener("click", (e) => {
      if (e.target === inspectorModal) closeMapInspector();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMapInspector();
  });
}

function filterByLine(lineId) {
  const inchargeBanner = document.getElementById("map-line-incharge-banner");
  if (lineId === "all") {
    document.querySelectorAll(".duplex-unit-node").forEach(n => n.style.opacity = "1");
    document.querySelectorAll(".streetlight-node").forEach(n => n.style.opacity = "1");
    if (inchargeBanner) inchargeBanner.style.display = "none";
    return;
  }

  const lineObj = SOCIETY_LINES.find(l => l.id === lineId);
  if (lineObj && inchargeBanner) {
    inchargeBanner.style.display = "flex";
    inchargeBanner.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;width:100%;justify-content:space-between;">
        <div>
          <span style="font-size:11px;font-weight:800;color:var(--sage-leaf);text-transform:uppercase;">${lineObj.name}</span>
          <div style="font-size:15px;font-weight:800;color:#fff;margin-top:2px;">
            આ લાઇનના કમિટી ઇન્ચાર્જ: <strong style="color:#fde047;">${lineObj.incharge.name}</strong> (ડુપ્લેક્સ નં. ${lineObj.incharge.house})
          </div>
          <div style="font-size:12px;color:var(--misty-sky);">${lineObj.incharge.role} · મકાનો: ${lineObj.duplexes.join(", ")}</div>
        </div>
        <div style="display:flex;gap:8px;">
          <a href="tel:${lineObj.incharge.phone}" class="quick-action-btn" style="padding:6px 14px;font-size:12px;">📞 Call Incharge</a>
          <a href="https://wa.me/91${lineObj.incharge.phone}?text=Hello%20${encodeURIComponent(lineObj.incharge.name)},%20I%20am%20from%20Shivam%20Duplex%20" target="_blank" class="quick-action-btn green" style="padding:6px 14px;font-size:12px;">💬 WhatsApp</a>
        </div>
      </div>
    `;
  }

  // Fade out other units
  document.querySelectorAll(".duplex-unit-node").forEach(n => {
    n.style.opacity = (n.dataset.line === lineId) ? "1" : "0.2";
  });
  document.querySelectorAll(".streetlight-node").forEach(n => {
    n.style.opacity = n.classList.contains(lineId) ? "1" : "0.25";
  });
}

function highlightDuplex(flat) {
  clearHighlights();
  const node = document.getElementById(`duplex-node-${flat}`);
  if (node) {
    node.classList.add("selected-pulse");
    highlightedFlat = flat;
  }
}

function clearHighlights() {
  document.querySelectorAll(".duplex-unit-node").forEach(n => n.classList.remove("selected-pulse"));
  highlightedFlat = null;
}

// House Inspector Popup
window.openHouseInspector = async function(flat) {
  highlightDuplex(flat);
  const modal = document.getElementById("map-inspector-modal");
  const title = document.getElementById("inspector-title");
  const body = document.getElementById("inspector-body");
  if (!modal || !body) return;

  modal.classList.remove("hidden");
  title.innerHTML = `🏡 ડુપ્લેક્સ નં. ${flat} — વિગતો`;
  body.innerHTML = `<div style="text-align:center;padding:20px;color:var(--misty-sky);">વિગતો લોડ થઈ રહી છે...</div>`;

  const isComm = COMMITTEE_HOUSES[flat];
  const c = DUPLEX_COORDS[flat];
  const lineObj = SOCIETY_LINES.find(l => l.id === c.line);

  // Try to find member in live database or fallback
  let member = null;
  try {
    if (typeof getAll === "function") {
      const allMembers = await getAll("sd_members");
      member = allMembers.find(m => (m.flatNumber||"").toLowerCase().trim() === flat.toLowerCase().trim());
    }
  } catch(e) {}

  const ownerName = member ? member.ownerName : (isComm ? isComm.name : `શ્રી સભાસદ (ડુપ્લેક્સ ${flat})`);
  const contact = member ? member.contactNumber : (isComm ? isComm.phone : "98250 11000");
  const designation = member ? (member.designation || (isComm ? isComm.title : "ઘર માલિક")) : (isComm ? isComm.title : "ઘર માલિક");
  const isRented = member ? (member.hasTenant || !!member.tenantName) : false;
  const car = member ? member.carNumber : "—";
  const bike = member ? member.bikeNumber : "—";
  const profession = member?.profession || (isComm ? "કારોબારી પદાધિકારી / બિઝનેસ" : "સરકારી / પ્રાઇવેટ જોબ");

  body.innerHTML = `
    <!-- Top Identity Card -->
    <div style="background:rgba(21,29,36,0.7);border:1.5px solid rgba(169,183,198,0.25);border-radius:12px;padding:16px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
        <span style="font-size:16px;font-weight:900;color:#fff;">ડુપ્લેક્સ નં. ${flat}</span>
        <span class="${isComm ? isComm.badgeClass : 'badge badge-owner'}">${isComm ? isComm.icon + ' ' : ''}${designation}</span>
      </div>
      <div style="font-size:14px;color:#fff;font-weight:800;margin-bottom:2px;">
        👤 ઘર માલિક: ${ownerName}
      </div>
      <div style="font-size:12.5px;color:var(--misty-sky);">
        📞 સંપર્ક: <strong>${contact}</strong> · 💼 વ્યવસાય: ${profession}
      </div>
    </div>

    <!-- Line / Street Allocation & Line Guardian -->
    <div style="background:linear-gradient(135deg,rgba(168,181,138,0.15) 0%,rgba(45,58,71,0.6) 100%);border:1px solid rgba(168,181,138,0.35);border-radius:12px;padding:14px;margin-bottom:14px;">
      <div style="font-size:11px;font-weight:800;color:var(--sage-leaf);text-transform:uppercase;">
        📍 સોસાયટી લાઇન: ${lineObj ? lineObj.name : 'મધ્ય રોડ'}
      </div>
      ${lineObj ? `
        <div style="font-size:13.5px;font-weight:800;color:#fff;margin:4px 0 2px;">
          આ લાઇનના કમિટી ઇન્ચાર્જ: <strong style="color:#fde047;">${lineObj.incharge.name}</strong> (ડુપ્લેક્સ ${lineObj.incharge.house})
        </div>
        <div style="font-size:12px;color:var(--misty-sky);margin-bottom:10px;">
          કોઈપણ ફરિયાદ કે સહાય માટે તમારા લાઇન ઇન્ચાર્જનો સીધો સંપર્ક કરો:
        </div>
        <div style="display:flex;gap:8px;">
          <a href="tel:${lineObj.incharge.phone}" class="quick-action-btn" style="padding:6px 14px;font-size:12px;">📞 Call Incharge</a>
          <a href="https://wa.me/91${lineObj.incharge.phone}?text=Hello%20${encodeURIComponent(lineObj.incharge.name)},%20I%20am%20from%20Shivam%20Duplex%20House%20${flat}" target="_blank" class="quick-action-btn green" style="padding:6px 14px;font-size:12px;">💬 WhatsApp</a>
        </div>
      ` : ''}
    </div>

    <!-- Vehicles & Occupancy -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;font-size:12.5px;">
      <div style="background:rgba(21,29,36,0.6);border:1px solid rgba(169,183,198,0.2);border-radius:10px;padding:10px;">
        <span style="color:var(--misty-sky);display:block;font-size:11px;font-weight:700;">🚗 રજીસ્ટર્ડ કાર:</span>
        <strong style="color:var(--sage-leaf);">${car}</strong>
      </div>
      <div style="background:rgba(21,29,36,0.6);border:1px solid rgba(169,183,198,0.2);border-radius:10px;padding:10px;">
        <span style="color:var(--misty-sky);display:block;font-size:11px;font-weight:700;">🛵 ટુ-વ્હીલર:</span>
        <strong style="color:var(--misty-sky);">${bike}</strong>
      </div>
    </div>

    <!-- Tenant Status if Rented -->
    ${isRented ? `
      <div style="background:rgba(226,149,120,0.15);border:1px solid rgba(226,149,120,0.35);border-radius:10px;padding:12px;margin-bottom:14px;font-size:12.5px;">
        <div style="font-weight:800;color:var(--blush-petal);margin-bottom:4px;">🔑 ભાડુઆત માહિતી (Tenant KYC Verified):</div>
        <div>નામ: <strong>${member?.tenantName || "નોંધાયેલ"}</strong></div>
        <div>સંપર્ક: <strong>${member?.tenantContact || "—"}</strong></div>
        <div style="font-size:11px;color:var(--misty-sky);margin-top:4px;">Aadhaar &amp; Agreement કમિટી રેકોર્ડમાં માન્ય છે.</div>
      </div>
    ` : `
      <div style="font-size:11.5px;color:var(--sage-leaf);margin-bottom:14px;">
        ✓ મકાનમાલિક પોતે રહે છે (Owner Residing)
      </div>
    `}

    <div style="display:flex;gap:8px;">
      <a href="tel:${contact}" class="quick-action-btn" style="padding:8px 16px;font-size:12px;">📞 Call Owner</a>
      <a href="https://wa.me/91${contact.replace(/\\D/g,'')}?text=Namaste%20from%20Shivam%20Duplex" target="_blank" class="quick-action-btn green" style="padding:8px 16px;font-size:12px;">💬 WhatsApp</a>
    </div>
  `;
};

// Streetlight Inspector Popup
window.openStreetlightInspector = function(slId) {
  const modal = document.getElementById("map-inspector-modal");
  const title = document.getElementById("inspector-title");
  const body = document.getElementById("inspector-body");
  if (!modal || !body) return;

  const sl = STREETLIGHTS.find(s => s.id === slId);
  if (!sl) return;

  const lineObj = SOCIETY_LINES.find(l => l.id === sl.line);
  modal.classList.remove("hidden");
  title.innerHTML = `💡 સ્ટ્રીટ લાઈટ: ${sl.id}`;

  body.innerHTML = `
    <div style="background:rgba(21,29,36,0.7);border:1.5px solid rgba(250,204,21,0.4);border-radius:12px;padding:16px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <span style="font-size:32px;">💡</span>
        <div>
          <div style="font-size:16px;font-weight:900;color:#fff;">${sl.name}</div>
          <div style="font-size:12px;color:var(--sage-leaf);font-weight:700;">સ્થિતિ: ${sl.status}</div>
        </div>
      </div>
      <div style="font-size:13px;color:var(--misty-sky);margin-top:6px;">
        📍 સ્થાન: <strong>${sl.loc}</strong>
      </div>
      <div style="font-size:12.5px;color:var(--misty-sky);margin-top:4px;">
        🏛 લાઈન: ${lineObj ? lineObj.name : "સામાન્ય જગ્યા"}
      </div>
    </div>

    <!-- Electrical Incharge -->
    <div style="background:rgba(21,29,36,0.5);border:1px solid rgba(169,183,198,0.25);border-radius:10px;padding:12px;margin-bottom:14px;font-size:12.5px;">
      <div style="font-weight:800;color:#fde047;margin-bottom:4px;">💡 ઈલેક્ટ્રિકલ &amp; લાઈટિંગ ઇન્ચાર્જ:</div>
      <div>શ્રી ભાવિનભાઈ શાહ (ડુપ્લેક્સ નં. ૨૩)</div>
      <div style="color:var(--misty-sky);margin-top:2px;">જો આ સ્ટ્રીટ લાઈટ બંધ હોય તો તાત્કાલિક જાણ કરો:</div>
      <div style="margin-top:10px;display:flex;gap:8px;">
        <a href="tel:9825011008" class="quick-action-btn" style="padding:6px 14px;font-size:12px;">📞 Call 98250 11008</a>
        <a href="https://wa.me/919825011008?text=Hello%20Bhavinbhai,%20Streetlight%20${sl.id}%20(${encodeURIComponent(sl.loc)})%20needs%20attention." target="_blank" class="quick-action-btn green" style="padding:6px 14px;font-size:12px;">💬 Report Issue</a>
      </div>
    </div>
  `;
};

// Landmarks Popup
window.openLandmarkModal = function(type) {
  const modal = document.getElementById("map-inspector-modal");
  const title = document.getElementById("inspector-title");
  const body = document.getElementById("inspector-body");
  if (!modal || !body) return;

  modal.classList.remove("hidden");

  if (type === "park") {
    title.innerHTML = "🌳 શિવમ ડુપ્લેક્સ સેન્ટ્રલ પાર્ક";
    body.innerHTML = `
      <div style="background:rgba(168,181,138,0.18);border:1.5px solid rgba(168,181,138,0.4);border-radius:12px;padding:16px;margin-bottom:14px;">
        <h3 style="color:#fff;margin:0 0 6px;">શિવમ ડુપ્લેક્સ સોસાયટી ગાર્ડન</h3>
        <p style="font-size:13px;color:var(--misty-sky);margin:0;line-height:1.6;">
          સોસાયટીના તમામ પરિવારો માટે હરિયાળો બગીચો, વોકિંગ ટ્રેક અને બાળકો માટે હિંચકા-લપસિયાની સુવિધા. દરરોજ સાંજે બાળકો અને વડીલો માટે ખુલ્લું.
        </p>
      </div>
      <div style="font-size:13px;color:var(--misty-sky);line-height:1.6;">
        🌱 <strong>બગીચો &amp; પર્યાવરણ ઇન્ચાર્જ:</strong> શ્રી નરેન્દ્રભાઈ રાણા (ડુપ્લેક્સ ૩૮)<br/>
        📞 <strong>સંપર્ક:</strong> +91 98250 11011
      </div>
    `;
  } else if (type === "temple") {
    title.innerHTML = "🛕 સોસાયટી શિવ મંદિર &amp; પ્રાર્થના સ્થળ";
    body.innerHTML = `
      <div style="background:rgba(234,179,8,0.15);border:1.5px solid rgba(234,179,8,0.4);border-radius:12px;padding:16px;margin-bottom:14px;">
        <h3 style="color:#fff;margin:0 0 6px;">॥ ॐ नमः शिवाय ॥</h3>
        <p style="font-size:13px;color:var(--misty-sky);margin:0;line-height:1.6;">
          શિવમ ડુપ્લેક્સ સોસાયટીનું પવિત્ર શિવ મંદિર. દરરોજ સવારે-સાંજે આરતી, શ્રાવણ માસ પૂજન અને મહાશિવરાત્રિ ઉત્સવ અહીં ધામધૂમથી ઉજવાય છે.
        </p>
      </div>
      <div style="font-size:13px;color:var(--misty-sky);">
        🌺 <strong>તહેવાર સમિતિ ઇન્ચાર્જ:</strong> શ્રી જીતેન્દ્રભાઈ ત્રિવેદી (ડુપ્લેક્સ ૨૭) · 📞 98250 11009
      </div>
    `;
  } else if (type === "gate") {
    title.innerHTML = "🚪 સોસાયટી મુખ્ય પ્રવેશદ્વાર &amp; સિક્યુરિટી";
    body.innerHTML = `
      <div style="background:rgba(21,29,36,0.7);border:1.5px solid rgba(169,183,198,0.3);border-radius:12px;padding:16px;margin-bottom:14px;">
        <h3 style="color:#fff;margin:0 0 6px;">૨૪×૭ સિક્યુરિટી ગેટ (D Mart Rd)</h3>
        <p style="font-size:13px;color:var(--misty-sky);margin:0;line-height:1.6;">
          સીસીટીવી સર્વેલન્સ, બૂમ બેરિયર અને વિઝિટર એન્ટ્રી રજીસ્ટર સાથે સજ્જ.
        </p>
      </div>
      <div style="font-size:13px;color:var(--misty-sky);">
        🛡️ <strong>સિક્યુરિટી ઇન્ચાર્જ:</strong> શ્રી હરેશભાઈ જોશી (ડુપ્લેક્સ ૧૪) · 📞 98250 11006
      </div>
    `;
  }
};

window.closeMapInspector = function() {
  const modal = document.getElementById("map-inspector-modal");
  if (modal) modal.classList.add("hidden");
  clearHighlights();
};
