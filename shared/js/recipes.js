// recipes.js - All 5 recipe data objects
const RECIPES = [
  {
    id: 1,
    name: "Basic Chai",
    description: "The foundation. Water, tea, sugar, milk — simple but must be perfect.",
    unlockCondition: null, // always available
    ingredients: {
      required: ["water", "tea-leaves", "sugar", "milk"],
      optional: ["extra-sugar"],
      traps: ["lemon", "coffee", "green-tea", "butter", "honey"]
    },
    prepSteps: {}, // no spice prep for level 1
    correctOrder: ["water", "sugar", "tea-leaves", "milk"],
    cooking: {
      initialHeat: "high",
      phases: [
        { action: "boil-water", heat: "high", description: "Bring water to a rolling boil" },
        { action: "add-sugar", heat: "high", description: "Add sugar to boiling water" },
        { action: "add-tea", heat: "medium", description: "Reduce heat, add tea leaves" },
        { action: "steep", heat: "low", duration: 3, description: "Let tea steep" },
        { action: "add-milk", heat: "medium", description: "Add milk" },
        { action: "final-boil", heat: "high", duration: 2, description: "Bring to a rolling boil" }
      ],
      timingWindow: { min: 8, sweet: 12, max: 16 }
    },
    serving: {
      bestVessel: "glass",
      shouldStrain: true
    },
    poojaIntro: "Let's start simple, beta. A proper chai needs love and patience. Show me what you've got!"
  },
  {
    id: 2,
    name: "Adrak (Ginger) Chai",
    description: "Fresh ginger transforms basic chai into medicine for the soul.",
    unlockCondition: { type: "beat", level: 1 },
    ingredients: {
      required: ["water", "tea-leaves", "sugar", "milk", "ginger"],
      optional: ["extra-sugar", "extra-ginger"],
      traps: ["lemon", "coffee", "ginger-powder", "cinnamon", "honey"]
    },
    prepSteps: {
      "ginger": { correct: "crush", options: ["crush", "slice", "grate", "whole", "grind"], hint: "Crushing releases the most flavor for chai" }
    },
    correctOrder: ["water", "ginger", "sugar", "tea-leaves", "milk"],
    cooking: {
      initialHeat: "high",
      phases: [
        { action: "boil-water", heat: "high", description: "Bring water to a boil" },
        { action: "add-ginger", heat: "high", description: "Add crushed ginger to boiling water" },
        { action: "simmer-ginger", heat: "medium", duration: 2, description: "Let ginger simmer" },
        { action: "add-sugar", heat: "medium", description: "Add sugar" },
        { action: "add-tea", heat: "medium", description: "Add tea leaves" },
        { action: "steep", heat: "low", duration: 3, description: "Let tea steep with ginger" },
        { action: "add-milk", heat: "medium", description: "Add milk" },
        { action: "final-boil", heat: "high", duration: 2, description: "Bring to a rolling boil" }
      ],
      timingWindow: { min: 10, sweet: 14, max: 18 }
    },
    serving: {
      bestVessel: "glass",
      shouldStrain: true
    },
    poojaIntro: "Adrak chai is what I make when someone has a cold. The ginger must be fresh and crushed — no shortcuts!"
  },
  {
    id: 3,
    name: "Masala Chai",
    description: "The crown jewel. Multiple spices in perfect harmony.",
    unlockCondition: { type: "stars", level: 2, minimum: 2 },
    ingredients: {
      required: ["water", "tea-leaves", "sugar", "milk", "cardamom", "cinnamon", "cloves", "ginger"],
      optional: ["black-pepper", "fennel"],
      traps: ["lemon", "coffee", "star-anise", "nutmeg", "vanilla"]
    },
    prepSteps: {
      "cardamom": { correct: "crush", options: ["crush", "whole", "grind", "slice"], hint: "Lightly crush to open the pod" },
      "cinnamon": { correct: "whole", options: ["whole", "grind", "crush", "slice"], hint: "A whole stick infuses slowly and beautifully" },
      "cloves": { correct: "whole", options: ["whole", "crush", "grind", "slice"], hint: "Whole cloves — crushing makes it too intense" },
      "ginger": { correct: "crush", options: ["crush", "slice", "grate", "whole", "grind"], hint: "Crush for maximum flavor" }
    },
    correctOrder: ["water", "ginger", "cardamom", "cinnamon", "cloves", "sugar", "tea-leaves", "milk"],
    cooking: {
      initialHeat: "high",
      phases: [
        { action: "boil-water", heat: "high", description: "Bring water to a boil" },
        { action: "add-spices", heat: "medium", description: "Add all spices to water" },
        { action: "simmer-spices", heat: "low", duration: 4, description: "Let spices infuse on low heat" },
        { action: "add-sugar", heat: "medium", description: "Add sugar" },
        { action: "add-tea", heat: "medium", description: "Add tea leaves" },
        { action: "steep", heat: "low", duration: 3, description: "Let tea steep with spices" },
        { action: "add-milk", heat: "medium", description: "Add milk" },
        { action: "final-boil", heat: "high", duration: 3, description: "Bring to a full rolling boil" }
      ],
      timingWindow: { min: 14, sweet: 18, max: 22 }
    },
    serving: {
      bestVessel: "kulhad",
      shouldStrain: true
    },
    poojaIntro: "Masala chai is an art. Every spice has its place and its time. Respect the spices, beta."
  },
  {
    id: 4,
    name: "Cutting Chai",
    description: "Mumbai street-style. Small, strong, and perfectly timed.",
    unlockCondition: { type: "stars", level: 3, minimum: 2 },
    ingredients: {
      required: ["water", "tea-leaves", "sugar", "milk", "ginger"],
      optional: ["cardamom"],
      traps: ["lemon", "coffee", "extra-milk", "cream", "honey"]
    },
    prepSteps: {
      "ginger": { correct: "grate", options: ["crush", "slice", "grate", "whole", "grind"], hint: "Grated ginger for quick, intense flavor" }
    },
    correctOrder: ["water", "ginger", "tea-leaves", "sugar", "milk"],
    cooking: {
      initialHeat: "high",
      phases: [
        { action: "boil-water", heat: "high", description: "Bring small amount of water to a boil" },
        { action: "add-ginger", heat: "high", description: "Add grated ginger" },
        { action: "add-tea", heat: "high", description: "Add extra tea leaves immediately" },
        { action: "strong-boil", heat: "high", duration: 2, description: "Boil hard to extract strong flavor" },
        { action: "add-sugar", heat: "high", description: "Add sugar" },
        { action: "add-milk", heat: "high", description: "Add milk — less than usual!" },
        { action: "final-boil", heat: "high", duration: 1, description: "Quick final boil — don't overdo it!" }
      ],
      timingWindow: { min: 5, sweet: 7, max: 9 }
    },
    serving: {
      bestVessel: "cutting-glass",
      shouldStrain: true
    },
    poojaIntro: "Cutting chai — the heartbeat of Mumbai! Small glass, big flavor. Every second counts here!"
  },
  {
    id: 5,
    name: "Pooja's Special Chai",
    description: "The ultimate test. Everything you've learned, plus a secret ingredient.",
    unlockCondition: { type: "total-stars", minimum: 9 },
    ingredients: {
      required: ["water", "tea-leaves", "sugar", "milk", "cardamom", "ginger", "saffron", "rose-water"],
      optional: ["black-pepper", "cinnamon", "fennel"],
      traps: ["lemon", "coffee", "vanilla", "cream", "honey", "star-anise"]
    },
    prepSteps: {
      "cardamom": { correct: "crush", options: ["crush", "whole", "grind", "slice"], hint: "Lightly crushed, as always" },
      "ginger": { correct: "crush", options: ["crush", "slice", "grate", "whole", "grind"], hint: "Crushed for depth" },
      "saffron": { correct: "whole", options: ["whole", "crush", "grind"], hint: "Whole strands — let them bloom in warm milk" }
    },
    correctOrder: ["water", "ginger", "cardamom", "sugar", "tea-leaves", "milk", "saffron", "rose-water"],
    cooking: {
      initialHeat: "high",
      phases: [
        { action: "boil-water", heat: "high", description: "Bring water to a boil" },
        { action: "add-ginger", heat: "medium", description: "Add crushed ginger" },
        { action: "add-cardamom", heat: "medium", description: "Add crushed cardamom" },
        { action: "simmer-spices", heat: "low", duration: 3, description: "Let spices infuse gently" },
        { action: "add-sugar", heat: "medium", description: "Add sugar" },
        { action: "add-tea", heat: "medium", description: "Add tea leaves" },
        { action: "steep", heat: "low", duration: 3, description: "Steep the tea" },
        { action: "add-milk", heat: "medium", description: "Add milk" },
        { action: "add-saffron", heat: "low", description: "Add saffron strands to warm milk" },
        { action: "gentle-simmer", heat: "low", duration: 3, description: "Gentle simmer — let saffron bloom" },
        { action: "add-rosewater", heat: "low", description: "Finish with a few drops of rose water" }
      ],
      timingWindow: { min: 16, sweet: 20, max: 24 }
    },
    serving: {
      bestVessel: "kulhad",
      shouldStrain: true
    },
    poojaIntro: "This is my special recipe. Saffron, rose water... this chai is love in a cup. Make me proud, Sean."
  }
];

