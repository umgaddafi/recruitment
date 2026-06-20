import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const ConfigContext = createContext({ config: null, loading: true });

export function ConfigProvider({ children }) {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        api.get('/config').then(({ data }) => {
            if (!cancelled) {
                setConfig(data || {});
                setLoading(false);
            }
        }).catch(() => {
            if (!cancelled) setLoading(false);
        });
        return () => { cancelled = true; };
    }, []);

    return <ConfigContext.Provider value={{ config, loading }}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
    return useContext(ConfigContext);
}

export default ConfigContext;
