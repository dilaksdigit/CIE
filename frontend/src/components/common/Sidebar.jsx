import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { RoleBadge } from './UIComponents';
import { NAV_ITEMS } from '../../data/mockData';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo" onClick={() => setCollapsed(!collapsed)}>
                <div className="sidebar-logo-icon">C</div>
                {!collapsed && (
                    <div className="sidebar-logo-text">
                        <h2>CIE</h2>
                        <span>v2.3.2</span>
                    </div>
                )}
            </div>

            {/* Nav items */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.id === 'dashboard' ? '/' : `/${item.id}`}
                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                        end={item.id === 'dashboard'}
                    >
                        <span className="icon">{item.icon}</span>
                        {!collapsed && (
                            <span className="label">{item.label}</span>
                        )}
                        {item.badge && !collapsed && (
                            <span className="badge-count">{item.badge}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User footer */}
            <div className="sidebar-footer">
                <div className="sidebar-avatar">DL</div>
                {!collapsed && (
                    <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text)', fontWeight: 600 }}>David L.</div>
                        <RoleBadge role="governor" />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
