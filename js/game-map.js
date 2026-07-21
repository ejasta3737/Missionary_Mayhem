/************************************
 * Country Map Game
 ************************************/

let mapTimerInterval = null;

/************************************
 * Round Setup
 ************************************/
function resetCountryRoundQueue() {
  // Shuffle all countries, then take only the first N
  const shuffled = shuffledCopy(countries);
  state.countryQueue = shuffled.slice(0, MAP_COUNTRIES_PER_ROUND);
}

function startFirstCountryRound() {
  resetCountryRoundQueue();
  state.mapRoundActive = true;
  loadNextCountry();
}

function loadNextCountry() {
  clearMarkers();
  mapFeedbackEl.textContent = "";

  if (!state.countryQueue || state.countryQueue.length === 0) {
    // Round done
    state.mapRoundActive = false;
    state.mapCurrent = null;
    mapQuestionEl.textContent = "Round complete! Returning to lobby...";
    if (mapTimerInterval) {
      clearInterval(mapTimerInterval);
      mapTimerInterval = null;
    }
    setTimeout(() => showScreen("screen-lobby"), 1500);
    return;
  }

  // Next country from queue
  state.mapCurrent = state.countryQueue.shift();
  mapQuestionEl.textContent =
    `Tap: ${state.mapCurrent.name} (Region: ${state.mapCurrent.region})`;

  if (mapTimerInterval) clearInterval(mapTimerInterval);
  const start = performance.now();
  state.mapStartTime = start;
  mapTimerInterval = setInterval(() => {
    const now = performance.now();
    const elapsed = (now - start) / 1000;
    mapTimerEl.textContent = "Time: " + formatTime(elapsed) + " s";
  }, 100);
}

/************************************
 * Guess Handling
 ************************************/
function handleMapGuess(evt) {
  // If no round yet, start entire round (all countries)
  if (!state.mapRoundActive) {
    startFirstCountryRound();
    // Same click continues and counts as guess
  }

  if (!state.mapCurrent || !state.mapStartTime) {
    return;
  }

  const end = performance.now();
  const elapsedSec = (end - state.mapStartTime) / 1000;
  clearInterval(mapTimerInterval);
  mapTimerInterval = null;

  clearMarkers();

  const guessCountryName = findCountryByPoint(evt);
  const target = state.mapCurrent;

  // Distance-based fallback
  const guessLatLng = clickToLatLng(evt, worldMapImg);
  const distanceKm = haversineDistance(guessLatLng.lat, guessLatLng.lng, target.lat, target.lng);
  const distanceText = distanceKm.toFixed(0);

  // Marker positions
  const guessPx  = latLngToPixel(guessLatLng.lat, guessLatLng.lng, worldMapImg);
  const targetPx = latLngToPixel(target.lat, target.lng, worldMapImg);
  addMarker(guessPx.x, guessPx.y, "guess");
  addMarker(targetPx.x, targetPx.y, "target");

  let points = 0;
  let message;

  if (guessCountryName === target.name) {
    // Exact hit inside polygon
    points = 10;
    message =
      `Excellent! You clicked inside ${target.name}. Full 10 points in ${formatTime(elapsedSec)} s.`;
    mapFeedbackEl.classList.remove("incorrect");
    mapFeedbackEl.classList.add("correct");
  } else {
    // Distance-based scoring
    if (distanceKm <= 300) points = 10;
    else if (distanceKm <= 1000) points = 7;
    else if (distanceKm <= 3000) points = 4;
    else if (distanceKm <= 6000) points = 2;

    if (points > 0) {
      message =
        `Nice! You were about ${distanceText} km from ${target.name}. ` +
        `You earned ${points} point(s) in ${formatTime(elapsedSec)} s.`;
      mapFeedbackEl.classList.remove("incorrect");
      mapFeedbackEl.classList.add("correct");
    } else {
      message =
        `You were about ${distanceText} km away from ${target.name}. ` +
        `No points this time. Time: ${formatTime(elapsedSec)} s.`;
      mapFeedbackEl.classList.remove("correct");
      mapFeedbackEl.classList.add("incorrect");
    }
  }

  mapFeedbackEl.textContent = message;
  if (points > 0) updateMyScore(points);

  // Prepare for next country
  state.mapCurrent = null;
  state.mapStartTime = null;

  // Brief pause so they can see markers, then load next
  setTimeout(loadNextCountry, 900);
}

/************************************
 * Event wiring
 ************************************/

worldMapImg.addEventListener("click", handleMapGuess);