export const MOCK_SKUS = [
    { id: 'CBL-BLK-3C-3M', name: 'Black 3-Core Cable 3m', tier: 'hero', cluster: 'CL-CABLE-POWER', category: 'Cables', readiness: 94, gates: { G1: true, G2: true, G3: true, G4: true, G5: true, G6: true, 'G6.1': true, G7: true, VEC: true }, citationRate: 72, maturity: 94 },
    { id: 'CBL-WHT-2C-5M', name: 'White 2-Core Cable 5m', tier: 'hero', cluster: 'CL-CABLE-POWER', category: 'Cables', readiness: 87, gates: { G1: true, G2: true, G3: true, G4: true, G5: true, G6: true, 'G6.1': true, G7: false, VEC: true }, citationRate: 58, maturity: 87 },
    { id: 'LMP-OPL-DRM-M', name: 'Opal Drum Lampshade Medium', tier: 'support', cluster: 'CL-SHADE-DRUM', category: 'Lampshades', readiness: 72, gates: { G1: true, G2: true, G3: true, G4: true, G5: false, G6: true, 'G6.1': true, G7: false, VEC: true }, citationRate: 34, maturity: 72 },
    { id: 'BLB-LED-E27-8W', name: 'LED E27 Bulb 8W Warm', tier: 'support', cluster: 'CL-BULB-LED', category: 'Bulbs', readiness: 65, gates: { G1: true, G2: false, G3: true, G4: true, G5: true, G6: true, 'G6.1': false, G7: false, VEC: true }, citationRate: 22, maturity: 65 },
    { id: 'PND-BRS-IND-L', name: 'Brass Industrial Pendant Large', tier: 'hero', cluster: 'CL-PEND-IND', category: 'Pendants', readiness: 91, gates: { G1: true, G2: true, G3: true, G4: true, G5: true, G6: true, 'G6.1': true, G7: true, VEC: false }, citationRate: 65, maturity: 88 },
    { id: 'CBL-GRY-3C-1M', name: 'Grey 3-Core Cable 1m', tier: 'harvest', cluster: 'CL-CABLE-POWER', category: 'Cables', readiness: 48, gates: { G1: true, G2: false, G3: true, G4: false, G5: false, G6: true, 'G6.1': false, G7: false, VEC: false }, citationRate: 8, maturity: 42 },
    { id: 'LMP-COT-CYL-S', name: 'Cotton Cylinder Shade Small', tier: 'harvest', cluster: 'CL-SHADE-CYL', category: 'Lampshades', readiness: 38, gates: { G1: true, G2: false, G3: false, G4: false, G5: false, G6: false, 'G6.1': false, G7: false, VEC: false }, citationRate: 2, maturity: 28 },
    { id: 'CBL-RED-2C-2M', name: 'Red 2-Core Cable 2m', tier: 'kill', cluster: 'CL-CABLE-DECO', category: 'Cables', readiness: 12, gates: { G1: true, G2: false, G3: false, G4: false, G5: false, G6: false, 'G6.1': false, G7: false, VEC: false }, citationRate: 0, maturity: 8 },
    { id: 'PND-CHR-MOD-M', name: 'Chrome Modern Pendant Medium', tier: 'support', cluster: 'CL-PEND-MOD', category: 'Pendants', readiness: 78, gates: { G1: true, G2: true, G3: true, G4: true, G5: true, G6: true, 'G6.1': false, G7: false, VEC: true }, citationRate: 41, maturity: 74 },
    { id: 'BLB-HAL-GU10-50', name: 'Halogen GU10 50W Spotlight', tier: 'kill', cluster: 'CL-BULB-LEGACY', category: 'Bulbs', readiness: 5, gates: { G1: true, G2: false, G3: false, G4: false, G5: false, G6: false, 'G6.1': false, G7: false, VEC: false }, citationRate: 0, maturity: 5 },
];

export const MOCK_CLUSTERS = [
    { id: 'CL-CABLE-POWER', name: 'Power Cables', skuCount: 48, avgReadiness: 76, intent: 'Compatibility' },
    { id: 'CL-CABLE-DECO', name: 'Decorative Cables', skuCount: 22, avgReadiness: 54, intent: 'Inspiration' },
    { id: 'CL-SHADE-DRUM', name: 'Drum Lampshades', skuCount: 35, avgReadiness: 68, intent: 'Comparison' },
    { id: 'CL-SHADE-CYL', name: 'Cylinder Lampshades', skuCount: 18, avgReadiness: 42, intent: 'Comparison' },
    { id: 'CL-BULB-LED', name: 'LED Bulbs', skuCount: 62, avgReadiness: 71, intent: 'Compatibility' },
    { id: 'CL-BULB-LEGACY', name: 'Legacy Bulbs', skuCount: 14, avgReadiness: 22, intent: 'Problem-Solving' },
    { id: 'CL-PEND-IND', name: 'Industrial Pendants', skuCount: 28, avgReadiness: 82, intent: 'Inspiration' },
    { id: 'CL-PEND-MOD', name: 'Modern Pendants', skuCount: 31, avgReadiness: 69, intent: 'Comparison' },
];

export const MOCK_AUDIT_SCORES = [
    { week: 'W1', cables: 68, lampshades: 45, bulbs: 52, pendants: 61 },
    { week: 'W2', cables: 71, lampshades: 48, bulbs: 55, pendants: 64 },
    { week: 'W3', cables: 74, lampshades: 52, bulbs: 58, pendants: 68 },
    { week: 'W4', cables: 72, lampshades: 56, bulbs: 61, pendants: 71 },
    { week: 'W5', cables: 78, lampshades: 59, bulbs: 64, pendants: 73 },
    { week: 'W6', cables: 82, lampshades: 63, bulbs: 67, pendants: 76 },
];

export const MOCK_REVIEW_QUEUE = [
    { id: 'CBL-WHT-2C-5M', name: 'White 2-Core Cable 5m', editor: 'Sarah M.', submitted: '2h ago', tier: 'hero', failedGates: ['G7'] },
    { id: 'LMP-OPL-DRM-M', name: 'Opal Drum Lampshade Medium', editor: 'James K.', submitted: '4h ago', tier: 'support', failedGates: ['G5', 'G7'] },
    { id: 'PND-CHR-MOD-M', name: 'Chrome Modern Pendant Medium', editor: 'Priya R.', submitted: '6h ago', tier: 'support', failedGates: ['G6.1', 'G7'] },
    { id: 'BLB-LED-E27-8W', name: 'LED E27 Bulb 8W Warm', editor: 'Tom H.', submitted: '1d ago', tier: 'support', failedGates: ['G2', 'G6.1', 'G7'] },
];

export const NAV_ITEMS = [
    { id: 'dashboard', icon: '◫', label: 'Dashboard' },
    { id: 'sku-edit', icon: '✎', label: 'SKU Edit' },
    { id: 'review', icon: '☑', label: 'Review Queue', badge: 12 },
    { id: 'maturity', icon: '◉', label: 'Maturity' },
    { id: 'audit', icon: '⊘', label: 'AI Audit' },
    { id: 'clusters', icon: '⬡', label: 'Clusters' },
    { id: 'channels', icon: '⇉', label: 'Channels' },
    { id: 'config', icon: '⚙', label: 'Config' },
    { id: 'tiers', icon: '▦', label: 'Tier Mgmt' },
    { id: 'briefs', icon: '📋', label: 'Briefs' },
    { id: 'audit-trail', icon: '⟳', label: 'Audit Trail' },
    { id: 'bulk', icon: '⊞', label: 'Bulk Ops' },
    { id: 'staff', icon: '👤', label: 'Staff KPIs' },
];
