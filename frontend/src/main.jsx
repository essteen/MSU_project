import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

const categoryOptions = ['Kitchen', 'Bedroom', 'Livingroom', 'Bathroom'];

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function App() {
  const [households, setHouseholds] = useState([]);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [householdName, setHouseholdName] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('');

  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Kitchen');
  const [itemPrice, setItemPrice] = useState('');
  const [itemOwnerId, setItemOwnerId] = useState('');
  const [itemHouseholdId, setItemHouseholdId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [householdsData, usersData, itemsData] = await Promise.all([
        apiFetch('/households'),
        apiFetch('/users'),
        apiFetch('/items')
      ]);

      setHouseholds(householdsData ?? []);
      setUsers(usersData ?? []);
      setItems(itemsData ?? []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedHouseholdId && households.length > 0) {
      setSelectedHouseholdId(households[0].householdId);
    }
  }, [households, selectedHouseholdId]);

  useEffect(() => {
    if (!itemHouseholdId && households.length > 0) {
      setItemHouseholdId(households[0].householdId);
    }
  }, [households, itemHouseholdId]);

  useEffect(() => {
    if (!itemOwnerId && users.length > 0) {
      setItemOwnerId(users[0].id);
    }
  }, [users, itemOwnerId]);

  const handleCreateHousehold = async (event) => {
    event.preventDefault();
    try {
      await apiFetch('/households', {
        method: 'POST',
        body: JSON.stringify({ name: householdName })
      });
      setHouseholdName('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create household');
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ name: userName, householdId: selectedHouseholdId || null })
      });
      setUserName('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleCreateItem = async (event) => {
    event.preventDefault();
    try {
      await apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify({
          name: itemName,
          category: itemCategory,
          price: Number(itemPrice || 0),
          ownerId: itemOwnerId,
          householdId: itemHouseholdId
        })
      });
      setItemName('');
      setItemPrice('');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create item');
    }
  };

  return (
    <main className="app-shell">
      <header className="navbar">
        <div className="navbar-left">
          <div className="logo" aria-label="Homely logo">
            <div className="logo-mark">H</div>
            <span>Homely</span>
          </div>
        </div>

        <div className="navbar-right">
          <button type="button" className="nav-button" onClick={() => window.location.assign('#my-households')}>
            My households
          </button>

          <div className="auth-buttons">
            <button type="button" className="auth-button">Log in</button>
            <button type="button" className="auth-button primary">Sign up</button>
          </div>
        </div>
      </header>

      <header className="topbar">
        <div>
          <p className="eyebrow">Household dashboard</p>
          <h1>Homely</h1>
        </div>
      </header>

      {error ? <div className="alert">{error}</div> : null}

      <section className="card-grid">
        <article className="card">
          <h2>Add household</h2>
          <form onSubmit={handleCreateHousehold} className="stacked-form">
            <input
              type="text"
              placeholder="Household name"
              value={householdName}
              onChange={(event) => setHouseholdName(event.target.value)}
              required
            />
            <button type="submit">Create household</button>
          </form>
        </article>

        <article className="card">
          <h2>Add member</h2>
          <form onSubmit={handleCreateUser} className="stacked-form">
            <input
              type="text"
              placeholder="Member name"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              required
            />
            <select value={selectedHouseholdId} onChange={(event) => setSelectedHouseholdId(event.target.value)}>
              {households.map((household) => (
                <option key={household.householdId} value={household.householdId}>
                  {household.name}
                </option>
              ))}
            </select>
            <button type="submit">Add member</button>
          </form>
        </article>

        <article className="card">
          <h2>Add purchased item</h2>
          <form onSubmit={handleCreateItem} className="stacked-form">
            <input
              type="text"
              placeholder="Item name"
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              required
            />
            <select value={itemCategory} onChange={(event) => setItemCategory(event.target.value)}>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={itemPrice}
              onChange={(event) => setItemPrice(event.target.value)}
            />
            <select value={itemHouseholdId} onChange={(event) => setItemHouseholdId(event.target.value)}>
              {households.map((household) => (
                <option key={household.householdId} value={household.householdId}>
                  {household.name}
                </option>
              ))}
            </select>
            <select value={itemOwnerId} onChange={(event) => setItemOwnerId(event.target.value)}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button type="submit">Save item</button>
          </form>
        </article>
      </section>

      <section className="data-grid">
        <article className="card">
          <h2>Households</h2>
          {loading ? <p>Loading…</p> : (
            <ul>
              {households.map((household) => (
                <li key={household.householdId}>
                  <strong>{household.name}</strong>
                  <span>{household.members?.length ?? 0} members</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="card">
          <h2>Members</h2>
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                <strong>{user.name}</strong>
                <span>{user.householdId ? 'Assigned to household' : 'No household'}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Items</h2>
          <ul>
            {items.map((item) => (
              <li key={item.itemId}>
                <strong>{item.name}</strong>
                <span>{item.category} · {item.price} kr</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
