import React, { createContext, useContext, useState, useEffect } from 'react';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    // permissions structure: role -> { module: boolean }
    const rolePermissions = {
        admin: { all: true },
        accountant: {
            dashboard: true,
            accounting: true,
            invoices: true,
            reports: true,
            archive: true
        },
        manager: {
            dashboard: true,
            projects: true,
            contracts: true,
            clients: true,
            real_estate: true,
            reports: true
        },
        user: {
            dashboard: true,
            archive: true
        }
    };

    const hasPermission = (moduleName) => {
        if (!user) return false;
        const perms = rolePermissions[user.role] || rolePermissions.user;
        return perms.all || perms[moduleName] || false;
    };

    const updatePermissionUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <PermissionContext.Provider value={{ user, hasPermission, updatePermissionUser, rolePermissions }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => {
    const context = useContext(PermissionContext);
    if (!context) throw new Error('usePermission must be used within PermissionProvider');
    return context;
};
