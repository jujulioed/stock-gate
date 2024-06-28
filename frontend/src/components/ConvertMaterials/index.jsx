import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import SearchBox from '../SearchBox';
import './index.css';

function ConvertMaterials({ setVisible }) {
    const [inputMaterials, setInputMaterials] = useState([]);
    const [outputMaterials, setOutputMaterials] = useState([]);
    const [inputMaterial, setInputMaterial] = useState({ item_id: '', name: '', quantity: '' });
    const [outputMaterial, setOutputMaterial] = useState({ item_id: '', name: '', quantity: '' });
    const [unit, setUnit] = useState('');
    const userId = Cookies.get('user_id');

    const handleInputMaterialSelect = (item_id, name, unit) => {
        setInputMaterial({ ...inputMaterial, item_id, name });
        setUnit(unit);
    };

    const handleOutputMaterialSelect = (item_id, name, unit) => {
        setOutputMaterial({ ...outputMaterial, item_id, name });
        setUnit(unit);
    };

    const updateMaterialList = (materials, material, setMaterials) => {
        const index = materials.findIndex((item) => item.item_id === material.item_id);
        if (index > -1) {
            const newMaterials = [...materials];
            newMaterials[index] = material; // Update existing material
            setMaterials(newMaterials);
        } else {
            setMaterials([...materials, material]); // Add new material
        }
    };

    const handleAddInputMaterial = () => {
        updateMaterialList(inputMaterials, inputMaterial, setInputMaterials);
        setInputMaterial({ item_id: '', name: '', quantity: '' });
    };

    const handleAddOutputMaterial = () => {
        updateMaterialList(outputMaterials, outputMaterial, setOutputMaterials);
        setOutputMaterial({ item_id: '', name: '', quantity: '' });
    };

    const handleRemoveMaterial = (index, materials, setMaterials) => {
        const updatedMaterials = materials.filter((_, i) => i !== index);
        setMaterials(updatedMaterials);
    };

    const handleInputChange = (e, type) => {
        const { id, value } = e.target;
        if (type === 'input') {
            setInputMaterial({ ...inputMaterial, [id]: value });
        } else {
            setOutputMaterial({ ...outputMaterial, [id]: value });
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const payload = {
            inputMaterials,
            outputMaterials,
            userId
        };
        axios.post(process.env.REACT_APP_API_URL + '/convert-materials', payload, { withCredentials: true })
            .then(res => {
                if (res.data.Status === "Success") {
                    alert("Conversão realizada com sucesso");
                    setVisible(false);
                    setTimeout(() => {
                        window.location.reload();
                    }, 0);
                } else {
                    alert(res.data.Error);
                }
            })
            .catch(err => console.log(err));
    };

    return (
        <div>
            <div className="convert-materials">
                <div className="convert-materials-header">
                    <h2>Conversão de Insumos</h2>
                    <button className="close" onClick={() => setVisible(false)}>Fechar</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="material-section">
                        <h3>Insumos de Entrada</h3>
                        <SearchBox onItemSelect={handleInputMaterialSelect} />
                        <div className="quantity-container">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Quantidade"
                                value={inputMaterial.quantity}
                                id="quantity"
                                onChange={(e) => handleInputChange(e, 'input')}
                            />
                            <p className="unit-display">{unit}</p>
                        </div>
                        <button type="button" onClick={handleAddInputMaterial}>Adicionar Insumo de Entrada</button>
                        <ul className="ul">
                            {inputMaterials.map((material, index) => (
                                <li key={index}>{material.name}: {material.quantity} {unit}
                                    <button onClick={() => handleRemoveMaterial(index, inputMaterials, setInputMaterials)} style={{ marginLeft: "10px" }}>X</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="material-section">
                        <h3>Insumos de Saída</h3>
                        <SearchBox onItemSelect={handleOutputMaterialSelect} />
                        <div className="quantity-container">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Quantidade"
                                value={outputMaterial.quantity}
                                id="quantity"
                                onChange={(e) => handleInputChange(e, 'output')}
                            />
                            <p className="unit-display">{unit}</p>
                        </div>
                        <button type="button" onClick={handleAddOutputMaterial}>Adicionar Insumo de Saída</button>
                        <ul className="ul">
                            {outputMaterials.map((material, index) => (
                                <li key={index}>{material.name}: {material.quantity} {unit}
                                    <button onClick={() => handleRemoveMaterial(index, outputMaterials, setOutputMaterials)} style={{ marginLeft: "10px" }}>X</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button type="submit">Converter</button>
                </form>
            </div>
        </div>
    );
}

export default ConvertMaterials;
