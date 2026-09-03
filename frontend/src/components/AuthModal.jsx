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
      setError(err.message || 'Kunne ikke logge inn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');

    if (!EMAIL_REGEX.test(email)) {
      setError('Vennligst skriv inn en gyldig e-postadresse.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passordene er ikke like.');
      return;
    }
    if (!isPasswordStrongEnough(password)) {
      setError('Passordet må være minst 8 tegn og inneholde et tall og en stor bokstav.');
      return;
    }
    if (!birthDate) {
      setError('Vennligst skriv inn fødselsdato.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ username, email, password, confirmPassword, birthDate, name });
      resetRegisterFields();
      onClose();
    } catch (err) {
      setError(err.message || 'Kunne ikke registrere deg');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Logg inn' : 'Registrer deg'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Lukk">×</button>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="stacked-form">
            <input
              type="text"
              placeholder="Brukernavn eller e-post"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Passord"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              required
            />
            <button type="submit" disabled={submitting}>Logg inn</button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="stacked-form">
            <input
              type="text"
              placeholder="Brukernavn"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <input
              type="email"
              placeholder="E-post"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Visningsnavn (valgfritt)"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              type="date"
              placeholder="Fødselsdato"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Passord"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Bekreft passord"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <button type="submit" disabled={submitting}>Registrer deg</button>
          </form>
        )}

        <button
          type="button"
          className="modal-switch"
          onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}
        >
          {mode === 'login' ? 'Har du ikke en konto? Registrer deg' : 'Har du allerede en konto? Logg inn'}
        </button>
      </div>
    </div>
  );
}
