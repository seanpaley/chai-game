// dialogue.js - All character lines by context

const DIALOGUE = {
  pooja: {
    // Ingredient reactions
    ingredients: {
      correct: [
        "Yes! That's exactly right.",
        "Good choice, beta!",
        "Now you're thinking like a chai wallah!",
        "Perfect. This one is essential."
      ],
      optional: [
        "Ooh, nice touch! Not required, but I like the confidence.",
        "A little extra never hurt. Bold move!",
        "Someone's feeling adventurous today!"
      ],
      trap: {
        "lemon":      "Lemon?! In MY chai?! What is this, English tea time?!",
        "coffee":     "COFFEE?! Beta, this is a chai class, not a Starbucks!",
        "green-tea":  "Green tea?! We are making CHAI, not a detox smoothie!",
        "butter":     "Butter in chai? Are you making bulletproof nonsense?!",
        "honey":      "Honey is for parathas, not for real chai! Use sugar like a proper person!",
        "ginger-powder": "Powder?! We use FRESH ginger in this house!",
        "star-anise": "Star anise? This isn't pho! Stay focused!",
        "nutmeg":     "Nutmeg? What are you making, eggnog?!",
        "vanilla":    "Vanilla?! This is chai, not a milkshake!",
        "extra-milk": "That's way too much milk! This isn't a latte!",
        "cream":      "Cream?! Beta, this is chai, not dessert!"
      },
      missing: "You're forgetting something important... think about what makes chai, CHAI."
    },

    // Preparation reactions
    prep: {
      correct: "Exactly right! You can smell the difference, na?",
      wrong: {
        "crush": "No no, this one needs to be crushed. You want to release the oils!",
        "slice": "Slicing? For this ingredient, there's a better way...",
        "grate": "Grating is good for some things, but not this one right now.",
        "whole": "Using it whole won't give you enough flavor here.",
        "grind": "Grinding makes powder — too much too fast!"
      }
    },

    // Cooking reactions
    cooking: {
      heatTooHigh: "Too hot! You'll burn it! Lower the flame!",
      heatTooLow: "More heat, beta! Nothing is happening!",
      heatJustRight: "Perfect temperature. Now patience...",
      wrongOrder: "Wait wait wait! That's not the right time for that ingredient!",
      rightOrder: "Good timing. You're learning!",
      boilStarted: "See those bubbles? That's what we want!",
      milkAdded: "Now watch it carefully — it can boil over in seconds!",
      tooEarly: "Patience! It needs more time!",
      tooLate: "Oh no, it's been on too long! The tea is getting bitter!",
      perfectTiming: "PERFECT! Right on time! That's the chai instinct!"
    },

    // Serving reactions
    serving: {
      rightVessel: "Excellent choice! The perfect cup for this chai.",
      wrongVessel: "Hmm... not the ideal cup for this one, but okay.",
      strained: "Good, always strain! Nobody wants leaves in their teeth.",
      notStrained: "You didn't strain it?! Enjoy chewing your chai, I guess!",
      kulhad: "Kulhad! Now it will taste like the earth itself. Beautiful.",
      cuttingGlass: "The cutting glass! True Mumbai style!"
    },

    // Judging - final verdicts based on score ranges
    judging: {
      perfect: [
        "Beta, you have made me proud. This is PERFECT chai!",
        "I would serve this to my own mother. That is the highest compliment!",
        "Sean, you are now an honorary chai master. Don't let it go to your head."
      ],
      great: [
        "Very good, beta! A few small things, but I would happily drink this!",
        "You're getting there! This chai has heart!",
        "Not bad at all! Your coworkers would be impressed!"
      ],
      okay: [
        "It's... acceptable. My grandmother would say 'needs work.'",
        "I can taste the effort, beta. Keep practicing!",
        "It's drinkable. That's a start, I suppose."
      ],
      poor: [
        "Beta... we need to talk about what just happened.",
        "This is... I'll be honest, I've had chai from vending machines better than this.",
        "Don't worry, even I burned my first chai. Try again!"
      ],
      terrible: [
        "What IS this?! This is not chai, this is... I don't even have words!",
        "My ancestors are rolling in their graves. Start over, beta!",
        "I'm going to pretend I didn't see that. Let's try again, haan?"
      ]
    },

    // Level-specific intro lines
    levelIntro: {
      1: "Every great chai journey starts with the basics. Show me you understand the fundamentals!",
      2: "Ginger chai is comfort in a cup. But the ginger must be treated right!",
      3: "Masala chai is where art meets science. Every spice has its moment.",
      4: "Cutting chai — no room for error! Quick, strong, and precise!",
      5: "This is my special recipe. Saffron, rose water... pour your soul into this one."
    }
  },

  sean: {
    // Player thought bubbles
    thoughts: {
      ingredientPhase: [
        "Okay, what did Pooja say goes in chai...?",
        "Right, the basics: water, tea, sugar, milk. What else for this recipe?",
        "I should be careful — some of these don't belong in chai at ALL."
      ],
      prepPhase: [
        "How should I prepare this? Pooja is very particular...",
        "I think she said something about releasing the oils...",
        "Crush, slice, grate... what's right for this ingredient?"
      ],
      cookingPhase: [
        "Okay, heat control. Don't burn it, don't undercook it.",
        "Pooja said always start with water... I think.",
        "Watch the pot... wait for the right moment..."
      ],
      timingPhase: [
        "Is it ready? The color looks right...",
        "Don't pull it too early... but don't wait too long either!",
        "That rolling boil is the sign... I think!"
      ],
      servingPhase: [
        "Which cup would Pooja approve of?",
        "To strain or not to strain... definitely strain.",
        "Almost done! Just need to serve it right."
      ]
    },

    // Reactions to own mistakes
    mistakes: [
      "Oh no... that didn't look right.",
      "Pooja is going to have words about that...",
      "Maybe she didn't notice? ...She definitely noticed."
    ],

    // Reactions to doing well
    success: [
      "Hey, that actually looks right!",
      "Pooja seems pleased — I must be doing something right!",
      "I'm getting the hang of this!"
    ]
  },

  tara: {
    // Hint questions that prompt Pooja's answers
    hints: {
      ingredients: {
        1: { q: "Pooja, what are the basics of a good chai?", a: "Water, tea leaves, sugar, and milk. That's all you need to start!" },
        2: { q: "Should we use fresh ginger or powder?", a: "Always fresh! Powder is for lazy people. Fresh ginger has the real punch!" },
        3: { q: "How many spices go in masala chai?", a: "For a proper masala chai: cardamom, cinnamon, cloves, and ginger. Some add pepper too!" },
        4: { q: "What makes cutting chai different?", a: "Less milk, more tea, tiny glass. It's concentrated — every drop counts!" },
        5: { q: "What's the secret ingredient, Pooja?", a: "Saffron and rose water! But the REAL secret is making it with love." }
      },
      prep: {
        general: { q: "How should we prepare the spices?", a: "It depends on the spice! Crush cardamom and ginger, but cinnamon and cloves stay whole." },
        ginger: { q: "Why crush the ginger?", a: "Crushing breaks the fibers and releases all the juice. Slicing just isn't enough!" },
        cardamom: { q: "Do we open the cardamom pods?", a: "Lightly crush them — just enough to crack open. Don't grind them!" }
      },
      cooking: {
        order: { q: "Why add spices to cold water?", a: "Spices need time to open up. They infuse better when they heat up slowly with the water!" },
        heat: { q: "How do I know the heat is right?", a: "Watch the liquid! Gentle bubbles for simmering, big rolling bubbles for boiling." },
        timing: { q: "How do I know when it's ready?", a: "The color changes! Good chai is a rich, warm brown with a creamy top. And the aroma — you'll know!" }
      },
      serving: {
        vessel: { q: "Does the cup really matter?", a: "Of course! A kulhad adds earthiness, a cutting glass keeps it hot. The vessel is part of the experience!" },
        strain: { q: "Do we always need to strain?", a: "Unless you enjoy chewing tea leaves, YES! Always strain!" }
      }
    },

    // Tara mode (no hints) lines
    taraMode: {
      enabled: "Tara Mode: ON. No hints this time — you're on your own! Good luck!",
      disabled: "Tara Mode: OFF. I'll be here to ask Pooja questions for you!",
      badge: "You earned 3 stars without ANY hints?! That's the Tara Badge! Incredible!"
    }
  }
};
