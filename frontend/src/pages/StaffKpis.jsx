import React, { useState, useEffect, useCallback } from 'react';
import { MiniBarChart, RoleBadge } from '../components/common/UIComponents';
import { dashboardApi } from '../services/api';

const StaffKpis = () => {
    const [staffKpis, setStaffKpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchKpis = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await dashboardApi.getSummary();
            const data = res.data?.data ?? {};
            setStaffKpis(data.staff_kpis ?? []);
        } catch (e) {
            console.error('Staff KPIs failed:', e);
            setError('Failed to load staff KPIs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKpis();
    }, [fetchKpis]);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading staff KPIs...</div>;
    if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--red)' }}>{error}</div>;

    const leaderboardData = staffKpis
        .filter(s => s.validations > 0)
        .sort((a, b) => (b.validations || 0) - (a.validations || 0))
        .slice(0, 6)
        .map(s => ({
            label: (s.user_name || 'Unknown').split(' ')[0],
            value: s.validations || 0,
            color: (s.gate_pass_rate || 0) >= 80 ? 'var(--green)' : (s.gate_pass_rate || 0) >= 60 ? 'var(--amber)' : 'var(--accent)',
        }));

    return (
        <div>
            <div className="mb-20">
                <h1 className="page-title">Staff Performance</h1>
                <div className="page-subtitle">KPI tracking per staff member — gate pass rate, rework count, hours spent</div>
            </div>

            <div className="data-table mb-16">
                <table>
                    <thead>
                        <tr>
                            <th>Staff</th>
                            <th>Role</th>
                            <th>Validations</th>
                            <th>Gate pass rate</th>
                            <th>Rework count</th>
                            <th>Hours spent</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffKpis.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 24 }}>No staff KPI data this week.</td></tr>
                        ) : (
                            staffKpis.map((s) => (
                                <tr key={s.user_id}>
                                    <td style={{ fontSize: '0.8rem', fontWeight: 500 }}>{s.user_name || 'Unknown'}</td>
                                    <td><RoleBadge role={s.role} /></td>
                                    <td className="mono" style={{ fontSize: '0.7rem' }}>{s.validations ?? 0}</td>
                                    <td>
                                        <span style={{
                                            color: (s.gate_pass_rate || 0) >= 80 ? 'var(--green)' : (s.gate_pass_rate || 0) >= 60 ? 'var(--amber)' : 'var(--red)',
                                            fontWeight: 600
                                        }}>{s.gate_pass_rate ?? 0}%</span>
                                    </td>
                                    <td>
                                        <span style={{
                                            color: (s.rework_count || 0) <= 2 ? 'var(--green)' : (s.rework_count || 0) <= 5 ? 'var(--amber)' : 'var(--red)',
                                            fontWeight: 600
                                        }}>{s.rework_count ?? 0}</span>
                                    </td>
                                    <td className="mono" style={{ fontSize: '0.7rem' }}>{s.hours_spent ?? 0}h</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {leaderboardData.length > 0 && (
                <div className="card">
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>Weekly validations — Leaderboard</div>
                    <MiniBarChart width={400} height={60} data={leaderboardData} />
                </div>
            )}
        </div>
    );
};

export default StaffKpis;
