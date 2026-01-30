// chaidle.js — Core game loop: row input, submit, feedback, win/lose

const Chaidle = {
  MAX_ATTEMPTS: 5,
  SLOTS: 5,
  puzzle: null,
  puzzleNumber: 0,
  attempts: [],        // array of arrays of ingredient ids
  currentRow: [],      // current input (up to 5)
  gameOver: false,
  won: false,
  keyboardState: {},   // ingredientId -> 'correct' | 'present' | 'absent'

  // Pooja reactions per row
  reactions: {
    correct: [
      "Beta, you have made me proud. This is PERFECT chai!",
      "I would serve this to my own mother!",
      "Sean, you are now an honorary chai master!"
    ],
    close: [
      "So close! I can almost taste it!",
      "You're getting warmer, beta!",
      "The chai instinct is growing in you!",
      "Not bad! A few ingredients off..."
    ],
    wrong: [
      "Hmm... that's not how I make it.",
      "Beta, what are you doing?!",
      "My grandmother is rolling in her grave!",
      "We need to talk about what just happened.",
      "I've had chai from vending machines better than this."
    ],
    lost: [
      "Don't worry, even I burned my first chai. Try again tomorrow!",
      "We don't speak of this. Come back tomorrow, beta.",
      "My ancestors are disappointed. Tomorrow is a new day!"
    ]
  },

  init() {
    const daily = Daily.getDailyPuzzle();
    this.puzzle = daily.puzzle;
    this.puzzleNumber = daily.number;

    // Update header
    document.getElementById('puzzle-number').textContent = `#${this.puzzleNumber}`;

    // Try to restore saved state
    const saved = Daily.loadTodayState();
    if (saved && saved.puzzleNumber === this.puzzleNumber) {
      this.attempts = saved.attempts || [];
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
      this.keyboardState = saved.keyboardState || {};
      this.restoreGrid();
      if (this.gameOver) {
        this.showEndState();
        return;
      }
    }

    this.renderGrid();
    this.renderKeyboard();
    this.bindEvents();
  },

  saveState() {
    Daily.saveTodayState({
      puzzleNumber: this.puzzleNumber,
      attempts: this.attempts,
      gameOver: this.gameOver,
      won: this.won,
      keyboardState: this.keyboardState
    });
  },

  // ===== GRID RENDERING =====
  renderGrid() {
    const grid = document.getElementById('guess-grid');
    grid.innerHTML = '';

    for (let row = 0; row < this.MAX_ATTEMPTS; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'grid-row';
      rowDiv.dataset.row = row;

      for (let col = 0; col < this.SLOTS; col++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        rowDiv.appendChild(cell);
      }

      grid.appendChild(rowDiv);
    }
  },

  restoreGrid() {
    this.renderGrid();

    // Re-render completed attempts with feedback
    this.attempts.forEach((attempt, rowIdx) => {
      const feedback = this.getFeedback(attempt);
      this.renderAttemptRow(rowIdx, attempt, feedback);
    });

    // Restore keyboard colors
    this.renderKeyboard();
    this.updateKeyboardColors();

    // If game is still in progress, set current row
    if (!this.gameOver) {
      this.currentRow = [];
      this.highlightCurrentRow();
    }
  },

  renderAttemptRow(rowIdx, attempt, feedback) {
    for (let col = 0; col < this.SLOTS; col++) {
      const cell = document.querySelector(`.grid-cell[data-row="${rowIdx}"][data-col="${col}"]`);
      if (!cell) continue;

      const ingId = attempt[col];
      const ing = CHAIDLE_INGREDIENTS.find(i => i.id === ingId);
      cell.textContent = ing ? ing.emoji : '?';
      cell.classList.add('filled', 'revealed');

      if (feedback[col] === 'correct') {
        cell.classList.add('correct');
      } else if (feedback[col] === 'present') {
        cell.classList.add('present');
      } else {
        cell.classList.add('absent');
      }
    }
  },

  highlightCurrentRow() {
    // Clear any previous highlights
    document.querySelectorAll('.grid-row').forEach(r => r.classList.remove('current'));
    const currentRowIdx = this.attempts.length;
    const rowEl = document.querySelector(`.grid-row[data-row="${currentRowIdx}"]`);
    if (rowEl) rowEl.classList.add('current');
  },

  updateCurrentRowDisplay() {
    const rowIdx = this.attempts.length;
    for (let col = 0; col < this.SLOTS; col++) {
      const cell = document.querySelector(`.grid-cell[data-row="${rowIdx}"][data-col="${col}"]`);
      if (!cell) continue;

      if (col < this.currentRow.length) {
        const ing = CHAIDLE_INGREDIENTS.find(i => i.id === this.currentRow[col]);
        cell.textContent = ing ? ing.emoji : '?';
        cell.classList.add('filled');
      } else {
        cell.textContent = '';
        cell.classList.remove('filled');
      }
    }
  },

  // ===== KEYBOARD =====
  renderKeyboard() {
    const kb = document.getElementById('ingredient-keyboard');
    kb.innerHTML = '';

    // Split into rows of 5
    const rows = [];
    for (let i = 0; i < CHAIDLE_INGREDIENTS.length; i += 5) {
      rows.push(CHAIDLE_INGREDIENTS.slice(i, i + 5));
    }

    rows.forEach(rowIngs => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'kb-row';

      rowIngs.forEach(ing => {
        const key = document.createElement('button');
        key.className = 'kb-key';
        key.dataset.ingredient = ing.id;
        key.innerHTML = `<span class="kb-emoji">${ing.emoji}</span><span class="kb-label">${ing.label}</span>`;

        // Apply saved state
        if (this.keyboardState[ing.id]) {
          key.classList.add(this.keyboardState[ing.id]);
        }

        rowDiv.appendChild(key);
      });

      kb.appendChild(rowDiv);
    });

    // Action row: backspace + submit
    const actionRow = document.createElement('div');
    actionRow.className = 'kb-row kb-action-row';
    actionRow.innerHTML = `
      <button class="kb-key kb-action" id="kb-backspace"><span class="kb-emoji">\u2B05\uFE0F</span><span class="kb-label">Undo</span></button>
      <button class="kb-key kb-action kb-submit" id="kb-submit"><span class="kb-emoji">\u2705</span><span class="kb-label">Submit</span></button>
    `;
    kb.appendChild(actionRow);
  },

  updateKeyboardColors() {
    CHAIDLE_INGREDIENTS.forEach(ing => {
      const state = this.keyboardState[ing.id];
      if (!state) return;
      const key = document.querySelector(`.kb-key[data-ingredient="${ing.id}"]`);
      if (key) {
        key.classList.remove('correct', 'present', 'absent');
        key.classList.add(state);
      }
    });
  },

  // ===== EVENTS =====
  bindEvents() {
    const kb = document.getElementById('ingredient-keyboard');

    kb.addEventListener('click', (e) => {
      if (this.gameOver) return;

      const key = e.target.closest('.kb-key');
      if (!key) return;

      if (key.id === 'kb-backspace') {
        this.removeLastIngredient();
      } else if (key.id === 'kb-submit') {
        this.submitRow();
      } else {
        const ingId = key.dataset.ingredient;
        if (ingId) this.addIngredient(ingId);
      }
    });

    // Stats button
    document.getElementById('btn-stats').addEventListener('click', () => this.showStats());

    // Help button
    document.getElementById('btn-help').addEventListener('click', () => this.showHelp());

    // Track current row
    this.highlightCurrentRow();
  },

  // ===== INPUT =====
  addIngredient(id) {
    if (this.currentRow.length >= this.SLOTS) return;
    this.currentRow.push(id);
    this.updateCurrentRowDisplay();
  },

  removeLastIngredient() {
    if (this.currentRow.length === 0) return;
    this.currentRow.pop();
    this.updateCurrentRowDisplay();
  },

  // ===== SUBMIT =====
  submitRow() {
    if (this.currentRow.length < this.SLOTS) {
      this.showPooja("Fill all 5 slots before submitting, beta!");
      // Shake current row
      const rowIdx = this.attempts.length;
      const rowEl = document.querySelector(`.grid-row[data-row="${rowIdx}"]`);
      if (rowEl) {
        rowEl.classList.add('shake');
        setTimeout(() => rowEl.classList.remove('shake'), 400);
      }
      return;
    }

    const attempt = [...this.currentRow];
    const feedback = this.getFeedback(attempt);

    // Store attempt
    this.attempts.push(attempt);
    this.currentRow = [];

    // Update keyboard state
    this.updateKeyboardState(attempt, feedback);

    // Animate reveal
    this.revealRow(this.attempts.length - 1, attempt, feedback);

    // Check win/lose
    const won = feedback.every(f => f === 'correct');
    if (won) {
      this.gameOver = true;
      this.won = true;
      this.saveState();
      Daily.markPlayed();
      Stats.recordGame(true, this.attempts.length);
      setTimeout(() => this.showEndState(), 1600);
    } else if (this.attempts.length >= this.MAX_ATTEMPTS) {
      this.gameOver = true;
      this.won = false;
      this.saveState();
      Daily.markPlayed();
      Stats.recordGame(false, this.attempts.length);
      setTimeout(() => this.showEndState(), 1600);
    } else {
      this.saveState();
      // Show Pooja reaction
      const correctCount = feedback.filter(f => f === 'correct').length;
      const presentCount = feedback.filter(f => f === 'present').length;
      if (correctCount >= 3) {
        this.showPooja(this.pickRandom(this.reactions.close));
      } else if (correctCount + presentCount >= 3) {
        this.showPooja(this.pickRandom(this.reactions.close));
      } else {
        this.showPooja(this.pickRandom(this.reactions.wrong));
      }
      this.highlightCurrentRow();
    }
  },

  // ===== FEEDBACK =====
  getFeedback(attempt) {
    const answer = this.puzzle.answer;
    const feedback = new Array(this.SLOTS).fill('absent');
    const answerUsed = new Array(this.SLOTS).fill(false);
    const attemptUsed = new Array(this.SLOTS).fill(false);

    // First pass: correct position
    for (let i = 0; i < this.SLOTS; i++) {
      if (attempt[i] === answer[i]) {
        feedback[i] = 'correct';
        answerUsed[i] = true;
        attemptUsed[i] = true;
      }
    }

    // Second pass: present but wrong position
    for (let i = 0; i < this.SLOTS; i++) {
      if (attemptUsed[i]) continue;
      for (let j = 0; j < this.SLOTS; j++) {
        if (answerUsed[j]) continue;
        if (attempt[i] === answer[j]) {
          feedback[i] = 'present';
          answerUsed[j] = true;
          break;
        }
      }
    }

    return feedback;
  },

  updateKeyboardState(attempt, feedback) {
    attempt.forEach((ingId, i) => {
      const current = this.keyboardState[ingId];
      const newState = feedback[i];

      // Priority: correct > present > absent
      if (newState === 'correct') {
        this.keyboardState[ingId] = 'correct';
      } else if (newState === 'present' && current !== 'correct') {
        this.keyboardState[ingId] = 'present';
      } else if (!current) {
        this.keyboardState[ingId] = 'absent';
      }
    });

    this.updateKeyboardColors();
  },

  // ===== ANIMATION =====
  revealRow(rowIdx, attempt, feedback) {
    for (let col = 0; col < this.SLOTS; col++) {
      const cell = document.querySelector(`.grid-cell[data-row="${rowIdx}"][data-col="${col}"]`);
      if (!cell) continue;

      const ing = CHAIDLE_INGREDIENTS.find(i => i.id === attempt[col]);
      cell.textContent = ing ? ing.emoji : '?';
      cell.classList.add('filled');

      // Stagger the flip animation
      setTimeout(() => {
        cell.classList.add('revealing');
        setTimeout(() => {
          cell.classList.remove('revealing');
          cell.classList.add('revealed');
          if (feedback[col] === 'correct') {
            cell.classList.add('correct');
          } else if (feedback[col] === 'present') {
            cell.classList.add('present');
          } else {
            cell.classList.add('absent');
          }
        }, 250);
      }, col * 250);
    }
  },

  // ===== END STATE =====
  showEndState() {
    const endDiv = document.getElementById('end-state');
    const answer = this.puzzle.answer;

    let poojaLine;
    if (this.won) {
      poojaLine = this.pickRandom(this.reactions.correct);
    } else {
      poojaLine = this.pickRandom(this.reactions.lost);
    }

    // Build answer display
    const answerEmojis = answer.map(id => {
      const ing = CHAIDLE_INGREDIENTS.find(i => i.id === id);
      return ing ? ing.emoji : '?';
    }).join(' ');

    let html = `
      <div class="end-card">
        <div class="end-pooja">
          <div class="avatar avatar-large avatar-pooja">\u{1F469}\u200D\u{1F373}</div>
          <div class="end-quote">"${poojaLine}"</div>
        </div>
        <div class="end-result">
          ${this.won ? `<div class="end-win">You got it in ${this.attempts.length}/5!</div>` : '<div class="end-lose">Better luck tomorrow!</div>'}
        </div>
        <div class="end-answer">
          <div class="end-answer-label">Today's recipe: ${this.puzzle.name}</div>
          <div class="end-answer-emojis">${answerEmojis}</div>
        </div>
        <div class="end-actions">
          <button class="btn btn-primary" id="btn-share">Share Result</button>
          <button class="btn btn-secondary" id="btn-show-stats">Statistics</button>
        </div>
        <div class="end-countdown">
          <div class="countdown-label">Next Chaidle in</div>
          <div class="countdown-time" id="countdown-time">--:--:--</div>
        </div>
      </div>
    `;

    endDiv.innerHTML = html;
    endDiv.classList.add('visible');

    // Bind share
    document.getElementById('btn-share').addEventListener('click', () => {
      const text = Share.generateShareText(this.puzzleNumber, this.attempts, this.won, this.puzzle.answer);
      Share.copyToClipboard(text).then(ok => {
        const btn = document.getElementById('btn-share');
        btn.textContent = ok ? 'Copied!' : 'Copy failed';
        setTimeout(() => { btn.textContent = 'Share Result'; }, 2000);
      });
    });

    // Bind stats
    document.getElementById('btn-show-stats').addEventListener('click', () => this.showStats());

    // Start countdown
    this.startCountdown();
  },

  startCountdown() {
    const update = () => {
      const time = Daily.getTimeToNextPuzzle();
      const el = document.getElementById('countdown-time');
      if (el) el.textContent = `${time.hours}:${time.minutes}:${time.seconds}`;
    };
    update();
    setInterval(update, 1000);
  },

  // ===== MODALS =====
  showStats() {
    // Remove existing
    const existing = document.getElementById('stats-overlay');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', Stats.renderModal());

    document.getElementById('stats-close').addEventListener('click', () => {
      document.getElementById('stats-overlay').remove();
    });

    document.getElementById('stats-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'stats-overlay') {
        document.getElementById('stats-overlay').remove();
      }
    });
  },

  showHelp() {
    const existing = document.getElementById('help-overlay');
    if (existing) { existing.remove(); return; }

    const html = `
      <div class="stats-overlay" id="help-overlay">
        <div class="stats-modal help-modal">
          <div class="stats-header">
            <h2>How to Play</h2>
            <button class="stats-close" id="help-close">&times;</button>
          </div>
          <p>Guess today's 5-ingredient chai recipe in 5 attempts.</p>
          <p>Each guess must be 5 ingredients. Tap ingredients from the keyboard, then submit.</p>
          <div class="help-examples">
            <div class="help-row">
              <span class="grid-cell example-cell correct">\u{1F4A7}</span>
              <span><strong>Brown</strong> = right ingredient, right position</span>
            </div>
            <div class="help-row">
              <span class="grid-cell example-cell present">\u{1FAD8}</span>
              <span><strong>Yellow</strong> = right ingredient, wrong position</span>
            </div>
            <div class="help-row">
              <span class="grid-cell example-cell absent">\u{1F34B}</span>
              <span><strong>Gray</strong> = not in today's recipe</span>
            </div>
          </div>
          <p>A new puzzle every day. Same puzzle for everyone!</p>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('help-close').addEventListener('click', () => {
      document.getElementById('help-overlay').remove();
    });
    document.getElementById('help-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'help-overlay') document.getElementById('help-overlay').remove();
    });
  },

  // ===== POOJA =====
  showPooja(text) {
    const el = document.getElementById('pooja-reaction');
    el.textContent = `"${text}"`;
    el.classList.remove('pop');
    void el.offsetWidth; // reflow
    el.classList.add('pop');
  },

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ===== BOLLYWOOD EASTER EGG =====
  potClickCount: 0,
  handlePotClick() {
    this.potClickCount++;
    if (this.potClickCount >= 10) {
      this.potClickCount = 0;
      this.triggerBollywood();
    }
  },

  triggerBollywood() {
    const overlay = document.getElementById('bollywood-overlay');
    if (!overlay) return;

    const quotes = [
      "Kuch kuch hota hai, beta... tum nahi samjhoge!",
      "Mogambo khush hua! ...because this chai is PERFECT!",
      "Mere paas chai hai... tumhare paas kya hai?!",
      "Bade bade deshon mein aisi chhoti chhoti chai banti rehti hai"
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    overlay.querySelector('.bollywood-quote').textContent = quote;
    overlay.classList.add('active');

    const emojis = ['\u{1F483}', '\u{1F57A}', '\u2615', '\u{1F31F}', '\u{1F525}', '\u{1F3B5}', '\u{1F389}'];
    const container = overlay.querySelector('.bollywood-emojis');
    container.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const span = document.createElement('span');
      span.className = 'bollywood-emoji';
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = Math.random() * 100 + '%';
      span.style.animationDelay = Math.random() * 2 + 's';
      span.style.animationDuration = (2 + Math.random() * 3) + 's';
      container.appendChild(span);
    }

    setTimeout(() => overlay.classList.remove('active'), 6000);
    overlay.onclick = () => overlay.classList.remove('active');
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => Chaidle.init());
