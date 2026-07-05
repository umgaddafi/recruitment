function UsersPage() {
    const [users, setUsers] = useState([]);
    const [modal, setModal] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', roles: [], status: 'active' });
    const [loading, setLoading] = useState(true);

    const loadUsers = useCallback(() => {
        setLoading(true);
        api.get('/admin/users?per_page=100').then(({ data }) => {
            setUsers(rows(data));
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const openModal = (user = null) => {
        if (user) {
            setFormData({
                id: user.id,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                roles: user.roles?.map(r => r.name) || [],
                status: user.status || 'active',
                password: '',
            });
            setModal('edit');
        } else {
            setFormData({ name: '', email: '', phone: '', password: '', roles: [], status: 'active' });
            setModal('add');
        }
    };

    const saveUser = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modal === 'add') {
                await api.post('/admin/users', formData);
            } else {
                await api.put(`/admin/users/${formData.id}`, formData);
            }
            setModal(null);
            loadUsers();
        } catch (error) {
            alert(errorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const deleteUser = async (user) => {
        if (!confirm(`Are you sure you want to delete ${user.email}?`)) return;
        try {
            await api.delete(`/admin/users/${user.id}`);
            loadUsers();
        } catch (error) {
            alert(errorMessage(error));
        }
    };

    const availableRoles = [
        { id: 'super_admin', label: 'Super Admin' },
        { id: 'hr_admin', label: 'HR/Admin Officer' },
        { id: 'reviewer', label: 'Department Reviewer' },
        { id: 'panel_member', label: 'Interview Panel Member' },
        { id: 'registrar', label: 'Registrar' },
    ];

    const action = (item) => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn icon" onClick={() => openModal(item)} title="Edit"><Pencil size={16} /></button>
            <button className="btn icon red" onClick={() => deleteUser(item)} title="Delete"><Trash2 size={16} /></button>
        </div>
    );

    return (
        <DashboardShell>
            <div className="card" style={{ padding: '24px' }}>
                <div className="toolbar" style={{ marginBottom: '16px' }}>
                    <h2>User Management</h2>
                    <button className="btn primary" onClick={() => openModal()}><Plus size={16} /> Add User</button>
                </div>
                {loading ? <div className="empty">Loading...</div> : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Roles</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.roles?.map(r => r.label || r.name).join(', ')}</td>
                                        <td><span className={`badge ${u.status === 'active' ? 'green' : 'red'}`}>{u.status}</span></td>
                                        <td>{action(u)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!users.length && <div className="empty">No users found.</div>}
                    </div>
                )}
            </div>

            {modal && (
                <Modal title={modal === 'add' ? 'Add User' : 'Edit User'} onClose={() => setModal(null)}>
                    <form className="grid" onSubmit={saveUser} style={{ gap: '16px' }}>
                        <Field label="Name" required value={formData.name} onChange={(value) => setFormData({ ...formData, name: value })} />
                        <Field label="Email" type="email" required value={formData.email} onChange={(value) => setFormData({ ...formData, email: value })} />
                        <Field label="Phone" value={formData.phone} onChange={(value) => setFormData({ ...formData, phone: value })} />
                        
                        <Field label={modal === 'edit' ? "Password (leave blank to keep current)" : "Password"} type="password" required={modal === 'add'} value={formData.password} onChange={(value) => setFormData({ ...formData, password: value })} />

                        <Field as="select" label="Role" value={formData.roles[0] || ''} options={[
                            { value: '', label: 'Select a Role' },
                            ...availableRoles.map(r => ({ value: r.id, label: r.label }))
                        ]} onChange={(value) => setFormData({ ...formData, roles: value ? [value] : [] })} required />

                        {modal === 'edit' && (
                            <Field as="select" label="Status" value={formData.status} options={[{value: 'active', label: 'Active'}, {value: 'inactive', label: 'Inactive'}]} onChange={(value) => setFormData({ ...formData, status: value })} />
                        )}

                        <div className="toolbar" style={{ marginTop: '16px' }}>
                            <button type="button" className="btn" onClick={() => setModal(null)}>Cancel</button>
                            <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving...' : (modal === 'add' ? 'Save User' : 'Update User')}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </DashboardShell>
    );
}
