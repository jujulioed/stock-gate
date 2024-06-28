import React, { useState } from 'react';
import './index.css';

function InventoryItem({ itemId, itemName, unit, quantity, lastUpdate, category, description, onAddToShoppingList, onInventoryUpdate }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    const value = event.target.value;
    if (value === '' || (Number(value) >= 0 && Number(value) <= quantity)) {
      setInputValue(value);
      setError('');

      // Atualiza a lista de atualizações de inventário no localStorage
      const updatedItem = {
        itemId,
        itemName,
        unit,
        previousQuantity: quantity,
        newQuantity: value,
        lastUpdate,
        category,
        description
      };

      let inventoryUpdateList = JSON.parse(localStorage.getItem('inventoryUpdate')) || [];
      const existingIndex = inventoryUpdateList.findIndex(item => item.itemId === itemId);

      if (existingIndex >= 0) {
        // Atualiza o item existente
        inventoryUpdateList[existingIndex] = updatedItem;
      } else {
        // Adiciona um novo item
        inventoryUpdateList.push(updatedItem);
      }

      localStorage.setItem('inventoryUpdate', JSON.stringify(inventoryUpdateList));
      onInventoryUpdate(updatedItem);

    } else {
      setError('Por favor, insira um número válido.');
    }
  };

  const handleCheckboxChange = (event) => {
    const isChecked = event.target.checked;
    const item = {
      itemId,
      itemName,
      unit,
      quantity: inputValue || 0, // Garante que a quantidade seja 0 se inputValue for vazio
      lastUpdate,
      category,
      description
    };
    onAddToShoppingList(item, isChecked);
  };

  return (
    <div className="item">
      <div className="item-content">
        <p className="last-update">Última atualização: {lastUpdate}</p>
        <h3>{itemName}</h3>
        <p className='item-quantity'>Qtd. atual: {quantity} {unit}</p>
        <p>Descrição: {description}</p>
      </div>
      <div className="item-slot-set">
        <input
          className="change-values"
          type="number"
          value={inputValue}
          onChange={handleInputChange}
        />
        <p className="unit-style">{unit}</p>
        <label className="checkbox-container">
          <input type="checkbox" onChange={handleCheckboxChange} />
          Adicionar à lista de compras
        </label>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default InventoryItem;
