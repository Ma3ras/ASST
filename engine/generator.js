// ARK Server Configuration AI — INI Generator
// Produces copy-paste-ready Game.ini and GameUserSettings.ini blocks

import { SETTINGS_DB, getById } from '../db/settings_db.js';

/**
 * Generate INI output from validated setting values.
 * @param {Object} values - settingId → value
 * @param {import('../engine/profiler.js').PlayerProfile} profile
 * @returns {{ gameIni: string, gameUserSettingsIni: string, summary: string, impact: string[] }}
 */
export function generate(values, profile) {
    const gameIniSettings = {};
    const gusSettings = {};

    for (const setting of SETTINGS_DB) {
        const value = values[setting.id];
        if (value === undefined) continue;

        const section = setting.section;
        const formatted = formatValue(value, setting.type);

        if (setting.file === "Game.ini") {
            if (!gameIniSettings[section]) gameIniSettings[section] = [];
            gameIniSettings[section].push({ key: setting.key, value: formatted, effect: setting.gameplay_effect });
        } else {
            if (!gusSettings[section]) gusSettings[section] = [];
            gusSettings[section].push({ key: setting.key, value: formatted, effect: setting.gameplay_effect });
        }
    }

    const gameIni = buildIniBlock(gameIniSettings);
    const gameUserSettingsIni = buildIniBlock(gusSettings);
    const summary = buildSummary(profile, values);
    const impact = buildImpact(values, profile);

    return { gameIni, gameUserSettingsIni, summary, impact };
}

/**
 * Format a value for INI output.
 */
function formatValue(value, type) {
    if (type === "bool") return value ? "True" : "False";
    if (type === "int") return String(Math.round(value));
    if (type === "float") {
        // ARK uses up to 6 decimal places for floats
        const str = value.toFixed(6);
        // Remove trailing zeros but keep at least one decimal
        return str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '.0');
    }
    return String(value);
}

/**
 * Build an INI file string from a sections object.
 */
function buildIniBlock(sections) {
    if (Object.keys(sections).length === 0) return "; (no settings for this file)";

    const lines = [];
    for (const [section, entries] of Object.entries(sections)) {
        lines.push(`[${section}]`);
        for (const entry of entries) {
            lines.push(`${entry.key}=${entry.value}`);
        }
        lines.push(""); // blank line between sections
    }
    return lines.join("\n").trimEnd();
}

/**
 * Build a human-readable summary.
 */
function buildSummary(profile, values) {
    const modeLabel = profile.mode === "pvp" ? "PvP" : "PvE";
    const expLabel = { beginner: "Beginner", intermediate: "Intermediate", veteran: "Veteran" }[profile.experience] || "Custom";
    const groupLabel = profile.groupSize === 1 ? "Solo" : `${profile.groupSize}-player group`;

    return `${expLabel} ${modeLabel} configuration for a ${groupLabel}. ` +
        `Taming: ${values.taming_speed_multiplier ?? "?"}x | ` +
        `Harvest: ${values.harvest_amount_multiplier ?? "?"}x | ` +
        `XP: ${values.xp_multiplier ?? "?"}x | ` +
        `Baby Maturation: ${values.baby_mature_speed_multiplier ?? "?"}x`;
}

/**
 * Build player-understandable impact statements.
 */
function buildImpact(values, profile) {
    const impacts = [];

    // Taming
    const taming = values.taming_speed_multiplier;
    if (taming !== undefined) {
        if (taming >= 5) impacts.push(`🦕 Taming is ${taming}x faster — dinos tame in minutes instead of hours.`);
        else if (taming >= 2) impacts.push(`🦕 Taming is ${taming}x faster — noticeably quicker than vanilla.`);
        else impacts.push(`🦕 Taming is near-vanilla speed (${taming}x).`);
    }

    // Harvesting
    const harvest = values.harvest_amount_multiplier;
    if (harvest !== undefined) {
        if (harvest >= 4) impacts.push(`⛏️ Resources are ${harvest}x — gathering is very fast, less time farming.`);
        else if (harvest >= 2) impacts.push(`⛏️ Resources are ${harvest}x — moderate boost, less repetitive farming.`);
        else impacts.push(`⛏️ Harvesting is near-vanilla (${harvest}x).`);
    }

    // XP
    const xp = values.xp_multiplier;
    if (xp !== undefined) {
        if (xp >= 3) impacts.push(`⭐ XP is ${xp}x — you'll level up quickly and unlock engrams fast.`);
        else if (xp >= 1.5) impacts.push(`⭐ XP is ${xp}x — slightly faster leveling than official.`);
        else impacts.push(`⭐ XP is vanilla speed (${xp}x).`);
    }

    // Breeding
    const mature = values.baby_mature_speed_multiplier;
    if (mature !== undefined) {
        if (mature >= 20) impacts.push(`🥚 Breeding is ${mature}x — babies grow in minutes, imprinting is easy.`);
        else if (mature >= 5) impacts.push(`🥚 Breeding is ${mature}x — manageable without watching babies all day.`);
        else impacts.push(`🥚 Breeding is near-vanilla (${mature}x) — requires significant time investment.`);
    }

    // Difficulty
    const dinoDmg = values.dino_damage_multiplier;
    if (dinoDmg !== undefined) {
        if (dinoDmg <= 0.7) impacts.push(`⚔️ Wild dinos deal reduced damage — more forgiving for new players.`);
        else if (dinoDmg >= 1.3) impacts.push(`⚔️ Wild dinos are more dangerous — high challenge combat.`);
        else impacts.push(`⚔️ Combat difficulty is standard.`);
    }

    // PvP
    if (profile.mode === "pvp") {
        impacts.push(`🛡️ PvP is enabled — players can attack each other and raid bases.`);
    } else {
        impacts.push(`🌿 PvE mode — no player-vs-player combat.`);
    }

    // QoL
    const hunger = values.player_character_food_drain_multiplier;
    if (hunger !== undefined && hunger <= 0.5) {
        impacts.push(`🍖 Hunger and thirst drain slowly — less micromanagement of survival stats.`);
    }

    const stack = values.item_stack_size_multiplier;
    if (stack !== undefined && stack >= 3) {
        impacts.push(`🎒 Item stacks are ${stack}x larger — much less inventory management.`);
    }

    return impacts;
}

/**
 * Generate a diff explanation for tuning changes.
 * @param {string[]} changedIds - Setting IDs that changed
 * @param {Object} oldValues
 * @param {Object} newValues
 * @returns {string[]} Human-readable change descriptions
 */
export function generateTuningExplanation(changedIds, oldValues, newValues) {
    return changedIds.map(id => {
        const setting = getById(id);
        if (!setting) return `Changed ${id}`;
        const oldVal = formatValue(oldValues[id], setting.type);
        const newVal = formatValue(newValues[id], setting.type);
        return `• **${setting.key}**: ${oldVal} → ${newVal} — ${setting.gameplay_effect}`;
    });
}
