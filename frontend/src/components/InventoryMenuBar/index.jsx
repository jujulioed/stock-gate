import React from 'react';
import './index.css';

function InventoryMenuBar({ registerItemVisibility, registerPurchaseVisibility, editItemVisibility, convertMaterialsVisibility, role }) {
    return (
        <div className="inventory-menu-bar">
            <ul className="ul-inventory-menu-bar">
                {role === 'admin' && (
                    <>
                        <li className="li-inventory-menu-bar"><button onClick={registerItemVisibility}>Cadastrar item</button></li>
                        <li className="li-inventory-menu-bar"><button onClick={editItemVisibility}>Alterar cadastro</button></li>
                        <li className="li-inventory-menu-bar"><button onClick={registerPurchaseVisibility}>Adicionar quantidade</button></li>
                    </>
                )}
                <li className="li-inventory-menu-bar"><button onClick={convertMaterialsVisibility}>Converter Insumos</button></li>
            </ul>
        </div>
    );
}

export default InventoryMenuBar;
