import React, { useState } from 'react';
import './index.css';

function Hall({ inventoryTab, ShoppingListTab, historyTab, role, logout }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <header>
            <div className="title">
                <h1>Bem-Vindo ao Stock Gate</h1>
                <button className="hamburger" onClick={toggleMenu}>
                    <div></div>
                    <div></div>
                    <div></div>
                </button>
                <div className={`menu-bar ${menuOpen ? 'active' : ''}`}>
                    <ul className="ul-menu-bar">
                        <li className="li-menu-bar"><button onClick={() => { inventoryTab(); toggleMenu(); }}>Inventário</button></li>
                        <li className="li-menu-bar"><button onClick={() => { ShoppingListTab(); toggleMenu(); }}>Lista de Compras</button></li>
                        {role === 'admin' && (
                            <li className="li-menu-bar"><button onClick={() => { historyTab(); toggleMenu();}}>Histórico de Compras</button></li>
                        )}
                        <li className="li-logout-bar"><button onClick={logout}>Sair</button></li>
                    </ul>
                </div>
            </div>
        </header>
    );
}

export default Hall;
