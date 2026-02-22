/**
 * vanilla_stats.js
 * 
 * This file contains the true, baseline vanilla breeding statistics and timings for creatures 
 * on a 1x (official rates) server. These values are used as mathematical reference points 
 * when calculating specific multipliers for quick breeding presets.
 * 
 * Note: Some values (like Maturation and Mating Speed) may differ slightly from public wikis 
 * based on actual in-game testing and server tick variances.
 */

export const VANILLA_STATS = {
    // ─── GIGANOTOSAURUS ───────────────────────────────────────────────────────
    giganotosaurus: {
        name: "Giganotosaurus",
        // The actual duration the mating progress bar takes to reach 100%
        mating_speed_duration_minutes: 2.04,

        // Cooldown between mating (min and max)
        mating_interval_min_minutes: 1080, // 18 hours
        mating_interval_max_minutes: 2880, // 48 hours

        // Incubation time from fertilized egg to hatch
        egg_hatch_duration_minutes: 2988,   // ~49.8 hours

        // Total time from baby to adult
        maturation_duration_minutes: 16800, // ~280 hours (Observed baseline)

        // Cuddle interval
        cuddle_interval_minutes: 461        // ~7.6 hours
    },

    // ─── ADDITIONAL CREATURES (To be added) ───────────────────────────────────
    // rex: { ... },
    // wyvern: { ... },
};

// Helper function to get stats for a specific creature
export function getVanillaStats(creatureKey) {
    return VANILLA_STATS[creatureKey] || null;
}
