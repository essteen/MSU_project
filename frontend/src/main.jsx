import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Household dashboard</p>
          <h1>Homely</h1>
        </div>
      </header>

      <section className="card-grid">
        <article className="card">
          <h2>Households</h2>
          <p>Track the homes and members connected to your group.</p>
        </article>
        <article className="card">
          <h2>Expenses</h2>
          <p>See purchases, balances, and who owes who.</p>
        </article>
        <article className="card">
          <h2>Shopping</h2>
          <p>Manage wishlist items and shared home needs.</p>
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