// Ingredient display data
const INGREDIENT_DATA = {
  "water":        { emoji: "\u{1F4A7}", label: "Water", color: "#ADD8E6" },
  "tea-leaves":   { emoji: "\u{1FAB6}", label: "Tea Leaves", color: "#8B4513" },
  "sugar":        { emoji: "\u{1F9C2}", label: "Sugar", color: "#FFFACD" },
  "milk":         { emoji: "\u{1F95B}", label: "Milk", color: "#FFFEF0" },
  "ginger":       { emoji: "\u{1FADA}", label: "Fresh Ginger", color: "#DEB887" },
  "cardamom":     { emoji: "\u{1FAD8}", label: "Cardamom", color: "#90EE90" },
  "cinnamon":     { emoji: "\u{1FAB5}", label: "Cinnamon Stick", color: "#D2691E" },
  "cloves":       { emoji: "\u{1F33F}", label: "Cloves", color: "#654321" },
  "black-pepper": { emoji: "\u26AB",    label: "Black Pepper", color: "#333" },
  "fennel":       { emoji: "\u{1F33F}", label: "Fennel Seeds", color: "#9ACD32" },
  "saffron":      { emoji: "\u{1F33E}", label: "Saffron", color: "#FF8C00" },
  "rose-water":   { emoji: "\u{1F339}", label: "Rose Water", color: "#FFB6C1" },
  "lemon":        { emoji: "\u{1F34B}", label: "Lemon", color: "#FFF44F" },
  "coffee":       { emoji: "\u2615",    label: "Coffee", color: "#6F4E37" },
  "green-tea":    { emoji: "\u{1F375}", label: "Green Tea", color: "#90EE90" },
  "butter":       { emoji: "\u{1F9C8}", label: "Butter", color: "#FAFAD2" },
  "honey":        { emoji: "\u{1F36F}", label: "Honey", color: "#EB9605" },
  "ginger-powder":{ emoji: "\u{1F9C2}", label: "Ginger Powder", color: "#C4A35A" },
  "star-anise":   { emoji: "\u2B50",    label: "Star Anise", color: "#8B4513" },
  "nutmeg":       { emoji: "\u{1FAD8}", label: "Nutmeg", color: "#A0522D" },
  "vanilla":      { emoji: "\u{1F366}", label: "Vanilla", color: "#F3E5AB" },
  "extra-sugar":  { emoji: "\u{1F9C2}", label: "Extra Sugar", color: "#FFFACD" },
  "extra-ginger": { emoji: "\u{1FADA}", label: "Extra Ginger", color: "#DEB887" },
  "extra-milk":   { emoji: "\u{1F95B}", label: "Extra Milk", color: "#FFFEF0" },
  "cream":        { emoji: "\u{1F95B}", label: "Cream", color: "#FFFDD0" },
  "cutting-glass":{ emoji: "\u{1FAD6}", label: "Cutting Glass", color: "#C0C0C0" }
};

