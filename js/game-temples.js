/************************************
 * Temple Quiz Game
 ************************************/

// DOM elements for temple game
const templeTimerEl    = document.getElementById("templeTimer");
const templePromptEl   = document.getElementById("templePrompt");
const templeImageEl    = document.getElementById("templeImage");
const templeOptionsEl  = document.getElementById("templeOptions");
const templeFeedbackEl = document.getElementById("templeFeedback");
const btnTempleStart   = document.getElementById("btnTempleStart");
const btnTempleNext    = document.getElementById("btnTempleNext");

let templeTimerInterval = null;

/************************************
 * Round Setup
 ************************************/
function resetTempleRoundQueue() {
  const shuffled = shuffledCopy(temples);
  state.templeQueue = shuffled.slice(0, TEMPLE_QUESTIONS_PER_ROUND);
}

function startTempleQuestion() {
  if (!state.templeQueue || state.templeQueue.length === 0) {
    resetTempleRoundQueue();
  }
  if (state.templeQueue.length === 0) {
    templeFeedbackEl.textContent = "No temples available.";
    return;
  }

  templeFeedbackEl.textContent = "";
  templeFeedbackEl.className = "feedback";
  btnTempleNext.classList.add("hidden");
  btnTempleStart.disabled = true;

  // Next temple from queue
  state.templeCurrent = state.templeQueue.shift();

  // Show image
  templeImageEl.src = state.templeCurrent.image;
  templeImageEl.alt = state.templeCurrent.name + " Temple";

  templePromptEl.textContent = "Which temple is this?";

  // Build options: correct + random others
  const templeNames = temples.map(t => t.name);
  const correctName = state.templeCurrent.name;

  const options = new Set();
  options.add(correctName);
  while (options.size < 4 && options.size < templeNames.length) {
    const randomName = templeNames[Math.floor(Math.random() * templeNames.length)];
    options.add(randomName);
  }

  const optionList = Array.from(options).sort(() => Math.random() - 0.5);
  templeOptionsEl.innerHTML = "";
  optionList.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.addEventListener("click", () => handleTempleAnswer(name));
    templeOptionsEl.appendChild(btn);
  });

  // Start timer
  if (templeTimerInterval) clearInterval(templeTimerInterval);
  const start = performance.now();
  state.templeStartTime = start;
  templeTimerInterval = setInterval(() => {
    const now = performance.now();
    const elapsed = (now - start) / 1000;
    templeTimerEl.textContent = "Time: " + formatTime(elapsed) + " s";
  }, 100);
}

/************************************
 * End-of-round check
 ************************************/
function endTempleRoundIfDone() {
  if (state.templeQueue.length === 0) {
    templeFeedbackEl.textContent += " | Round complete! Returning to lobby...";
    setTimeout(() => showScreen("screen-lobby"), 1500);
    btnTempleStart.disabled = false;
    btnTempleNext.classList.add("hidden");
    return true;
  }
  return false;
}

/************************************
 * Answer Handling
 ************************************/
function handleTempleAnswer(selectedName) {
  if (!state.templeCurrent || !state.templeStartTime) return;

  const end = performance.now();
  const elapsedSec = (end - state.templeStartTime) / 1000;

  clearInterval(templeTimerInterval);
  templeTimerInterval = null;

  const correctName = state.templeCurrent.name;
  const correct = selectedName === correctName;
  let points = 0;

  if (correct) {
    if (elapsedSec <= 3) points = 5;
    else if (elapsedSec <= 6) points = 3;
    else points = 1;

    templeFeedbackEl.textContent =
      `Correct! It was the ${correctName} Temple. You earned ${points} point(s) in ${formatTime(elapsedSec)} s.`;
    templeFeedbackEl.classList.add("correct");
    updateMyScore(points);
  } else {
    templeFeedbackEl.textContent =
      `Not quite. It was the ${correctName} Temple. Time: ${formatTime(elapsedSec)} s.`;
    templeFeedbackEl.classList.add("incorrect");
  }

  // Disable all option buttons
  Array.from(templeOptionsEl.children).forEach(btn => btn.disabled = true);

  // If the round is finished, go back to lobby
  if (endTempleRoundIfDone()) {
    return;
  }

  // Otherwise, automatically move to the next temple after a short delay
  setTimeout(startTempleQuestion, 900);
}

/************************************
 * Buttons
 ************************************/
btnTempleStart.addEventListener("click", () => {
  resetTempleRoundQueue();
  startTempleQuestion();
});

// If you want manual Next instead of auto-advance, you can keep this:
// btnTempleNext.addEventListener("click", startTempleQuestion);