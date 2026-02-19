// ARK Server Configuration AI — Parameter Calculator
// Calculates concrete setting values from preset + category weights

import { SETTINGS_DB, getById } from '../db/settings_db.js';
import { getPreset, PRESETS } from '../db/presets.js';
import { clamp } from './classifier.js';

// ─── MODE B DIRECT ANSWER → SETTING ID MAP ────────────────────────────────────
// Maps questionnaire answer IDs to settings_db IDs for direct override
const DEEP_ANSWER_MAP = {
    // Taming
    taming_speed: "taming_speed_multiplier",
    torpor_drain: "wild_dino_torpor_drain_multiplier",
    tamed_dino_damage: "tamed_dino_damage_multiplier",
    tamed_dino_resistance: "tamed_dino_resistance_multiplier",
    max_tamed_dinos: "max_tamed_dinos",
    disable_dino_taming_q: "disable_dino_taming",
    disable_dino_riding_q: "disable_dino_riding",
    // Breeding
    breeding_speed: "baby_mature_speed_multiplier",
    egg_hatch_speed: "egg_hatch_speed_multiplier",
    mating_interval: "mating_interval_multiplier",
    mating_speed: "mating_speed_multiplier",
    imprint_ease: "baby_cuddle_interval_multiplier",
    imprint_amount: "baby_imprint_amount_multiplier",
    imprint_stat_scale: "baby_imprinting_stat_scale_multiplier",
    lay_egg_interval: "lay_egg_interval_multiplier",
    // Harvesting
    harvest_amount: "harvest_amount_multiplier",
    harvest_health: "harvest_health_multiplier",
    respawn_speed: "resource_respawn_period_multiplier",
    dino_harvest_damage: "dino_harvesting_damage_multiplier",
    // XP
    xp_rate: "xp_multiplier",
    auto_unlock_engrams: "auto_unlock_all_engrams",
    // Loot
    loot_quality: "supply_crate_loot_quality_multiplier",
    fishing_loot: "fishing_loot_quality_multiplier",
    disable_loot_crates_q: "disable_loot_crates",
    allow_custom_recipes_q: "allow_custom_recipes",
    // Difficulty
    max_level: "override_official_difficulty",
    dino_damage: "dino_damage_multiplier",
    player_damage_q: "player_damage_multiplier",
    // Building
    structure_pickup: "structure_pickup_time_after_placement",
    max_structures_q: "max_structures_in_range",
    allow_cave_building_q: "allow_cave_building_pve",
    disable_structure_decay_q: "disable_structure_decay_pve",
    ignore_prevention_volumes_q: "ignore_structures_prevention_volumes",
    allow_platform_multi_floors_q: "allow_platform_saddle_multi_floors",
    // Environment
    day_speed_q: "day_time_speed_scale",
    night_speed_q: "night_time_speed_scale",
    spoiling_time_q: "global_spoiling_time_multiplier",
    kick_idle_q: "kick_idle_players_period",
    // Server Settings
    player_food_drain_q: "player_character_food_drain_multiplier",
    player_water_drain_q: "player_character_water_drain_multiplier",
    allow_third_person_q: "allow_third_person_player",
    server_crosshair_q: "server_crosshair",
    show_map_location_q: "show_map_player_location",
    genesis_missions_q: "disable_genesis_missions",
    // Tribe
    tribe_size: "max_tribe_size",
    max_alliances_q: "max_alliances_per_tribe",
    friendly_fire_q: "disable_friendly_fire",
    tribe_war_q: "pve_allow_tribe_war",
    // Turrets
    turret_count_q: "limit_turrets_num",
    // Transfers
    allow_downloads_q: "no_tribute_downloads",
    prevent_download_dinos_q: "prevent_download_dinos",
    // PvP
    structure_damage_q: "structure_damage_multiplier",
    pvp_zone_damage_q: "pvp_zone_structure_damage_multiplier",
};

