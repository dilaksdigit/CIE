import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useStore from '../../store/index';
import { authApi } from '../../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const setLogin = useStore(state => state.login);

    useEffect(() => {
        // Check if redirected from register with success message
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location]);

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
        const demoUser = { id: 1, name: 'David L.', role: 'governor' };
        const demoToken = 'demo-token-' + Date.now();
        useStore.getState().login(demoUser, demoToken);
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
                {success && <div style={{ padding: '10px', background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 4, color: 'var(--green)', marginBottom: 14, fontSize: '0.85rem' }}>{success}</div>}

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

                <div style={{ marginTop: 18, textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
