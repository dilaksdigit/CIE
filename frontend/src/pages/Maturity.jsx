import React from 'react';
import {
    TierBadge,
    ReadinessBar,
    SectionTitle
} from '../components/common/UIComponents';

const Maturity = () => {
    const categories = [
        { cat: "Cables", pct: 76, core: 88, auth: 62, channel: 74, ai: 72, color: "#8B6914" },
        { cat: "Lampshades", pct: 58, core: 72, auth: 38, channel: 55, ai: 45, color: "#3D6B8E" },
        { cat: "Bulbs", pct: 62, core: 78, auth: 44, channel: 60, ai: 52, color: "#5B7A3A" },
        { cat: "Pendants", pct: 71, core: 84, auth: 56, channel: 68, ai: 65, color: "#B8860B" },
    ];

    const tiers = [
        { tier: "hero", target: "≥85%", actual: "68%", met: 56, total: 82 },
        { tier: "support", target: "≥70%", actual: "74%", met: 72, total: 98 },
        { tier: "harvest", target: "≥40%", actual: "82%", met: 42, total: 52 },
        { tier: "kill", target: "N/A", actual: "—", met: 0, total: 26 },
    ];

    const TIERS = {
        hero: { bg: "#FDF6E3", border: "#E8D5A0", color: "#8B6914" },
        support: { bg: "#EBF3F9", border: "#B5D0E3", color: "#3D6B8E" },
        harvest: { bg: "#FFF8E7", border: "#E8D49A", color: "#B8860B" },
        kill: { bg: "#FDEEEB", border: "#E5B5AD", color: "#A63D2F" },
    };

    return (
        <div>
            <div className="mb-20">
                <h1 className="page-title">Maturity Dashboard</h1>
                <div className="page-subtitle">Boardroom view — decomposed readiness by category and component</div>
            </div>

            <div className="flex gap-14 mb-20 flex-wrap">
                {categories.map(cat => (
                    <div key={cat.cat} className="card" style={{ flex: 1, minWidth: 220 }}>
                        <div className="flex justify-between items-center mb-14">
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>{cat.cat}</span>
                            <span style={{ fontSize: "1.4rem", fontWeight: 800, color: cat.color, fontFamily: "var(--mono)" }}>{cat.pct}%</span>
                        </div>
                        {[
                            { label: "Core Fields", weight: "40%", value: cat.core },
                            { label: "Authority", weight: "20%", value: cat.auth },
                            { label: "Channel Readiness", weight: "25%", value: cat.channel },
                            { label: "AI Visibility", weight: "15%", value: cat.ai },
                        ].map(comp => (
                            <div key={comp.label} className="mb-8">
                                <div className="flex justify-between mb-4">
                                    <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>{comp.label} ({comp.weight})</span>
                                    <span style={{ fontSize: "0.62rem", color: "var(--text)", fontFamily: "var(--mono)", fontWeight: 600 }}>{comp.value}%</span>
                                </div>
                                <div style={{ height: 4, background: "#E8E8E8", borderRadius: 2, overflow: "hidden" }}>
                                    <div style={{ width: `${comp.value}%`, height: "100%", background: cat.color, borderRadius: 2, opacity: 0.75 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="card">
                <SectionTitle sub="Percentage of SKUs meeting tier-appropriate readiness threshold">Tier Maturity Rates</SectionTitle>
                <div className="flex gap-16 flex-wrap">
                    {tiers.map(t => (
                        <div key={t.tier} style={{
                            flex: 1, minWidth: 160, padding: 14,
                            background: TIERS[t.tier].bg, border: `1px solid ${TIERS[t.tier].border}`, borderRadius: 6,
                        }}>
                            <TierBadge tier={t.tier} size="sm" />
                            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: TIERS[t.tier].color, fontFamily: "var(--mono)", marginTop: 8 }}>{t.actual}</div>
                            <div style={{ fontSize: "0.58rem", color: "var(--text-dim)", marginTop: 4 }}>{t.met}/{t.total} SKUs meet target ({t.target})</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Maturity;
