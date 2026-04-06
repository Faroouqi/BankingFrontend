import React, { useState } from 'react';

const UpdateTransaction = ({ transactions, setTransactions, children }) => {
    const [editingCell, setEditingCell] = useState(null); // {id, field}
    const [cellLoading, setCellLoading] = useState(null);

    const updateTxnAPI = async (txnId, field, value) => {
    setCellLoading(txnId);

    try {
        const params = new URLSearchParams({
            field,
            value
        });

        const res = await fetch(
            `http://localhost:8089/transactions/${txnId}?${params}`,
            {
                method: 'PUT',
                credentials: 'include'
            }
        );

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Update failed: ${res.status} - ${text}`);
        }

        return await res.json();
    } finally {
        setCellLoading(null);
    }
};
    const updateLocalTransactions = (txnId, field, value) => {
        setTransactions(prev => 
            prev.map(t => t.id === txnId || t._id === txnId ? {...t, [field]: value} : t)
        );
    };

    const renderCell = (txn, field, displayValue, inputType = 'text') => {
        const txnId = txn.id || txn._id;
        const isEditing = editingCell?.id === txnId && editingCell.field === field;
        
        return isEditing ? (
            <input
                autoFocus
                type={inputType}
                defaultValue={txn[field]}
                onBlur={async (e) => {
                    let newValue;
                    if (inputType === 'number') {
                        newValue = String(parseFloat(e.target.value) || 0);
                    } else if (inputType === 'date') {
                        newValue = String(e.target.value);
                    } else {
                        newValue = (e.target.value.trim() || 'Uncategorized').toString();
                    }
                    try {
                        await updateTxnAPI(txnId, field, newValue);
                        updateLocalTransactions(txnId, field, newValue);
                    } catch (err) {
                        console.error('Update failed:', err);
                    }
                    setEditingCell(null);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        setEditingCell(null);
                    }
                    if (e.key === 'Enter') e.target.blur();
                }}
                disabled={cellLoading === txnId}
                style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
            />
        ) : (
            <span 
                onDoubleClick={() => setEditingCell({id: txnId, field})} 
                style={{cursor: 'pointer', padding: '4px', display: 'block'}}
                title="Double-click to edit"
            >
                {displayValue}
            </span>
        );
    };

    return children({ renderCell, editingCell, cellLoading });
};

export default UpdateTransaction;