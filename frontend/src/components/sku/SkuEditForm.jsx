import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TierBadge } from './TierBadge';
import { ValidationPanel } from './ValidationPanel';

export function SkuEditForm({ skuId }) {
    const [sku, setSku] = useState(null);
    const [validationResults, setValidationResults] = useState(null);
    const { register, handleSubmit } = useForm();

    useEffect(() => {
        // Load SKU logic
    }, [skuId]);

    const onSaveDraft = async (data) => {
        // Save logic
    };

    return (
        <div className="sku-edit-form">
            <div className="header">
                <h1>{sku?.sku_code} - {sku?.title}</h1>
                <TierBadge tier={sku?.tier} />
            </div>
            <form onSubmit={handleSubmit(onSaveDraft)}>
                <div className="form-field">
                    <label>Title *</label>
                    <input type="text" {...register('title')} defaultValue={sku?.title} />
                </div>
                <button type="submit">Save Draft</button>
            </form>
            {validationResults && <ValidationPanel results={validationResults} />}
        </div>
    );
}
