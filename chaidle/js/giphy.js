// giphy.js — Display curated GIFs at key game moments
// Uses direct Giphy media URLs (no API key required)

const Giphy = {
  gifs: {
    winEarly: [
      'https://media.giphy.com/media/p4tA4P0FCgbv4ouTf4/giphy.gif',  // Happy Deepika Padukone
      'https://media.giphy.com/media/1hA1EpKqr7BIC11kbG/giphy.gif',  // Celebrate Shah Rukh Khan
      'https://media.giphy.com/media/1tHVHRCKx9fvmYipFW/giphy.gif',  // Happy Republic Day Hrithik
      'https://media.giphy.com/media/zfnNtcThZaTxRNxgYT/giphy.gif'   // Dance Love celebration
    ],
    winMid: [
      'https://media.giphy.com/media/H8IA12aTDZ2Mlp1ooZ/giphy.gif',  // Good Vibes Love
      'https://media.giphy.com/media/RDzCvd2WtvsbQgYWAG/giphy.gif',  // Wagh Bakri Tea love
      'https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif',  // Thumbs up
      'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif'     // Cheers
    ],
    winClutch: [
      'https://media.giphy.com/media/EDt1m8p5hqXG8/giphy.gif',       // Relief wipe sweat
      'https://media.giphy.com/media/JMV7IKoqzxlrW/giphy.gif',       // Relief so relieved
      'https://media.giphy.com/media/KR9OgQyWAwIIE/giphy.gif',       // Relief exhale
      'https://media.giphy.com/media/4PT6v3PQKG6Yg/giphy.gif'        // Phew
    ],
    lose: [
      'https://media.giphy.com/media/YPFZW07dFFi0kaSdOz/giphy.gif',  // Mood reaction
      'https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif',       // Facepalm
      'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif',       // Dramatic no
      'https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif'   // Disappointed
    ],
    bollywood: [
      'https://media.giphy.com/media/3o6wrpn8peK6TuAa64/giphy.gif',  // Katrina Kaif Bollywood
      'https://media.giphy.com/media/3ohfFs6InH1536JDt6/giphy.gif',  // Bollywood India dance
      'https://media.giphy.com/media/l1IYejlEUC43LhN4Y/giphy.gif',  // Hrithik Roshan India
      'https://media.giphy.com/media/3o6wrrI7piafCoRlwk/giphy.gif'   // Katrina Kaif dance
    ]
  },

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  show(containerId, tagsKey) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var gifPool = this.gifs[tagsKey];
    if (!gifPool || gifPool.length === 0) return;

    var gifUrl = this.pickRandom(gifPool);

    // Insert directly into DOM — let browser handle loading
    container.innerHTML =
      '<img src="' + gifUrl + '" alt="Reaction GIF">' +
      '<div class="gif-credit">Powered by GIPHY</div>';

    // If the image errors, hide the container gracefully
    var img = container.querySelector('img');
    if (img) {
      img.onerror = function() { container.innerHTML = ''; };
    }
  }
};
