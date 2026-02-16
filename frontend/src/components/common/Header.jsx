import React from 'react';
import useStore from '../../store';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, isAuthenticated, logout } = useStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="app-header">
            <div className="header-brand">
                <div className="logo">CIE</div>
                <h1>Content Intelligence Engine</h1>
                <span className="version">v2.3.2</span>
            </div>
            <div className="header-actions">
                <div className="header-status">
                    <span className="status-dot"></span>
                    <span>System Online</span>
                </div>
                {isAuthenticated && (
                    <>
                        <div className="header-user" onClick={handleLogout} title="Logout">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
