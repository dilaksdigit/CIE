import React from 'react';
export function TierBadge({ tier }) {
 const tierConfig = {
  HERO: { label: 'Hero', color: '#10B981', icon: '⭐' },
  SUPPORT: { label: 'Support', color: '#3B82F6', icon: '️' },
  HARVEST: { label: 'Harvest', color: '#F59E0B', icon: '  ' },
  KILL: { label: 'Kill', color: '#EF4444', icon: '  ' }
 };
 const config = tierConfig[tier] || tierConfig.SUPPORT;
 return (
  <span className="tier-badge" style={{ backgroundColor: config.color, color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>
   {config.icon} {config.label}
  </span>
 );
}
