// ui.js - DOM rendering: ingredient shelf, pot, timer, dialogue bubbles

const UI = {
  // Cache DOM elements
  els: {},

  init() {
    this.els = {
      screens: document.querySelectorAll('.screen'),
      potLiquid: document.querySelector('.pot-liquid'),
      potContents: document.querySelector('.pot-contents'),
      steamContainer: document.querySelector('.steam-container'),
      flameContainer: document.querySelector('.flame-container'),
      bubbleContainer: document.querySelector('.bubble-container'),
      interactionPanel: document.querySelector('.interaction-panel'),
      phaseTitle: document.querySelector('.phase-title'),
      phaseInstruction: document.querySelector('.phase-instruction'),
      phaseDots: document.querySelectorAll('.phase-dot'),
      characterArea: document.querySelector('.character-area'),
      levelGrid: document.querySelector('.level-grid'),
      gameLevelTitle: document.querySelector('.game-level-title'),
      recipeList: document.querySelector('.recipe-list'),
      sharedResult: document.querySelector('.shared-result')
    };
  },

  // ===== SCREEN NAVIGATION =====
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
  },

  // ===== LEVEL SELECT =====
  renderLevelSelect(gameState) {
    const grid = this.els.levelGrid;
    if (!grid) return;
    grid.innerHTML = '';

    RECIPES.forEach(recipe => {
      const unlocked = Game.isLevelUnlocked(recipe);
      const bestScore = gameState.scores[recipe.id] || 0;
      const bestStars = gameState.stars[recipe.id] || 0;

      const card = document.createElement('div');
      card.className = `level-card${unlocked ? '' : ' locked'}`;
      card.innerHTML = `
        <div class="level-num">${recipe.id}</div>
        <div class="level-info">
          <h3>${recipe.name}</h3>
          <p>${unlocked ? recipe.description : 'Locked'}</p>
        </div>
        <div class="level-stars">${this.renderStars(bestStars)}</div>
      `;

      if (unlocked) {
        card.addEventListener('click', () => Game.startLevel(recipe.id));
      }

      grid.appendChild(card);
    });
  },

  renderStars(count) {
    let s = '';
    for (let i = 0; i < 3; i++) {
      s += i < count ? '\u2B50' : '\u2606';
    }
    return s;
  },

  // ===== RECIPE BOOK =====
  renderRecipeBook(gameState) {
    const list = this.els.recipeList;
    if (!list) return;
    list.innerHTML = '';

    RECIPES.forEach(recipe => {
      const unlocked = gameState.stars[recipe.id] > 0;
      const card = document.createElement('div');
      card.className = `recipe-card${unlocked ? '' : ' recipe-locked'}`;

      if (unlocked) {
        card.innerHTML = `
          <h3>${recipe.name}</h3>
          <p>${recipe.description}</p>
          <div class="recipe-ingredients">
            ${recipe.ingredients.required.map(ing => {
              const data = INGREDIENT_DATA[ing];
              return `<span>${data ? data.emoji : ''} ${data ? data.label : ing}</span>`;
            }).join('')}
          </div>
        `;
      } else {
        card.innerHTML = `
          <h3>??? Locked Recipe</h3>
          <p>Complete the level to unlock this recipe!</p>
        `;
      }

      list.appendChild(card);
    });
  },

  // ===== POT VISUALS =====
  updatePot(potState) {
    const liquid = this.els.potLiquid;
    if (!liquid) return;

    // Update liquid level
    liquid.style.height = potState.liquidLevel + '%';

    // Update liquid color class
    liquid.className = 'pot-liquid';
    if (potState.colorClass) liquid.classList.add(potState.colorClass);

    // Update contents (emoji display)
    const contents = this.els.potContents;
    if (contents) {
      contents.innerHTML = potState.contents.map(ing => {
        const data = INGREDIENT_DATA[ing];
        return `<span class="ingredient-drop">${data ? data.emoji : '?'}</span>`;
      }).join('');
    }
  },

  updateSteam(visible) {
    const steam = this.els.steamContainer;
    if (steam) steam.classList.toggle('visible', visible);
  },

  updateFlame(heat) {
    const flame = this.els.flameContainer;
    if (!flame) return;
    flame.className = 'flame-container';
    if (heat) flame.classList.add('heat-' + heat);
  },

  updateBubbles(intensity) {
    const bubbles = this.els.bubbleContainer;
    if (!bubbles) return;
    bubbles.className = 'bubble-container';
    if (intensity) bubbles.classList.add(intensity);
  },

  // ===== PHASE RENDERING =====
  setPhase(phaseIndex, totalPhases) {
    this.els.phaseDots.forEach((dot, i) => {
      dot.classList.remove('active', 'done');
      if (i < phaseIndex) dot.classList.add('done');
      else if (i === phaseIndex) dot.classList.add('active');
    });
  },

  setPhaseTitle(title) {
    if (this.els.phaseTitle) this.els.phaseTitle.textContent = title;
  },

  setPhaseInstruction(text) {
    if (this.els.phaseInstruction) this.els.phaseInstruction.textContent = text;
  },

  // ===== INGREDIENT SHELF =====
  renderIngredientShelf(allIngredients, selected, onSelect) {
    const panel = this.els.interactionPanel;
    if (!panel) return;

    let shelfHTML = '<div class="phase-title">Select Ingredients</div>';
    shelfHTML += '<div class="phase-instruction">Click ingredients to add to your chai</div>';
    shelfHTML += '<div class="ingredient-shelf">';

    allIngredients.forEach(id => {
      const data = INGREDIENT_DATA[id];
      if (!data) return;
      const isSelected = selected.includes(id);
      shelfHTML += `
        <div class="ingredient-tile ${isSelected ? 'selected' : ''}" data-ingredient="${id}">
          <span class="ing-emoji">${data.emoji}</span>
          <span class="ing-label">${data.label}</span>
        </div>
      `;
    });

    shelfHTML += '</div>';
    shelfHTML += '<div class="phase-actions"><button class="btn btn-primary" id="confirm-ingredients">Done Selecting</button></div>';

    panel.innerHTML = shelfHTML;

    // Bind click events
    panel.querySelectorAll('.ingredient-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const id = tile.dataset.ingredient;
        onSelect(id);
      });
    });
  },

  updateIngredientTile(id, status) {
    const tile = document.querySelector(`.ingredient-tile[data-ingredient="${id}"]`);
    if (!tile) return;
    tile.classList.remove('selected', 'trap-selected', 'shake', 'pulse');
    if (status === 'selected') {
      tile.classList.add('selected', 'pulse');
    } else if (status === 'trap') {
      tile.classList.add('trap-selected', 'shake');
    } else if (status === 'deselected') {
      // default state
    }
  },

  // ===== PREPARATION PHASE =====
  renderPrepPhase(ingredientsToPrep, prepMethods, onSelect) {
    const panel = this.els.interactionPanel;
    if (!panel) return;

    const keys = Object.keys(ingredientsToPrep);
    if (keys.length === 0) return;

    const currentKey = keys[0];
    const ingData = INGREDIENT_DATA[currentKey];
    const step = ingredientsToPrep[currentKey];

    let html = `<div class="phase-title">Prepare: ${ingData ? ingData.label : currentKey}</div>`;
    html += `<div class="phase-instruction">How should you prepare this ingredient?</div>`;
    html += '<div class="prep-options">';

    step.options.forEach(method => {
      const mData = PREP_METHODS[method];
      html += `
        <div class="prep-btn" data-method="${method}">
          ${mData ? mData.emoji : ''} ${mData ? mData.label : method}
        </div>
      `;
    });

    html += '</div>';
    panel.innerHTML = html;

    panel.querySelectorAll('.prep-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        onSelect(currentKey, btn.dataset.method);
      });
    });
  },

  highlightPrepChoice(method, correct) {
    const btn = document.querySelector(`.prep-btn[data-method="${method}"]`);
    if (btn) {
      btn.classList.add('selected');
      if (!correct) btn.classList.add('shake');
    }
  },

  // ===== COOKING PHASE =====
  renderCookingPhase(ingredientsToAdd, onAdd, onUndo) {
    const panel = this.els.interactionPanel;
    if (!panel) return;

    let html = '<div class="phase-title">Cooking</div>';
    html += '<div class="phase-instruction">Click each ingredient to add it to the pot, one at a time. The order you add them matters! Use the heat buttons on the left.</div>';
    html += '<div class="cooking-step" id="cooking-step">Step 1 of ' + ingredientsToAdd.length + ': Choose what to add first</div>';
    html += '<div class="cooking-timeline">';

    ingredientsToAdd.forEach(id => {
      const data = INGREDIENT_DATA[id];
      html += `
        <div class="timeline-ingredient" data-ingredient="${id}">
          ${data ? data.emoji : ''} ${data ? data.label : id}
        </div>
      `;
    });

    html += '</div>';
    html += '<div class="phase-actions"><button class="btn btn-ghost btn-small" id="undo-cooking" disabled>Undo Last</button></div>';
    panel.innerHTML = html;

    panel.querySelectorAll('.timeline-ingredient').forEach(el => {
      el.addEventListener('click', () => {
        if (!el.classList.contains('added')) {
          onAdd(el.dataset.ingredient);
        }
      });
    });

    document.getElementById('undo-cooking').addEventListener('click', () => {
      onUndo();
    });
  },

  updateCookingStep(current, total) {
    const el = document.getElementById('cooking-step');
    if (el) {
      if (current >= total) {
        el.textContent = 'All added! Moving on...';
      } else {
        el.textContent = `Step ${current + 1} of ${total}: Choose what to add next`;
      }
    }
  },

  markIngredientAdded(id) {
    const el = document.querySelector(`.timeline-ingredient[data-ingredient="${id}"]`);
    if (el) {
      el.classList.add('added');
      el.textContent = '\u2705 ' + el.textContent.trim();
    }
  },

  unmarkIngredientAdded(id) {
    const el = document.querySelector(`.timeline-ingredient[data-ingredient="${id}"]`);
    if (el) {
      el.classList.remove('added');
      const data = INGREDIENT_DATA[id];
      el.textContent = '';
      el.innerHTML = `${data ? data.emoji : ''} ${data ? data.label : id}`;
    }
  },

  updateUndoButton(enabled) {
    const btn = document.getElementById('undo-cooking');
    if (btn) btn.disabled = !enabled;
  },

  // ===== TIMING PHASE =====
  renderTimingPhase(duration, sweetSpotStart, sweetSpotEnd, onPull) {
    const panel = this.els.interactionPanel;
    if (!panel) return;

    const sweetLeft = (sweetSpotStart / duration) * 100;
    const sweetWidth = ((sweetSpotEnd - sweetSpotStart) / duration) * 100;

    let html = '<div class="phase-title">Timing</div>';
    html += '<div class="phase-instruction">Pull the chai off the heat at the perfect moment!</div>';
    html += '<div class="timing-meter-container">';
    html += `<div class="timing-meter">
      <div class="timing-sweet-spot" style="left:${sweetLeft}%;width:${sweetWidth}%"></div>
      <div class="timing-marker" id="timing-marker"></div>
    </div>`;
    html += '<div class="timing-label">Watch the color and bubbles... pull when ready!</div>';
    html += '</div>';
    html += '<div class="phase-actions"><button class="btn btn-primary" id="pull-btn">Pull Off Heat!</button></div>';

    panel.innerHTML = html;

    document.getElementById('pull-btn').addEventListener('click', onPull);
  },

  updateTimingMarker(pct) {
    const marker = document.getElementById('timing-marker');
    if (marker) marker.style.left = pct + '%';
  },

  // ===== SERVING PHASE =====
  renderServingPhase(vessels, onServe) {
    const panel = this.els.interactionPanel;
    if (!panel) return;

    let html = '<div class="phase-title">Serve</div>';
    html += '<div class="phase-instruction">Choose a vessel and decide whether to strain.</div>';
    html += '<div class="vessel-options">';

    Object.keys(vessels).forEach(key => {
      const v = vessels[key];
      html += `
        <div class="vessel-tile" data-vessel="${key}">
          <span class="vessel-emoji">${v.emoji}</span>
          <span class="vessel-label">${v.label}</span>
        </div>
      `;
    });

    html += '</div>';
    html += '<div class="strain-toggle">';
    html += '<div class="strain-btn" data-strain="true">Strain</div>';
    html += '<div class="strain-btn" data-strain="false">Don\'t Strain</div>';
    html += '</div>';
    html += '<div class="phase-actions"><button class="btn btn-primary" id="serve-btn" disabled>Serve Chai</button></div>';

    panel.innerHTML = html;

    let selectedVessel = null;
    let selectedStrain = null;

    panel.querySelectorAll('.vessel-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        panel.querySelectorAll('.vessel-tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        selectedVessel = tile.dataset.vessel;
        checkReady();
      });
    });

    panel.querySelectorAll('.strain-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.strain-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedStrain = btn.dataset.strain === 'true';
        checkReady();
      });
    });

    function checkReady() {
      const serveBtn = document.getElementById('serve-btn');
      if (selectedVessel && selectedStrain !== null) {
        serveBtn.disabled = false;
        serveBtn.onclick = () => onServe(selectedVessel, selectedStrain);
      }
    }
  },

  // ===== CHARACTER DIALOGUES =====
  showDialogue(character, text) {
    const area = this.els.characterArea;
    if (!area) return;

    const avatars = { pooja: '\u{1F469}\u200D\u{1F373}', sean: '\u{1F468}\u200D\u{1F4BB}', tara: '\u{1F469}\u200D\u{1F3A4}' };
    const names = { pooja: 'Pooja', sean: 'Sean', tara: 'Tara' };

    // Find or create bubble for this character
    let bubble = area.querySelector(`.character-bubble[data-char="${character}"]`);
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'character-bubble';
      bubble.dataset.char = character;
      bubble.innerHTML = `
        <div class="avatar avatar-${character}">
          ${avatars[character] || '?'}
          <span class="avatar-label">${names[character] || character}</span>
        </div>
        <div class="bubble-content"></div>
      `;
      area.appendChild(bubble);
    }

    const content = bubble.querySelector('.bubble-content');
    if (character === 'sean') {
      content.innerHTML = `<div class="thought-bubble">${text}</div>`;
    } else {
      content.innerHTML = `<div class="speech-bubble speech-bubble-${character}">${text}</div>`;
    }
  },

  showHint(question, answer) {
    const area = this.els.characterArea;
    if (!area) return;

    let bubble = area.querySelector('.character-bubble[data-char="tara"]');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'character-bubble';
      bubble.dataset.char = 'tara';
      bubble.innerHTML = `
        <div class="avatar avatar-tara">
          \u{1F469}\u200D\u{1F3A4}
          <span class="avatar-label">Tara</span>
        </div>
        <div class="bubble-content"></div>
      `;
      area.appendChild(bubble);
    }

    const content = bubble.querySelector('.bubble-content');
    content.innerHTML = `
      <div class="hint-bubble">
        <div class="hint-question">${question}</div>
        <div class="hint-answer">${answer}</div>
      </div>
    `;
  },

  clearDialogue() {
    const area = this.els.characterArea;
    if (area) area.innerHTML = '';
  },

  // ===== JUDGING SCREEN =====
  renderJudging(scoreData, recipe, poojaLine) {
    document.getElementById('judge-verdict').textContent = `"${poojaLine}"`;
    document.getElementById('score-value').textContent = scoreData.total;
    document.getElementById('score-value').classList.add('score-reveal');

    // Stars
    const starDisplay = document.getElementById('star-display');
    starDisplay.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.className = 'star-animate';
      span.textContent = i < scoreData.stars ? '\u2B50' : '\u2606';
      starDisplay.appendChild(span);
    }

    // Breakdown
    const bd = document.getElementById('score-breakdown');
    bd.innerHTML = '';
    const categories = [
      { name: 'Ingredients', score: scoreData.ingredients.score },
      { name: 'Preparation', score: scoreData.preparation.score },
      { name: 'Order', score: scoreData.order.score },
      { name: 'Timing', score: scoreData.timing.score },
      { name: 'Presentation', score: scoreData.presentation.score }
    ];
    categories.forEach(cat => {
      const div = document.createElement('div');
      div.className = 'breakdown-item';
      div.innerHTML = `<span class="cat-name">${cat.name}</span><span class="cat-score">${cat.score}/20</span>`;
      bd.appendChild(div);
    });

    // Level name
    document.getElementById('judge-level-name').textContent = recipe.name;
  },

  showUnlock(message) {
    const el = document.getElementById('unlock-message');
    if (el) {
      el.textContent = message;
      el.classList.add('visible');
    }
  },

  hideUnlock() {
    const el = document.getElementById('unlock-message');
    if (el) el.classList.remove('visible');
  },

  // ===== SHARE =====
  renderShareCard(scoreData, recipe) {
    const card = document.getElementById('share-card');
    if (!card) return;
    card.querySelector('.share-level').textContent = recipe.name;
    card.querySelector('.share-score').textContent = scoreData.total + '/100';
    card.querySelector('.share-stars').textContent = UI.renderStars(scoreData.stars);
  },

  // ===== SHARED RESULT DISPLAY =====
  showSharedResult(level, score) {
    const el = this.els.sharedResult;
    if (!el) return;
    const recipe = RECIPES.find(r => r.id === level);
    el.querySelector('.score-big').textContent = score + '/100';
    el.querySelector('.level-name').textContent = recipe ? recipe.name : 'Level ' + level;
    el.classList.add('visible');
  }
};
