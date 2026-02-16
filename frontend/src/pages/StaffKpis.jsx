import React from 'react';
import { MiniBarChart, RoleBadge } from '../components/common/UIComponents';

const StaffKpis = () => {
    const staff = [
        { name: "Sarah M.", role: "editor", skus: 14, pass: "82%", review: "1.2m", rework: "8%", hero: "65%" },
        { name: "James K.", role: "editor", skus: 11, pass: "71%", review: "1.8m", rework: "14%", hero: "48%" },
        { name: "Priya R.", role: "editor", skus: 16, pass: "89%", review: "0.9m", rework: "5%", hero: "72%" },
        { name: "Tom H.", role: "editor", skus: 8, pass: "58%", review: "2.4m", rework: "22%", hero: "35%" },
        { name: "David L.", role: "governor", skus: "—", pass: "—", review: "1.1m", rework: "—", hero: "—" },
    ];

    return (
        <div>
            <div className="mb-20">
                <h1 className="page-title">Staff Performance</h1>
                <div className="page-subtitle">KPI tracking per staff member — every person proves measurable value</div>
            </div>

            <div className="data-table mb-16">
                <table>
                    <thead>
                        <tr>
                            <th>Staff</th>
                            <th>Role</th>
                            <th>SKUs/Week</th>
                            <th>1st Submit Pass</th>
                            <th>Avg Review</th>
                            <th>Rework Rate</th>
                            <th>Hero Time %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((s, i) => (
                            <tr key={i}>
                                <td style={{ fontSize: '0.8rem', fontWeight: 500 }}>{s.name}</td>
                                <td><RoleBadge role={s.role} /></td>
                                <td className="mono" style={{ fontSize: '0.7rem' }}>{s.skus}</td>
                                <td>
                                    <span style={{
                                        color: parseInt(s.pass) >= 80 ? 'var(--green)' : parseInt(s.pass) >= 60 ? 'var(--orange)' : 'var(--red)',
                                        fontWeight: 600
                                    }}>{s.pass}</span>
                                </td>
                                <td className="mono" style={{ fontSize: '0.7rem' }}>{s.review}</td>
                                <td>
                                    <span style={{
                                        color: parseInt(s.rework) <= 10 ? 'var(--green)' : parseInt(s.rework) <= 15 ? 'var(--orange)' : 'var(--red)',
                                        fontWeight: 600
                                    }}>{s.rework}</span>
                                </td>
                                <td className="mono" style={{ fontSize: '0.7rem' }}>{s.hero}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Weekly Completions — Leaderboard</div>
                <MiniBarChart width={400} height={60} data={[
                    { label: "Priya", value: 16, color: "var(--green)" },
                    { label: "Sarah", value: 14, color: "var(--accent)" },
                    { label: "James", value: 11, color: "var(--support)" },
                    { label: "Tom", value: 8, color: "var(--amber)" },
                ]} />
            </div>
        </div>
    );
};

export default StaffKpis;
