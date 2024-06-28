import React, { useEffect, useState } from 'react';

function SearchBox({ onItemSelect }) {
    const apiUrl = process.env.REACT_APP_API_URL + '/get-all-items';
    const [items, setItems] = useState([]);
    const [searchedItems, setSearchedItems] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [currentItemId, setCurrentItemId] = useState('');

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    credentials: 'include' // Adicione esta linha para incluir os cookies
                });
                if (!response.ok) {
                    throw new Error('Failed to load items');
                }
                const data = await response.json();
                setItems(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [apiUrl]);

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchText(event.target.value);
        if (query) {
            const searchResult = items.filter(item => item.name.toLowerCase().includes(query));
            setSearchedItems(searchResult);
        } else {
            setSearchedItems(items); // Show all items if query is empty
        }
        setShowResults(true);
    };

    const handleSelectItem = (item) => {
        setSearchText(item.name);
        setCurrentItemId(item.item_id);
        setShowResults(false);
        onItemSelect(item.item_id, item.name, item.unit); // Call the prop function with the selected item_id, name, and unit
    };

    const handleFocus = () => {
        setSearchedItems(items);
        setShowResults(true);
    };

    return (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    type="text"
                    value={searchText}
                    placeholder="Search items..."
                    onChange={handleSearch}
                    onFocus={handleFocus}
                    onBlur={() => setTimeout(() => setShowResults(false), 100)}  // Delay to allow click event
                />
                <p style={{ backgroundColor: 'white', color: 'black', marginLeft: '10px', width: '20%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box', textAlign: 'center' }}>Id: {currentItemId}</p>
            </div>
            {loading && <p>Loading...</p>}
            {showResults && searchedItems.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',  // Position the results directly below the input field
                    marginTop: '5px',  // Add some space between the input and the results
                    border: '1px solid #ccc',
                    backgroundColor: '#fff',
                    zIndex: 1,
                    width: '100%',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.29)'
                }}>
                    {searchedItems.map(item => (
                        <div
                            key={item.item_id}
                            onClick={() => handleSelectItem(item)}
                            style={{ padding: '10px', cursor: 'pointer', color: 'black', borderBottom: '1px solid #ccc' }}
                        >
                            {item.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBox;
