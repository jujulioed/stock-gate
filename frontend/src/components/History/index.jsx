import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function History() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        axios.get(process.env.REACT_APP_API_URL + '/stock-history', { withCredentials: true })
            .then(res => {
                if (res.data.Status === "Success") {
                    setHistory(res.data.history);
                } else {
                    console.log(res.data.Error);
                }
            })
            .catch(err => {
                console.log(err);
                alert("Network error: " + err.message);
            });
    }, []);

    return (
        <div className="history-view">
            <h2>Histórico do Estoque</h2>
            {history.length === 0 ? (
                <p>Não há histórico de estoque.</p>
            ) : (
                history.map((entry, index) => (
                    <div key={index} className="history-entry">
                        <h3>{entry.item_name}</h3>
                        <p><strong>Quantidade:</strong> {entry.quantity}</p>
                        <p><strong>Data de Compra:</strong> {new Date(entry.purchase_date).toLocaleDateString()}</p>
                        {entry.payment_due_date && (
                            <p><strong>Prazo para Pagamento:</strong> {new Date(entry.payment_due_date).toLocaleDateString()}</p>
                        )}
                        {entry.expire_date && (
                            <p><strong>Validade:</strong> {new Date(entry.expire_date).toLocaleDateString()}</p>
                        )}
                        <p><strong>Preço Pago:</strong> R$ {parseFloat(entry.purchase_price).toFixed(2)}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default History;
