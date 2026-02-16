import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ValidationPanel from './ValidationPanel';

const SkuEditForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sku, setSku] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/skus/${id}`)
            .then(response => {
                setSku(response.data.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching SKU:', error);
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`/api/skus/${id}`, sku)
            .then(() => alert('SKU updated successfully!'))
            .catch(error => alert('Error updating SKU: ' + (error.response?.data?.error || error.message)));
    };

    const handleValidate = () => {
        axios.post(`/api/skus/${id}/validate`)
            .then(response => {
                alert('Validation completed');
                setSku({ ...sku, ...response.data.data }); // Update with validation results
            })
            .catch(error => alert('Validation failed'));
    };

    if (loading) return <div>Loading...</div>;
    if (!sku) return <div>SKU not found</div>;

    return (
        <div className="sku-edit-container">
            <h2>Edit SKU: {sku.sku_code}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        value={sku.title}
                        onChange={e => setSku({ ...sku, title: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={sku.long_description}
                        onChange={e => setSku({ ...sku, long_description: e.target.value })}
                    />
                </div>
                <div className="actions">
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={handleValidate} className="btn-validate">Run AI Validation</button>
                </div>
            </form>

            <ValidationPanel skuId={id} results={sku.validation_results} />
        </div>
    );
};

export default SkuEditForm;
