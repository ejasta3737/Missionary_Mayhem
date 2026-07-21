/************************************
 * CONFIG: adjust these to change round lengths
 ************************************/
const LANG_QUESTIONS_PER_ROUND = 5;       // language questions per round
const MAP_COUNTRIES_PER_ROUND  = 5;       // country questions per round
const SCRIPTURE_QUESTIONS_PER_ROUND = 5;  // scripture questions per round
const TEMPLE_QUESTIONS_PER_ROUND     = 5;

/************************************
 * Basic State (shared)
 ************************************/
const state = {
  username: null,
  myScore: 0,
  leaderboard: [
    { name: "DemoMissionary1", score: 15 },
    { name: "DemoMissionary2", score: 9 },
    { name: "DemoMissionary3", score: 7 },
  ],

  // language game
  langCurrent: null,
  langStartTime: null,
  langQueue: [],

  // map game
  mapCurrent: null,
  mapStartTime: null,
  countryQueue: [],
  mapRoundActive: false,

  // scripture game
  scriptureCurrent: null,
  scriptureStartTime: null,
  scriptureQueue: [],

  // temple game
  templeCurrent: null,
  templeStartTime: null,
  templeQueue: []
};

/************************************
 * DOM Elements (shared)
 ************************************/
const screenLogin     = document.getElementById("screen-login");
const screenLobby     = document.getElementById("screen-lobby");
const screenLanguage  = document.getElementById("screen-language");
const screenMap       = document.getElementById("screen-map");
const screenScripture = document.getElementById("screen-scripture");
const screenTemple    = document.getElementById("screen-temple");   // NEW

const navFooter       = document.getElementById("navFooter");

const usernameInput   = document.getElementById("usernameInput");
const btnStart        = document.getElementById("btnStart");
const headerUsername  = document.getElementById("headerUsername");
const myScoreEl       = document.getElementById("myScore");
const leaderboardList = document.getElementById("leaderboardList");

const navLobbyBtn     = document.getElementById("navLobby");
const navLanguageBtn  = document.getElementById("navLanguage");
const navMapBtn       = document.getElementById("navMap");
const navScriptureBtn = document.getElementById("navScripture");
const navTempleBtn    = document.getElementById("navTemple");       // NEW

// Map-specific shared DOM used by game-map.js
const mapTimerEl      = document.getElementById("mapTimer");
const mapQuestionEl   = document.getElementById("mapQuestion");
const mapFeedbackEl   = document.getElementById("mapFeedback");
const worldMapImg     = document.getElementById("worldMap");
const mapOverlay      = document.getElementById("mapOverlay");
const countryOverlay  = document.getElementById("countryOverlay");





/************************************
 * Data (shared across games)
 ************************************/
const languagePhrases = [
  { phrase: "Hola", meaning: "Hello", language: "Spanish" },
  { phrase: "Bonjour", meaning: "Hello", language: "French" },
  { phrase: "Olá", meaning: "Hello", language: "Portuguese" },
  { phrase: "Hallo", meaning: "Hello", language: "German" },
  { phrase: "Ciao", meaning: "Hello", language: "Italian" },
  { phrase: "Konnichiwa", meaning: "Hello", language: "Japanese" },
  { phrase: "你好 (Nǐ hǎo)", meaning: "Hello", language: "Mandarin Chinese" },

  { phrase: "Gracias", meaning: "Thank you", language: "Spanish" },
  { phrase: "Merci",   meaning: "Thank you", language: "French" },
  { phrase: "Obrigado/Obrigada", meaning: "Thank you", language: "Portuguese" },
  { phrase: "Danke",   meaning: "Thank you", language: "German" },
  { phrase: "Grazie",  meaning: "Thank you", language: "Italian" },

  { phrase: "Sí",   meaning: "Yes", language: "Spanish" },
  { phrase: "Oui",  meaning: "Yes", language: "French" },
  { phrase: "Sim",  meaning: "Yes", language: "Portuguese" },
  { phrase: "Ja",   meaning: "Yes", language: "German" },

  { phrase: "No",   meaning: "No", language: "Spanish" },
  { phrase: "Non",  meaning: "No", language: "French" },
  { phrase: "Não",  meaning: "No", language: "Portuguese" },
  { phrase: "Nein", meaning: "No", language: "German" },

  {
    phrase: "La Iglesia de Jesucristo de los Santos de los Últimos Días",
    meaning: "The Church of Jesus Christ of Latter-day Saints",
    language: "Spanish"
  },
  {
    phrase: "L'Église de Jésus-Christ des Saints des Derniers Jours",
    meaning: "The Church of Jesus Christ of Latter-day Saints",
    language: "French"
  },
  {
    phrase: "A Igreja de Jesus Cristo dos Santos dos Últimos Dias",
    meaning: "The Church of Jesus Christ of Latter-day Saints",
    language: "Portuguese"
  },
  {
    phrase: "Die Kirche Jesu Christi der Heiligen der Letzten Tage",
    meaning: "The Church of Jesus Christ of Latter-day Saints",
    language: "German"
  }
];

