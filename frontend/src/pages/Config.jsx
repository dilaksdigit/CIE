import React from 'react';

const Config = () => {
    const sections = [
        {
            section: "Gate Thresholds", items: [
                { label: "Answer Block Min", value: "250", unit: "chars" },
                { label: "Answer Block Max", value: "300", unit: "chars" },
                { label: "Title Max Length", value: "250", unit: "chars" },
                { label: "Vector Threshold", value: "0.72", unit: "cosine" },
                { label: "Title Intent Min", value: "20", unit: "chars" },
            ]
        },
        {
            section: "Tier Score Weights", items: [
                { label: "Margin Weight", value: "0.30", unit: "" },
                { label: "Velocity Weight", value: "0.30", unit: "" },
                { label: "Return Rate Weight", value: "0.20", unit: "" },
                { label: "Margin Rank Weight", value: "0.20", unit: "" },
                { label: "Hero Threshold", value: "75", unit: "%" },
            ]
        },
        {
            section: "Channel Thresholds", items: [
                { label: "Hero Compete Min", value: "85", unit: "%" },
                { label: "Support Compete Min", value: "70", unit: "%" },
                { label: "Harvest", value: "Excluded", unit: "" },
                { label: "Kill", value: "Excluded", unit: "" },
                { label: "Feed Regen Time", value: "02:00", unit: "UTC" },
            ]
        },
        {
            section: "Audit Settings", items: [
                { label: "Audit Day", value: "Monday", unit: "" },
                { label: "Audit Time", value: "06:00", unit: "UTC" },
                { label: "Questions/Category", value: "20", unit: "" },
                { label: "Engines", value: "4", unit: "" },
                { label: "Decay Trigger", value: "Week 3", unit: "" },
            ]
        },
    ];

    return (
        <div>
            <div className="mb-20">
                <h1 className="page-title">Configuration</h1>
                <div className="page-subtitle">Admin only — system thresholds, vocabularies, and templates</div>
            </div>

            <div className="flex gap-14 flex-wrap">
                {sections.map(section => (
                    <div key={section.section} className="card" style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>{section.section}</div>
                        {section.items.map(item => (
                            <div key={item.label} className="flex justify-between items-center" style={{ padding: "6px 0", borderBottom: '1px solid var(--border-light)' }}>
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{item.label}</span>
                                <div className="flex items-center gap-4">
                                    <span style={{
                                        padding: "2px 8px", background: "var(--surface-alt)", border: "1px solid var(--border)",
                                        borderRadius: 3, fontSize: "0.7rem", color: "var(--text)", fontFamily: "var(--mono)", fontWeight: 600,
                                    }}>{item.value}</span>
                                    {item.unit && <span style={{ fontSize: "0.55rem", color: "var(--text-dim)" }}>{item.unit}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Config;