// Vessel data
const VESSELS = {
  "kulhad":       { emoji: "\u{1FAD6}", label: "Kulhad (Clay Cup)", description: "Traditional clay cup — earthy flavor" },
  "glass":        { emoji: "\u{1F95B}", label: "Glass", description: "Classic chai glass" },
  "cutting-glass":{ emoji: "\u{1F943}", label: "Cutting Glass", description: "Small Mumbai-style glass" },
  "mug":          { emoji: "\u2615",    label: "Mug", description: "Standard ceramic mug" }
};

// Preparation methods
const PREP_METHODS = {
  "crush": { label: "Crush", emoji: "\u{1F44A}", description: "Pound to release oils" },
  "slice": { label: "Slice", emoji: "\u{1F52A}", description: "Cut into thin pieces" },
  "grate": { label: "Grate", emoji: "\u{1FAD1}", description: "Finely grate" },
  "whole": { label: "Leave Whole", emoji: "\u{1F91A}", description: "Use as-is" },
  "grind": { label: "Grind", emoji: "\u{1FAF7}", description: "Grind to powder" }
};

// ===== CHAIDLE (Daily Puzzle) Data =====

// Ingredient pool for Chaidle — 15 ingredients used across all daily puzzles
const CHAIDLE_INGREDIENTS = [
  { id: "water",        emoji: "\u{1F4A7}", label: "Water" },
  { id: "tea-leaves",   emoji: "\u{1FAB6}", label: "Tea Leaves" },
  { id: "sugar",        emoji: "\u{1F9C2}", label: "Sugar" },
  { id: "milk",         emoji: "\u{1F95B}", label: "Milk" },
  { id: "ginger",       emoji: "\u{1FADA}", label: "Ginger" },
  { id: "cardamom",     emoji: "\u{1FAD8}", label: "Cardamom" },
  { id: "cinnamon",     emoji: "\u{1FAB5}", label: "Cinnamon" },
  { id: "cloves",       emoji: "\u{1F33F}", label: "Cloves" },
  { id: "black-pepper", emoji: "\u26AB",    label: "Pepper" },
  { id: "fennel",       emoji: "\u{1F33F}", label: "Fennel" },
  { id: "saffron",      emoji: "\u{1F33E}", label: "Saffron" },
  { id: "rose-water",   emoji: "\u{1F339}", label: "Rose Water" },
  { id: "honey",        emoji: "\u{1F36F}", label: "Honey" },
  { id: "jaggery",      emoji: "\u{1F36B}", label: "Jaggery" },
  { id: "strain",       emoji: "\u{1FAA3}", label: "Strain" }
];

