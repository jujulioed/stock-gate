import React, { useState, useEffect } from 'react';
import './index.css';
import InventoryItem from '../InventoryItem';
import SubmitButton from '../SubmitButton';
import axios from 'axios';
import Cookies from 'js-cookie';


function InventoryItemsGrid() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(Cookies.get('user_id'));  // Colocado diretamente no useState

  useEffect(() => {
    // Limpar listas no localStorage quando o componente for montado
    localStorage.removeItem('shoppingList');
    localStorage.removeItem('inventoryUpdate');
    setUserId(Cookies.get('user_id'));

    const fetchItems = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_API_URL + '/load-all-items', {
                withCredentials: true // Certifique-se de enviar os cookies com a solicitação
            });
            if (response.data.Status === "Success") {
                setItems(response.data.items);
            } else {
                throw new Error(response.data.Error);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchItems();
}, []);


  const updateLocalStorage = (item, isChecked) => {
    let shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];
    if (isChecked) {
      shoppingList.push(item);
    } else {
      shoppingList = shoppingList.filter(i => i.itemName !== item.itemName);
    }
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  };

  const handleInventoryUpdate = (item) => {
    let inventoryUpdate = JSON.parse(localStorage.getItem('inventoryUpdate')) || [];
    const existingItemIndex = inventoryUpdate.findIndex(i => i.itemId === item.itemId);
    if (existingItemIndex !== -1) {
      inventoryUpdate[existingItemIndex] = item;
    } else {
      inventoryUpdate.push(item);
    }
    localStorage.setItem('inventoryUpdate', JSON.stringify(inventoryUpdate));
  };

  const handleSubmit = async () => {
    const inventoryUpdate = JSON.parse(localStorage.getItem('inventoryUpdate')) || [];
    const shoppingList = JSON.parse(localStorage.getItem('shoppingList')) || [];

    try {
      const { data } = await axios.post(process.env.REACT_APP_API_URL + '/update-inventory-and-shopping-list', { shoppingList, inventoryUpdate, userId });
      if (data.Status === "Success") {
        alert('Dados enviados com sucesso!');
        localStorage.removeItem('shoppingList');
        localStorage.removeItem('inventoryUpdate');
        window.location.reload();
      } else {
        throw new Error(data.Error || "Falha ao enviar dados");
      }
    } catch (error) {
      alert('Erro ao enviar os dados: ' + error.message);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="container">
      <div className="inventory" id="inventory">
        {items.map(item => (
          <InventoryItem
            key={item.item_id}
            itemId={item.item_id}
            itemName={item.name}
            unit={item.unit}
            quantity={item.quantity}
            description={item.description}
            lastUpdate={item.last_update}
            category={item.category}
            onAddToShoppingList={updateLocalStorage}
            onInventoryUpdate={handleInventoryUpdate}
          />
        ))}
      </div>
      <SubmitButton onSubmit={handleSubmit} />
    </div>
  );
}

export default InventoryItemsGrid;
