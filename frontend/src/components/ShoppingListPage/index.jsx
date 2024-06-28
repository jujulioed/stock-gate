// components/ShoppingListPage/index.js
import React, { useState } from 'react';
import ShoppingListMenuBar from '../ShoppingListMenuBar';
import ShoppingListView from '../ShoppingListView';
import ShoppingHistoryView from '../ShoppingHistoryView'; // Certifique-se de importar corretamente

function ShoppingListPage() {
  const [activeTab, setActiveTab] = useState('shoppingList');

  const showShoppingListTab = () => setActiveTab('shoppingList');
  const showShoppingHistoryTab = () => setActiveTab('shoppingHistory');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'shoppingList':
        return <ShoppingListView />;
      case 'shoppingHistory':
        return <ShoppingHistoryView />;
      default:
        return null;
    }
  };

  return (
    <div>
      <ShoppingListMenuBar
        showShoppingListTab={showShoppingListTab}
        showShoppingHistoryTab={showShoppingHistoryTab}
      />
      <div className="tab-content">
        {renderActiveTab()}
      </div>
    </div>
  );
}

export default ShoppingListPage;
