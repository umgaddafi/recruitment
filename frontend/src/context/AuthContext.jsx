import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(Boolean(localStorage.getItem('recruitment_token')));

    useEffect(() => {
        if (!localStorage.getItem('recruitment_token')) return;
        api.get('/auth/me')
            .then(({ data }) => setUser(data))
            .catch(() => localStorage.removeItem('recruitment_token'))
            .finally(() => setLoading(false));
    }, []);

    const refreshUser = async () => {
        const { data } = await api.get('/auth/me');
        setUser(data);
        return data;
    };

    const value = useMemo(() => ({
        user,
        loading,
        roles: user?.roles?.map((role) => role.name) || [],
        hasRole: (...roles) => (user?.roles || []).some((role) => roles.includes(role.name)),
        refreshUser,
        login(payload) {
            localStorage.setItem('recruitment_token', payload.token);
            setUser(payload.user);
        },
        async logout() {
            try { await api.post('/auth/logout'); } catch {}
            localStorage.removeItem('recruitment_token');
            setUser(null);
        },
    }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