// ─── ANCHOR PRESET ────────────────────────────────────────────────────────────
// These are the exact values produced when ALL category weights = 1.0
// (reference profile: Intermediate · PvE · Easy(7) · 10h · 3 players · Fast(7) · SomeGrind(5))
// All other profiles scale proportionally from these anchors.
const ANCHOR_PRESET = {
    // Difficulty — always fixed at 5.0 (never changes)
    difficulty_offset: 0.5,
    override_official_difficulty: 5.0,
    dino_damage_multiplier: 1.0,
    player_damage_multiplier: 1.2,
    dino_resistance_multiplier: 1.0,
    player_resistance_multiplier: 0.9,
    // XP — anchor: 5x
    xp_multiplier: 5.0,
    kill_xp_multiplier: 5.0,
    harvest_xp_multiplier: 5.0,
    craft_xp_multiplier: 5.0,
    generic_xp_multiplier: 5.0,
    special_xp_multiplier: 5.0,
    // Taming — anchor: 70x
    taming_speed_multiplier: 70.0,
    dino_character_food_drain_multiplier: 0.5,
    wild_dino_torpor_drain_multiplier: 0.7,
    wild_dino_character_food_drain_multiplier: 0.7,
    tamed_dino_torpor_drain_multiplier: 0.7,
    // Harvesting — anchor: 5x
    harvest_amount_multiplier: 5.0,
    resource_respawn_period_multiplier: 0.15,
    harvest_health_multiplier: 0.5,
    // Breeding — anchor: 70x mature, 35x hatch
    baby_mature_speed_multiplier: 70.0,
    egg_hatch_speed_multiplier: 35.0,
    baby_food_consumption_speed_multiplier: 0.5,
    baby_imprinting_stat_scale_multiplier: 2.0,
    baby_cuddle_interval_multiplier: 0.15,
    baby_cuddle_grace_period_multiplier: 5.0,
    mating_interval_multiplier: 0.01,
    mating_speed_multiplier: 10.0,
    allow_anyone_baby_imprint_cuddle: true,
    // QoL
    player_character_water_drain_multiplier: 0.4,
    player_character_food_drain_multiplier: 0.4,
    player_character_stamina_drain_multiplier: 0.8,
    player_character_health_recovery_multiplier: 1.5,
    dino_character_health_recovery_multiplier: 1.5,
    item_stack_size_multiplier: 3.0,
    spoiling_time_multiplier: 2.0,
    global_corpse_decomposition_time_multiplier: 2.0,
    fuel_consumption_interval_multiplier: 3.0,
    day_time_speed_scale: 1.0,
    night_time_speed_scale: 2.0,
    max_tamed_dinos: 5000,
    show_map_player_location: true,
    allow_third_person_player: true,
    allow_flyer_carry_pve: true,
    // Loot — anchor: 3x quality
    supply_crate_loot_quality_multiplier: 3.0,
    fishing_loot_quality_multiplier: 3.0,
    crafting_skill_bonus_multiplier: 1.5,
    // Building
    allow_structure_pickup: true,
    structure_pickup_time_after_placement: 3600.0,
    pve_structure_decay_period_multiplier: 2.0,
    // PvP flags (off for PvE)
    server_pvp: false,
};

// Settings that are ALWAYS fixed regardless of weights
const ALWAYS_FIXED = {
    override_official_difficulty: 5.0,
    difficulty_offset: 0.5,
};

// Wild dino stat presets (per-level stat multipliers)
const WILD_STAT_PRESETS = {
    easy: 0.5,
    normal: 1.0,
    hard: 1.5,
};

// Tamed dino stat presets
const TAMED_STAT_PRESETS = {
    easy: { hp: 0.2, speed: 0.17 },
    normal: { hp: 1.0, speed: 1.0 },
    boosted: { hp: 1.5, speed: 1.0 },
};

// Vanilla ARK baseline for PerLevelStatsMultiplier_Tamed_Add per stat index
// Indices 0 (HP) and 8 (temperature/fortitude) are 0.14 in vanilla
const VANILLA_TAMED_ADD = [0.14, 1, 1, 1, 1, 1, 1, 1, 0.14, 1];
// DinoTamed_Affinity has different vanilla values: 0.44 for HP (0) and temperature (8)
const VANILLA_TAMED_AFFINITY = [0.44, 1, 1, 1, 1, 1, 1, 1, 0.44, 1];