// 55 daily recipes — each has exactly 5 ingredients in order
const DAILY_RECIPES = [
  { id: 1,  name: "Basic Chai",               answer: ["water", "sugar", "tea-leaves", "milk", "strain"] },
  { id: 2,  name: "Ginger Chai",              answer: ["water", "ginger", "tea-leaves", "sugar", "milk"] },
  { id: 3,  name: "Cardamom Chai",            answer: ["water", "cardamom", "tea-leaves", "sugar", "milk"] },
  { id: 4,  name: "Masala Chai",              answer: ["water", "ginger", "cardamom", "tea-leaves", "milk"] },
  { id: 5,  name: "Cutting Chai",             answer: ["water", "ginger", "tea-leaves", "milk", "strain"] },
  { id: 6,  name: "Cinnamon Chai",            answer: ["water", "cinnamon", "tea-leaves", "sugar", "milk"] },
  { id: 7,  name: "Clove Chai",               answer: ["water", "cloves", "tea-leaves", "sugar", "milk"] },
  { id: 8,  name: "Pepper Chai",              answer: ["water", "black-pepper", "tea-leaves", "sugar", "milk"] },
  { id: 9,  name: "Saffron Chai",             answer: ["water", "tea-leaves", "milk", "saffron", "sugar"] },
  { id: 10, name: "Rose Chai",                answer: ["water", "tea-leaves", "sugar", "milk", "rose-water"] },
  { id: 11, name: "Ginger Cardamom Chai",     answer: ["water", "ginger", "cardamom", "sugar", "milk"] },
  { id: 12, name: "Ginger Cinnamon Chai",     answer: ["water", "ginger", "cinnamon", "tea-leaves", "milk"] },
  { id: 13, name: "Spiced Milk Chai",         answer: ["water", "cardamom", "cinnamon", "milk", "sugar"] },
  { id: 14, name: "Fennel Chai",              answer: ["water", "fennel", "tea-leaves", "sugar", "milk"] },
  { id: 15, name: "Honey Ginger Chai",        answer: ["water", "ginger", "tea-leaves", "milk", "honey"] },
  { id: 16, name: "Double Spice Chai",        answer: ["water", "ginger", "cloves", "tea-leaves", "milk"] },
  { id: 17, name: "Bombay Cutting",           answer: ["water", "ginger", "tea-leaves", "sugar", "strain"] },
  { id: 18, name: "Jaggery Chai",             answer: ["water", "tea-leaves", "jaggery", "milk", "strain"] },
  { id: 19, name: "Saffron Rose Chai",        answer: ["water", "tea-leaves", "milk", "saffron", "rose-water"] },
  { id: 20, name: "Pooja's Morning Chai",     answer: ["water", "ginger", "cardamom", "tea-leaves", "sugar"] },
  { id: 21, name: "Cardamom Clove Chai",      answer: ["water", "cardamom", "cloves", "tea-leaves", "milk"] },
  { id: 22, name: "Warm Pepper Chai",         answer: ["water", "black-pepper", "ginger", "tea-leaves", "milk"] },
  { id: 23, name: "Sweet Fennel Chai",        answer: ["water", "fennel", "sugar", "tea-leaves", "milk"] },
  { id: 24, name: "Cinnamon Cardamom Chai",   answer: ["water", "cinnamon", "cardamom", "tea-leaves", "milk"] },
  { id: 25, name: "Strong Ginger Chai",       answer: ["water", "ginger", "ginger", "tea-leaves", "milk"] },
  { id: 26, name: "Royal Saffron Chai",       answer: ["water", "cardamom", "tea-leaves", "saffron", "milk"] },
  { id: 27, name: "Honey Rose Chai",          answer: ["water", "tea-leaves", "rose-water", "milk", "honey"] },
  { id: 28, name: "Jaggery Masala Chai",      answer: ["water", "ginger", "cardamom", "jaggery", "milk"] },
  { id: 29, name: "Fennel Ginger Chai",       answer: ["water", "fennel", "ginger", "tea-leaves", "milk"] },
  { id: 30, name: "Triple Spice Chai",        answer: ["water", "ginger", "cardamom", "cinnamon", "milk"] },
  { id: 31, name: "Clove Cinnamon Chai",      answer: ["water", "cloves", "cinnamon", "tea-leaves", "milk"] },
  { id: 32, name: "Pepper Cardamom Chai",     answer: ["water", "black-pepper", "cardamom", "tea-leaves", "milk"] },
  { id: 33, name: "Street Masala Chai",       answer: ["water", "ginger", "cloves", "sugar", "milk"] },
  { id: 34, name: "Evening Chai",             answer: ["water", "cardamom", "tea-leaves", "milk", "strain"] },
  { id: 35, name: "Office Chai",              answer: ["water", "sugar", "tea-leaves", "milk", "ginger"] },
  { id: 36, name: "Monsoon Chai",             answer: ["water", "ginger", "black-pepper", "sugar", "milk"] },
  { id: 37, name: "Festival Chai",            answer: ["water", "cardamom", "saffron", "milk", "sugar"] },
  { id: 38, name: "Grandmother's Chai",       answer: ["water", "ginger", "tea-leaves", "jaggery", "milk"] },
  { id: 39, name: "Wedding Chai",             answer: ["water", "cardamom", "saffron", "rose-water", "milk"] },
  { id: 40, name: "Roadside Chai",            answer: ["water", "ginger", "sugar", "tea-leaves", "milk"] },
  { id: 41, name: "Kolkata Chai",             answer: ["water", "cardamom", "sugar", "tea-leaves", "milk"] },
  { id: 42, name: "Fennel Cardamom Chai",     answer: ["water", "fennel", "cardamom", "tea-leaves", "milk"] },
  { id: 43, name: "Ginger Honey Chai",        answer: ["water", "ginger", "tea-leaves", "honey", "milk"] },
  { id: 44, name: "Saffron Cardamom Chai",    answer: ["water", "cardamom", "tea-leaves", "milk", "saffron"] },
  { id: 45, name: "Pepper Ginger Chai",       answer: ["water", "black-pepper", "ginger", "sugar", "milk"] },
  { id: 46, name: "Clove Ginger Chai",        answer: ["water", "cloves", "ginger", "tea-leaves", "milk"] },
  { id: 47, name: "Sweet Rose Chai",          answer: ["water", "tea-leaves", "sugar", "rose-water", "milk"] },
  { id: 48, name: "Jaggery Ginger Chai",      answer: ["water", "ginger", "tea-leaves", "jaggery", "strain"] },
  { id: 49, name: "Full Masala Chai",         answer: ["water", "ginger", "cardamom", "cloves", "milk"] },
  { id: 50, name: "Cinnamon Ginger Chai",     answer: ["water", "cinnamon", "ginger", "sugar", "milk"] },
  { id: 51, name: "Winter Chai",              answer: ["water", "ginger", "black-pepper", "cinnamon", "milk"] },
  { id: 52, name: "Summer Rose Chai",         answer: ["water", "tea-leaves", "rose-water", "sugar", "milk"] },
  { id: 53, name: "Fennel Pepper Chai",       answer: ["water", "fennel", "black-pepper", "tea-leaves", "milk"] },
  { id: 54, name: "Honey Cardamom Chai",      answer: ["water", "cardamom", "tea-leaves", "honey", "milk"] },
  { id: 55, name: "Pooja's Special",          answer: ["water", "ginger", "cardamom", "saffron", "rose-water"] }
];
