// ARK Server Configuration AI — Questionnaire UI
// Drives Mode A (Quick) and Mode B (Deep Config) Q&A flows

import { EMOTIONAL_STATEMENT_OPTIONS } from '../engine/profiler.js';

// ─── MODE A QUESTIONS ─────────────────────────────────────────────────────────

export const MODE_A_QUESTIONS = [
    {
        id: "experience",
        text: "What's your ARK experience level?",
        icon: "🎮",
        type: "slider",
        min: 1, max: 10, step: 1, default: 5,
        hint: "1 = Brand new to ARK · 5 = Know the basics · 10 = Veteran (hundreds of hours)",
        labels: { 1: "Newbie", 3: "Beginner", 5: "Intermediate", 7: "Experienced", 10: "Veteran" },
    },
    {
        id: "mode",
        text: "What type of server do you want?",
        icon: "⚔️",
        type: "choice",
        options: [
            { value: "pve", label: "PvE", desc: "Cooperative — no player vs player combat" },
            { value: "pvp", label: "PvP", desc: "Competitive — players can raid each other" },
        ],
    },
    {
        id: "preset_style",
        text: "How boosted should the server be?",
        icon: "🎯",
        type: "slider",
        min: 1, max: 10, step: 1, default: 7,
        hint: "1 = Vanilla official rates · 5 = Moderate boost · 7 = Easy community server · 10 = Maximum boost",
        labels: { 1: "Vanilla", 3: "Light boost", 5: "Balanced", 7: "Easy", 10: "Max boost" },
    },
    {
        id: "weeklyHours",
        text: "How many hours per week will you play?",
        icon: "⏰",
        type: "slider",
        min: 1, max: 40, step: 1, default: 10,
        hint: "Less time = auto-boost taming & breeding so you still make progress",
        labels: { 1: "1h", 5: "5h", 10: "10h", 20: "20h", 40: "40h+" },
    },
    {
        id: "groupSize",
        text: "How many players will be on the server?",
        icon: "👥",
        type: "slider",
        min: 1, max: 20, step: 1, default: 3,
        hint: "Solo players get extra taming & harvest boost to compensate",
        labels: { 1: "Solo", 3: "Small", 8: "Medium", 15: "Large", 20: "Public" },
    },
    {
        id: "progressionSpeed",
        text: "How fast do you want to progress?",
        icon: "🚀",
        type: "slider",
        min: 1, max: 10, step: 1, default: 7,
        hint: "1 = Slow & steady journey · 5 = Balanced pace · 10 = Reach endgame fast",
        labels: { 1: "Slow", 4: "Steady", 7: "Fast", 10: "Rush" },
    },
    {
        id: "grindTolerance",
        text: "How much grinding are you okay with?",
        icon: "⛏️",
        type: "slider",
        min: 1, max: 10, step: 1, default: 5,
        hint: "1 = Focus on fun, skip the farming · 5 = Some grind · 10 = Full resource loop",
        labels: { 1: "No grind", 4: "Some", 7: "Moderate", 10: "Full grind" },
    },
    {
        id: "challengePreference",
        text: "How challenging should combat be?",
        icon: "🦖",
        type: "slider",
        min: 1, max: 10, step: 1, default: 5,
        hint: "1 = Dinos are harmless · 5 = Standard ARK · 10 = Fear the wild",
        labels: { 1: "Easy", 4: "Normal", 7: "Hard", 10: "Brutal" },
    },
    {
        id: "emotionalStatements",
        text: "Any specific pain points? (select all that apply)",
        icon: "💬",
        type: "multiselect",
        options: EMOTIONAL_STATEMENT_OPTIONS.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
        optional: true,
    },
];

// ─── MODE B CATEGORIES ────────────────────────────────────────────────────────

