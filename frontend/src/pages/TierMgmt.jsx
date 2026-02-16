import React from 'react';
import { TierBadge } from '../components/common/UIComponents';

const TierMgmt = () => {
    const data = [
        { id: "CBL-BLK-3C-3M", current: "hero", score: 87.4, proposed: "hero", reason: "Score stable", override: false },
        { id: "LMP-OPL-DRM-M", current: "support", score: 71.2, proposed: "support", reason: "Score stable", override: false },
        { id: "CBL-GRY-3C-1M", current: "harvest", score: 42.1, proposed: "kill", reason: "Below threshold 3 months", override: true },
        { id: "PND-BRS-IND-L", current: "hero", score: 88.9, proposed: "hero", reason: "Score stable", override: false },
    ];

    return (
        <div>
            <div className="mb-20">
                <h1 className="page-title">Tier Management</h1>
                <div className="page-subtitle">Finance + Portfolio Holders — dual approval required for manual overrides</div>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Current Tier</th>
                            <th>Score</th>
                            <th>Proposed</th>
                            <th>Reason</th>
                            <th>Override</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(row => (
                            <tr key={row.id}>
                                <td className="mono" style={{ fontSize: '0.75rem' }}>{row.id}</td>
                                <td><TierBadge tier={row.current} size="xs" /></td>
                                <td className="mono">{row.score}</td>
                                <td>
                                    {row.proposed !== row.current ? (
                                        <div className="flex items-center gap-4">
                                            <TierBadge tier={row.current} size="xs" />
                                            <span style={{ color: "var(--text-dim)" }}>→</span>
                                            <TierBadge tier={row.proposed} size="xs" />
                                        </div>
                                    ) : <TierBadge tier={row.proposed} size="xs" />}
                                </td>
                                <td style={{ fontSize: '0.7rem' }}>{row.reason}</td>
                                <td>
                                    {row.override ? (
                                        <button className="btn btn-reject btn-sm">Approve (1/2)</button>
                                    ) : <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>—</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="alert-banner danger">
                ⚠ Manual tier override requires DUAL APPROVAL: Portfolio Holder + Finance Director. Both must sign off before tier changes.
            </div>
        </div>
    );
};

export default TierMgmt;
