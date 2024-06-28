// components/ShoppingListMenuBar/index.js
import React from 'react';
import './index.css';

function ShoppingListMenuBar({ showShoppingListTab, showShoppingHistoryTab }) {
  return (
    <div className="shopping-list-menu-bar">
      <ul className="ul-shopping-list-menu-bar">
        <li className="li-shopping-list-menu-bar">
          <button onClick={showShoppingListTab}>Lista de Compras</button>
        </li>
        <li className="li-shopping-list-menu-bar">
          <button onClick={showShoppingHistoryTab}>Histórico de Listas</button>
        </li>
      </ul>
    </div>
  );
}

export default ShoppingListMenuBar;
