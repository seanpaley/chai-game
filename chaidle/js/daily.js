// daily.js — Date-seeded puzzle selection, replay prevention, countdown

const Daily = {
  EPOCH: new Date(2025, 0, 1), // Jan 1 2025

  getDayNumber() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((today - this.EPOCH) / 86400000);
  },

  getTodayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },

  // Seeded PRNG (mulberry32)
  seededRandom(seed) {
    let t = seed + 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  },

  getDailyPuzzle() {
    const dayNum = this.getDayNumber();
    const rand = this.seededRandom(dayNum);
    const index = Math.floor(rand * DAILY_RECIPES.length);
    return {
      puzzle: DAILY_RECIPES[index],
      number: dayNum
    };
  },

  hasPlayedToday() {
    const saved = localStorage.getItem('chaidleLastPlayed');
    return saved === this.getTodayKey();
  },

  markPlayed() {
    localStorage.setItem('chaidleLastPlayed', this.getTodayKey());
  },

  // Load saved game state for today
  loadTodayState() {
    try {
      const saved = localStorage.getItem('chaidleGameState');
      if (!saved) return null;
      const state = JSON.parse(saved);
      if (state.date !== this.getTodayKey()) return null;
      return state;
    } catch (e) {
      return null;
    }
  },

  saveTodayState(state) {
    state.date = this.getTodayKey();
    localStorage.setItem('chaidleGameState', JSON.stringify(state));
  },

  clearTodayState() {
    localStorage.removeItem('chaidleGameState');
    localStorage.removeItem('chaidleLastPlayed');
  },

  // Countdown to next puzzle
  getTimeToNextPuzzle() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = tomorrow - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  }
};
