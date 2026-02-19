// ARK Server Configuration AI — Validator
// Validates calculated setting values before output

import { SETTINGS_DB, getById } from '../db/settings_db.js';

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string[]} warnings
 * @property {string[]} errors
 * @property {Object} fixedValues - Auto-corrected values
 */

/**
 * Validate and auto-fix a set of calculated values.
 * @param {Object} values - settingId → value
 * @returns {ValidationResult}
 */
export function validate(values) {
    const warnings = [];
    const errors = [];
    const fixedValues = { ...values };

    for (const setting of SETTINGS_DB) {
        const id = setting.id;
        const value = values[id];

        if (value === undefined) continue;

        // Type check and range validation
        if (setting.type === "float" || setting.type === "int") {
            const [min, max] = setting.valid_range;

            if (typeof value !== "number" || isNaN(value)) {
                errors.push(`[${id}] Invalid value: ${value}. Expected ${setting.type}.`);
                fixedValues[id] = setting.default;
                continue;
            }

            if (value < min) {
                warnings.push(`[${id}] Value ${value} below minimum ${min}. Auto-corrected to ${min}.`);
                fixedValues[id] = min;
            } else if (value > max) {
                warnings.push(`[${id}] Value ${value} above maximum ${max}. Auto-corrected to ${max}.`);
                fixedValues[id] = max;
            }

            // Integer check
            if (setting.type === "int" && !Number.isInteger(fixedValues[id])) {
                fixedValues[id] = Math.round(fixedValues[id]);
                warnings.push(`[${id}] Rounded to integer: ${fixedValues[id]}`);
            }
        }

        if (setting.type === "bool") {
            if (typeof value !== "boolean") {
                warnings.push(`[${id}] Expected boolean, got ${typeof value}. Auto-corrected.`);
                fixedValues[id] = Boolean(value);
            }
        }
    }

    // Conflict checks
    const conflicts = checkConflicts(fixedValues);
    for (const conflict of conflicts) {
        warnings.push(conflict.message);
        if (conflict.fix) {
            fixedValues[conflict.fix.id] = conflict.fix.value;
        }
    }

    // Duplicate key check (by section+key combination)
    const seen = new Set();
    for (const setting of SETTINGS_DB) {
        const key = `${setting.section}::${setting.key}`;
        if (seen.has(key)) {
            errors.push(`Duplicate key detected: ${setting.key} in section ${setting.section}`);
        }
        seen.add(key);
    }

    return {
        valid: errors.length === 0,
        warnings,
        errors,
        fixedValues,
    };
}

/**
 * Check for known conflicting setting combinations.
 */
function checkConflicts(values) {
    const conflicts = [];

    // PvP-only settings should not be active in PvE
    if (values.server_pvp === false) {
        if (values.pvp_dino_decay === true) {
            conflicts.push({
                message: "pvp_dino_decay requires serverPVP=true. Auto-disabled.",
                fix: { id: "pvp_dino_decay", value: false },
            });
        }
        if (values.pvp_structure_decay === true) {
            conflicts.push({
                message: "pvp_structure_decay requires serverPVP=true. Auto-disabled.",
                fix: { id: "pvp_structure_decay", value: false },
            });
        }
    }

    // DayCycleSpeedScale interactions
    if (values.day_cycle_speed_scale !== undefined) {
        if (values.day_time_speed_scale !== undefined && values.day_time_speed_scale < 0.001) {
            conflicts.push({
                message: "DayTimeSpeedScale too low. Clamped to 0.001.",
                fix: { id: "day_time_speed_scale", value: 0.001 },
            });
        }
        if (values.night_time_speed_scale !== undefined && values.night_time_speed_scale < 0.001) {
            conflicts.push({
                message: "NightTimeSpeedScale too low. Clamped to 0.001.",
                fix: { id: "night_time_speed_scale", value: 0.001 },
            });
        }
    }

    // Structure pickup time must be > 0 if pickup is enabled
    if (values.allow_structure_pickup === true && values.structure_pickup_time_after_placement <= 0) {
        conflicts.push({
            message: "StructurePickupTimeAfterPlacement must be > 0 when pickup is enabled. Set to 30.",
            fix: { id: "structure_pickup_time_after_placement", value: 30 },
        });
    }

    // OverrideOfficialDifficulty should be >= 1 if DifficultyOffset is 1.0
    if (values.difficulty_offset >= 1.0 && values.override_official_difficulty < 1.0) {
        conflicts.push({
            message: "OverrideOfficialDifficulty < 1.0 with max DifficultyOffset. Set to 1.0.",
            fix: { id: "override_official_difficulty", value: 1.0 },
        });
    }

    return conflicts;
}

/**
 * Validate a single setting value.
 * @param {string} id - Setting ID
 * @param {*} value
 * @returns {{ valid: boolean, message: string }}
 */
export function validateSingle(id, value) {
    const setting = getById(id);
    if (!setting) return { valid: false, message: `Unknown setting: ${id}` };

    if (setting.type === "float" || setting.type === "int") {
        const [min, max] = setting.valid_range;
        if (typeof value !== "number" || isNaN(value)) {
            return { valid: false, message: `Expected number, got ${typeof value}` };
        }
        if (value < min || value > max) {
            return { valid: false, message: `Value ${value} out of range [${min}, ${max}]` };
        }
    }

    if (setting.type === "bool" && typeof value !== "boolean") {
        return { valid: false, message: `Expected boolean` };
    }

    return { valid: true, message: "OK" };
}
