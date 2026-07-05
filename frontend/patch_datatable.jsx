function DataTable({ title, items = [], columns = [], action, pageSize = 15 }) {
    const [currentPage, setCurrentPage] = useState(1);
    
    // Reset to page 1 if items change significantly (like a new search)
    useEffect(() => { setCurrentPage(1); }, [items.length]);

    const totalPages = Math.ceil(items.length / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return (
        <div className="card" style={{ padding: 0 }}>
            {title && (
                <div className="toolbar" style={{ padding: '20px 24px 16px', margin: 0, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>{title}</h2>
                    <span className="badge">{items.length} records</span>
                </div>
            )}
            <div className="table-wrap">
                <table style={{ margin: 0, border: 'none' }}>
                    <thead>
                        <tr>
                            {columns.map((c) => <th key={c}>{c.replaceAll('_', ' ')}</th>)}
                            {action && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedItems.map((item, idx) => (
                            <tr key={item.id || idx}>
                                {columns.map((c) => <td key={c}>{renderCell(item, c)}</td>)}
                                {action && <td>{action(item)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!items.length && <div className="empty" style={{ padding: '40px' }}>No records found.</div>}
            </div>
            {items.length > pageSize && (
                <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#fcfcfc' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                        Showing {startIndex + 1} to {Math.min(startIndex + pageSize, items.length)} of {items.length} entries
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            type="button" 
                            className="btn outline" 
                            style={{ padding: '6px 12px', fontSize: '13px', minHeight: '32px' }} 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                        >
                            Previous
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: 500, padding: '0 8px' }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            type="button" 
                            className="btn outline" 
                            style={{ padding: '6px 12px', fontSize: '13px', minHeight: '32px' }} 
                            disabled={currentPage === totalPages} 
                            onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
