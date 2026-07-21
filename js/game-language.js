/************************************
 * Language Game
 ************************************/

// DOM elements for language game
const langTimerEl    = document.getElementById("langTimer");
const langQuestionEl = document.getElementById("langQuestion");
const langOptionsEl  = document.getElementById("langOptions");
const langFeedbackEl = document.getElementById("langFeedback");
const btnLangStart   = document.getElementById("btnLangStart");
const btnLangNext    = document.getElementById("btnLangNext");

let langTimerInterval = null;

// Build a new round queue: shuffle all phrases and take the first N
function resetLanguageRoundQueue() {
  const shuffled = shuffledCopy(languagePhrases);
  state.langQueue = shuffled.slice(0, LANG_QUESTIONS_PER_ROUND);
}

function startLanguageRound() {
  if (!state.langQueue || state.langQueue.length === 0) {
    resetLanguageRoundQueue();
  }
  if (state.langQueue.length === 0) {
    langFeedbackEl.textContent = "No language phrases available.";
    return;
  }

  langFeedbackEl.textContent = "";
  langFeedbackEl.className = "feedback";

  // Hide Next button and hide Start during the round
  btnLangNext.classList.add("hidden");
  btnLangStart.classList.add("hidden");
  btnLangStart.disabled = true;

  // Next phrase from queue
  state.langCurrent = state.langQueue.shift();

  langQuestionEl.textContent =
    `"${state.langCurrent.phrase}" means "${state.langCurrent.meaning}". Which language is this?`;

  // Build options
  const options = new Set();
  options.add(state.langCurrent.language);
  while (options.size < 4 && options.size < languages.length) {
    const randomLang = languages[Math.floor(Math.random() * languages.length)];
    options.add(randomLang);
  }
  const optionList = Array.from(options).sort(() => Math.random() - 0.5);

  langOptionsEl.innerHTML = "";
  optionList.forEach(lang => {
    const btn = document.createElement("button");
    btn.textContent = lang;
    btn.addEventListener("click", () => handleLangAnswer(lang));
    langOptionsEl.appendChild(btn);
  });

  // Start timer
  if (langTimerInterval) clearInterval(langTimerInterval);
  const start = performance.now();
  state.langStartTime = start;
  langTimerInterval = setInterval(() => {
    const now = performance.now();
    const elapsed = (now - start) / 1000;
    langTimerEl.textContent = "Time: " + formatTime(elapsed) + " s";
  }, 100);
}

function endLanguageRoundIfDone() {
  if (state.langQueue.length === 0) {
    langFeedbackEl.textContent += " | Round complete! Returning to lobby...";
    // Show Start again so they can start a new round later
    btnLangStart.classList.remove("hidden");
    btnLangStart.disabled = false;
    btnLangNext.classList.add("hidden");
    setTimeout(() => showScreen("screen-lobby"), 1500);
    return true;
  }
  return false;
}

function handleLangAnswer(selectedLang) {
  if (!state.langCurrent || !state.langStartTime) return;

  const end = performance.now();
  const elapsedSec = (end - state.langStartTime) / 1000;

  clearInterval(langTimerInterval);
  langTimerInterval = null;

  const correct = selectedLang === state.langCurrent.language;
  let points = 0;

  if (correct) {
    if (elapsedSec <= 3) points = 5;
    else if (elapsedSec <= 6) points = 3;
    else points = 1;

    langFeedbackEl.textContent =
      `Correct! It was ${state.langCurrent.language}. You earned ${points} point(s) in ${formatTime(elapsedSec)} s.`;
    langFeedbackEl.classList.add("correct");
    updateMyScore(points);
  } else {
    langFeedbackEl.textContent =
      `Not quite. It was ${state.langCurrent.language}. Time: ${formatTime(elapsedSec)} s.`;
    langFeedbackEl.classList.add("incorrect");
  }

  // Disable all option buttons
  Array.from(langOptionsEl.children).forEach(btn => btn.disabled = true);

  // If the round is finished, go back to lobby; otherwise auto-advance
  if (endLanguageRoundIfDone()) {
    return;
  }

  // Automatically move to the next question after a short delay
  setTimeout(startLanguageRound, 900);
}

// Button handler: only starts a new round
btnLangStart.addEventListener("click", () => {
  resetLanguageRoundQueue();
  startLanguageRound();
});

// We no longer use btnLangNext; it can stay hidden
// btnLangNext.addEventListener("click", startLanguageRound);
