import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPasswordStrongEnough(password) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}

export default function AuthModal({ isOpen, initialMode, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode ?? 'login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode ?? 'login');
      setError('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) {
    return null;
  }

  const resetRegisterFields = () => {
    setUsername('');
    setEmail('');
    setName('');
    setBirthDate('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginId, loginPassword);
      setLoginId('');
      setLoginPassword('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!isPasswordStrongEnough(password)) {
      setError('Password must be at least 8 characters and include a number and an uppercase letter.');
      return;
    }
    if (!birthDate) {
      setError('Please enter your birth date.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ username, email, password, confirmPassword, birthDate, name });
      resetRegisterFields();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Log in' : 'Sign up'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="stacked-form">
            <input
              type="text"
              placeholder="Username or email"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              required
            />
            <button type="submit" disabled={submitting}>Log in</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="stacked-form">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Display name (optional)"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              type="date"
              placeholder="Birth date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <button type="submit" disabled={submitting}>Sign up</button>
          </form>
        )}

        <button
          type="button"
          className="modal-switch"
          onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
