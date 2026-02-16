import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    TierBadge,
    GateChip,
    ReadinessBar,
    RoleBadge,
    SectionTitle,
    TrafficLight,
    GATES
} from '../components/common/UIComponents';
import { skuApi } from '../services/api';
import useStore from '../store';

const TIERS = {
    HERO: { label: "HERO", color: "#8B6914", bg: "#FDF6E3", border: "#E8D5A0" },
    SUPPORT: { label: "SUPPORT", color: "#3D6B8E", bg: "#EBF3F9", border: "#B5D0E3" },
    HARVEST: { label: "HARVEST", color: "#B8860B", bg: "#FFF8E7", border: "#E8D49A" },
    KILL: { label: "KILL", color: "#A63D2F", bg: "#FDEEEB", border: "#E5B5AD" },
};

const SkuEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addNotification } = useStore();
    const [activeTab, setActiveTab] = useState('content');
    const [sku, setSku] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        const fetchSku = async () => {
            try {
                const response = await skuApi.get(id);
                setSku(response.data.data);
            } catch (err) {
                console.error('Failed to fetch SKU:', err);
                addNotification({ type: 'error', message: 'Failed to load SKU' });
            } finally {
                setLoading(false);
            }
        };
        fetchSku();
    }, [id, addNotification]);

    const handleSave = async (isSubmit = false) => {
        setSaving(true);
        try {
            await skuApi.update(id, sku);
            addNotification({
                type: 'success',
                message: isSubmit ? 'Submitted for review' : 'Draft saved successfully'
            });
            if (isSubmit) navigate('/review');
        } catch (err) {
            console.error('Save failed:', err);
            addNotification({ type: 'error', message: 'Failed to save changes' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading SKU details...</div>;

    if (!id) {
        return (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 20 }}>✎</div>
                <h2>No SKU Selected</h2>
                <p>Please select a SKU from the <a href="/" style={{ color: 'var(--hero)', fontWeight: 600 }}>Dashboard</a> to begin editing.</p>
            </div>
        );
    }

    if (!sku) {
        return (
            <div style={{ padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', color: 'var(--red)', marginBottom: 20 }}>⚠</div>
                <h2 style={{ color: 'var(--text)' }}>SKU Not Found</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: 24 }}>The SKU ID "{id}" does not exist in the database or you lack permission to view it.</p>
                <button className="btn btn-secondary" onClick={() => navigate('/')}>Return to Dashboard</button>
            </div>
        );
    }

    const currentTier = sku.tier || 'SUPPORT';
    const tierStyle = TIERS[currentTier] || TIERS.SUPPORT;

    const tabs = [
        { id: 'content', label: 'Content' },
        { id: 'faq', label: 'FAQ' },
        { id: 'authority', label: 'Authority' },
        { id: 'channels', label: 'Channels' },
        { id: 'history', label: 'History' },
    ];

    return (
        <div>
            {/* Tier Header Banner */}
            <div style={{
                background: tierStyle.bg, border: `1px solid ${tierStyle.border}`,
                borderRadius: 6, padding: "12px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
                <div>
                    <div className="flex items-center gap-12">
                        <TierBadge tier={currentTier} size="md" />
                        <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{sku.sku_code}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>— {sku.title}</span>
                    </div>
                    <div style={{ fontSize: "0.62rem", color: tierStyle.color, marginTop: 4 }}>
                        {currentTier} TIER: {currentTier === 'HERO' ? 'Full content required. All 7 gates + vector must pass.' : 'Standard governance requirements apply.'}
                    </div>
                </div>
                <div className="flex gap-8">
                    <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button className="btn btn-primary" onClick={() => handleSave(true)} disabled={saving}>
                        Submit for Review
                    </button>
                </div>
            </div>

            {/* Gate Status Bar */}
            <div className="card mb-14 flex items-center gap-12 flex-wrap" style={{ padding: '10px 18px' }}>
                <span style={{ fontSize: "0.62rem", color: "var(--text-dim)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>GATE STATUS</span>
                <div style={{ width: 1, height: 20, background: "var(--border)" }} />
                {GATES.map(g => <GateChip key={g.id} id={g.id} pass={sku.readiness_score > 80} />)}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.62rem", color: "var(--text-dim)" }}>Readiness:</span>
                    <ReadinessBar value={sku.readiness_score || 0} width={100} />
                </div>
            </div>

            <div className="flex gap-14">
                <div style={{ flex: 1 }}>
                    <div className="tab-bar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'content' && (
                        <div className="flex flex-col gap-14">
                            <div className="flex gap-12">
                                <div style={{ flex: 1 }}>
                                    <label className="field-label">G1 — Cluster ID <GateChip id="G1" pass={true} compact /></label>
                                    <div className="field-input readonly">{sku.primaryCluster?.name || 'Unassigned'}</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="field-label">G3 — Primary Intent <GateChip id="G3" pass={true} compact /></label>
                                    <select className="field-input field-select">
                                        <option>Compatibility</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="field-label">
                                    G2 — Title <GateChip id="G2" pass={true} compact />
                                    <span className="char-count">{sku.title?.length}/250 chars</span>
                                </label>
                                <input
                                    className="field-input valid"
                                    value={sku.title || ''}
                                    onChange={(e) => setSku({ ...sku, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="field-label">
                                    G4 — Answer Block <GateChip id="G4" pass={true} compact />
                                    <span className="char-count">{sku.short_description?.length}/300 chars</span>
                                </label>
                                <textarea
                                    className="field-textarea valid"
                                    rows={3}
                                    value={sku.short_description || ''}
                                    onChange={(e) => setSku({ ...sku, short_description: e.target.value })}
                                />
                            </div>

                            <div className="vector-panel">
                                <div>
                                    <div className="field-label">VECTOR — Semantic Similarity <GateChip id="VEC" pass={true} compact /></div>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Cosine similarity vs cluster intent vector</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div className="vector-score" style={{ color: 'var(--green)' }}>0.87</div>
                                    <div className="vector-threshold">threshold: ≥0.72</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'faq' && (
                        <div className="card">
                            <SectionTitle sub="Auto-generated from golden query set — editable by editors">FAQ Templates</SectionTitle>
                            <div style={{ padding: "12px 0" }}>
                                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>Q: What fitting types work with this cable?</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text)" }}>A: This cable is compatible with E27, B22, and GU10 lamp holders.</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="card">
                            <SectionTitle sub="Immutable audit trail for this SKU">Change History</SectionTitle>
                            <div style={{ padding: "10px 0", color: 'var(--text-dim)', fontSize: '0.75rem' }}>No recent history found for this SKU.</div>
                        </div>
                    )}
                </div>

                <div style={{ width: 220, flexShrink: 0 }} className="flex flex-col gap-12">
                    <div className="card" style={{ padding: 14 }}>
                        <div className="field-label">ERP Data</div>
                        {[
                            { label: "Margin", value: `${sku.margin_percent || 0}%` },
                            { label: "Velocity", value: `${sku.annual_volume || 0}/yr` },
                            { label: "Status", value: sku.validation_status },
                        ].map(d => (
                            <div key={d.label} className="flex justify-between" style={{ padding: "4px 0", borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{d.label}</span>
                                <span style={{ fontSize: "0.7rem", color: "var(--text)", fontFamily: "var(--mono)", fontWeight: 600 }}>{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkuEdit;
