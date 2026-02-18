/**
 * Role-Based Access Control (RBAC)
 * No superuser bypass. Admin cannot edit SKU content. Every check should be logged server-side.
 *
 * Roles (3.1): content_editor, product_specialist, seo_governor, channel_manager,
 *              ai_ops, portfolio_holder, finance, admin, system, viewer
 *
 * Critical: KILL-tier SKUs revoke ALL edit permissions system-wide.
 *           Content editors CANNOT override validation gate failures.
 *           Manual tier change requires DUAL sign-off (Portfolio Holder + Finance).
 */

const ROLES = {
    CONTENT_EDITOR: 'content_editor',
    PRODUCT_SPECIALIST: 'product_specialist',
    SEO_GOVERNOR: 'seo_governor',
    CHANNEL_MANAGER: 'channel_manager',
    AI_OPS: 'ai_ops',
    PORTFOLIO_HOLDER: 'portfolio_holder',
    FINANCE: 'finance',
    ADMIN: 'admin',
    SYSTEM: 'system',
    VIEWER: 'viewer',
};

/** Normalize role from backend (e.g. ADMIN, SEO_GOVERNOR, content_editor) to lowercase snake_case */
export function normalizeRole(role) {
    if (!role) return '';
    const r = String(role).toLowerCase().trim().replace(/-/g, '_');
    // Legacy mapping for backward compatibility
    const legacy = {
        governor: 'seo_governor',
        editor: 'content_editor',
        content_lead: 'portfolio_holder',
        finance_director: 'finance',
    };
    return legacy[r] || r;
}

/** Whether the user can access the app (any role except unauthenticated) */
export function canAccess(user) {
    return !!user && !!normalizeRole(user.role);
}

// --- Permission matrix (3.2) ---

/** Create/edit content fields (title, descriptions, answer block, best-for, not-for). Admin & PH CANNOT (matrix 3.2). */
export function canEditContentFields(user, sku) {
    if (!user || !sku) return false;
    const role = normalizeRole(user.role);
    if (role === ROLES.ADMIN || role === ROLES.SYSTEM || role === ROLES.VIEWER) return false;
    if (role === ROLES.PORTFOLIO_HOLDER || role === ROLES.FINANCE) return false; // Matrix: PH NO, Finance NO
    if (sku.tier === 'KILL') return false; // CRITICAL: KILL revokes all edit
    // Editor, Prod Spec*, Ch Mgr* per matrix (*category-bound: not enforced in UI yet)
    return [ROLES.CONTENT_EDITOR, ROLES.PRODUCT_SPECIALIST, ROLES.CHANNEL_MANAGER].includes(role);
}

/** Tier-lock for content_editor: SUPPORT & HARVEST only; cannot edit HERO */
export function canEditContentFieldsForTier(user, sku) {
    if (!canEditContentFields(user, sku)) return false;
    const role = normalizeRole(user.role);
    if (role === ROLES.CONTENT_EDITOR && sku && !['SUPPORT', 'HARVEST'].includes(sku.tier)) return false;
    return true;
}

/** Edit expert authority / safety certs. Product Specialist only. */
export function canEditExpertAuthority(user, sku) {
    if (!user || !sku) return false;
    if (sku.tier === 'KILL') return false;
    return normalizeRole(user.role) === ROLES.PRODUCT_SPECIALIST;
}

/** Assign/change cluster_id. SEO Governor only. */
export function canAssignCluster(user) {
    if (!user) return false;
    return normalizeRole(user.role) === ROLES.SEO_GOVERNOR;
}

/** Modify/propose intent taxonomy. Matrix 3.2: only SEO Governor (REVIEW* — quarterly Commercial Director review to activate). Admin = NO. */
export function canModifyIntentTaxonomy(user) {
    if (!user) return false;
    return normalizeRole(user.role) === ROLES.SEO_GOVERNOR;
}

/** Alias: SEO Governor proposes taxonomy changes (review with Commercial Director to activate). */
export function canProposeTaxonomyChange(user) {
    return canModifyIntentTaxonomy(user);
}

