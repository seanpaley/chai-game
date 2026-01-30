// scoring.js - Pure scoring logic

const Scoring = {
  /**
   * Calculate total score for a level attempt
   * @param {object} recipe - The recipe definition from RECIPES
   * @param {object} playerChoices - What the player did
   * @returns {object} Detailed score breakdown
   */
  calculate(recipe, playerChoices) {
    const breakdown = {
      ingredients: this.scoreIngredients(recipe, playerChoices.ingredients || []),
      preparation: this.scorePreparation(recipe, playerChoices.preparations || {}),
      order: this.scoreOrder(recipe, playerChoices.addOrder || []),
      timing: this.scoreTiming(recipe, playerChoices.timing || {}),
      presentation: this.scorePresentation(recipe, playerChoices.serving || {})
    };

    breakdown.total = breakdown.ingredients.score +
                      breakdown.preparation.score +
                      breakdown.order.score +
                      breakdown.timing.score +
                      breakdown.presentation.score;

    breakdown.stars = this.getStars(breakdown.total);
    breakdown.maxScore = 100;

    return breakdown;
  },

  /**
   * Score ingredient selection (0-20 points)
   */
  scoreIngredients(recipe, selected) {
    const required = recipe.ingredients.required;
    const optional = recipe.ingredients.optional || [];
    const traps = recipe.ingredients.traps || [];

    let score = 0;
    const details = { correct: [], missing: [], traps: [], optional: [] };

    // Points for each required ingredient (up to 16 points)
    const perRequired = required.length > 0 ? 16 / required.length : 0;
    required.forEach(ing => {
      if (selected.includes(ing)) {
        score += perRequired;
        details.correct.push(ing);
      } else {
        details.missing.push(ing);
      }
    });

    // Bonus for optional ingredients (up to 4 points)
    const optionalSelected = selected.filter(s => optional.includes(s));
    if (optionalSelected.length > 0) {
      score += Math.min(4, optionalSelected.length * 2);
      details.optional = optionalSelected;
    }

    // Penalty for trap ingredients (-4 each, minimum 0 total)
    const trapSelected = selected.filter(s => traps.includes(s));
    trapSelected.forEach(t => {
      score -= 4;
      details.traps.push(t);
    });

    score = Math.max(0, Math.min(20, Math.round(score)));
    return { score, details };
  },

  /**
   * Score preparation methods (0-20 points)
   */
  scorePreparation(recipe, preparations) {
    const prepSteps = recipe.prepSteps;
    const stepKeys = Object.keys(prepSteps);

    // If no prep steps required, give full marks
    if (stepKeys.length === 0) {
      return { score: 20, details: { note: "No preparation required" } };
    }

    let score = 0;
    const perStep = 20 / stepKeys.length;
    const details = { correct: [], wrong: [] };

    stepKeys.forEach(key => {
      const expected = prepSteps[key].correct;
      const actual = preparations[key];
      if (actual === expected) {
        score += perStep;
        details.correct.push({ ingredient: key, method: actual });
      } else {
        // Partial credit for reasonable methods
        score += perStep * 0.25;
        details.wrong.push({ ingredient: key, expected, actual: actual || "none" });
      }
    });

    score = Math.max(0, Math.min(20, Math.round(score)));
    return { score, details };
  },

  /**
   * Score ingredient order (0-20 points)
   */
  scoreOrder(recipe, playerOrder) {
    const correctOrder = recipe.correctOrder;

    if (playerOrder.length === 0) return { score: 0, details: { note: "No ingredients added" } };

    // Filter player order to only include ingredients in the correct order
    const relevantOrder = playerOrder.filter(i => correctOrder.includes(i));

    // Calculate longest common subsequence for partial credit
    let matchCount = 0;
    let correctIdx = 0;
    const details = { matches: [], outOfOrder: [] };

    relevantOrder.forEach(item => {
      const expectedIdx = correctOrder.indexOf(item);
      if (expectedIdx >= correctIdx) {
        matchCount++;
        correctIdx = expectedIdx + 1;
        details.matches.push(item);
      } else {
        details.outOfOrder.push(item);
      }
    });

    const ratio = correctOrder.length > 0 ? matchCount / correctOrder.length : 0;
    const score = Math.max(0, Math.min(20, Math.round(ratio * 20)));

    return { score, details };
  },

  /**
   * Score timing and heat control (0-20 points)
   */
  scoreTiming(recipe, timing) {
    let score = 0;
    const details = {};

    // Heat control accuracy (0-10 points)
    const heatAccuracy = timing.heatAccuracy || 0; // 0-1 scale
    const heatScore = Math.round(heatAccuracy * 10);
    score += heatScore;
    details.heatScore = heatScore;

    // Final timing - how close to the sweet spot (0-10 points)
    const window = recipe.cooking.timingWindow;
    const pullTime = timing.pullTime || 0;

    if (pullTime >= window.min && pullTime <= window.max) {
      // Within acceptable range
      const distFromSweet = Math.abs(pullTime - window.sweet);
      const maxDist = Math.max(window.sweet - window.min, window.max - window.sweet);
      const timingRatio = 1 - (distFromSweet / maxDist);
      const timingScore = Math.round(timingRatio * 10);
      score += timingScore;
      details.timingScore = timingScore;
      details.pullTime = pullTime;
      details.sweet = window.sweet;
    } else {
      details.timingScore = 0;
      details.pullTime = pullTime;
      details.outOfRange = true;
    }

    score = Math.max(0, Math.min(20, score));
    return { score, details };
  },

  /**
   * Score presentation (0-20 points)
   */
  scorePresentation(recipe, serving) {
    let score = 0;
    const details = {};

    // Vessel choice (0-12 points)
    if (serving.vessel === recipe.serving.bestVessel) {
      score += 12;
      details.vessel = "perfect";
    } else if (serving.vessel) {
      score += 6; // Any vessel is worth something
      details.vessel = "acceptable";
    } else {
      details.vessel = "none";
    }

    // Straining (0-8 points)
    if (recipe.serving.shouldStrain) {
      if (serving.strained) {
        score += 8;
        details.strained = "correct";
      } else {
        details.strained = "should have strained";
      }
    } else {
      // If straining isn't required, give points either way
      score += 8;
      details.strained = "not required";
    }

    score = Math.max(0, Math.min(20, score));
    return { score, details };
  },

  /**
   * Convert total score to stars
   */
  getStars(total) {
    if (total >= 85) return 3;
    if (total >= 70) return 2;
    if (total >= 50) return 1;
    return 0;
  },

  /**
   * Get judge verdict category based on score
   */
  getVerdict(total) {
    if (total >= 85) return "perfect";
    if (total >= 70) return "great";
    if (total >= 50) return "okay";
    if (total >= 30) return "poor";
    return "terrible";
  }
};
