INSERT INTO roles (id, name, display_name, description) VALUES
(UUID(), 'ADMIN', 'Administrator', 'Full system access'),
(UUID(), 'SEO_GOVERNOR', 'SEO Governor', 'Manage clusters and taxonomy'),
(UUID(), 'CONTENT_EDITOR', 'Content Editor', 'Edit SKU content'),
(UUID(), 'CONTENT_LEAD', 'Content Lead', 'Manage content team and briefs'),
(UUID(), 'PRODUCT_SPECIALIST', 'Product Specialist', 'Edit technical and expert fields'),
(UUID(), 'CHANNEL_MANAGER', 'Channel Manager', 'View readiness and manage channels'),
(UUID(), 'FINANCE', 'Finance', 'ERP sync and tier management'),
(UUID(), 'AI_OPS', 'AI Operations', 'Run audits and manage AI systems'),
(UUID(), 'VIEWER', 'Viewer', 'Read-only access');
