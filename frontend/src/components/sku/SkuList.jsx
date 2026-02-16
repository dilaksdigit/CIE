import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SkuList = () => {
    const [skus, setSkus] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/skus')
            .then(response => setSkus(response.data.data))
            .catch(error => console.error('Error fetching SKUs:', error));
    }, []);

    return (
        <div className="sku-list-container">
            <h2>Product SKUs</h2>
            <table>
                <thead>
                    <tr>
                        <th>SKU Code</th>
                        <th>Title</th>
                        <th>Tier</th>
                        <th>Validation Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {skus.map(sku => (
                        <tr key={sku.id}>
                            <td>{sku.sku_code}</td>
                            <td>{sku.title}</td>
                            <td><span className={`badge tier-${sku.tier}`}>{sku.tier}</span></td>
                            <td><span className={`status-${sku.validation_status}`}>{sku.validation_status}</span></td>
                            <td>
                                <button onClick={() => navigate(`/skus/edit/${sku.id}`)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SkuList;
