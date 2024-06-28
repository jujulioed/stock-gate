import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import './index.css';
import SearchBox from '../SearchBox';

function RegisterPurchase({ setVisible }) {
    const [values, setValues] = useState({
        item_id: '',
        quantity: '',
        purchase_date: '',
        purchase_price: '',
        payment_due_date: '',
        expire_date: '',
        user_id: Cookies.get('user_id')
    });

    const [inputTypes, setInputTypes] = useState({
        purchase_date: 'text',
        payment_due_date: 'text',
        expire_date: 'text'
    });

    const [unit, setUnit] = useState('');

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setValues({ ...values, [id]: value });
    };

    const handleItemSelect = (item_id, unit) => {
        setValues({ ...values, item_id });
        setUnit(unit);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const payload = { ...values, purchase_price: parseFloat(values.purchase_price.replace(/[^\d.-]/g, '')) };
        axios.post(process.env.REACT_APP_API_URL + '/register-purchase', payload)
            .then(res => {
                if (res.data.Status === "Success") {
                    alert("Compra registrada com sucesso");
                    window.location.reload();
                } else {
                    alert(res.data.Error);
                }
            })
            .catch(err => console.log(err));
    };

    const handleFocus = (id) => {
        setInputTypes({ ...inputTypes, [id]: 'date' });
    };

    const handleBlur = (id) => {
        const { [id]: dateValue } = values;
        if (dateValue) {
            const isValidDate = !isNaN(new Date(dateValue).getTime());
            if (!isValidDate) {
                alert('Data inválida!');
                setValues({ ...values, [id]: '' });
            }
        }
        setInputTypes({ ...inputTypes, [id]: 'text' });
    };

    const handlePriceChange = (e) => {
        const { value } = e.target;
        const formattedValue = `R$ ${value.replace(/[^\d.-]/g, '')}`;
        setValues({ ...values, purchase_price: formattedValue });
    };

    return (
        <div>
            <div className="add-item">
                <div className="add-item-first-info">
                    <h2>Registrar Compra</h2>
                    <button className="close" onClick={() => setVisible(false)}>Fechar</button>
                </div>
                <form onSubmit={handleSubmit} id="registerItemForm">
                    <SearchBox onItemSelect={handleItemSelect} />

                    <div className="input-container">
                        <div className="quantity-container">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Quantidade"
                                value={values.quantity}
                                id="quantity"
                                onChange={handleInputChange}
                            />
                            <p className="unit-display">{unit}</p>
                        </div>
                    </div>

                    <input
                        type={inputTypes.purchase_date}
                        value={values.purchase_date}
                        id="purchase_date"
                        onChange={handleInputChange}
                        onFocus={() => handleFocus('purchase_date')}
                        onBlur={() => handleBlur('purchase_date')}
                        placeholder="Dia de compra"
                    />

                    <input
                        type="text"
                        placeholder="Preço de compra"
                        value={values.purchase_price}
                        id="purchase_price"
                        onChange={handlePriceChange}
                    />

                    <input
                        type={inputTypes.payment_due_date}
                        value={values.payment_due_date}
                        id="payment_due_date"
                        onChange={handleInputChange}
                        onFocus={() => handleFocus('payment_due_date')}
                        onBlur={() => handleBlur('payment_due_date')}
                        placeholder="Prazo para pagamento (opcional)"
                    />

                    <input
                        type={inputTypes.expire_date}
                        value={values.expire_date}
                        id="expire_date"
                        onChange={handleInputChange}
                        onFocus={() => handleFocus('expire_date')}
                        onBlur={() => handleBlur('expire_date')}
                        placeholder="Validade (opcional)"
                    />

                    <button type="submit">Adicionar</button>
                </form>
            </div>
        </div>
    );
}

export default RegisterPurchase;