export const MODE_B_CATEGORIES = [
    {
        id: "profile",
        label: "Player Profile",
        icon: "👤",
        description: "Tell us about yourself so we can set the right baseline.",
        questions: [
            {
                id: "mode",
                text: "PvE or PvP server?",
                icon: "⚔️",
                type: "choice",
                options: [
                    { value: "pve", label: "PvE", desc: "Cooperative — no player vs player combat" },
                    { value: "pvp", label: "PvP", desc: "Competitive — players can raid each other" },
                ],
            },
        ],
    },
    {
        id: "taming",
        label: "Taming",
        icon: "🦕",
        description: "How fast and easy it is to tame wild creatures.",
        questions: [
            {
                id: "taming_speed",
                text: "Taming speed multiplier",
                type: "slider",
                min: 1, max: 20, step: 0.5, default: 1,
                hint: "1x = vanilla. 10x = 10x faster taming. Type any value in the box for higher speeds.",
                numberInput: true,
                mapTo: "taming",
            },
            {
                id: "torpor_drain",
                text: "Torpor drain rate (wild dinos)",
                type: "slider",
                min: 0.1, max: 3.0, step: 0.1, default: 1.0,
                hint: "How fast knocked-out dinos wake up. Lower = easier taming. 1.0 = vanilla.",
                numberInput: true,
                mapTo: "taming",
            },
            {
                id: "tamed_dino_damage",
                text: "Tamed dino damage multiplier",
                type: "slider",
                min: 0.1, max: 5.0, step: 0.1, default: 1.0,
                hint: "How much damage your tamed dinos deal. 1.0 = vanilla. 2.0 = recommended for PvE.",
                numberInput: true,
                mapTo: "taming",
            },
            {
                id: "tamed_dino_resistance",
                text: "Tamed dino resistance",
                type: "slider",
                min: 0.1, max: 3.0, step: 0.1, default: 1.0,
                hint: "Lower = tames take more damage (harder). Higher = tougher tames. 1.0 = vanilla.",
                numberInput: true,
                mapTo: "taming",
            },
            {
                id: "max_tamed_dinos",
                text: "Max tamed dinos on server",
                type: "slider",
                min: 100, max: 20000, step: 100, default: 5000,
                hint: "Total tamed dino limit across the entire server. Default = 5000.",
                numberInput: true,
                mapTo: "taming",
            },
            {
                id: "disable_dino_taming_q",
                text: "Allow dino taming?",
                type: "choice",
                options: [
                    { value: false, label: "Yes — taming enabled (normal)" },
                    { value: true, label: "No — disable all taming" },
                ],
                mapTo: "taming",
            },
            {
                id: "disable_dino_riding_q",
                text: "Allow riding tamed dinos?",
                type: "choice",
                options: [
                    { value: false, label: "Yes — riding enabled (normal)" },
                    { value: true, label: "No — disable riding" },
                ],
                mapTo: "taming",
            },
        ],
    },
    {
        id: "breeding",
        label: "Breeding",
        icon: "🥚",
        description: "Egg hatching, baby maturation, and imprinting.",
        questions: [
            {
                id: "breeding_speed",
                text: "Baby maturation speed",
                type: "slider",
                min: 1, max: 500, step: 1, default: 1,
                hint: "Default (1x) ~ 36h | 10x ~ 3h 30min | 50x ~ 43min | 480x ~ instant",
                numberInput: true,
                mapTo: "breeding",
            },
            {
                id: "egg_hatch_speed",
                text: "Egg hatch speed",
                type: "slider",
                min: 1, max: 500, step: 1, default: 1,
                hint: "Default (1x) ~ 80min | 10x ~ 8min | 50x ~ 1.5min | 240x ~ instant",
                numberInput: true,
                mapTo: "breeding",
            },
            {
                id: "mating_interval",
                text: "Mating cooldown multiplier",
                type: "slider",
                min: 0.001, max: 1.0, step: 0.001, default: 1.0,
                hint: "1.0 = vanilla. 0.1 = short cooldown.",
                maxLabel: "Vanilla",
                numberInput: true,
                mapTo: "breeding",
            },
            {
                id: "mating_speed",
                text: "Mating speed",
                type: "slider",
                min: 1, max: 50, step: 1, default: 1,
                hint: "40x = mating completes almost instantly.",
                mapTo: "breeding",
            },
            {
                id: "imprint_ease",
                text: "Imprint cuddle interval",
                type: "slider",
                min: 0.05, max: 1.0, step: 0.05, default: 1.0,
                hint: "Lower = more frequent cuddles needed. 1.0 = vanilla.",
                maxLabel: "Vanilla",
                numberInput: true,
                mapTo: "breeding",
            },
            {
                id: "imprint_amount",
                text: "Imprint progress per cuddle",
                type: "slider",
                min: 1, max: 20, step: 1, default: 1,
                hint: "10x = each cuddle gives 10x more imprint progress.",
                numberInput: true,
                mapTo: "breeding",
            },
            {
                id: "imprint_stat_scale",
                text: "Imprint stat bonus strength",
                type: "slider",
                min: 1, max: 10, step: 0.5, default: 1,
                hint: "5x = imprinting gives 5x stronger stat bonuses.",
                numberInput: true,
                mapTo: "breeding",
            },
            {
                id: "lay_egg_interval",
                text: "Egg laying interval",
                type: "slider",
                min: 0.1, max: 2.0, step: 0.1, default: 1.0,
                hint: "0.1 = very frequent. 1.0 = vanilla. 2.0 = infrequent.",
                maxLabel: "2.0x",
                numberInput: true,
                mapTo: "breeding",
            },
        ],
    },
    {
        id: "harvesting",
        label: "Harvesting",
        icon: "🌲",
        description: "Resource amounts, dino harvesting, and respawn rates.",
        questions: [
            {
                id: "harvest_amount",
                text: "Harvest amount multiplier",
                type: "slider",
                min: 1, max: 5, step: 0.1, default: 1,
                hint: "Vanilla = 1x.",
                numberInput: true,
                mapTo: "harvesting",
            },
            {
                id: "harvest_health",
                text: "Resource node health",
                type: "slider",
                min: 0.5, max: 5.0, step: 0.5, default: 1.0,
                hint: "Higher = more hits needed to break a tree/rock. 1.0 = vanilla.",
                numberInput: true,
                mapTo: "harvesting",
            },
            {
                id: "respawn_speed",
                text: "Resource respawn speed",
                type: "slider",
                min: 0.1, max: 2.0, step: 0.1, default: 1.0,
                hint: "How quickly trees, rocks, etc. regrow. 1.0 = vanilla. Lower = faster respawn.",
                maxLabel: "Slow",
                numberInput: true,
                mapTo: "harvesting",
            },
            {
                id: "dino_harvest_damage",
                text: "Dino harvesting damage",
                type: "slider",
                min: 1, max: 10, step: 0.1, default: 3.2,
                hint: "Vanilla = 3.2x.",
                numberInput: true,
                mapTo: "harvesting",
            },
        ],
    },
    {
        id: "xp",
        label: "XP & Leveling",
        icon: "⭐",
        description: "How fast players and dinos level up.",
        questions: [
            {
                id: "xp_rate",
                text: "XP multiplier",
                type: "slider",
                min: 1, max: 3, step: 0.1, default: 1,
                hint: "Applies to all XP sources. Vanilla = 1x.",
                numberInput: true,
                mapTo: "xp",
            },
            {
                id: "auto_unlock_engrams",
                text: "Auto-unlock all engrams?",
                type: "choice",
                options: [
                    { value: false, label: "No — players learn engrams normally" },
                    { value: true, label: "Yes — all engrams unlocked automatically" },
                ],
                mapTo: "xp",
            },
        ],
    },
    {
        id: "loot",
        label: "Loot Quality",
        icon: "📦",
        description: "Quality of items from drops, fishing, and crafting.",
        questions: [
            {
                id: "loot_quality",
                text: "Supply drop loot quality",
                type: "slider",
                min: 0.5, max: 5, step: 0.5, default: 1.0,
                hint: "3x = significantly better items from all drops.",
                numberInput: true,
                mapTo: "loot",
            },
            {
                id: "fishing_loot",
                text: "Fishing loot quality",
                type: "slider",
                min: 0.5, max: 5, step: 0.5, default: 1.0,
                hint: "3x = much better fishing rewards.",
                numberInput: true,
                mapTo: "loot",
            },
            {
                id: "disable_loot_crates_q",
                text: "Enable supply crate drops?",
                type: "choice",
                options: [
                    { value: false, label: "Yes — supply crates active (normal)" },
                    { value: true, label: "No — disable supply crates" },
                ],
                mapTo: "loot",
            },
            {
                id: "allow_custom_recipes_q",
                text: "Allow custom food recipes?",
                type: "choice",
                options: [
                    { value: true, label: "Yes — custom recipes enabled" },
                    { value: false, label: "No — disable custom recipes" },
                ],
                mapTo: "loot",
            },
        ],
    },
    {
        id: "difficulty",
        label: "Difficulty & Combat",
        icon: "⚔️",
        description: "Wild creature levels, damage, and resistance.",
        questions: [
            {
                id: "max_level",
                text: "Maximum wild creature level",
                type: "choice",
                options: [
                    { value: 1.0, label: "Level 30 (very easy)" },
                    { value: 2.0, label: "Level 60" },
                    { value: 5.0, label: "Level 150 (vanilla max)" },
                    { value: 8.0, label: "Level 240 (hard)" },
                    { value: 10.0, label: "Level 300 (extreme)" },
                ],
                hint: "OverrideOfficialDifficulty setting.",
                mapTo: "difficulty",
            },
            {
                id: "dino_damage",
                text: "Wild dino damage",
                type: "slider",
                min: 0.5, max: 2.0, step: 0.05, default: 1.0,
                hint: "1.0 = vanilla. 0.5 = very forgiving. 2.0 = brutal.",
                numberInput: true,
                mapTo: "difficulty",
            },
            {
                id: "player_damage_q",
                text: "Player damage multiplier",
                type: "slider",
                min: 0.5, max: 2.0, step: 0.1, default: 1.0,
                hint: "1.0 = vanilla.",
                numberInput: true,
                mapTo: "difficulty",
            },
        ],
    },
    {
        id: "dino_stats",
        label: "Dino Stat Multipliers",
        icon: "📊",
        description: "Per-level stat gains for wild and tamed dinos.",
        questions: [
            {
                id: "wild_dino_stats_preset",
                text: "Wild dino stat scaling",
                type: "slider",
                min: 0.1, max: 3.0, step: 0.1, default: 1.0,
                hint: "Per-level stat multiplier for wild dinos (HP, damage, speed). 1.0 = vanilla.",
                numberInput: true,
                mapTo: "difficulty",
            },
            {
                id: "tamed_dino_stats_preset",
                text: "Tamed dino stat scaling",
                type: "slider",
                min: 0.1, max: 3.0, step: 0.1, default: 1.0,
                hint: "Per-level HP/stat multiplier for tamed dinos. 1.0 = vanilla.",
                numberInput: true,
                mapTo: "taming",
            },
        ],
    },
    {
        id: "building",
        label: "Building & Structures",
        icon: "🏗️",
        description: "Structure placement, decay, pickup, and limits.",
        questions: [
            {
                id: "structure_pickup",
                text: "Structure pickup window",
                type: "slider",
                min: 30, max: 86400, step: 30, default: 30,
                hint: "How long after placement you can pick up a structure (seconds).",
                numberInput: true,
                mapTo: "building",
            },
            {
                id: "max_structures_q",
                text: "Max structures in range",
                type: "slider",
                min: 1000, max: 20000, step: 500, default: 6700,
                hint: "Maximum structures within the build radius. Default = 6700.",
                numberInput: true,
                mapTo: "building",
            },
            {
                id: "allow_cave_building_q",
                text: "Allow cave building?",
                type: "choice",
                options: [
                    { value: false, label: "No — caves are off-limits (vanilla)" },
                    { value: true, label: "Yes — allow building in caves" },
                ],
                mapTo: "building",
            },
            {
                id: "disable_structure_decay_q",
                text: "Structure decay?",
                type: "choice",
                options: [
                    { value: false, label: "Yes — structures decay (vanilla)" },
                    { value: true, label: "No — disable structure decay" },
                ],
                mapTo: "building",
            },
            {
                id: "ignore_prevention_volumes_q",
                text: "Allow building in restricted zones?",
                type: "choice",
                options: [
                    { value: true, label: "Yes — ignore build restrictions" },
                    { value: false, label: "No — respect restricted zones" },
                ],
                mapTo: "building",
            },
            {
                id: "allow_platform_multi_floors_q",
                text: "Platform saddle multi-floors?",
                type: "choice",
                options: [
                    { value: false, label: "No — single floor (vanilla)" },
                    { value: true, label: "Yes — allow multiple floors" },
                ],
                mapTo: "building",
            },
        ],
    },
    {
        id: "environment",
        label: "Environment & Time",
        icon: "🌍",
        description: "Day/night cycle, temperature, and item decay.",
        questions: [
            {
                id: "day_speed_q",
                text: "Daytime speed",
                type: "slider",
                min: 0.5, max: 3.0, step: 0.1, default: 1.0,
                hint: "1.0 = vanilla. Higher = faster days.",
                numberInput: true,
                mapTo: "qol",
            },
            {
                id: "night_speed_q",
                text: "Nighttime speed",
                type: "slider",
                min: 1.0, max: 5.0, step: 0.5, default: 1.0,
                hint: "1.0 = vanilla. Higher = shorter nights.",
                numberInput: true,
                mapTo: "qol",
            },
            {
                id: "spoiling_time_q",
                text: "Food spoiling time",
                type: "slider",
                min: 0.1, max: 10.0, step: 0.1, default: 1.0,
                hint: "1.0 = vanilla. Higher = food lasts longer.",
                numberInput: true,
                mapTo: "qol",
            },
            {
                id: "kick_idle_q",
                text: "Kick idle players after (seconds)",
                type: "slider",
                min: 0, max: 7200, step: 60, default: 0,
                hint: "0 = never kick. 3600 = 1 hour.",
                numberInput: true,
                mapTo: "qol",
            },
        ],
    },
    {
        id: "server_settings",
        label: "Server Settings",
        icon: "⚙️",
        description: "Voice chat, crosshair, player notifications, and QoL flags.",
        questions: [
            {
                id: "player_food_drain_q",
                text: "Player hunger drain",
                type: "slider",
                min: 0.1, max: 2.0, step: 0.1, default: 1.0,
                hint: "1.0 = vanilla. Lower = slower hunger drain.",
                maxLabel: "Vanilla",
                numberInput: true,
                mapTo: "qol",
            },
            {
                id: "player_water_drain_q",
                text: "Player thirst drain",
                type: "slider",
                min: 0.1, max: 2.0, step: 0.1, default: 1.0,
                hint: "1.0 = vanilla. Lower = slower thirst drain.",
                maxLabel: "Vanilla",
                numberInput: true,
                mapTo: "qol",
            },
            {
                id: "allow_third_person_q",
                text: "Allow third-person camera?",
                type: "choice",
                options: [
                    { value: true, label: "Yes — third-person enabled" },
                    { value: false, label: "No — first-person only" },
                ],
                mapTo: "qol",
            },
            {
                id: "server_crosshair_q",
                text: "Show crosshair?",
                type: "choice",
                options: [
                    { value: true, label: "Yes — crosshair visible" },
                    { value: false, label: "No — no crosshair" },
                ],
                mapTo: "qol",
            },
            {
                id: "show_map_location_q",
                text: "Show player location on map?",
                type: "choice",
                options: [
                    { value: true, label: "Yes — GPS dot on map" },
                    { value: false, label: "No — no GPS (vanilla)" },
                ],
                mapTo: "qol",
            },
            {
                id: "genesis_missions_q",
                text: "Enable Genesis missions?",
                type: "choice",
                options: [
                    { value: false, label: "Yes — missions enabled (normal)" },
                    { value: true, label: "No — disable Genesis missions" },
                ],
                mapTo: "qol",
            },
        ],
    },
    {
        id: "tribe_alliance",
        label: "Tribe & Alliance",
        icon: "👥",
        description: "Tribe size, alliances, friendly fire, and tribe wars.",
        questions: [
            {
                id: "tribe_size",
                text: "Maximum tribe size",
                type: "slider",
                min: 1, max: 70, step: 1, default: 70,
                hint: "Vanilla = 70. Small tribes servers often use 3–6.",
                numberInput: true,
                mapTo: "pvp",
            },
            {
                id: "max_alliances_q",
                text: "Max alliances per tribe",
                type: "slider",
                min: 0, max: 25, step: 1, default: 10,
                hint: "0 = no alliances. Vanilla = 10.",
                numberInput: true,
                mapTo: "pvp",
            },
            {
                id: "friendly_fire_q",
                text: "Friendly fire between tribe members?",
                type: "choice",
                options: [
                    { value: false, label: "No — tribe members can't hurt each other" },
                    { value: true, label: "Yes — friendly fire enabled" },
                ],
                mapTo: "pvp",
            },
            {
                id: "tribe_war_q",
                text: "Allow tribe wars in PvE?",
                type: "choice",
                options: [
                    { value: true, label: "Yes — tribes can declare war" },
                    { value: false, label: "No — no tribe wars" },
                ],
                mapTo: "pvp",
            },
        ],
    },
    {
        id: "turrets",
        label: "Turrets & Defense",
        icon: "🔫",
        description: "Turret limits and passive defense behavior.",
        questions: [
            {
                id: "turret_count_q",
                text: "Max turrets per area (0 = no limit)",
                type: "slider",
                min: 0, max: 500, step: 10, default: 100,
                hint: "0 = turret limit disabled. Default = 100.",
                numberInput: true,
                mapTo: "pvp",
            },
        ],
    },
    {
        id: "transfers",
        label: "Transfers & Downloads",
        icon: "🔄",
        description: "Cross-server character, item, and dino transfers.",
        questions: [
            {
                id: "allow_downloads_q",
                text: "Allow cross-server downloads?",
                type: "choice",
                options: [
                    { value: false, label: "Yes — allow all downloads (open server)" },
                    { value: true, label: "No — block all downloads" },
                ],
                hint: "Controls noTributeDownloads.",
                mapTo: "pvp",
            },
            {
                id: "prevent_download_dinos_q",
                text: "Allow downloading tamed dinos?",
                type: "choice",
                options: [
                    { value: false, label: "Yes — dino downloads allowed" },
                    { value: true, label: "No — block dino downloads" },
                ],
                mapTo: "pvp",
            },
        ],
    },
    {
        id: "pvp_balance",
        label: "PvP Settings",
        icon: "🛡️",
        description: "PvP-specific combat and raiding settings.",
        questions: [
            {
                id: "structure_damage_q",
                text: "Structure damage multiplier",
                type: "slider",
                min: 0.5, max: 4.0, step: 0.5, default: 1.0,
                hint: "1.0 = vanilla. Higher = easier raiding.",
                numberInput: true,
                mapTo: "pvp",
            },
            {
                id: "pvp_zone_damage_q",
                text: "PvP zone structure damage",
                type: "slider",
                min: 1.0, max: 10.0, step: 0.5, default: 6.0,
                hint: "Structure damage multiplier within PvP zones.",
                numberInput: true,
                mapTo: "pvp",
            },
        ],
    },
];

