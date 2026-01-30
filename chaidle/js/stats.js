// stats.js — Streak tracking, win distribution, stats modal

const Stats = {
  defaults: {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0], // wins by attempt (index 0 = attempt 1)
    lastPlayedDate: null
  },

  load() {
    try {
      const saved = localStorage.getItem('chaidleStats');
      if (saved) {
        return { ...this.defaults, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return { ...this.defaults };
  },

  save(stats) {
    localStorage.setItem('chaidleStats', JSON.stringify(stats));
  },

  recordGame(won, attempts) {
    const stats = this.load();
    const todayKey = Daily.getTodayKey();

    stats.gamesPlayed++;

    if (won) {
      stats.gamesWon++;
      stats.distribution[attempts - 1]++;
    }

    // Streak logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (won) {
      if (stats.lastPlayedDate === yesterdayKey || stats.lastPlayedDate === null) {
        stats.currentStreak++;
      } else if (stats.lastPlayedDate !== todayKey) {
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 0;
    }

    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.lastPlayedDate = todayKey;

    this.save(stats);
    return stats;
  },

  renderModal() {
    const stats = this.load();
    const maxDist = Math.max(1, ...stats.distribution);

    let distHTML = '';
    for (let i = 0; i < 5; i++) {
      const val = stats.distribution[i];
      const pct = Math.max(8, (val / maxDist) * 100);
      distHTML += `
        <div class="dist-row">
          <span class="dist-label">${i + 1}</span>
          <div class="dist-bar-wrap">
            <div class="dist-bar" style="width:${pct}%">${val}</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="stats-overlay" id="stats-overlay">
        <div class="stats-modal">
          <div class="stats-header">
            <h2>Statistics</h2>
            <button class="stats-close" id="stats-close">&times;</button>
          </div>
          <div class="stats-numbers">
            <div class="stat-box">
              <div class="stat-value">${stats.gamesPlayed}</div>
              <div class="stat-label">Played</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}</div>
              <div class="stat-label">Win %</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.currentStreak}</div>
              <div class="stat-label">Current Streak</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.maxStreak}</div>
              <div class="stat-label">Max Streak</div>
            </div>
          </div>
          <h3>Guess Distribution</h3>
          <div class="stats-distribution">
            ${distHTML}
          </div>
        </div>
      </div>
    `;
  }
};