// Which categories affect which settings (beyond the category tag)
const CATEGORY_SETTING_MAP = {
    taming: ["taming_speed_multiplier", "dino_character_food_drain_multiplier",
        "wild_dino_torpor_drain_multiplier", "wild_dino_character_food_drain_multiplier",
        "tamed_dino_torpor_drain_multiplier"],
    breeding: ["baby_mature_speed_multiplier", "egg_hatch_speed_multiplier",
        "baby_food_consumption_speed_multiplier", "baby_imprinting_stat_scale_multiplier",
        "baby_cuddle_interval_multiplier", "baby_cuddle_grace_period_multiplier",
        "mating_interval_multiplier", "mating_speed_multiplier",
        "allow_anyone_baby_imprint_cuddle"],
    harvesting: ["harvest_amount_multiplier", "resource_respawn_period_multiplier",
        "harvest_health_multiplier"],
    xp: ["xp_multiplier", "kill_xp_multiplier", "harvest_xp_multiplier",
        "craft_xp_multiplier", "generic_xp_multiplier", "special_xp_multiplier"],
    loot: ["supply_crate_loot_quality_multiplier", "fishing_loot_quality_multiplier",
        "crafting_skill_bonus_multiplier"],
    difficulty: ["difficulty_offset", "override_official_difficulty",
        "dino_damage_multiplier", "player_damage_multiplier",
        "dino_resistance_multiplier", "player_resistance_multiplier"],
    qol: ["player_character_water_drain_multiplier", "player_character_food_drain_multiplier",
        "player_character_stamina_drain_multiplier", "player_character_health_recovery_multiplier",
        "dino_character_health_recovery_multiplier", "item_stack_size_multiplier",
        "spoiling_time_multiplier", "global_corpse_decomposition_time_multiplier",
        "fuel_consumption_interval_multiplier", "day_time_speed_scale", "night_time_speed_scale",
        "max_tamed_dinos", "show_map_player_location", "allow_third_person_player",
        "allow_flyer_carry_pve"],
    pvp: ["server_pvp", "structure_damage_multiplier", "structure_resistance_multiplier",
        "max_tribe_size", "pvp_dino_decay", "pvp_structure_decay", "pvp_zone_structure_damage_multiplier"],
    building: ["allow_structure_pickup", "structure_pickup_time_after_placement",
        "pve_structure_decay_period_multiplier", "max_platform_saddle_structure_limit",
        "per_platform_max_structures_multiplier", "disable_structure_placement_collision",
        "fast_decay_unsnapped_core_structures"],
};

// Settings where HIGHER weight = LOWER value (inverse relationship)
// e.g. "more taming" → lower food drain, lower torpor drain
const INVERSE_SETTINGS = new Set([
    "dino_character_food_drain_multiplier",
    "wild_dino_torpor_drain_multiplier",
    "wild_dino_character_food_drain_multiplier",
    "tamed_dino_torpor_drain_multiplier",
    "baby_food_consumption_speed_multiplier",
    "baby_cuddle_interval_multiplier",
    "mating_interval_multiplier",
    "resource_respawn_period_multiplier",
    "harvest_health_multiplier",
    "player_character_water_drain_multiplier",
    "player_character_food_drain_multiplier",
    "player_character_stamina_drain_multiplier",
    "dino_resistance_multiplier",   // higher difficulty = higher resistance (harder to kill)
    "player_resistance_multiplier", // higher difficulty = lower player resistance (takes more damage)
    "day_time_speed_scale",
]);

// Settings that are boolean — weight threshold determines true/false
const BOOL_THRESHOLDS = {
    "allow_anyone_baby_imprint_cuddle": 1.1,  // enabled if breeding weight > 1.1
    "show_map_player_location": 1.2,
    "allow_third_person_player": 0.5,         // almost always true
    "allow_flyer_carry_pve": 1.2,
    "server_pvp": null,                        // set directly from profile.mode
    "pvp_dino_decay": null,                    // set from mode
    "pvp_structure_decay": null,               // set from mode
    "allow_structure_pickup": 0.5,
    "disable_structure_placement_collision": 1.5,
    "fast_decay_unsnapped_core_structures": 1.3,
};

/**
 * Calculate final setting values from profile + weights.
 * Uses ANCHOR_PRESET as base. weight=1.0 → anchor values exactly.
 * weight>1.0 → higher values (more boosted), weight<1.0 → lower values.
 * OverrideOfficialDifficulty is always forced to 5.0.
 * @param {import('./profiler.js').PlayerProfile} profile
 * @param {import('./classifier.js').CategoryWeights} weights
 * @returns {Object} settingId → value
 */
