/************************************
 * Scripture Quiz Game
 ************************************/

// DOM elements for scripture game
const scriptureTimerEl    = document.getElementById("scriptureTimer");
const scripturePromptEl   = document.getElementById("scripturePrompt");
const scriptureTextEl     = document.getElementById("scriptureText");
const scriptureOptionsEl  = document.getElementById("scriptureOptions");
const scriptureFeedbackEl = document.getElementById("scriptureFeedback");
const btnScriptureStart   = document.getElementById("btnScriptureStart");
const btnScriptureNext    = document.getElementById("btnScriptureNext"); // unused if auto-advance, but safe

let scriptureTimerInterval = null;

/************************************
 * Round Setup
 ************************************/
function resetScriptureRoundQueue() {
  const shuffled = shuffledCopy(scriptures);
  state.scriptureQueue = shuffled.slice(0, SCRIPTURE_QUESTIONS_PER_ROUND);
}

function startScriptureQuestion() {
  // If queue empty, (re)build it
  if (!state.scriptureQueue || state.scriptureQueue.length === 0) {
    resetScriptureRoundQueue();
  }
  if (state.scriptureQueue.length === 0) {
    scriptureFeedbackEl.textContent = "No scriptures available.";
    return;
  }

  scriptureFeedbackEl.textContent = "";
  scriptureFeedbackEl.className = "feedback";
  if (btnScriptureNext) btnScriptureNext.classList.add("hidden");
  btnScriptureStart.disabled = true;

  // Take next scripture from queue
  state.scriptureCurrent = state.scriptureQueue.shift();

  // Random question type: book, prophet, or chapter
  const questionTypes = ["book", "prophet", "chapter"];
  const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  state.scriptureCurrent.qType = qType;

  // Show scripture text
  scriptureTextEl.textContent = `"${state.scriptureCurrent.scripture_contents}"`;

  // Build prompt and options
  let correctAnswer;
  let optionPool = [];

  if (qType === "book") {
    scripturePromptEl.textContent = "Which book is this verse from?";
    correctAnswer = state.scriptureCurrent.book;
    optionPool = [...new Set(scriptures.map(s => s.book))];
  } else if (qType === "prophet") {
    scripturePromptEl.textContent = "Which prophet said this?";
    correctAnswer = state.scriptureCurrent.prophet;
    optionPool = [...new Set(scriptures.map(s => s.prophet))];
  } else { // chapter
    scripturePromptEl.textContent = `Which chapter of ${state.scriptureCurrent.book} is this verse in?`;
    correctAnswer = String(state.scriptureCurrent.chapter);
    optionPool = [...new Set(scriptures.map(s => s.chapter))].map(n => String(n));
  }

  const options = new Set();
  options.add(correctAnswer);

  while (options.size < 4 && options.size < optionPool.length) {
    const random = optionPool[Math.floor(Math.random() * optionPool.length)];
    options.add(String(random));
  }

  const optionList = Array.from(options).sort(() => Math.random() - 0.5);

  scriptureOptionsEl.innerHTML = "";
  optionList.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => handleScriptureAnswer(opt));
    scriptureOptionsEl.appendChild(btn);
  });

  // Start timer
  if (scriptureTimerInterval) clearInterval(scriptureTimerInterval);
  const start = performance.now();
  state.scriptureStartTime = start;
  scriptureTimerInterval = setInterval(() => {
    const now = performance.now();
    const elapsed = (now - start) / 1000;
    scriptureTimerEl.textContent = "Time: " + formatTime(elapsed) + " s";
  }, 100);
}

/************************************
 * End-of-round check
 ************************************/
function endScriptureRoundIfDone() {
  if (state.scriptureQueue.length === 0) {
    scriptureFeedbackEl.textContent += " | Round complete! Returning to lobby...";
    setTimeout(() => showScreen("screen-lobby"), 1500);
    btnScriptureStart.disabled = false;
    if (btnScriptureNext) btnScriptureNext.classList.add("hidden");
    return true;
  }
  return false;
}

/************************************
 * Answer Handling
 ************************************/
function handleScriptureAnswer(selectedOpt) {
  if (!state.scriptureCurrent || !state.scriptureStartTime) return;

  const end = performance.now();
  const elapsedSec = (end - state.scriptureStartTime) / 1000;

  clearInterval(scriptureTimerInterval);
  scriptureTimerInterval = null;

  let correctAnswer;
  if (state.scriptureCurrent.qType === "book") {
    correctAnswer = state.scriptureCurrent.book;
  } else if (state.scriptureCurrent.qType === "prophet") {
    correctAnswer = state.scriptureCurrent.prophet;
  } else { // chapter
    correctAnswer = String(state.scriptureCurrent.chapter);
  }

  const correct = selectedOpt === String(correctAnswer);
  let points = 0;

  if (correct) {
    if (elapsedSec <= 3) points = 5;
    else if (elapsedSec <= 6) points = 3;
    else points = 1;

    scriptureFeedbackEl.textContent =
      `Correct! The answer was "${correctAnswer}". You earned ${points} point(s) in ${formatTime(elapsedSec)} s.`;
    scriptureFeedbackEl.classList.add("correct");
    updateMyScore(points);
  } else {
    scriptureFeedbackEl.textContent =
      `Not quite. The correct answer was "${correctAnswer}". Time: ${formatTime(elapsedSec)} s.`;
    scriptureFeedbackEl.classList.add("incorrect");
  }

  // Disable all option buttons
  Array.from(scriptureOptionsEl.children).forEach(btn => btn.disabled = true);

  // If the round is finished, go back to lobby
  if (endScriptureRoundIfDone()) {
    return;
  }

  // Otherwise, automatically move to the next question after a short delay
  setTimeout(startScriptureQuestion, 900);
}

/************************************
 * Buttons
 ************************************/
btnScriptureStart.addEventListener("click", () => {
  resetScriptureRoundQueue();
  startScriptureQuestion();
});

// If you ever want a manual Next button instead of auto-advance, you can keep this:
// btnScriptureNext.addEventListener("click", startScriptureQuestion);