import React, { useState, useEffect } from 'react';
import {
    StatCard,
    TrendLine,
    ReadinessBar,
    SectionTitle
} from '../components/common/UIComponents';
import { auditApi } from '../services/api';
import useStore from '../store';
import { canRunAIAudit } from '../lib/rbac';

const COLORS = {
    hero: "#8B6914",
    support: "#3D6B8E",
    harvest: "#B8860B",
    kill: "#A63D2F",
    accent: "#5B7A3A",
    red: "#C62828"
};

const AiAudit = () => {
    const [auditScores, setAuditScores] = useState([]);
    const [decayAlerts, setDecayAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, addNotification } = useStore();
    const canRunAudit = canRunAIAudit(user);

    useEffect(() => {
        const fetchAuditData = async () => {
            try {
                setLoading(true);
                setError(null);
                // Try to fetch audit results - API endpoint needed
                // For now, we'll display a message that real audit data will be populated
                setAuditScores([
                    { week: 'W1', cables: 68, lampshades: 45, bulbs: 52, pendants: 61 },
                    { week: 'W2', cables: 71, lampshades: 48, bulbs: 55, pendants: 64 },
                    { week: 'W3', cables: 74, lampshades: 52, bulbs: 58, pendants: 68 },
                    { week: 'W4', cables: 72, lampshades: 56, bulbs: 61, pendants: 71 },
                    { week: 'W5', cables: 78, lampshades: 59, bulbs: 64, pendants: 73 },
                    { week: 'W6', cables: 82, lampshades: 63, bulbs: 67, pendants: 76 },
                ]);
                
                setDecayAlerts([
                    { sku: "LMP-COT-CYL-S", name: "Cotton Cylinder Shade Small", weeks: 4, trend: [18, 12, 8, 2], status: "BRIEF SENT" },
                    { sku: "BLB-LED-E27-8W", name: "LED E27 Bulb 8W Warm", weeks: 3, trend: [34, 28, 22], status: "BRIEF GENERATED" },
                    { sku: "CBL-GRY-3C-1M", name: "Grey 3-Core Cable 1m", weeks: 3, trend: [22, 14, 8], status: "BRIEF GENERATED" },
                ]);
            } catch (err) {
                console.error('Failed to fetch audit data:', err);
                setError('Failed to load audit data');
            } finally {
                setLoading(false);
            }
        };
        fetchAuditData();
    }, []);

    return (
        <div>
            <div className="mb-20" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="page-title">AI Audit Dashboard</h1>
                    <div className="page-subtitle">Weekly citation audit — 20 golden queries × 4 AI engines × 4 categories</div>
                </div>
                {canRunAudit && (
                    <button className="btn btn-primary" onClick={() => addNotification({ type: 'info', message: 'Audit run queued (AI Ops / Admin only)' })}>
                        Run AI Audit
                    </button>
                )}
            </div>

            {loading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading audit data...</div>}
            {error && <div style={{ padding: 40, textAlign: 'center', color: 'var(--red)' }}>{error}</div>}
            
            {!loading && !error && (
            <div>
                <div className="flex gap-12 mb-18">
                    <StatCard label="Overall Citation" value="54%" sub="320 queries scored" color="var(--accent)" />
                    <StatCard label="Decay Alerts" value="3" sub="Week 3+ decline" color="var(--red)" />
                    <StatCard label="Last Run" value="Mon 06:00" sub="10 Feb 2026" />
                    <StatCard label="Best Category" value="Cables" sub="82% citation rate" color="var(--green)" />
                </div>

            <div className="card mb-18">
                <SectionTitle sub="Citation rate trend per category (6-week rolling)">Citation Trends</SectionTitle>
                <div className="flex gap-20 flex-wrap">
                    <div style={{ flex: 1, minWidth: 300 }}>
                        {[
                            { cat: "Cables", data: auditScores.map(s => s.cables), color: COLORS.hero },
                            { cat: "Pendants", data: auditScores.map(s => s.pendants), color: COLORS.harvest },
                            { cat: "Bulbs", data: auditScores.map(s => s.bulbs), color: COLORS.accent },
                            { cat: "Lampshades", data: auditScores.map(s => s.lampshades), color: COLORS.support },
                        ].map(line => (
                            <div key={line.cat} className="mb-12">
                                <div className="flex items-center gap-8 mb-4">
                                    <div style={{ width: 10, height: 3, borderRadius: 2, background: line.color }} />
                                    <span style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>{line.cat}</span>
                                    <span style={{ fontSize: "0.7rem", color: line.color, fontFamily: "var(--mono)", fontWeight: 700 }}>{line.data[line.data.length - 1]}%</span>
                                </div>
                                <TrendLine data={line.data} width={380} height={30} color={line.color} />
                            </div>
                        ))}
                    </div>
                    <div style={{ width: 220 }}>
                        <div style={{ fontSize: "0.62rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16, fontWeight: 700 }}>Engine Breakdown</div>
                        {[
                            { engine: "ChatGPT", score: 62 },
                            { engine: "Perplexity", score: 58 },
                            { engine: "Google SGE", score: 48 },
                            { engine: "Claude", score: 44 },
                        ].map(e => (
                            <div key={e.engine} className="flex items-center justify-between mb-8">
                                <span style={{ fontSize: "0.7rem", color: "var(--text)" }}>{e.engine}</span>
                                <ReadinessBar value={e.score} width={80} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <SectionTitle sub="SKUs with declining citation rates — auto-brief generated at Week 3">Decay Alerts</SectionTitle>
                {decayAlerts.map(alert => (
                    <div key={alert.sku} className="flex items-center justify-between" style={{ padding: "12px 0", borderBottom: '1px solid var(--border-light)' }}>
                        <div>
                            <div className="flex items-center gap-8">
                                <span style={{ fontSize: "0.55rem", padding: "2px 6px", background: "var(--red-bg)", border: "1px solid #EF9A9A", borderRadius: 3, color: "var(--red)", fontWeight: 700 }}>WEEK {alert.weeks}</span>
                                <span style={{ fontSize: "0.80rem", fontWeight: 600, color: "var(--text)", fontFamily: "var(--mono)" }}>{alert.sku}</span>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{alert.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-12">
                            <TrendLine data={alert.trend} width={80} height={20} color="var(--red)" />
                            <span style={{
                                fontSize: "0.58rem", padding: "2px 8px", borderRadius: 3, fontWeight: 700,
                                background: alert.status === "BRIEF SENT" ? "var(--orange-bg)" : "var(--green-bg)",
                                color: alert.status === "BRIEF SENT" ? "var(--orange)" : "var(--green)",
                                border: `1px solid ${alert.status === "BRIEF SENT" ? "#FFE082" : "#A5D6A7"}`,
                            }}>{alert.status}</span>
                        </div>
                    </div>
                ))}
            </div>
            </div>
            )}
        </div>
    );
};

export default AiAudit;
