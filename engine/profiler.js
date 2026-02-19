// ARK Server Configuration AI — Player Profiler
// Translates Q&A answers (sliders 1–10) into a structured PlayerProfile

/**
 * @typedef {Object} PlayerProfile
 * @property {'beginner'|'intermediate'|'veteran'} experience
 * @property {'pve'|'pvp'} mode
 * @property {number} experienceScore    // 1–10 raw slider
 * @property {number} boostScore         // 1–10 raw slider (preset_style)
 * @property {number} weeklyHours        // 1–40
 * @property {number} groupSize          // 1–20
 * @property {number} progressionScore   // 1–10
 * @property {number} grindScore         // 1–10
 * @property {number} challengeScore     // 1–10
 * @property {Object} categoryAdjustments
 */

// Emotional statement → category adjustment map
const EMOTIONAL_ADJUSTMENTS = {
    "less grind": {
        harvesting: +0.4,
        taming: +0.4,
        breeding: +0.3,
        xp: +0.3,
        qol: +0.3,
    },
    "more challenge": {
        difficulty: +0.4,
        xp: -0.2,
        harvesting: -0.2,
    },
    "faster taming": {
        taming: +0.6,
    },
    "faster breeding": {
        breeding: +0.6,
    },
    "more loot": {
        loot: +0.5,
    },
    "easier bosses": {
        difficulty: -0.4,
    },
    "harder bosses": {
        difficulty: +0.4,
    },
    "more resources": {
        harvesting: +0.4,
    },
    "less survival pressure": {
        qol: +0.4,
    },
};

/**
 * Map a 1–10 slider value to a normalized delta around the anchor (0.0).
 * Anchor is at the reference value. Values above anchor → positive delta, below → negative.
 * @param {number} value - Raw slider value (1–10)
 * @param {number} anchor - The reference slider value that produces delta=0
 * @param {number} scale - How much delta per unit away from anchor
 */
function sliderDelta(value, anchor, scale) {
    return (value - anchor) * scale;
}

/**
 * Build a PlayerProfile from questionnaire answers (Mode A).
 * All non-PvE/PvP questions are now sliders (1–10 or 1–40).
 * @param {Object} answers - Raw answers from the questionnaire
 * @returns {PlayerProfile}
 */
