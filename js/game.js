// game.js - Main controller: screen nav, game loop, state, localStorage

const Game = {
  state: {
    scores: {},      // { levelId: bestScore }
    stars: {},       // { levelId: bestStars }
    taraMode: false,
    taraBadges: {},  // { levelId: true } if 3 stars in tara mode
    firstPlay: true
  },

  currentLevel: null,
  currentRecipe: null,
  playerChoices: {},
  currentPhase: 0,
  timingInterval: null,
  timingStartTime: 0,
  cookingAddOrder: [],
  heatLevel: 'off',
  heatChanges: [],
  potState: { liquidLevel: 0, colorClass: '', contents: [] },

  // ===== INITIALIZATION =====
  init() {
    this.loadState();
    UI.init();
    this.bindGlobalEvents();
    this.parseURLHash();
    UI.showScreen('title-screen');
  },

  // ===== STATE PERSISTENCE =====
  loadState() {
    try {
      const saved = localStorage.getItem('chaiGameState');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(this.state, parsed);
      }
    } catch (e) {
      console.warn('Could not load saved state');
    }
  },

  saveState() {
    try {
      localStorage.setItem('chaiGameState', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save state');
    }
  },

  // ===== URL HASH SHARING =====
  parseURLHash() {
    const hash = window.location.hash;
    if (hash && hash.includes('score=')) {
      const params = new URLSearchParams(hash.substring(1));
      const score = parseInt(params.get('score'));
      const level = parseInt(params.get('level'));
      if (!isNaN(score) && !isNaN(level)) {
        UI.showSharedResult(level, score);
      }
    }
  },

  generateShareURL(level, score) {
    const base = window.location.href.split('#')[0];
    return `${base}#score=${score}&level=${level}`;
  },

  // ===== LEVEL UNLOCK LOGIC =====
  isLevelUnlocked(recipe) {
    if (!recipe.unlockCondition) return true;
    const cond = recipe.unlockCondition;

    switch (cond.type) {
      case 'beat':
        return (this.state.scores[cond.level] || 0) >= 50;
      case 'stars':
        return (this.state.stars[cond.level] || 0) >= cond.minimum;
      case 'total-stars': {
        const totalStars = Object.values(this.state.stars).reduce((a, b) => a + b, 0);
        return totalStars >= cond.minimum;
      }
      default:
        return false;
    }
  },

  // ===== GLOBAL EVENTS =====
  bindGlobalEvents() {
    // Title screen buttons
    document.getElementById('btn-play').addEventListener('click', () => {
      if (this.state.firstPlay) {
        this.state.firstPlay = false;
        this.saveState();
        UI.showScreen('story-screen');
      } else {
        this.showLevelSelect();
      }
    });

    document.getElementById('btn-howto').addEventListener('click', () => {
      UI.showScreen('howto-screen');
    });

    document.getElementById('btn-recipes').addEventListener('click', () => {
      UI.renderRecipeBook(this.state);
      UI.showScreen('recipe-screen');
    });

    // Story screen
    document.getElementById('btn-story-continue').addEventListener('click', () => {
      this.showLevelSelect();
    });

    // Back buttons
    document.querySelectorAll('.btn-back').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.timingInterval) {
          clearInterval(this.timingInterval);
          this.timingInterval = null;
        }
        UI.showScreen('title-screen');
      });
    });

    document.querySelectorAll('.btn-back-levels').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showLevelSelect();
      });
    });

    // Judging screen buttons
    document.getElementById('btn-retry').addEventListener('click', () => {
      if (this.currentRecipe) this.startLevel(this.currentRecipe.id);
    });

    document.getElementById('btn-next-level').addEventListener('click', () => {
      this.showLevelSelect();
    });

    document.getElementById('btn-share').addEventListener('click', () => {
      if (this.currentRecipe && this.lastScore) {
        const url = this.generateShareURL(this.currentRecipe.id, this.lastScore.total);
        const text = `I scored ${this.lastScore.total}/100 (${UI.renderStars(this.lastScore.stars)}) on ${this.currentRecipe.name} in Pooja's Chai Academy! Can you beat me? ${url}`;
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.getElementById('btn-share');
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Challenge a Coworker'; }, 2000);
        }).catch(() => {
          prompt('Copy this link:', url);
        });
      }
    });

    // Tara mode toggle
    const taraToggle = document.getElementById('tara-toggle');
    if (taraToggle) {
      taraToggle.classList.toggle('on', this.state.taraMode);
      taraToggle.addEventListener('click', () => {
        this.state.taraMode = !this.state.taraMode;
        taraToggle.classList.toggle('on', this.state.taraMode);
        this.saveState();
      });
    }
  },

  // ===== LEVEL SELECT =====
  showLevelSelect() {
    UI.renderLevelSelect(this.state);
    UI.showScreen('level-screen');
  },

  // ===== START LEVEL =====
  startLevel(levelId) {
    this.currentRecipe = RECIPES.find(r => r.id === levelId);
    if (!this.currentRecipe) return;

    this.currentPhase = 0;
    this.playerChoices = {
      ingredients: [],
      preparations: {},
      addOrder: [],
      timing: { heatAccuracy: 0, pullTime: 0 },
      serving: { vessel: null, strained: false }
    };
    this.cookingAddOrder = [];
    this.heatLevel = 'off';
    this.heatChanges = [];
    this.potState = { liquidLevel: 0, colorClass: '', contents: [] };

    UI.showScreen('gameplay-screen');
    UI.els.gameLevelTitle.textContent = `Level ${this.currentRecipe.id}: ${this.currentRecipe.name}`;
    UI.clearDialogue();
    UI.updatePot(this.potState);
    UI.updateFlame('off');
    UI.updateSteam(false);
    UI.updateBubbles(null);

    // Show Pooja's intro
    UI.showDialogue('pooja', this.currentRecipe.poojaIntro);

    // Show Sean's thought
    const thoughts = DIALOGUE.sean.thoughts.ingredientPhase;
    UI.showDialogue('sean', thoughts[Math.floor(Math.random() * thoughts.length)]);

    // Show hint if not tara mode
    if (!this.state.taraMode) {
      const hints = DIALOGUE.tara.hints.ingredients[levelId];
      if (hints) {
        setTimeout(() => UI.showHint(hints.q, hints.a), 1500);
      }
    }

    this.startPhase(0);
  },

  // ===== PHASE MANAGEMENT =====
  phases: ['ingredients', 'preparation', 'cooking', 'timing', 'serving'],

  startPhase(index) {
    this.currentPhase = index;
    UI.setPhase(index, this.phases.length);

    switch (this.phases[index]) {
      case 'ingredients': this.runIngredientPhase(); break;
      case 'preparation': this.runPrepPhase(); break;
      case 'cooking': this.runCookingPhase(); break;
      case 'timing': this.runTimingPhase(); break;
      case 'serving': this.runServingPhase(); break;
    }
  },

  nextPhase() {
    if (this.currentPhase < this.phases.length - 1) {
      this.startPhase(this.currentPhase + 1);
    } else {
      this.finishLevel();
    }
  },

  // ===== INGREDIENT PHASE =====
  runIngredientPhase() {
    const recipe = this.currentRecipe;
    const allIngredients = [
      ...recipe.ingredients.required,
      ...recipe.ingredients.optional,
      ...recipe.ingredients.traps
    ];
    // Shuffle
    const shuffled = allIngredients.sort(() => Math.random() - 0.5);

    UI.renderIngredientShelf(shuffled, this.playerChoices.ingredients, (id) => {
      this.toggleIngredient(id);
    });

    document.getElementById('confirm-ingredients').addEventListener('click', () => {
      // Check for missing ingredients
      const missing = recipe.ingredients.required.filter(
        r => !this.playerChoices.ingredients.includes(r)
      );
      if (missing.length > 0) {
        UI.showDialogue('pooja', DIALOGUE.pooja.ingredients.missing);
      }
      this.nextPhase();
    });
  },

  toggleIngredient(id) {
    const recipe = this.currentRecipe;
    const selected = this.playerChoices.ingredients;
    const idx = selected.indexOf(id);

    if (idx >= 0) {
      // Deselect
      selected.splice(idx, 1);
      UI.updateIngredientTile(id, 'deselected');
      this.removePotContent(id);
    } else {
      selected.push(id);

      // Check if trap
      if (recipe.ingredients.traps.includes(id)) {
        UI.updateIngredientTile(id, 'trap');
        const trapLine = DIALOGUE.pooja.ingredients.trap[id] || "That doesn't belong in chai!";
        UI.showDialogue('pooja', trapLine);
        UI.showDialogue('sean', DIALOGUE.sean.mistakes[Math.floor(Math.random() * DIALOGUE.sean.mistakes.length)]);
      } else {
        UI.updateIngredientTile(id, 'selected');
        const lines = recipe.ingredients.optional.includes(id)
          ? DIALOGUE.pooja.ingredients.optional
          : DIALOGUE.pooja.ingredients.correct;
        UI.showDialogue('pooja', lines[Math.floor(Math.random() * lines.length)]);
      }

      this.addPotContent(id);
    }
  },

  addPotContent(id) {
    this.potState.contents.push(id);
    this.updatePotVisuals();
  },

  removePotContent(id) {
    const idx = this.potState.contents.indexOf(id);
    if (idx >= 0) this.potState.contents.splice(idx, 1);
    this.updatePotVisuals();
  },

  updatePotVisuals() {
    const contents = this.potState.contents;
    const hasWater = contents.includes('water');
    const hasTea = contents.includes('tea-leaves');
    const hasMilk = contents.includes('milk');
    const hasSaffron = contents.includes('saffron');

    this.potState.liquidLevel = Math.min(85, contents.length * 15);

    if (hasSaffron && hasMilk) this.potState.colorClass = 'saffron-chai';
    else if (hasMilk && hasTea) this.potState.colorClass = 'chai';
    else if (hasMilk) this.potState.colorClass = 'milky';
    else if (hasTea) this.potState.colorClass = 'tea-medium';
    else if (hasWater) this.potState.colorClass = 'water';
    else this.potState.colorClass = '';

    UI.updatePot(this.potState);
  },

  // ===== PREPARATION PHASE =====
  runPrepPhase() {
    const recipe = this.currentRecipe;
    const prepSteps = recipe.prepSteps;
    const keys = Object.keys(prepSteps);

    if (keys.length === 0) {
      // Skip if no prep needed
      UI.showDialogue('pooja', "No special preparation needed — let's get cooking!");
      setTimeout(() => this.nextPhase(), 800);
      return;
    }

    UI.clearDialogue();
    const thoughts = DIALOGUE.sean.thoughts.prepPhase;
    UI.showDialogue('sean', thoughts[Math.floor(Math.random() * thoughts.length)]);

    if (!this.state.taraMode) {
      const hints = DIALOGUE.tara.hints.prep;
      const firstKey = keys[0];
      if (hints[firstKey]) {
        UI.showHint(hints[firstKey].q, hints[firstKey].a);
      } else if (hints.general) {
        UI.showHint(hints.general.q, hints.general.a);
      }
    }

    this.prepQueue = [...keys];
    this.showNextPrep();
  },

  showNextPrep() {
    if (this.prepQueue.length === 0) {
      setTimeout(() => this.nextPhase(), 600);
      return;
    }

    const recipe = this.currentRecipe;
    const remaining = {};
    this.prepQueue.forEach(k => {
      remaining[k] = recipe.prepSteps[k];
    });

    UI.renderPrepPhase(remaining, PREP_METHODS, (ingredient, method) => {
      this.playerChoices.preparations[ingredient] = method;

      const correct = recipe.prepSteps[ingredient].correct === method;
      UI.highlightPrepChoice(method, correct);

      if (correct) {
        UI.showDialogue('pooja', DIALOGUE.pooja.prep.correct);
      } else {
        const hint = recipe.prepSteps[ingredient].hint;
        UI.showDialogue('pooja', DIALOGUE.pooja.prep.wrong[method] || hint || "Not quite right...");
      }

      this.prepQueue.shift();
      setTimeout(() => this.showNextPrep(), 800);
    });
  },

  // ===== COOKING PHASE =====
  runCookingPhase() {
    const recipe = this.currentRecipe;
    UI.clearDialogue();

    const thoughts = DIALOGUE.sean.thoughts.cookingPhase;
    UI.showDialogue('sean', thoughts[Math.floor(Math.random() * thoughts.length)]);

    if (!this.state.taraMode) {
      const hints = DIALOGUE.tara.hints.cooking;
      UI.showHint(hints.order.q, hints.order.a);
    }

    // Light the flame
    this.heatLevel = 'medium';
    UI.updateFlame(this.heatLevel);
    UI.updateSteam(true);
    UI.updateBubbles('gentle');

    // Render heat controls
    this.renderHeatControls();

    // Ingredient timeline - only ingredients the player selected
    const toAdd = this.playerChoices.ingredients.filter(
      i => !this.currentRecipe.ingredients.traps.includes(i)
    );

    UI.renderCookingPhase(toAdd, (id) => {
      this.cookingAddOrder.push(id);
      UI.markIngredientAdded(id);
      UI.updateUndoButton(true);
      UI.updateCookingStep(this.cookingAddOrder.length, toAdd.length);
      this.addPotContent(id);

      // Check order
      const correctOrder = recipe.correctOrder;
      const orderIdx = this.cookingAddOrder.length - 1;
      if (orderIdx < correctOrder.length && correctOrder[orderIdx] === id) {
        UI.showDialogue('pooja', DIALOGUE.pooja.cooking.rightOrder);
      } else {
        UI.showDialogue('pooja', DIALOGUE.pooja.cooking.wrongOrder);
      }

      // Special reactions
      if (id === 'milk') {
        UI.showDialogue('pooja', DIALOGUE.pooja.cooking.milkAdded);
        UI.updateBubbles('rolling');
      }

      // All added? Move on
      if (this.cookingAddOrder.length >= toAdd.length) {
        setTimeout(() => {
          this.playerChoices.addOrder = this.cookingAddOrder;
          this.nextPhase();
        }, 1000);
      }
    }, () => {
      // Undo callback
      if (this.cookingAddOrder.length === 0) return;
      const lastId = this.cookingAddOrder.pop();
      UI.unmarkIngredientAdded(lastId);
      this.removePotContent(lastId);
      UI.updateUndoButton(this.cookingAddOrder.length > 0);
      UI.updateCookingStep(this.cookingAddOrder.length, toAdd.length);
      UI.showDialogue('sean', "Let me rethink that...");
    });
  },

  renderHeatControls() {
    const potArea = document.querySelector('.heat-controls');
    if (!potArea) return;

    potArea.innerHTML = '';
    ['low', 'medium', 'high'].forEach(level => {
      const btn = document.createElement('button');
      btn.className = `heat-btn${this.heatLevel === level ? ' active' : ''}`;
      btn.textContent = level.charAt(0).toUpperCase() + level.slice(1);
      btn.addEventListener('click', () => {
        this.setHeat(level);
        potArea.querySelectorAll('.heat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      potArea.appendChild(btn);
    });
  },

  setHeat(level) {
    this.heatLevel = level;
    this.heatChanges.push({ level, time: Date.now() });
    UI.updateFlame(level);

    if (level === 'high') {
      UI.updateBubbles('rolling');
      UI.updateSteam(true);
    } else if (level === 'medium') {
      UI.updateBubbles('gentle');
      UI.updateSteam(true);
    } else {
      UI.updateBubbles(null);
      UI.updateSteam(false);
    }

    // Pooja heat reactions
    const recipe = this.currentRecipe;
    const phase = recipe.cooking.phases[Math.min(this.cookingAddOrder.length, recipe.cooking.phases.length - 1)];
    if (phase) {
      if (level === phase.heat) {
        UI.showDialogue('pooja', DIALOGUE.pooja.cooking.heatJustRight);
      } else if (['high'].includes(level) && phase.heat !== 'high') {
        UI.showDialogue('pooja', DIALOGUE.pooja.cooking.heatTooHigh);
      } else if (['low'].includes(level) && phase.heat === 'high') {
        UI.showDialogue('pooja', DIALOGUE.pooja.cooking.heatTooLow);
      }
    }
  },

  // ===== TIMING PHASE =====
  runTimingPhase() {
    const recipe = this.currentRecipe;
    const window = recipe.cooking.timingWindow;
    const totalDuration = window.max + 4; // extra room past max

    UI.clearDialogue();
    const thoughts = DIALOGUE.sean.thoughts.timingPhase;
    UI.showDialogue('sean', thoughts[Math.floor(Math.random() * thoughts.length)]);

    if (!this.state.taraMode) {
      const hints = DIALOGUE.tara.hints.cooking;
      UI.showHint(hints.timing.q, hints.timing.a);
    }

    const sweetStart = window.sweet - 2;
    const sweetEnd = window.sweet + 2;

    UI.renderTimingPhase(totalDuration, sweetStart, sweetEnd, () => {
      this.pullFromHeat();
    });

    // Animate the marker
    this.timingStartTime = Date.now();
    const durationMs = totalDuration * 1000;

    this.timingInterval = setInterval(() => {
      const elapsed = Date.now() - this.timingStartTime;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      UI.updateTimingMarker(pct);

      // Auto-fail if they wait too long
      if (pct >= 100) {
        this.pullFromHeat();
      }
    }, 50);
  },

  pullFromHeat() {
    if (this.timingInterval) {
      clearInterval(this.timingInterval);
      this.timingInterval = null;
    }

    const recipe = this.currentRecipe;
    const window = recipe.cooking.timingWindow;
    const totalDuration = window.max + 4;
    const elapsedSec = (Date.now() - this.timingStartTime) / 1000;

    // Calculate heat accuracy from heat changes
    let heatAccuracy = 0.5; // base
    if (this.heatChanges.length > 0) {
      // Simple: more heat changes = more attentive = better (up to a point)
      heatAccuracy = Math.min(1, 0.4 + this.heatChanges.length * 0.1);
    }

    this.playerChoices.timing = {
      heatAccuracy,
      pullTime: elapsedSec
    };

    // Reaction
    if (elapsedSec >= window.sweet - 2 && elapsedSec <= window.sweet + 2) {
      UI.showDialogue('pooja', DIALOGUE.pooja.cooking.perfectTiming);
    } else if (elapsedSec < window.min) {
      UI.showDialogue('pooja', DIALOGUE.pooja.cooking.tooEarly);
    } else if (elapsedSec > window.max) {
      UI.showDialogue('pooja', DIALOGUE.pooja.cooking.tooLate);
    }

    UI.updateFlame('off');
    UI.updateBubbles(null);

    setTimeout(() => this.nextPhase(), 1000);
  },

  // ===== SERVING PHASE =====
  runServingPhase() {
    UI.clearDialogue();
    const thoughts = DIALOGUE.sean.thoughts.servingPhase;
    UI.showDialogue('sean', thoughts[Math.floor(Math.random() * thoughts.length)]);

    if (!this.state.taraMode) {
      const hints = DIALOGUE.tara.hints.serving;
      UI.showHint(hints.vessel.q, hints.vessel.a);
    }

    UI.renderServingPhase(VESSELS, (vessel, strained) => {
      this.playerChoices.serving = { vessel, strained };

      // Reactions
      const recipe = this.currentRecipe;
      if (vessel === recipe.serving.bestVessel) {
        UI.showDialogue('pooja', DIALOGUE.pooja.serving.rightVessel);
      } else {
        UI.showDialogue('pooja', DIALOGUE.pooja.serving.wrongVessel);
      }

      if (recipe.serving.shouldStrain && !strained) {
        UI.showDialogue('pooja', DIALOGUE.pooja.serving.notStrained);
      } else if (strained) {
        UI.showDialogue('pooja', DIALOGUE.pooja.serving.strained);
      }

      if (vessel === 'kulhad') {
        UI.showDialogue('pooja', DIALOGUE.pooja.serving.kulhad);
      } else if (vessel === 'cutting-glass') {
        UI.showDialogue('pooja', DIALOGUE.pooja.serving.cuttingGlass);
      }

      setTimeout(() => this.nextPhase(), 1200);
    });
  },

  // ===== FINISH LEVEL =====
  finishLevel() {
    const recipe = this.currentRecipe;
    const scoreData = Scoring.calculate(recipe, this.playerChoices);
    this.lastScore = scoreData;

    // Update best scores
    const prev = this.state.scores[recipe.id] || 0;
    if (scoreData.total > prev) {
      this.state.scores[recipe.id] = scoreData.total;
    }

    const prevStars = this.state.stars[recipe.id] || 0;
    if (scoreData.stars > prevStars) {
      this.state.stars[recipe.id] = scoreData.stars;
    }

    // Tara badge
    if (this.state.taraMode && scoreData.stars >= 3) {
      this.state.taraBadges[recipe.id] = true;
    }

    this.saveState();

    // Determine verdict
    const verdict = Scoring.getVerdict(scoreData.total);
    const lines = DIALOGUE.pooja.judging[verdict];
    const poojaLine = lines[Math.floor(Math.random() * lines.length)];

    // Check for unlocks
    let unlockMsg = '';
    RECIPES.forEach(r => {
      if (r.id > recipe.id && this.isLevelUnlocked(r)) {
        const wasLocked = !this.isLevelUnlockedBefore(r);
        if (wasLocked || r.id === recipe.id + 1) {
          unlockMsg = `${r.name} unlocked!`;
        }
      }
    });

    // Render judging screen
    UI.hideUnlock();
    UI.renderJudging(scoreData, recipe, poojaLine);
    UI.renderShareCard(scoreData, recipe);

    if (unlockMsg) {
      UI.showUnlock(unlockMsg);
    }

    UI.showScreen('judging-screen');
  },

  // Helper: check if a level was unlocked BEFORE this play
  isLevelUnlockedBefore(recipe) {
    if (!recipe.unlockCondition) return true;
    // This is a simplified check - in practice we'd need the pre-play state
    return false;
  }
};

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', () => Game.init());
