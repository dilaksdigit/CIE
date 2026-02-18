/**
 * CIE v2.3.1 — CMS form field visibility by SKU tier (G6.1).
 * Input: tier string (hero/support/harvest/kill)
 * Output: show/hide form sections, max secondary intents, readonly state.
 */

export const TIER_FIELD_MAP = {
    hero: {
        enabled: ['all_9_intents', 'answer_block', 'best_for', 'not_for', 'expert_authority', 'wikidata_uri', 'json_ld_preview'],
        max_secondary: 3,
    },
    support: {
        enabled: ['all_9_intents', 'answer_block', 'best_for', 'not_for', 'expert_authority'],
        max_secondary: 2,
        hidden: ['wikidata_uri'],
    },
    harvest: {
        enabled: ['specification', 'problem_solving', 'compatibility'],
        hidden: ['answer_block', 'best_for', 'not_for', 'expert_authority', 'wikidata_uri', 'comparison', 'installation', 'troubleshooting', 'inspiration', 'regulatory', 'replacement'],
        max_secondary: 1,
    },
    kill: {
        enabled: [],
        readonly: true,
        banner: 'This SKU is flagged for delisting. No edits permitted.',
    },
};

/**
 * Normalize tier to lowercase key (HERO -> hero).
 */
export function normalizeTier(tier) {
    if (!tier || typeof tier !== 'string') return '';
    return tier.trim().toLowerCase();
}

/**
 * Get config for tier. Uses TIER_FIELD_MAP keys (lowercase).
 */
export function getTierConfig(tier) {
    const key = normalizeTier(tier);
    return TIER_FIELD_MAP[key] || TIER_FIELD_MAP.support;
}

/**
 * Whether this tier is read-only (Kill).
 */
export function isTierReadonly(tier) {
    return getTierConfig(tier).readonly === true;
}

/**
 * Banner message for read-only tier (e.g. Kill).
 */
export function getTierBanner(tier) {
    const config = getTierConfig(tier);
    return config.banner || null;
}

/**
 * Max secondary intents allowed for this tier (0 for kill).
 */
export function getMaxSecondaryIntents(tier) {
    const config = getTierConfig(tier);
    if (config.readonly) return 0;
    return config.max_secondary ?? 2;
}

/**
 * Whether a form field/section should be visible for this tier.
 * Field names: answer_block, best_for, not_for, expert_authority, wikidata_uri,
 * json_ld_preview, and intent keys (specification, problem_solving, compatibility, etc.)
 */
export function isFieldEnabledForTier(tier, fieldName) {
    const config = getTierConfig(tier);
    if (config.readonly) return false;
    if (config.hidden && config.hidden.includes(fieldName)) return false;
    if (config.enabled && config.enabled.length > 0) {
        if (config.enabled.includes('all_9_intents') && !config.hidden?.includes(fieldName)) return true;
        return config.enabled.includes(fieldName);
    }
    return true;
}

/**
 * Apply tier restrictions (for use on page load).
 * - If readonly: call disableAllFields(), showBanner(config.banner).
 * - Else: hide fields in config.hidden.
 * Returns the config for the tier.
 */
export function applyTierRestrictions(tier, options = {}) {
    const config = getTierConfig(tier);
    if (config.readonly) {
        if (typeof options.disableAllFields === 'function') options.disableAllFields();
        if (typeof options.showBanner === 'function') options.showBanner(config.banner);
        return config;
    }
    if (config.hidden && Array.isArray(config.hidden) && typeof options.hideField === 'function') {
        config.hidden.forEach((field) => options.hideField(field));
    }
    return config;
}

export default {
    TIER_FIELD_MAP,
    normalizeTier,
    getTierConfig,
    isTierReadonly,
    getTierBanner,
    getMaxSecondaryIntents,
    isFieldEnabledForTier,
    applyTierRestrictions,
};
