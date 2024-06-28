import React, { useState } from 'react';
import axios from 'axios';
import './index.css';
import SearchBox from '../SearchBox';

function EditItem({ setVisible }) {
    const [values, setValues] = useState({
        item_id: '',
        name: '',
        unit: '',
        category: '',
        description: '',
        stock_min_value: ''
    });

    const handleItemSelect = (item_id) => {
        axios.get(process.env.REACT_APP_API_URL + `/item/${item_id}`, { withCredentials: true })
            .then(res => {
                if (res.data.Status === "Success") {
                    const item = res.data.item;
                    setValues({
                        item_id: item.item_id,
                        name: item.name,
                        unit: item.unit,
                        category: item.category,
                        description: item.description,
                        stock_min_value: item.stock_min_value
                    });
                } else {
                    alert(res.data.Error);
                }
            })
            .catch(err => console.log(err));
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setValues({ ...values, [id]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!values.item_id) {
            alert("Por favor, selecione um item primeiro.");
            return;
        }
        const confirmed = window.confirm('Tem certeza que deseja alterar este item?');
        if (confirmed) {
            axios.post(process.env.REACT_APP_API_URL + '/edit-item', values, { withCredentials: true })
                .then(res => {
                    if (res.data.Status === "Success") {
                        alert("Item atualizado com sucesso");
                        setVisible(false);
                        setTimeout(() => {
                            window.location.reload();
                        }, 0);
                    } else {
                        alert(res.data.Error);
                    }
                })
                .catch(err => console.log(err));
        }
    };

    const handleDelete = () => {
        if (!values.item_id) {
            alert("Por favor, selecione um item primeiro.");
            return;
        }
        const confirmed = window.confirm('Tem certeza que deseja excluir este item?');
        if (confirmed) {
            axios.post(process.env.REACT_APP_API_URL + '/delete-item', { item_id: values.item_id }, { withCredentials: true })
                .then(res => {
                    if (res.data.Status === "Success") {
                        alert("Item excluído com sucesso");
                        setVisible(false);
                        setTimeout(() => {
                            window.location.reload();
                        }, 20);
                    } else {
                        alert(res.data.Error);
                    }
                })
                .catch(err => console.log(err));
        }
    };

    return (
        <div>
            <div className="edit-item">
                <div className="edit-item-first-info">
                    <h2>Alterar Cadastro do Item</h2>
                    <button className="close" onClick={() => setVisible(false)}>Fechar</button>
                </div>
                <form onSubmit={handleSubmit} id="editItemForm">
                    <SearchBox onItemSelect={handleItemSelect} />

                    <input
                        type="text"
                        placeholder="Nome"
                        value={values.name}
                        id="name"
                        onChange={handleInputChange}
                    />

                    <input
                        type="text"
                        placeholder="Unidade"
                        value={values.unit}
                        id="unit"
                        onChange={handleInputChange}
                    />

                    <input
                        type="text"
                        placeholder="Categoria"
                        value={values.category}
                        id="category"
                        onChange={handleInputChange}
                    />

                    <textarea
                        placeholder="Descrição"
                        value={values.description}
                        id="description"
                        onChange={handleInputChange}
                    />

                    <input
                        type="number"
                        placeholder="Quantidade Mínima de Estoque"
                        value={values.stock_min_value}
                        id="stock_min_value"
                        onChange={handleInputChange}
                    />

                    <button type="submit">Atualizar</button>
                    <button type="button" onClick={handleDelete} className="delete-button">Excluir</button>
                </form>
            </div>
        </div>
    );
}

export default EditItem;