export function calculate(profile, weights) {
    // Choose base preset: use pve_beginner for PvE, or intermediate_pvp for PvP
    // but override with ANCHOR_PRESET values for the key settings
    const basePreset = getPreset(profile.experience, profile.mode);
    const result = {};

    for (const setting of SETTINGS_DB) {
        const id = setting.id;

        // Check if we have an anchor value for this setting
        const anchorVal = ANCHOR_PRESET[id];
        const presetVal = basePreset[id];

        // Skip if neither anchor nor preset defines this setting
        if (anchorVal === undefined && presetVal === undefined) continue;

        // Use anchor if available, otherwise fall back to preset
        const baseVal = anchorVal !== undefined ? anchorVal : presetVal;

        // Always-fixed settings: never change regardless of weights
        if (ALWAYS_FIXED[id] !== undefined) {
            result[id] = ALWAYS_FIXED[id];
            continue;
        }

        // Boolean settings
        if (setting.type === "bool") {
            result[id] = calculateBool(id, baseVal, weights, profile);
            continue;
        }

        // Find which category this setting belongs to
        const category = setting.category;
        const weight = weights[category] || 1.0;

        // Calculate adjusted value from anchor
        // Formula: steeper curve than sqrt for more responsive sliders
        let value;
        if (INVERSE_SETTINGS.has(id)) {
            // Inverse: higher weight → lower value
            // At weight=1.0: value = baseVal (anchor)
            // At weight=2.0: value = baseVal / 2^0.8 ≈ baseVal * 0.574
            value = baseVal / Math.pow(weight, 0.8);
        } else {
            // Direct: higher weight → higher value
            // At weight=1.0: value = baseVal (anchor)
            // At weight=2.0: value = baseVal * 2^1.2 ≈ baseVal * 2.297
            value = baseVal * Math.pow(weight, 1.2);
        }

        // Clamp to valid range
        const [min, max] = setting.valid_range;
        value = clamp(value, min, max);

        // Round appropriately
        if (setting.type === "int") {
            value = Math.round(value);
        } else {
            value = parseFloat(value.toFixed(3));
        }

        result[id] = value;
    }

    // PvP mode: override PvP-specific flags
    if (profile.mode === "pvp") {
        result.server_pvp = true;
        result.pvp_dino_decay = true;
        result.pvp_structure_decay = true;
    } else {
        result.server_pvp = false;
        result.pvp_dino_decay = false;
        result.pvp_structure_decay = false;
    }

    return result;
}

/**
 * Calculate settings from Mode B deep config answers.
 * Starts from the appropriate preset, then directly overrides with user answers.
 * @param {Object} profile - Player profile (has experience, mode, deepConfig)
 * @returns {Object} settingId → value
 */
export function calculateFromDeepConfig(profile) {
    const answers = profile.deepConfig || {};
    const preset = getPreset(profile.experience, profile.mode);

    // Start with a full preset calculation (weight=1.0 for all)
    const neutralWeights = {};
    for (const cat of ['taming', 'breeding', 'harvesting', 'xp', 'loot', 'difficulty', 'qol', 'pvp', 'building']) {
        neutralWeights[cat] = 1.0;
    }
    const result = calculate(profile, neutralWeights);

    // Apply direct overrides from Mode B answers
    for (const [answerId, settingId] of Object.entries(DEEP_ANSWER_MAP)) {
        if (answers[answerId] === undefined) continue;
        const setting = getById(settingId);
        if (!setting) continue;

        let val = answers[answerId];

        // Clamp numeric values
        if (setting.type !== 'bool' && typeof val === 'number') {
            const [min, max] = setting.valid_range;
            val = clamp(val, min, max);
            if (setting.type === 'int') val = Math.round(val);
            else val = parseFloat(val.toFixed(3));
        }

        result[settingId] = val;
    }

    // Handle wild dino stat preset (now accepts numeric slider value directly)
    if (answers.wild_dino_stats_preset !== undefined) {
        const val = answers.wild_dino_stats_preset;
        const scale = typeof val === 'number' ? val : (WILD_STAT_PRESETS[val] || 1.0);
        for (let i = 0; i <= 9; i++) {
            result[`per_level_stats_dino_wild_${i}`] = scale;
        }
    }

    // Handle tamed dino stat preset (now accepts numeric slider value directly)
    if (answers.tamed_dino_stats_preset !== undefined) {
        const val = answers.tamed_dino_stats_preset;
        if (typeof val === 'number') {
            // Numeric slider: scale each stat proportionally from its vanilla baseline
            for (let i = 0; i <= 9; i++) {
                const perLevel = parseFloat((1.0 * val).toFixed(4));          // DinoTamed per-level: vanilla=1.0
                const addVal = parseFloat((VANILLA_TAMED_ADD[i] * val).toFixed(4));      // DinoTamed_Add
                const affVal = parseFloat((VANILLA_TAMED_AFFINITY[i] * val).toFixed(4)); // DinoTamed_Affinity
                result[`per_level_stats_dino_tamed_${i}`] = perLevel;
                result[`per_level_stats_tamed_add_${i}`] = addVal;
                result[`per_level_stats_dino_tamed_affinity_${i}`] = affVal;
            }
        } else {
            // Legacy string preset (kept for backwards compat)
            const sp = TAMED_STAT_PRESETS[val] || TAMED_STAT_PRESETS.normal;
            for (let i = 0; i <= 9; i++) {
                const statVal = (i === 0) ? sp.hp : (i === 8) ? sp.speed : 1.0;
                result[`per_level_stats_dino_tamed_${i}`] = statVal;
                result[`per_level_stats_tamed_add_${i}`] = parseFloat((VANILLA_TAMED_ADD[i] * statVal / 1.0).toFixed(4));
                result[`per_level_stats_dino_tamed_affinity_${i}`] = parseFloat((VANILLA_TAMED_AFFINITY[i] * statVal / 1.0).toFixed(4));
            }
        }
    }

    // Handle combined turret_count_q: 0 = disabled, >0 = set limit and enable
    if (answers.turret_count_q !== undefined) {
        if (answers.turret_count_q === 0) {
            result.limit_turrets_in_range = false;
        } else {
            result.limit_turrets_in_range = true;
            result.limit_turrets_num = Math.round(answers.turret_count_q);
        }
    }

    // Handle preset_style from Mode A (easy/medium/hard)
    if (answers.preset_style) {
        const styleMap = { easy: 'easy_pve', medium: null, hard: 'veteran_pve' };
        const styleKey = styleMap[answers.preset_style];
        if (styleKey && PRESETS[styleKey]) {
            const stylePreset = PRESETS[styleKey];
            for (const [k, v] of Object.entries(stylePreset)) {
                if (result[k] === undefined) result[k] = v;
            }
        }
    }

    return result;
}