/** Manual tier change requires DUAL: Portfolio Holder AND Finance. Admin cannot do alone. */
export function canApproveTierAsPortfolioHolder(user) {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return role === ROLES.PORTFOLIO_HOLDER;
}

export function canApproveTierAsFinance(user) {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return role === ROLES.FINANCE;
}

/** Trigger tier recalculation. Admin + Finance only. */
export function canTriggerTierRecalculation(user) {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return role === ROLES.ADMIN || role === ROLES.FINANCE;
}

/** Publish SKU / submit for review. Editor, SEO Gov, Ch Mgr, PH. Not Admin. */
export function canPublishSku(user, sku) {
    if (!user || !sku) return false;
    if (sku.tier === 'KILL') return false;
    const role = normalizeRole(user.role);
    return [ROLES.CONTENT_EDITOR, ROLES.SEO_GOVERNOR, ROLES.CHANNEL_MANAGER, ROLES.PORTFOLIO_HOLDER].includes(role);
}

/** Run AI audit. AI Ops, Admin, System. */
export function canRunAIAudit(user) {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return [ROLES.AI_OPS, ROLES.ADMIN, ROLES.SYSTEM].includes(role);
}

/** Manage golden queries. SEO Governor, AI Ops. */
export function canManageGoldenQueries(user) {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return [ROLES.SEO_GOVERNOR, ROLES.AI_OPS].includes(role);
}

/** View audit logs scope: OWN, ALL, CAT (category). Simplified: admin/seo_governor/ai_ops/ph/finance = broader. */
export function canViewAuditLogs(user) {
    return !!user && normalizeRole(user.role) !== ROLES.VIEWER;
}

/** Manage users/roles. Admin only. */
export function canManageUsers(user) {
    if (!user) return false;
    return normalizeRole(user.role) === ROLES.ADMIN;
}

/** ERP sync trigger. Finance, Admin, System. */
export function canTriggerERPSync(user) {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return [ROLES.FINANCE, ROLES.ADMIN, ROLES.SYSTEM].includes(role);
}

/** System configuration (gate thresholds, tier weights, etc.). Admin only. */
export function canModifyConfig(user) {
    if (!user) return false;
    return normalizeRole(user.role) === ROLES.ADMIN;
}

/** View readiness / manage channel mappings. Channel Manager + others who can view. */
export function canViewReadiness(user) {
    return canAccess(user);
}

export function canManageChannelMappings(user) {
    if (!user) return false;
    return normalizeRole(user.role) === ROLES.CHANNEL_MANAGER;
}

/** View tier assignments. Finance, PH, Admin, etc. */
export function canViewTierAssignments(user) {
    return canAccess(user);
}

/** Content editors CANNOT override validation gate failures. Return true if this role may bypass (none can). */
export function canOverrideGateFailures(user) {
    return false; // No role can override; dual sign-off is for tier change only
}

/** Can user edit anything on this SKU? (content OR expert OR cluster, subject to tier) */
export function canEditSkuAny(user, sku) {
    if (!user || !sku) return false;
    if (sku.tier === 'KILL') return false;
    return canEditContentFieldsForTier(user, sku) || canEditExpertAuthority(user, sku) || canAssignCluster(user);
}

export default {
    ROLES,
    normalizeRole,
    canAccess,
    canEditContentFields,
    canEditContentFieldsForTier,
    canEditExpertAuthority,
    canAssignCluster,
    canModifyIntentTaxonomy,
    canProposeTaxonomyChange,
    canApproveTierAsPortfolioHolder,
    canApproveTierAsFinance,
    canTriggerTierRecalculation,
    canPublishSku,
    canRunAIAudit,
    canManageGoldenQueries,
    canViewAuditLogs,
    canManageUsers,
    canTriggerERPSync,
    canModifyConfig,
    canViewReadiness,
    canManageChannelMappings,
    canViewTierAssignments,
    canOverrideGateFailures,
    canEditSkuAny,
};
