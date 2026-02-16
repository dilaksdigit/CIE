import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/index';
import { authApi } from '../../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const setLogin = useStore(state => state.login);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login(email, password);
            const { user, token } = response.data.data;
            setLogin(user, token);
            navigate('/');
        } catch (err) {
            console.error('Login failed:', err);
            const msg = err.response?.data?.error || 'Invalid credentials. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = () => {
        // Mock success
        useStore.getState().setUser({ id: 1, name: 'David L.', role: 'governor' });
        useStore.getState().setToken('demo-token');
        navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <div className="sidebar-logo-icon" style={{ width: 42, height: 42, fontSize: '1.2rem', borderRadius: 6 }}>C</div>
                </div>
                <h2>CIE Global Content</h2>
                <div className="login-sub">v2.3.2 — Secure Access Protocol</div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-14">
                        <label className="field-label">Organization Email</label>
                        <input
                            type="email"
                            className="field-input"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-20">
                        <label className="field-label">Access Token / Password</label>
                        <input
                            type="password"
                            className="field-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Secure Login'}
                    </button>

                    <div style={{ margin: '14px 0', borderTop: '1px solid var(--border)', position: 'relative' }}>
                        <span style={{
                            position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                            background: '#FFF', padding: '0 10px', fontSize: '0.6rem', color: 'var(--text-dim)'
                        }}>OR</span>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleDemoLogin}
                    >
                        🚀 Enter Demo Mode
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