function calculateBool(id, presetVal, weights, profile) {
    const threshold = BOOL_THRESHOLDS[id];

    // Direct from profile mode
    if (id === "server_pvp") return profile.mode === "pvp";
    if (id === "pvp_dino_decay") return profile.mode === "pvp";
    if (id === "pvp_structure_decay") return profile.mode === "pvp";

    // Threshold-based
    if (threshold !== null && threshold !== undefined) {
        // Find relevant category weight
        const cat = findCategoryForSetting(id);
        const weight = weights[cat] || 1.0;
        return weight >= threshold;
    }

    return presetVal;
}

function findCategoryForSetting(id) {
    for (const [cat, ids] of Object.entries(CATEGORY_SETTING_MAP)) {
        if (ids.includes(id)) return cat;
    }
    return "qol";
}

/**
 * Apply iterative tuning adjustments to existing calculated values.
 * @param {Object} currentValues - Current setting values
 * @param {Object} categoryAdjustments - Category deltas from feedback
 * @param {import('./profiler.js').PlayerProfile} profile
 * @returns {{ newValues: Object, changedSettings: string[] }}
 */
export function applyTuning(currentValues, categoryAdjustments, profile) {
    const newValues = { ...currentValues };
    const changedSettings = [];

    for (const [category, delta] of Object.entries(categoryAdjustments)) {
        const settingIds = CATEGORY_SETTING_MAP[category] || [];

        // Pick top 3 most impactful settings for this category
        const impactful = settingIds.slice(0, 3);

        for (const id of impactful) {
            const setting = getById(id);
            if (!setting || setting.type === "bool") continue;

            const current = currentValues[id];
            if (current === undefined) continue;

            const [min, max] = setting.valid_range;
            let newVal;

            if (INVERSE_SETTINGS.has(id)) {
                // Positive delta = make easier = lower value
                newVal = current * (1 - delta * 0.2);
            } else {
                newVal = current * (1 + delta * 0.2);
            }

            newVal = clamp(newVal, min, max);
            if (setting.type === "int") newVal = Math.round(newVal);
            else newVal = parseFloat(newVal.toFixed(3));

            if (newVal !== current) {
                newValues[id] = newVal;
                changedSettings.push(id);
            }
        }
    }

    // Limit to max 3 changed settings
    const limited = changedSettings.slice(0, 3);
    const limitedValues = { ...currentValues };
    for (const id of limited) {
        limitedValues[id] = newValues[id];
    }

    return { newValues: limitedValues, changedSettings: limited };
}
