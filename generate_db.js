const fs = require('fs');

const userList = `
AllowAnyoneBabyImprintCuddle=true
AllowBunkerModulesAboveGround=false
AllowBunkersInPreventionZones=false
AllowCrateSpawnsOnTopOfStructures=false
AllowCryoFridgeOnSaddle=false
AllowDinoAIInsideBunkers=true
AllowFlyerCarryPvE=false
AllowFlyingStaminaRecovery=false
AllowHideDamageSourceFromLogs=true
AllowHitMarkers=true
AllowMultipleAttachedC4=false
AllowRaidDinoFeeding=true
AllowRidingDinosInsideBunkers=true
AllowTeslaCoilCaveBuildingPVP=true
allowThirdPersonPlayer=true
AlwaysAllowStructurePickup=True
ArmadoggoDeathCooldown=3600
AutoDestroyDecayedDinos=false
AutoDestroyOldStructuresMultiplier=1
AutoDestroyStructures=False
AutoSavePeriodMinutes=15
bFilterCharacterNames=False
bFilterChat=False
bFilterTribeNames=False
bJoinNotifications=false
BloodforgeReinforceExtraDurability=0.3
BloodforgeReinforceResourceCostMultiplier=3
BloodforgeReinforceSpeedMultiplier=0.1
bShowStatusNotificationMessages=false
BunkerUnderHPThresholdDmgMultiplier=0.05
ClampItemSpoilingTimes=false
ClampItemStats=false
converttostore=False
CosmoWeaponAmmoReloadAmount=-1
CrossARKAllowForeignDinoDownloads=False
CryoHospitalHoursToDrainTorpor=1
CryoHospitalHoursToRegenFood=24
CryoHospitalHoursToRegenHP=1
CryoHospitalMatingCooldownReduction=2
CryopodFridgeCooldowntime=90
DayCycleSpeedScale=1
DayTimeSpeedScale=1
DifficultyOffset=1.0
DinoCharacterFoodDrainMultiplier=1
DinoCharacterHealthRecoveryMultiplier=1
DinoCharacterStaminaDrainMultiplier=1
DinoDamageMultiplier=1
DinoResistanceMultiplier=1
DisableCryopodEnemyCheck=false
DisableCryopodFridgeRequirement=false
DisableCustomCosmetics=False
DisableDinoDecayPvE=False
DisableImprintDinoBuff=true
DisableStructureDecayPvE=False
EnableCryopodNerf=False
EnableCryoSicknessPVE=false
EnableExtraStructurePreventionVolumes=true
EnemyAccessBunkerHPThreshold=0.25
FastDecayUnsnappedCoreStructures=true
ForceRespawnDinos=False
HarvestAmountMultiplier=1
HarvestHealthMultiplier=1
IgnorePVPMountedWeaponryRestriction=true
ImplantSuicideCD=28800
ItemStackSizeMultiplier=1
KickIdlePlayersPeriod=3600
LimitBunkersPerTribe=true
LimitBunkersPerTribeNum=3
MaxActiveCityOutposts=0
MaxActiveOutposts=0
MaxActiveResourceCaches=0
MaxCosmoWeaponAmmo=-1
MaxPersonalTamedDinos=10000
MaxTamedDinos=5000
MinDistanceBetweenBunkers=3000.0
MinimumDinoReuploadInterval=0
NightTimeSpeedScale=1
NoBattlEye=False
NonPermanentDiseases=true
OnlyAutoDestroyCoreStructures=true
OnlyDecayUnsnappedCoreStructures=False
OverrideOfficialDifficulty=0
OverrideStructurePlatformPrevention=true
OxygenSwimSpeedStatMultiplier=1
PerPlatformMaxStructuresMultiplier=1
PlatformSaddleBuildAreaBoundsMultiplier=1
PlayerCharacterFoodDrainMultiplier=1
PlayerCharacterHealthRecoveryMultiplier=1
PlayerCharacterStaminaDrainMultiplier=1
PlayerCharacterWaterDrainMultiplier=1
PlayerDamageMultiplier=1
PlayerResistanceMultiplier=1
PreventDiseases=false
PreventDownloadDinos=False
PreventDownloadItems=False
PreventDownloadSurvivors=False
PreventOfflinePvP=true
PreventOfflinePvPInterval=800
PreventSpawnAnimations=false
PreventTribeAlliances=true
PreventUploadDinos=False
PreventUploadItems=False
PreventUploadSurvivors=False
PvEAllowStructuresAtSupplyDrops=false
PvEDinoDecayPeriodMultiplier=1
PvEStructureDecayPeriodMultiplier=1
PvPDinoDecay=true
PvPStructureDecay=true
RaidDinoCharacterFoodDrainMultiplier=1
RCONEnabled=True
RCONPort=25000
RCONServerGameLogBuffer=600
ResourcesRespawnPeriodMultiplier=1
ServerAdminPassword=1234
ServerCrosshair=true
servergamelog=False
ServerPassword=1234
serverPVE=false
ShowFloatingDamageText=true
ShowMapPlayerLocation=true
SpectatorPassword=
StartTimeHour=-1
StructurePickupHoldDuration=0.5
StructurePickupTimeAfterPlacement=30
StructurePreventResourceRadiusMultiplier=1
StructureResistanceMultiplier=1
TamingSpeedMultiplier=1
TheMaxStructuresInRange=10500
TribeLogDestroyedEnemyStructures=false
TribeNameChangeCooldown=15
UseItemDupeCheck=False
UseOptimizedHarvestingHealth=false
usestore=True
WorldBossKingKaijuSpawnTime=15:00:00
XPMultiplier=1.3
CryopodNerfDuration=0
CryopodNerfDamageMult=0.0099999998
CryopodNerfIncomingDamageMultPercent=0
AllowBunkerModulesInPreventionZones=false
`;

