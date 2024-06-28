import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './index.css';

function ShoppingListView() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const location = useLocation();

  useEffect(() => {
    fetchShoppingList();
  }, [location]);

  const fetchShoppingList = () => {
    axios.get(process.env.REACT_APP_API_URL + '/shopping-list', { withCredentials: true })
      .then(res => {
        if (res.data.Status === "Success") {
          setItems(res.data.items);
        } else {
          console.log(res.data.Error);
        }
      })
      .catch(err => {
        console.log(err);
        alert("Network error: " + err.message);
      });
  };

  const handleCopy = () => {
    const itemList = items.map(item => item.name).join('\n');
    navigator.clipboard.writeText(itemList).then(() => {
      alert('Lista copiada para a área de transferência!');
    }).catch(err => {
      console.error('Erro ao copiar a lista: ', err);
      alert('Erro ao copiar a lista. Por favor, tente novamente.');
    });
  };

  const handleSelectItem = (itemId) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleConfirmRemoval = () => {
    const itemIds = Array.from(selectedItems);
    if (itemIds.length === 0) {
      alert('Nenhum item selecionado para remoção');
      return;
    }
    axios.post(process.env.REACT_APP_API_URL + '/remove-shopping-list-items', { itemIds }, { withCredentials: true })
      .then(res => {
        if (res.data.Status === "Success") {
          fetchShoppingList();
          setSelectedItems(new Set());
          alert('Itens removidos com sucesso');
        } else {
          console.log(res.data.Error);
          alert('Erro ao remover itens');
        }
      })
      .catch(err => {
        console.log(err);
        alert("Network error: " + err.message);
      });
  };

  const handleClearList = () => {
    const userConfirmed = window.confirm("Você realmente deseja limpar toda a lista de compras?");
    if (userConfirmed) {
      axios.post(process.env.REACT_APP_API_URL + '/clear-shopping-list', {}, { withCredentials: true })
        .then(res => {
          if (res.data.Status === "Success") {
            fetchShoppingList();
            setSelectedItems(new Set());
            alert('Lista de compras limpa com sucesso');
          } else {
            console.log(res.data.Error);
            alert('Erro ao limpar a lista de compras');
          }
        })
        .catch(err => {
          console.log(err);
          alert("Network error: " + err.message);
        });
    }
  };

  const handleCompleteList = () => {
    const userConfirmed = window.confirm("Você realmente deseja concluir a lista de compras? Isso arquivará a lista.");
    if (userConfirmed) {
      const itemList = items.map(item => ({
        item_id: item.item_id,
        name: item.name,
        quantity: item.quantity
      }));
      axios.post(process.env.REACT_APP_API_URL + '/complete-shopping-list', { itemList }, { withCredentials: true })
        .then(res => {
          if (res.data.Status === "Success") {
            fetchShoppingList();
            alert('Lista de compras concluída e arquivada com sucesso');
          } else {
            console.log(res.data.Error);
            alert('Erro ao concluir a lista de compras');
          }
        })
        .catch(err => {
          console.log(err);
          alert("Network error: " + err.message);
        });
    }
  };

  const pullAutomaticList = () => {
    axios.get(process.env.REACT_APP_API_URL + '/pull-automatic-list', { withCredentials: true })
      .then(res => {
        if (res.data.Status === "Success") {
          const mergedItems = res.data.items;
          setItems(mergedItems);
        } else {
          console.log(res.data.Error);
        }
      })
      .catch(err => {
        console.log(err);
        alert("Network error: " + err.message);
      });
  };

  return (
    <div className="shopping-list-container">
      <div className="shopping-list-view">
        {items.length === 0 ? (
          <p>Não há itens para comprar</p>
        ) : (
          <>
            {items.map(item => (
              <div className="item-list-shopping" key={item.item_id}>
                <div className="item-content">
                  <h3>{item.name}</h3>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                  <p className="item-source">Fonte: {item.source}</p>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.item_id)}
                    onChange={() => handleSelectItem(item.item_id)}
                  />
                </div>
              </div>
            ))}
            <button className="copy-button" onClick={handleCopy}>Copiar</button>
            <button className="remove-button" onClick={handleConfirmRemoval}>Confirmar Remoção</button>
            <button className="clear-button" onClick={handleClearList}>Limpar Lista</button>
            <button className="complete-button" onClick={handleCompleteList}>Concluir Lista</button>
          </>
        )}
        <button className="complete-button" onClick={pullAutomaticList}>Carregar Lista de Reposição</button>
      </div>
    </div>
  );
}

export default ShoppingListView;