// ─── QUESTIONNAIRE STATE MACHINE ──────────────────────────────────────────────

export class Questionnaire {
    constructor(mode, onComplete) {
        this.mode = mode; // 'A' or 'B'
        this.onComplete = onComplete;
        this.answers = {};
        this.currentIndex = 0;
        this.questions = mode === 'A' ? MODE_A_QUESTIONS : this._flattenModeB();
        this.categoryIndex = 0; // for Mode B
        this.modeB_categories = MODE_B_CATEGORIES;
    }

    _flattenModeB() {
        return MODE_B_CATEGORIES.flatMap(cat => cat.questions.map(q => ({ ...q, categoryLabel: cat.label, categoryIcon: cat.icon })));
    }

    get currentQuestion() {
        return this.questions[this.currentIndex];
    }

    get progress() {
        return { current: this.currentIndex + 1, total: this.questions.length };
    }

    get isLast() {
        return this.currentIndex >= this.questions.length - 1;
    }

    answer(value) {
        const q = this.currentQuestion;
        this.answers[q.id] = value;
    }

    next() {
        if (this.isLast) {
            this.onComplete(this.answers);
        } else {
            this.currentIndex++;
        }
    }

    prev() {
        if (this.currentIndex > 0) this.currentIndex--;
    }

    canProceed() {
        const q = this.currentQuestion;
        if (q.optional) return true;
        return this.answers[q.id] !== undefined;
    }
}
