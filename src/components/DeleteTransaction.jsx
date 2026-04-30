const DeleteTransaction = async (selectedTxns, setTransactions) => {
    try {
        const ids = Array.from(selectedTxns);

        const res = await fetch('http://localhost:8089/transactions/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(ids),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Delete failed: ${text}`);
        }

        setTransactions((prev) => prev.filter((txn) => !selectedTxns.has(txn.id)));
        return true;
    } catch (err) {
        alert(err.message);
        return false;
    }
};

export default DeleteTransaction;
