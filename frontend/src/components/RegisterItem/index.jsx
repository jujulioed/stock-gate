import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import Cookies from 'js-cookie';

function RegisterItem( {setVisible} ) {
    const [values, setValues] = useState({
        name: '',
        unit: '',
        category: '',
        description: '',
        stock_min_value: '',
        id: Cookies.get('user_id')
    })

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post(process.env.REACT_APP_API_URL + '/register-item', values)
        .then(res => {
            if(res.data.Status === "Success") {
                alert("Item registrado com sucesso")
                setTimeout(() => {
                        window.location.reload();
                    }, 0);
            } else {
                alert(res.data.Error);
            }
        })
        .then(err => console.log(err))

    }
    return (
        <div className="registerItemContainer">
            <div className="add-item">
                <div className="add-item-first-info">
                    <h2>Registrar Novo Item</h2>
                    <button className="close" onClick={setVisible}>Fechar</button>
                </div>
                <form onSubmit={handleSubmit} id="registerItemForm">
                    <input type="text" placeholder="Nome *" id="name"
                    onChange={e => setValues({...values, name: e.target.value})}/>

                    <input type="text" placeholder="Descrição" id="description"
                    onChange={e => setValues({...values, description: e.target.value})}/>

                    <input type="text" placeholder="Unidade de Medida *" id="unit"
                    onChange={e => setValues({...values, unit: e.target.value})}/>

                    <input type="text" placeholder="Categoria" id="category"
                    onChange={e => setValues({...values, category: e.target.value})}/>

                    <input type="text" placeholder="Quantidade mínima" id="min-quantity"
                    onChange={e => setValues({...values, stock_min_value: e.target.value})}/>
                    <button type="submit">Adicionar</button>
                </form>
            </div>
        </div> 
    )
}

export default RegisterItem;