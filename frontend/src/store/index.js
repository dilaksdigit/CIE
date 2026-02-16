import { create } from 'zustand';

const useStore = create((set, get) => ({
    // Auth state
    user: JSON.parse(localStorage.getItem('cie_user') || 'null'),
    token: localStorage.getItem('cie_token') || null,
    isAuthenticated: !!localStorage.getItem('cie_token'),

    login: (user, token) => {
        localStorage.setItem('cie_token', token);
        localStorage.setItem('cie_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('cie_token');
        localStorage.removeItem('cie_user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    // SKU state
    skus: [],
    selectedSku: null,
    skuLoading: false,

    setSkus: (skus) => set({ skus }),
    setSelectedSku: (sku) => set({ selectedSku: sku }),
    setSkuLoading: (loading) => set({ skuLoading: loading }),

    // Notifications
    notifications: [],
    addNotification: (notification) => {
        const id = Date.now();
        set((state) => ({
            notifications: [...state.notifications, { ...notification, id }]
        }));
        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
            }));
        }, 4000);
    },
}));

export default useStore;
