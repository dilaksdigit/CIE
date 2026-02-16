import React from 'react';
import {
    ReadinessBar,
    SectionTitle
} from '../components/common/UIComponents';
import { MOCK_CLUSTERS } from '../data/mockData';

const Clusters = () => {
    return (
        <div>
            <div className="mb-20">
                <h1 className="page-title">Cluster Manager</h1>
                <div className="page-subtitle">SEO/AI Governor — semantic cluster taxonomy governance</div>
            </div>

            <div className="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Cluster ID</th>
                            <th>Name</th>
                            <th>Primary Intent</th>
                            <th>SKUs</th>
                            <th>Avg Readiness</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_CLUSTERS.map(cl => (
                            <tr key={cl.id}>
                                <td className="mono">{cl.id}</td>
                                <td>{cl.name}</td>
                                <td>
                                    <span style={{
                                        padding: "2px 8px", borderRadius: 3, fontSize: "0.65rem",
                                        background: "var(--accent-dim)", color: "var(--accent)", fontWeight: 600,
                                        border: `1px solid var(--accent)22`,
                                    }}>{cl.intent}</span>
                                </td>
                                <td className="mono">{cl.skuCount}</td>
                                <td><ReadinessBar value={cl.avgReadiness} /></td>
                                <td>
                                    <button className="btn btn-secondary btn-sm">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="alert-banner warning">
                ⚠ Cluster changes require quarterly review. Changes affect all SKUs in the cluster. Governor-only permission.
            </div>
        </div>
    );
};

export default Clusters;
