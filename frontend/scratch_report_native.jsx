function ReportsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ department_id: '', vacancy_id: '' });
    const [lookups, setLookups] = useState({ departments: [], vacancies: [] });

    useEffect(() => {
        api.get('/lookups').then(({ data }) => setLookups(prev => ({ ...prev, departments: data.departments || [] })));
        api.get('/vacancies').then(({ data }) => setLookups(prev => ({ ...prev, vacancies: data.data || data || [] })));
    }, []);

    const fetchReport = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.department_id) params.append('department_id', filters.department_id);
        if (filters.vacancy_id) params.append('vacancy_id', filters.vacancy_id);
        
        api.get(`/reports?${params.toString()}`).then(({ data }) => {
            setData(data);
        }).finally(() => setLoading(false));
    }, [filters]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleExport = (type) => {
        const params = new URLSearchParams();
        if (filters.department_id) params.append('department_id', filters.department_id);
        if (filters.vacancy_id) params.append('vacancy_id', filters.vacancy_id);
        window.location.href = `/api/reports/export/${type}?${params.toString()}`;
    };

    return (
        <DashboardShell>
            <div className="toolbar">
                <div>
                    <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 700 }}>Enterprise Reports</h1>
                    <p className="muted" style={{ margin: '4px 0 0 0' }}>Comprehensive overview of recruitment metrics and operations.</p>
                </div>
                <div className="header-actions" style={{ gap: '12px' }}>
                    <button type="button" className="btn outline" onClick={() => handleExport('all')}><Download size={18} /> Export All</button>
                    <button type="button" className="btn outline" onClick={() => handleExport('shortlisted')}><FileText size={18} /> Shortlisted</button>
                    <button type="button" className="btn primary" onClick={() => handleExport('approved')}><ClipboardCheck size={18} /> Export Approved</button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '32px', padding: '24px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={20} color="var(--primary)" /> Advanced Filtering
                </h3>
                <div className="grid cols-2" style={{ gap: '20px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Filter by Department</label>
                        <select value={filters.department_id} onChange={(e) => setFilters({...filters, department_id: e.target.value})}>
                            <option value="">All Departments</option>
                            {lookups.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Filter by Vacancy</label>
                        <select value={filters.vacancy_id} onChange={(e) => setFilters({...filters, vacancy_id: e.target.value})}>
                            <option value="">All Vacancies</option>
                            {lookups.vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '60px', display: 'flex', justifyContent: 'center' }}>
                    <Loader2 size={32} className="spinner" style={{ color: 'var(--primary)' }} />
                </div>
            ) : data ? (
                <>
                    <div className="grid cols-4" style={{ gap: '20px', marginBottom: '32px' }}>
                        <div className="card metric">
                            <div className="metric-header">
                                <span className="metric-title">Total Applications</span>
                                <div className="metric-icon-wrapper" style={{ background: 'rgba(100, 116, 139, 0.1)', color: '#64748b' }}>
                                    <UsersRound size={20} />
                                </div>
                            </div>
                            <strong>{data.total_applications || 0}</strong>
                        </div>
                        <div className="card metric">
                            <div className="metric-header">
                                <span className="metric-title">Shortlisted Candidates</span>
                                <div className="metric-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                    <CheckCircle2 size={20} />
                                </div>
                            </div>
                            <strong>{data.total_shortlisted || 0}</strong>
                        </div>
                        <div className="card metric">
                            <div className="metric-header">
                                <span className="metric-title">Approved Candidates</span>
                                <div className="metric-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                                    <Award size={20} />
                                </div>
                            </div>
                            <strong>{data.total_approved || 0}</strong>
                        </div>
                        <div className="card metric">
                            <div className="metric-header">
                                <span className="metric-title">Rejected Applications</span>
                                <div className="metric-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                    <X size={20} />
                                </div>
                            </div>
                            <strong>{data.total_rejected || 0}</strong>
                        </div>
                    </div>

                    <div className="grid cols-2" style={{ gap: '20px', marginBottom: '32px' }}>
                        <div className="card">
                            <h3 style={{ marginBottom: '20px' }}>Applicants by Status</h3>
                            <Chart title="" items={data.applicants_by_status || []} labelKey="status" valueKey="total" />
                        </div>
                        <div className="card">
                            <h3 style={{ marginBottom: '20px' }}>Applicants by Department</h3>
                            <Chart title="" items={data.applicants_by_department || []} labelKey="department" valueKey="total" />
                        </div>
                    </div>

                    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: 0 }}>Recent Activity & Applications</h3>
                        </div>
                        <DataTable 
                            title="" 
                            items={(data.recent_applications || []).map(a => ({
                                'App No.': a.application_number,
                                'Candidate': a.user?.name || 'Unknown',
                                'Vacancy': a.vacancy?.title || 'Unknown',
                                'Department': a.vacancy?.department?.name || 'N/A',
                                'Status': a.status
                            }))} 
                            columns={['App No.', 'Candidate', 'Vacancy', 'Department', 'Status']} 
                        />
                    </div>
                </>
            ) : null}
        </DashboardShell>
    );
}
