import React, { useState } from 'react';
import RegisterItem from '../RegisterItem';
import RegisterPurchase from '../RegisterPurchase';
import InventoryMenuBar from '../InventoryMenuBar';
import InventoryItemsGrid from '../InventoryItemsGrid';
import ConvertMaterials from '../ConvertMaterials';
import EditItem from '../EditItem';

function InventoryView({ role }) {
    const [showRegisterItemVisibility, setRegisterItem] = useState(false);
    const showRegisterItem = () => { setRegisterItem(true); 
        setAddQuantity(false);
        setEditItem(false);
        setConvertMaterials(false);
        };
    const hideRegisterItem = () => { setRegisterItem(false); };

    const [showAddQuantityVisibility, setAddQuantity] = useState(false);
    const showAddQuantity = () => { setAddQuantity(true);
        setRegisterItem(false); 
        setEditItem(false);
        setConvertMaterials(false);};
    const hideAddQuantity = () => { setAddQuantity(false); };

    const [showEditItemVisibility, setEditItem] = useState(false);
    const showEditItem = () => { setEditItem(true);
        setRegisterItem(false); 
        setAddQuantity(false);
        setConvertMaterials(false);};
    const hideEditItem = () => { setEditItem(false); };

    const [showConvertMaterialsVisibility, setConvertMaterials] = useState(false);
    const showConvertMaterials = () => { setConvertMaterials(true);
        setRegisterItem(false); 
        setAddQuantity(false);
        setEditItem(false);};
    const hideConvertMaterials = () => { setConvertMaterials(false); };

    return (
        <div>
            <InventoryMenuBar
                registerItemVisibility={showRegisterItem}
                registerPurchaseVisibility={showAddQuantity}
                editItemVisibility={showEditItem}
                convertMaterialsVisibility={showConvertMaterials}
                role={role}
            />
            {showRegisterItemVisibility ?
                <RegisterItem setVisible={hideRegisterItem} />
                :
                <p></p>
            }

            {showAddQuantityVisibility ?
                <RegisterPurchase setVisible={hideAddQuantity} />
                :
                <p></p>
            }

            {showEditItemVisibility ?
                <EditItem setVisible={hideEditItem} />
                :
                <p></p>
            }

            {showConvertMaterialsVisibility ?
                <ConvertMaterials setVisible={hideConvertMaterials} />
                :
                <p></p>
            }

            <InventoryItemsGrid />
        </div>
    );
}

export default InventoryView;
