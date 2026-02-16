import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { skuApi } from '../../services/api';

const DEMO_SKUS = [
    { id: 1, sku_code: 'SKU-001234', title: 'Wireless Bluetooth Headphones Pro', cluster: 'Audio & Sound', tier: 'HERO', validation_status: 'VALID', similarity_score: 0.92, margin: 34.5 },
    { id: 2, sku_code: 'SKU-002567', title: 'USB-C Charging Cable 2m Fast Charge', cluster: 'Cables & Adapters', tier: 'SUPPORT', validation_status: 'DEGRADED', similarity_score: 0.68, margin: 52.1 },
    { id: 3, sku_code: 'SKU-003891', title: 'Smart Watch Band - Premium Silicone', cluster: 'Wearable Accessories', tier: 'HARVEST', validation_status: 'VALID', similarity_score: 0.87, margin: 61.2 },
    { id: 4, sku_code: 'SKU-004012', title: 'Laptop Stand Aluminium Adjustable', cluster: 'Desktop & Office', tier: 'HERO', validation_status: 'PENDING', similarity_score: null, margin: 28.9 },
    { id: 5, sku_code: 'SKU-005678', title: 'Desk Organiser Bamboo Multi-Slot', cluster: 'Desktop & Office', tier: 'KILL', validation_status: 'INVALID', similarity_score: 0.41, margin: 8.3 },
    { id: 6, sku_code: 'SKU-006123', title: 'Noise Cancelling Earbuds Active', cluster: 'Audio & Sound', tier: 'HERO', validation_status: 'VALID', similarity_score: 0.95, margin: 42.0 },
    { id: 7, sku_code: 'SKU-007456', title: 'Phone Case Clear Protective TPU', cluster: 'Phone Accessories', tier: 'SUPPORT', validation_status: 'VALID', similarity_score: 0.81, margin: 67.8 },
    { id: 8, sku_code: 'SKU-008789', title: 'Wireless Mouse Ergonomic DPI', cluster: 'Desktop & Office', tier: 'SUPPORT', validation_status: 'DEGRADED', similarity_score: 0.71, margin: 38.4 },
    { id: 9, sku_code: 'SKU-009012', title: 'Webcam 1080p HD Autofocus', cluster: 'Video & Streaming', tier: 'HARVEST', validation_status: 'VALID', similarity_score: 0.88, margin: 21.5 },
    { id: 10, sku_code: 'SKU-010345', title: 'HDMI Cable 4K Ultra HD 3m', cluster: 'Cables & Adapters', tier: 'KILL', validation_status: 'INVALID', similarity_score: 0.39, margin: 5.1 },
];

const SkuList = () => {
    const [skus, setSkus] = useState(DEMO_SKUS);
    const [search, setSearch] = useState('');
    const [filterTier, setFilterTier] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const navigate = useNavigate();

    const filteredSkus = skus.filter(sku => {
        const matchesSearch = sku.sku_code.toLowerCase().includes(search.toLowerCase()) ||
            sku.title.toLowerCase().includes(search.toLowerCase()) ||
            sku.cluster.toLowerCase().includes(search.toLowerCase());
        const matchesTier = filterTier === 'ALL' || sku.tier === filterTier;
        const matchesStatus = filterStatus === 'ALL' || sku.validation_status === filterStatus;
        return matchesSearch && matchesTier && matchesStatus;
    });

    return (
        <div className="dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>SKU Management</h2>
                <button className="btn btn-primary" onClick={() => navigate('/skus/new')}>
                    + New SKU
                </button>
            </div>

            <div className="data-table-container">
                <div className="table-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                    <div className="table-search">
                        <span>🔍</span>
                        <input
                            type="text"
                            placeholder="Search SKUs, titles, clusters..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                            value={filterTier}
                            onChange={e => setFilterTier(e.target.value)}
                            style={{
                                background: 'var(--bg-input)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', borderRadius: '8px', padding: '8px 12px',
                                fontSize: '13px', outline: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">All Tiers</option>
                            <option value="HERO">Hero</option>
                            <option value="SUPPORT">Support</option>
                            <option value="HARVEST">Harvest</option>
                            <option value="KILL">Kill</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            style={{
                                background: 'var(--bg-input)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', borderRadius: '8px', padding: '8px 12px',
                                fontSize: '13px', outline: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="VALID">Valid</option>
                            <option value="DEGRADED">Degraded</option>
                            <option value="PENDING">Pending</option>
                            <option value="INVALID">Invalid</option>
                        </select>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>SKU Code</th>
                            <th>Title</th>
                            <th>Cluster</th>
                            <th>Tier</th>
                            <th>Validation</th>
                            <th>Similarity</th>
                            <th>Margin</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSkus.map(sku => (
                            <tr key={sku.id}>
                                <td><strong style={{ color: 'var(--primary)' }}>{sku.sku_code}</strong></td>
                                <td>{sku.title}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{sku.cluster}</td>
                                <td><span className={`badge tier-${sku.tier}`}>{sku.tier}</span></td>
                                <td><span className={`status-badge ${sku.validation_status}`}>{sku.validation_status}</span></td>
                                <td>
                                    {sku.similarity_score !== null ? (
                                        <span style={{
                                            color: sku.similarity_score >= 0.72 ? 'var(--success)' : 'var(--danger)',
                                            fontWeight: 600, fontSize: '13px'
                                        }}>
                                            {sku.similarity_score.toFixed(2)}
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                                    )}
                                </td>
                                <td style={{ fontSize: '13px' }}>{sku.margin}%</td>
                                <td>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => navigate(`/skus/${sku.id}/edit`)}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSkus.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    No SKUs found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Showing {filteredSkus.length} of {skus.length} SKUs
            </div>
        </div>
    );
};

export default SkuList;