const languages = [
  "Spanish",
  "French",
  "Portuguese",
  "German",
  "Italian",
  "Japanese",
  "Mandarin Chinese",
  "English"
];

const temples = [
  { name: "Gila Valley",   image: "GilaValleyTemple.jpeg" },
  { name: "Mesa",          image: "MesaTemple.jpg" },
  { name: "Phoenix",       image: "PhoenixTemple.jpg" },
  { name: "Tucson",        image: "TucsonTemple.jpg" },
  { name: "Yuma",          image: "YumaTemple.jpg" },
  { name: "Snowflake",     image: "SnowflakeTemple.jpg" },
  { name: "Flagstaff",     image: "FlagstaffTemple.jpg" },
  { name: "Queen Creek",   image: "QueenCreekTemple.jpg" }
];

const countries = [
  { name: "Brazil",        region: "South America", lat: -14.2350, lng: -51.9253 },
  { name: "Mexico",        region: "North America", lat:  23.6345, lng: -102.5528 },
  { name: "United States", region: "North America", lat:  39.8283, lng: -98.5795 },
  { name: "Canada",        region: "North America", lat:  56.1304, lng: -106.3468 },
  { name: "France",        region: "Europe",        lat:  46.2276, lng:   2.2137 },
  { name: "Germany",       region: "Europe",        lat:  51.1657, lng:  10.4515 },
  { name: "Italy",         region: "Europe",        lat:  41.8719, lng:  12.5674 },
  { name: "Nigeria",       region: "Africa",        lat:   9.0820, lng:   8.6753 },
  { name: "South Africa",  region: "Africa",        lat: -30.5595, lng:  22.9375 },
  { name: "Japan",         region: "Asia",          lat:  36.2048, lng: 138.2529 },
  { name: "Philippines",   region: "Asia",          lat:  12.8797, lng: 121.7740 },
  { name: "Australia",     region: "Oceania",       lat: -25.2744, lng: 133.7751 }
];

const scriptures = [
  { prophet: "Nephi",         scripture_contents: "I will go and do the things which the Lord hath commanded", book: "1 Nephi",    chapter: 3, verse: 7 },
  { prophet: "Moses",         scripture_contents: "For behold, this is my work and my glory-to bring to pass the immortality and eternal life of man", book: "Moses",       chapter: 1, verse: 39 },
  { prophet: "Moses",         scripture_contents: "thou shalt love they neighbor as thyself", book: "Leviticus",  chapter: 19, verse: 18 },
  { prophet: "David",         scripture_contents: "Trust in the Lord with all thine heart", book: "Proverbs",   chapter: 3, verse: 5 },
  { prophet: "James",         scripture_contents: "If any of you lack wisdom, let him ask of God", book: "James",      chapter: 1, verse: 5 },
  { prophet: "John",          scripture_contents: "I saw another angel fly in the midst of heaven, having the everlasting gospel", book: "Revelation", chapter: 14, verse: 6 },
  { prophet: "Moroni",        scripture_contents: "And if men come unto me I will show unto them their weakness... and my grace is sufficient for all men that humble themselves before me", book: "Ether",      chapter: 12, verse: 27 },
  { prophet: "Amulek",        scripture_contents: "For behold, this life is the time for men to prepare to meet God", book: "Alma",       chapter: 34, verse: 32 },
  { prophet: "King Benjamin", scripture_contents: "Watch your yourselves, your thoughts, your words and yourdeeds", book: "Mosiah",     chapter: 4, verse: 30 },
  { prophet: "John",          scripture_contents: "For God so loved the world that He gave His Only Begotten Son", book: "John",       chapter: 3, verse: 16 }
];

