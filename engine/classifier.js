// ARK Server Configuration AI — Classifier
// Maps PlayerProfile → CategoryWeights
// Anchor: reference profile (exp=5, boost=7, 10h, 3 players, prog=7, grind=5, challenge=5)
//         produces weight=1.0 for all categories → anchor values in calculator.js

/**
 * @typedef {Object} CategoryWeights
 * @property {number} taming      0.1–3.0
 * @property {number} breeding    0.1–3.0
 * @property {number} harvesting  0.1–3.0
 * @property {number} xp          0.1–3.0
 * @property {number} loot        0.1–3.0
 * @property {number} difficulty  0.1–3.0 (higher = harder)
 * @property {number} qol         0.1–3.0
 * @property {number} pvp         0.1–3.0
 * @property {number} building    0.1–3.0
 */

// PvP mode adds fixed deltas on top of the computed weights
const PVP_ADJUSTMENTS = {
    taming: +0.2,
    breeding: +0.3,
    harvesting: +0.3,
    xp: +0.2,
    pvp: +0.3,
    qol: +0.1,
};

/**
 * Classify a PlayerProfile into CategoryWeights.
 * All weights start at 1.0 (anchor) and are adjusted by profile deltas.
 * @param {import('./profiler.js').PlayerProfile} profile
 * @returns {CategoryWeights}
 */
export function classify(profile) {
    // Start from anchor (1.0 for all categories)
    const weights = {
        taming: 1.0,
        breeding: 1.0,
        harvesting: 1.0,
        xp: 1.0,
        loot: 1.0,
        difficulty: 1.0,
        qol: 1.0,
        pvp: 1.0,
        building: 1.0,
    };

    // Apply profile category adjustments (from profiler.js)
    const adj = profile.categoryAdjustments || {};
    for (const [cat, delta] of Object.entries(adj)) {
        if (weights[cat] !== undefined) {
            weights[cat] = clamp(weights[cat] + delta, 0.1, 3.0);
        }
    }

    // Apply PvP mode adjustments
    if (profile.mode === "pvp") {
        for (const [cat, delta] of Object.entries(PVP_ADJUSTMENTS)) {
            weights[cat] = clamp((weights[cat] || 1.0) + delta, 0.1, 3.0);
        }
    }

    return weights;
}

/**
 * Classify deep config answers directly into CategoryWeights.
 */
export function classifyDeep(deepConfig) {
    const weights = {};
    const categories = ["taming", "breeding", "harvesting", "xp", "loot", "difficulty", "qol", "pvp", "building"];
    for (const cat of categories) {
        weights[cat] = clamp(deepConfig[cat] ?? 1.0, 0.1, 3.0);
    }
    return weights;
}

export function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}