export function buildProfile(answers) {
    // Parse slider values (may come as strings from DOM)
    const expScore = parseFloat(answers.experience) || 5;   // 1–10, anchor=5
    const boostScore = parseFloat(answers.preset_style) || 7;   // 1–10, anchor=7
    const weeklyHours = parseFloat(answers.weeklyHours) || 10;  // 1–40, anchor=10
    const groupSize = parseFloat(answers.groupSize) || 3;   // 1–20, anchor=3
    const progScore = parseFloat(answers.progressionSpeed) || 7;   // 1–10, anchor=7
    const grindScore = parseFloat(answers.grindTolerance) || 5;   // 1–10, anchor=5
    const challengeScore = parseFloat(answers.challengePreference) || 5; // 1–10, anchor=5

    // Map experience score to label
    const experience = expScore <= 3 ? "beginner" : expScore <= 6 ? "intermediate" : "veteran";

    const profile = {
        experience,
        mode: answers.mode || "pve",
        experienceScore: expScore,
        boostScore,
        weeklyHours,
        groupSize,
        progressionScore: progScore,
        grindScore,
        challengeScore,
        categoryAdjustments: {},
    };

    const adj = profile.categoryAdjustments;

    // ── Boost score (preset_style slider) ────────────────────────────────────
    // Anchor = 7 (Easy community server). Each point away from 7 shifts all
    // non-difficulty categories by ±0.12.
    const boostDelta = sliderDelta(boostScore, 7, 0.12);
    for (const cat of ["taming", "breeding", "harvesting", "xp", "loot", "qol"]) {
        adj[cat] = (adj[cat] || 0) + boostDelta;
    }

    // ── Experience score ──────────────────────────────────────────────────────
    // Higher experience → less boost needed (lower taming/breeding/harvesting)
    // Anchor = 5 (intermediate). Each point shifts by -0.06 (veterans want less boost).
    const expDelta = sliderDelta(expScore, 5, -0.06);
    for (const cat of ["taming", "breeding", "harvesting", "xp", "qol"]) {
        adj[cat] = (adj[cat] || 0) + expDelta;
    }
    // Veterans want slightly more difficulty
    adj.difficulty = (adj.difficulty || 0) + sliderDelta(expScore, 5, 0.05);

    // ── Progression speed ─────────────────────────────────────────────────────
    // Anchor = 7 (Fast). Each point shifts xp/taming/breeding.
    const progDelta = sliderDelta(progScore, 7, 0.08);
    adj.xp = (adj.xp || 0) + progDelta;
    adj.taming = (adj.taming || 0) + progDelta * 0.7;
    adj.breeding = (adj.breeding || 0) + progDelta * 0.7;

    // ── Grind tolerance ───────────────────────────────────────────────────────
    // Anchor = 5 (Some grind). Lower grind tolerance → more harvesting boost.
    // Note: grind=1 means "no grind" → MORE harvesting boost (inverse!)
    const grindDelta = sliderDelta(grindScore, 5, -0.08); // lower grind = positive delta
    adj.harvesting = (adj.harvesting || 0) + grindDelta;
    adj.qol = (adj.qol || 0) + grindDelta * 0.5;

    // ── Challenge preference ──────────────────────────────────────────────────
    // Anchor = 5 (Normal). Higher = harder.
    const challengeDelta = sliderDelta(challengeScore, 5, 0.08);
    adj.difficulty = (adj.difficulty || 0) + challengeDelta;

    // ── Weekly hours ──────────────────────────────────────────────────────────
    // Anchor = 10h. Less time → more taming/breeding boost.
    if (weeklyHours < 10) {
        const timeDelta = (10 - weeklyHours) / 10 * 0.5; // 0–0.5
        adj.taming = (adj.taming || 0) + timeDelta;
        adj.breeding = (adj.breeding || 0) + timeDelta;
        adj.xp = (adj.xp || 0) + timeDelta * 0.5;
    } else if (weeklyHours > 20) {
        // Heavy players can handle slightly lower boosts
        const timeDelta = Math.min((weeklyHours - 20) / 20 * 0.2, 0.2);
        adj.taming = (adj.taming || 0) - timeDelta;
        adj.breeding = (adj.breeding || 0) - timeDelta;
    }

    // ── Group size ────────────────────────────────────────────────────────────
    // Anchor = 3 (small group). Solo gets extra boost.
    if (groupSize === 1) {
        adj.taming = (adj.taming || 0) + 0.2;
        adj.breeding = (adj.breeding || 0) + 0.2;
        adj.harvesting = (adj.harvesting || 0) + 0.2;
    } else if (groupSize >= 10) {
        // Large servers need slightly less individual boost
        adj.taming = (adj.taming || 0) - 0.1;
        adj.breeding = (adj.breeding || 0) - 0.1;
    }

    // ── Emotional statements ──────────────────────────────────────────────────
    const statements = answers.emotionalStatements || [];
    for (const stmt of statements) {
        const emo = EMOTIONAL_ADJUSTMENTS[stmt];
        if (emo) {
            for (const [cat, delta] of Object.entries(emo)) {
                adj[cat] = (adj[cat] || 0) + delta;
            }
        }
    }

    return profile;
}

/**
 * Build a PlayerProfile from deep config answers (Mode B).
 */
export function buildDeepProfile(categoryAnswers) {
    return {
        experience: categoryAnswers.experience || "intermediate",
        mode: categoryAnswers.mode || "pve",
        weeklyHours: parseInt(categoryAnswers.weeklyHours) || 10,
        groupSize: parseInt(categoryAnswers.groupSize) || 1,
        progressionScore: 7,
        grindScore: 5,
        challengeScore: 5,
        boostScore: 7,
        experienceScore: 5,
        progressionSpeed: "custom",
        grindTolerance: "custom",
        challengePreference: "custom",
        categoryAdjustments: categoryAnswers.adjustments || {},
        deepConfig: categoryAnswers,
    };
}

/**
 * Translate a feedback phrase into category adjustments for tuning.
 */
export function feedbackToAdjustments(feedback) {
    const map = {
        "too easy": { difficulty: +0.5, dino_damage_multiplier: +0.3 },
        "too hard": { difficulty: -0.4, dino_damage_multiplier: -0.2 },
        "bosses too fast": { difficulty: +0.3 },
        "bosses too slow": { difficulty: -0.3 },
        "breeding too slow": { breeding: +0.6 },
        "breeding too fast": { breeding: -0.4 },
        "taming too slow": { taming: +0.6 },
        "taming too fast": { taming: -0.3 },
        "not enough resources": { harvesting: +0.5 },
        "too many resources": { harvesting: -0.3 },
        "leveling too slow": { xp: +0.5 },
        "leveling too fast": { xp: -0.3 },
        "loot too bad": { loot: +0.5 },
        "too much grind": { harvesting: +0.4, qol: +0.3 },
        "need more challenge": { difficulty: +0.4, xp: -0.2 },
    };
    return map[feedback.toLowerCase()] || {};
}

export const EMOTIONAL_STATEMENT_OPTIONS = Object.keys(EMOTIONAL_ADJUSTMENTS);
