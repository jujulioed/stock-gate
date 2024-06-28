import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

function ShoppingHistoryView() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(process.env.REACT_APP_API_URL + '/shopping-list-history', { withCredentials: true })
      .then(res => {
        if (res.data.Status === "Success") {
          const sortedHistory = res.data.history.sort((a, b) => new Date(b.date) - new Date(a.date));
          setHistory(sortedHistory);
        } else {
          console.log(res.data.Error);
        }
      })
      .catch(err => {
        console.log(err);
        alert("Network error: " + err.message);
      });
  }, []);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="shopping-history-view">
      <h2>Histórico de Compras</h2>
      {history.length === 0 ? (
        <p>Não há histórico de compras.</p>
      ) : (
        history.map((entry, index) => (
          <div key={index} className="history-entry">
            <p className="history-date"><strong>Data:</strong> {formatDateTime(entry.date)}</p>
            <ul className="history-item-list">
              {JSON.parse(entry.item_list).map(item => (
                <li key={item.item_id}>
                  {item.item_id} - {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default ShoppingHistoryView;