const fileContent = fs.readFileSync('d:/ai/ASST/db/settings_db.js', 'utf8');
const existingKeys = new Set();
const keyRegex = /key:\s*"([^"]+)"/g;
let match;
while ((match = keyRegex.exec(fileContent)) !== null) {
    existingKeys.add(match[1].toLowerCase());
}

const lines = userList.trim().split('\n');
const missing = [];

lines.forEach(line => {
    if (!line.includes('=')) return;
    const [rawKey, rawVal] = line.split('=');
    const key = rawKey.trim();
    if (!key) return;
    let val = rawVal.trim();

    let type = 'string';
    let defaultVal = val;
    const valLower = val.toLowerCase();

    if (valLower === 'true' || valLower === 'false') {
        type = 'bool';
        defaultVal = valLower === 'true';
    } else if (valLower === '') {
        type = 'string';
        defaultVal = '';
    } else if (!isNaN(parseFloat(val))) {
        if (val.includes('.') || parseFloat(val) !== parseInt(val, 10)) {
            type = 'float';
            defaultVal = parseFloat(val);
        } else {
            type = 'int';
            defaultVal = parseInt(val, 10);
        }
    }

    if (!existingKeys.has(key.toLowerCase())) {
        missing.push({ key, default: defaultVal, type });
    }
});

let injectString = '    // === Nitrado Base ServerSettings Injections ===\n';
missing.forEach(m => {
    let id = m.key.replace(/([A-Z])/g, '_$1').replace(/^_/, '').toLowerCase();
    if (id.startsWith('b_')) id = id.substring(2); // Fix booleans starting with b

    let validRangeStr = '[]';
    if (m.type === 'bool') validRangeStr = '[true, false]';
    else if (m.type === 'int') validRangeStr = '[-999999, 999999]';
    else if (m.type === 'float') validRangeStr = '[-1000.0, 1000.0]';

    let defaultStr = m.default;
    if (m.type === 'string') defaultStr = `"${m.default}"`;

    injectString += `    {
        id: "${id}",
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        key: "${m.key}",
        type: "${m.type}",
        valid_range: ${validRangeStr},
        default: ${defaultStr},
        gameplay_effect: "Nitrado Default Server Setting.",
        dependencies: [],
        support: "both",
        category: "server"
    },\n`;
});

fs.writeFileSync('d:/ai/ASST/missing_settings.txt', injectString);
console.log('Total keys missing and generated:', missing.length);
