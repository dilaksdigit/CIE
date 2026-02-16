import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    StatCard,
    TierBadge,
    GateChip,
    ReadinessBar,
    SectionTitle
} from '../components/common/UIComponents';
import useStore from '../store';
import { skuApi } from '../services/api';

const ReviewQueue = () => {
    const navigate = useNavigate();
    const { addNotification } = useStore();
    const [skus, setSkus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const response = await skuApi.list();
                const allSkus = response.data.data || [];
                // Filter for PENDING status
                const pending = allSkus.filter(s => s.validation_status === 'PENDING');
                setSkus(pending);
            } catch (err) {
                console.error('Failed to fetch review queue:', err);
                setError('Failed to load review queue');
            } finally {
                setLoading(false);
            }
        };
        fetchPending();
    }, []);

    const handleAction = async (id, action, skuCode) => {
        console.log(`ReviewQueue: ${action} for ${skuCode} (${id})`);
        try {
            const status = action === 'approve' ? 'VALID' : 'INVALID';
            await skuApi.update(id, { validation_status: status });

            setSkus(prev => prev.filter(s => s.id !== id));
            addNotification({
                type: 'success',
                message: `SKU ${skuCode} ${action === 'approve' ? 'approved' : 'rejected'} successfully`
            });
        } catch (err) {
            console.error('Action failed:', err);
            addNotification({ type: 'error', message: `Failed to ${action} SKU ${skuCode}` });
        }
    };

    return (
        <div>
            <div className="mb-20">
                <h1 className="page-title">Review Queue</h1>
                <div className="page-subtitle">Governor approval workflow — target: review in under 2 minutes per SKU</div>
            </div>

            <div className="flex gap-12 mb-18">
                <StatCard label="Pending" value={skus.length.toString()} color="var(--orange)" />
                <StatCard label="Approved Today" value="8" color="var(--green)" />
                <StatCard label="Rejected" value="3" color="var(--red)" />
                <StatCard label="Avg Review Time" value="1.4m" sub="Target: <2 min" />
            </div>

            <div className="flex flex-col gap-10">
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading review queue...</div>
                ) : error ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--red)' }}>{error}</div>
                ) : skus.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
                        Queue empty. All SKUs reviewed.
                    </div>
                ) : skus.map(item => (
                    <div key={item.id} className="card flex items-center gap-16">
                        <div style={{ flex: 1 }}>
                            <div className="flex items-center gap-10 mb-8">
                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--mono)" }}>{item.sku_code}</span>
                                <TierBadge tier={item.tier} size="xs" />
                                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}> — {item.title}</span>
                            </div>
                            <div className="flex items-center gap-12" style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                                <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="flex items-center gap-4">Readiness: <ReadinessBar value={item.readiness_score} width={60} /></span>
                            </div>
                        </div>
                        <div className="flex gap-8">
                            <button className="btn btn-approve" onClick={() => handleAction(item.id, 'approve', item.sku_code)}>Approve</button>
                            <button className="btn btn-reject" onClick={() => handleAction(item.id, 'reject', item.sku_code)}>Reject</button>
                            <button className="btn btn-secondary" onClick={() => navigate(`/sku-edit/${item.id}`)}>View</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewQueue;
