// share.js — Emoji grid generation and clipboard copy

const Share = {
  generateGrid(attempts, answer) {
    let grid = '';
    attempts.forEach(attempt => {
      let row = '';
      attempt.forEach((ingredientId, i) => {
        if (ingredientId === answer[i]) {
          row += '\u{1F7EB}'; // brown square
        } else if (answer.includes(ingredientId)) {
          row += '\u{1F7E1}'; // yellow circle
        } else {
          row += '\u2B1C'; // white square
        }
      });
      grid += row + '\n';
    });
    return grid.trim();
  },

  generateShareText(puzzleNumber, attempts, won, answer) {
    const grid = this.generateGrid(attempts, answer);
    const result = won ? `${attempts.length}/5` : 'X/5';

    // Pick Pooja quote based on result
    let quote = '';
    if (won && attempts.length <= 2) {
      quote = '"Beta, you have made me proud."';
    } else if (won && attempts.length <= 4) {
      quote = '"Not bad, beta! Your chai sense is growing!"';
    } else if (won) {
      quote = '"Phew! Just in time!"';
    } else {
      quote = '"We don\'t speak of this. Try again tomorrow."';
    }

    return `Chaidle #${puzzleNumber} \u2615 ${result}\n${grid}\n${quote}`;
  },

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (e2) {
        document.body.removeChild(textarea);
        return false;
      }
    }
  }
};
