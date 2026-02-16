import React from 'react';
import { RoleBadge } from '../components/common/UIComponents';

const AuditTrail = () => {
    const logs = [
        { ts: "2026-02-10 14:32:18", user: "Sarah M.", role: "editor", action: "content_edit", sku: "CBL-BLK-3C-3M", detail: "answer_block: updated (278 chars)" },
        { ts: "2026-02-10 14:31:02", user: "Sarah M.", role: "editor", action: "gate_pass", sku: "CBL-BLK-3C-3M", detail: "G4 passed — 278 chars in range" },
        { ts: "2026-02-10 13:18:45", user: "Tom H.", role: "editor", action: "permission_denied", sku: "CBL-GRY-3C-1M", detail: "Attempted cluster change (403)" },
        { ts: "2026-02-10 11:18:33", user: "Sarah M.", role: "editor", action: "content_edit", sku: "CBL-BLK-3C-3M", detail: "title: added intent phrase" },
        { ts: "2026-02-10 06:00:12", user: "System", role: "admin", action: "audit_run", sku: "—", detail: "Weekly AI audit completed: 320 queries" },
    ];

    return (
        <div>
            <div className="mb-20">
                <h1 className="page-title">Audit Trail Viewer</h1>
                <div className="page-subtitle">Immutable log — REVOKE UPDATE/DELETE enforced at database level</div>
            </div>

            <div className="flex gap-8 mb-14 flex-wrap">
                <input className="search-input" placeholder="Filter by SKU..." />
                <input className="search-input" placeholder="Filter by user..." />
                <select className="filter-select">
                    <option>All Actions</option>
                    <option>Content Edit</option>
                    <option>Publish</option>
                    <option>Tier Change</option>
                    <option>Permission Denied</option>
                </select>
                <button className="btn btn-primary" style={{ fontSize: '0.7rem' }}>Export CSV</button>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Role</th>
                            <th>Action</th>
                            <th>SKU</th>
                            <th>Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((row, i) => (
                            <tr key={i}>
                                <td className="mono" style={{ fontSize: '0.65rem' }}>{row.ts}</td>
                                <td style={{ fontSize: '0.75rem' }}>{row.user}</td>
                                <td><RoleBadge role={row.role} /></td>
                                <td>
                                    <span style={{
                                        color: row.action === "permission_denied" ? "var(--red)" : "var(--text)",
                                        fontSize: "0.7rem",
                                        fontWeight: row.action === "permission_denied" ? 600 : 400
                                    }}>{row.action}</span>
                                </td>
                                <td className="mono">{row.sku}</td>
                                <td style={{ fontSize: '0.7rem' }}>{row.detail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditTrail;
