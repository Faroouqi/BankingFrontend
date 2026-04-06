import React from "react";

const DeleteTransaction = ({
    selectedTxns,
    transactions,
    setTransactions,
    clearSelection
}) => {

    const handleDelete = async () => {
        try {
            const ids = Array.from(selectedTxns);

            const res = await fetch("http://localhost:8089/transactions/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(ids),
            });

            if (!res.ok) {
                throw new Error("Delete failed");
            }

            // update UI
            setTransactions(prev =>
                prev.filter(txn => !selectedTxns.has(txn.id))
            );

            clearSelection();

        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="delete-bar">
            <button onClick={handleDelete}>
                🗑 Delete ({selectedTxns.size})
            </button>

            <button onClick={clearSelection}>
                ❌ Cancel
            </button>
        </div>
    );
};

export default DeleteTransaction;