/************************************
 * Utility Functions (shared)
 ************************************/
function showScreen(id) {
  [screenLogin, screenLobby, screenLanguage, screenMap, screenScripture, screenTemple].forEach(s => {
    if (s) s.classList.add("hidden");
  });
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

function updateHeaderUsername() {
  headerUsername.textContent = state.username || "Guest";
}

function updateMyScore(points = 0) {
  state.myScore += points;
  myScoreEl.textContent = state.myScore;
  const existing = state.leaderboard.find(p => p.name === state.username);
  if (existing) existing.score = state.myScore;
  else if (state.username) state.leaderboard.push({ name: state.username, score: state.myScore });
  renderLeaderboard();
}

function renderLeaderboard() {
  const sorted = [...state.leaderboard].sort((a, b) => b.score - a.score).slice(0, 10);
  leaderboardList.innerHTML = "";
  sorted.forEach(player => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${player.name}</span><span>${player.score}</span>`;
    leaderboardList.appendChild(li);
  });
}

function formatTime(seconds) {
  return seconds.toFixed(1);
}

// Map helpers (used by game-map.js)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function clickToLatLng(evt, img) {
  const rect = img.getBoundingClientRect();
  const x = evt.clientX - rect.left;
  const y = evt.clientY - rect.top;
  const lon = (x / rect.width) * 360 - 180;
  const lat = 90 - (y / rect.height) * 180;
  return { lat, lng: lon };
}

function latLngToPixel(lat, lng, img) {
  const rect = img.getBoundingClientRect();
  const x = ((lng + 180) / 360) * rect.width;
  const y = ((90 - lat) / 180) * rect.height;
  return { x, y };
}

function clearMarkers() {
  mapOverlay.innerHTML = "";
}

function addMarker(x, y, type) {
  const marker = document.createElement("div");
  marker.classList.add("marker", type);
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  mapOverlay.appendChild(marker);
}

function pointInPolygon(svgPoint, polygonElement) {
  const points = polygonElement.points;
  const x = svgPoint.x;
  const y = svgPoint.y;
  let inside = false;
  for (let i = 0, j = points.numberOfItems - 1; i < points.numberOfItems; j = i++) {
    const xi = points.getItem(i).x, yi = points.getItem(i).y;
    const xj = points.getItem(j).x, yj = points.getItem(j).y;
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi + 0.00001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function findCountryByPoint(evt) {
  const pt = countryOverlay.createSVGPoint();
  const rect = countryOverlay.getBoundingClientRect();
  pt.x = ((evt.clientX - rect.left) / rect.width) * 1000;
  pt.y = ((evt.clientY - rect.top) / rect.height) * 500;
  const shapesGroup = document.getElementById("shapes");
  for (const node of shapesGroup.children) {
    if (node.tagName.toLowerCase() === "polygon") {
      if (pointInPolygon(pt, node)) {
        return node.id.replace("shape-", "");
      }
    }
  }
  return null;
}

// General helper
function shuffledCopy(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/************************************
 * Login & Navigation (no game logic)
 ************************************/
btnStart.addEventListener("click", () => {
  const value = usernameInput.value.trim();
  if (!value) {
    alert("Please enter a username.");
    return;
  }
  state.username = value;
  updateHeaderUsername();
  navFooter.classList.remove("hidden");
  showScreen("screen-lobby");
  renderLeaderboard();
});

navLobbyBtn.addEventListener("click", () => showScreen("screen-lobby"));
navLanguageBtn.addEventListener("click", () => showScreen("screen-language"));
navScriptureBtn.addEventListener("click", () => showScreen("screen-scripture"));
navTempleBtn.addEventListener("click", () => showScreen("screen-temple"));

navMapBtn.addEventListener("click", () => {
  showScreen("screen-map");
  mapFeedbackEl.textContent = "";
  mapQuestionEl.textContent = "Tap anywhere to start a round.";
  clearMarkers();
  state.mapRoundActive = false;
  state.mapCurrent = null;
  state.countryQueue = [];
  mapTimerEl.textContent = "Time: 0.0 s";
});

/************************************
 * Init
 ************************************/
renderLeaderboard();
updateHeaderUsername();