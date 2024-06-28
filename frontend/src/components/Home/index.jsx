import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Hall from '../Hall';
import InventoryView from '../InventoryView';
import Bottom from '../Bottom';
import ShoppingListPage from '../ShoppingListPage';
import History from '../History';
import Cookies from 'js-cookie';

import './index.css';

function Home() {
  const [auth, setAuth] = useState(false);
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('inventory');

  const showInventoryTab = () => setActiveTab('inventory');
  const showShoppingListTab = () => setActiveTab('shoppingList');
  const showHistoryTab = () => setActiveTab('history');

  const handleLogout = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/logout`, { withCredentials: true })
      .then(res => {
        Cookies.remove('user_id', { path: '/' });
        Cookies.remove('token', { path: '/' });
        Cookies.remove('role', { path: '/' });
        setAuth(false);
        setMessage('');
        setRole('');
        navigate('/login');
      })
      .catch(err => console.log(err));
  };

  axios.defaults.withCredentials = true;

  useEffect(() => {
  const fetchUserRole = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth`, { withCredentials: true });
      if (response.data.Status === 'Success') {
        setAuth(true);
        setRole(response.data.role);
      } else {
        setAuth(false);
        setMessage(response.data.Error);
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setMessage('Authentication error');
      navigate('/login');
    }
  };

  fetchUserRole();
}, [navigate]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryView role={role} />;
      case 'shoppingList':
        return <ShoppingListPage />;
      case 'history':
        return <History />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className='view'>
          {auth ? (
            <div>
              <Hall
                inventoryTab={showInventoryTab}
                ShoppingListTab={showShoppingListTab}
                historyTab={showHistoryTab}
                role={role}
                logout={handleLogout}
              />
              <div className="tab-content">
                {renderActiveTab()}
              </div>
            </div>
          ) : (
            <div>
              <h3>{message}</h3>
              <h3>Login Now</h3>
              <Link to="/login" className='btn btn-primary'>Login</Link>
            </div>
          )}
        </div>
      <Bottom />
    </div>
  );
}

export default Home;
