import React from 'react';
import {
    StatCard,
    SectionTitle,
    DonutChart,
    TrendLine,
    TierBadge,
    GateChip,
    ReadinessBar,
    GATES
} from '../components/common/UIComponents';
import { useNavigate } from 'react-router-dom';
import { skuApi } from '../services/api';
import useStore from '../store';

const COLORS = {
    hero: "#8B6914",
    support: "#3D6B8E",
    harvest: "#B8860B",
    kill: "#A63D2F",
    accent: "#5B7A3A",
    green: "#2E7D32"
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { addNotification } = useStore();
    const [skus, setSkus] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = React.useState('');
    const [tierFilter, setTierFilter] = React.useState('All Tiers');
    const [categoryFilter, setCategoryFilter] = React.useState('All Categories');

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, tierFilter, categoryFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (tierFilter !== 'All Tiers') params.tier = tierFilter.toUpperCase();
            if (categoryFilter !== 'All Categories') params.category = categoryFilter;

            const response = await skuApi.list(params);
            const skuData = response.data.data || [];
            setSkus(skuData);
        } catch (err) {
            console.error('Failed to fetch SKUs:', err);
            setError('Failed to load SKUs from database');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    // React.useEffect(() => { fetchData(); }, []); // Handled by the debounced effect above

    if (loading && skus.length === 0) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', height: '100%' }}>Loading portfolio health...</div>;
    if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--red)', height: '100%' }}>{error}</div>;

    const heroCount = skus.filter(s => s.tier === "HERO").length;
    const supportCount = skus.filter(s => s.tier === "SUPPORT").length;
    const harvestCount = skus.filter(s => s.tier === "HARVEST").length;
    const killCount = skus.filter(s => s.tier === "KILL").length;
    const avgReadiness = skus.length > 0 ? Math.round(skus.reduce((a, s) => a + (s.readiness_score || 0), 0) / skus.length) : 0;

    return (
        <div>
            <div className="mb-20">
                <h1 className="page-title">Portfolio Overview</h1>
                <div className="page-subtitle">Real-time portfolio health across all categories</div>
            </div>

            <div className="flex gap-12 mb-20 flex-wrap">
                <StatCard label="Total SKUs" value={skus.length.toString()} sub="Connected to API" />
                <StatCard label="Avg Readiness" value={`${avgReadiness}%`} color={avgReadiness >= 70 ? 'var(--green)' : 'var(--orange)'} />
                <StatCard label="AI Citation Rate" value="48%" sub="↑ 6% vs last week" color="var(--accent)" />
                <StatCard label="Review Queue" value="12" sub="4 urgent" color="var(--orange)" />
            </div>

            <div className="flex gap-14 mb-20 flex-wrap">
                <div className="card" style={{ flex: 1, minWidth: 280 }}>
                    <SectionTitle sub="SKU count by commercial tier">Tier Distribution</SectionTitle>
                    <div className="flex gap-16 items-center">
                        <DonutChart size={110} strokeWidth={14} segments={[
                            { value: skus.length > 0 ? (heroCount / skus.length) * 100 : 0, color: COLORS.hero },
                            { value: skus.length > 0 ? (supportCount / skus.length) * 100 : 0, color: COLORS.support },
                            { value: skus.length > 0 ? (harvestCount / skus.length) * 100 : 0, color: COLORS.harvest },
                            { value: skus.length > 0 ? (killCount / skus.length) * 100 : 0, color: COLORS.kill },
                        ]} />
                        <div className="flex flex-col gap-8" style={{ flex: 1 }}>
                            {[
                                { tier: "HERO", count: heroCount, pct: skus.length > 0 ? `${Math.round((heroCount / skus.length) * 100)}%` : "0%" },
                                { tier: "SUPPORT", count: supportCount, pct: skus.length > 0 ? `${Math.round((supportCount / skus.length) * 100)}%` : "0%" },
                                { tier: "HARVEST", count: harvestCount, pct: skus.length > 0 ? `${Math.round((harvestCount / skus.length) * 100)}%` : "0%" },
                                { tier: "KILL", count: killCount, pct: skus.length > 0 ? `${Math.round((killCount / skus.length) * 100)}%` : "0%" },
                            ].map(r => (
                                <div key={r.tier} className="flex items-center justify-between">
                                    <div className="flex items-center gap-8">
                                        <TierBadge tier={r.tier} size="xs" />
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>{r.count} SKUs</span>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{r.pct}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ flex: 1, minWidth: 280 }}>
                    <SectionTitle sub="Average citation rate trend (6 weeks)">AI Visibility Trend</SectionTitle>
                    <TrendLine data={[42, 45, 48, 46, 51, 54]} width={280} height={80} color="var(--accent)" />
                    <div className="flex justify-between" style={{ marginTop: 8 }}>
                        {["W1", "W2", "W3", "W4", "W5", "W6"].map(w => (
                            <span key={w} style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{w}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="data-table">
                <div className="table-top">
                    <SectionTitle sub="Click any row to open SKU editor">All SKUs</SectionTitle>
                    <div className="flex gap-8">
                        <input
                            className="search-input"
                            placeholder="Search SKUs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="filter-select"
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                        >
                            <option>All Tiers</option>
                            <option>Hero</option>
                            <option>Support</option>
                            <option>Harvest</option>
                            <option>Kill</option>
                        </select>
                        <select
                            className="filter-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option>All Categories</option>
                            <option>Cables</option>
                            <option>Lampshades</option>
                        </select>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>Export benefits.csv</button>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>SKU ID</th>
                                <th>Product Name</th>
                                <th>Tier</th>
                                <th>Category</th>
                                <th>Gates</th>
                                <th>Readiness</th>
                                <th>Citation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {skus.map(sku => (
                                <tr
                                    key={sku.id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        navigate(`/sku-edit/${sku.id}`);
                                    }}
                                >
                                    <td className="mono">{sku.sku_code}</td>
                                    <td>{sku.title}</td>
                                    <td><TierBadge tier={sku.tier || 'SUPPORT'} size="xs" /></td>
                                    <td>{sku.primaryCluster?.name || 'Unassigned'}</td>
                                    <td>
                                        <div className="flex gap-4 flex-wrap">
                                            {GATES.map(g => <GateChip key={g.id} id={g.id} pass={false} compact />)}
                                        </div>
                                    </td>
                                    <td><ReadinessBar value={sku.readiness_score || 0} /></td>
                                    <td className="mono">
                                        <span style={{ color: (sku.ai_citation_rate || 0) >= 50 ? 'var(--green)' : (sku.ai_citation_rate || 0) >= 25 ? 'var(--orange)' : 'var(--red)', fontWeight: 600 }}>
                                            {sku.ai_citation_rate || 0}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
