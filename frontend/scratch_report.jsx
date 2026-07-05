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
            <div className="flex flex-col space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Enterprise Reports</h1>
                        <p className="text-gray-500 mt-1">Comprehensive overview of recruitment metrics and operations.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleExport('all')} variant="outline"><Download className="mr-2 h-4 w-4" /> Export All</Button>
                        <Button onClick={() => handleExport('shortlisted')} variant="outline"><FileText className="mr-2 h-4 w-4" /> Shortlisted</Button>
                        <Button onClick={() => handleExport('approved')} className="bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]"><ClipboardCheck className="mr-2 h-4 w-4" /> Approved</Button>
                    </div>
                </div>

                <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg flex items-center"><Search className="w-5 h-5 mr-2 text-[var(--primary)]" /> Advanced Filtering</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Filter by Department</label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filters.department_id} onChange={(e) => setFilters({...filters, department_id: e.target.value})}>
                                <option value="">All Departments</option>
                                {lookups.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Filter by Vacancy</label>
                            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filters.vacancy_id} onChange={(e) => setFilters({...filters, vacancy_id: e.target.value})}>
                                <option value="">All Vacancies</option>
                                {lookups.vacancies.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>
                ) : data ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between space-x-2">
                                        <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
                                        <UsersRound className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="text-3xl font-bold mt-2">{data.total_applications || 0}</div>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between space-x-2">
                                        <h3 className="text-sm font-medium text-gray-500">Shortlisted</h3>
                                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="text-3xl font-bold mt-2">{data.total_shortlisted || 0}</div>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between space-x-2">
                                        <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                                        <Award className="h-4 w-4 text-green-500" />
                                    </div>
                                    <div className="text-3xl font-bold mt-2">{data.total_approved || 0}</div>
                                </CardContent>
                            </Card>
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between space-x-2">
                                        <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
                                        <X className="h-4 w-4 text-red-500" />
                                    </div>
                                    <div className="text-3xl font-bold mt-2">{data.total_rejected || 0}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle>Applicants by Status</CardTitle></CardHeader>
                                <CardContent className="h-80 flex items-center justify-center">
                                    <Chart title="" items={data.applicants_by_status || []} labelKey="status" valueKey="total" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Applicants by Department</CardTitle></CardHeader>
                                <CardContent className="h-80 flex items-center justify-center">
                                    <Chart title="" items={data.applicants_by_department || []} labelKey="department" valueKey="total" />
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader><CardTitle>Recent Activity & Applications</CardTitle></CardHeader>
                            <CardContent>
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
                            </CardContent>
                        </Card>
                    </>
                ) : null}
            </div>
        </DashboardShell>
    );
}
