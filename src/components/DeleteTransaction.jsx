const DeleteTransaction = async (selectedTxns, setTransactions) => {
    try {
        const ids = Array.from(selectedTxns);
        console.log("Deleting IDs:", ids);

        const res = await fetch("http://localhost:8089/transactions/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(ids),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Delete failed: ${text}`);
        }

        // update UI
        setTransactions(prev =>
            prev.filter(txn => !selectedTxns.has(txn.id))
        );

    } catch (err) {
        alert(err.message);
    }
};

export default DeleteTransaction;