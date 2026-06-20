import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
    AlarmClock, Bell, BriefcaseBusiness, CalendarClock, CheckCircle2, ClipboardCheck,
    Download, Eye, FileCheck2, FileText, GraduationCap, KeyRound, LayoutDashboard, LogIn, LogOut, Mail, MapPin, Menu, Phone,
    Plus, Search, Settings, ShieldCheck, Trash2, Upload, UserCog, UserPlus, UsersRound, X, ChevronUp, HelpCircle, Share,
    ChevronLeft, ChevronRight, MousePointerClick, Smartphone, EyeOff, FileCheck, Sparkles, MonitorSmartphone
} from 'lucide-react';
import './bootstrap';
import './app.css';
import { Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);
import api, { errorMessage } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfigProvider, useConfig } from './context/ConfigContext';

const fmt = (date) => date ? new Date(date).toLocaleDateString() : 'Not set';
const appointmentDate = (date = new Date()) => {
    const value = date ? new Date(date) : new Date();
    if (Number.isNaN(value.getTime())) return fmt(new Date());
    const day = value.getDate();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    return `${day}${suffix} ${value.toLocaleString('en-US', { month: 'long' })}, ${value.getFullYear()}`;
};
const defaultBranding = {
    university_name: 'JOSEPH SARWUAN TARKA UNIVERSITY MAKURDI, BENUE STATE',
    portal_name: 'JOSTUM Recruitment',
    contact_email: 'recruitment@jostum.edu.ng',
};
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
const captchaEnabled = false;
const rows = (payload) => payload?.data || payload || [];
const statusClass = (status = '') => status.includes('Approved') || status.includes('Shortlisted') || status.includes('Recommended') ? 'green' : status.includes('Rejected') || status.includes('Not') ? 'red' : status.includes('Draft') ? 'gold' : '';
const statusTone = (status = '') => status.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'pending';
const dateValue = (date) => date ? String(date).slice(0, 10) : '';
const fullName = (profile = {}) => [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(' ') || 'Applicant';
const withCurrentOption = (options = [], current = '') => current && !options.includes(current) ? [current, ...options] : options;
const stateKey = (value = '') => value.toLowerCase().replace(/\s+state$/i, '').trim();
const canonicalState = (states = [], selected = '') => states.find((state) => state.toLowerCase() === selected.toLowerCase())
    || states.find((state) => stateKey(state) === stateKey(selected))
    || '';
const present = (value) => value !== null && value !== undefined && String(value).trim() !== '';
const applicantDisplayName = (item = {}) => {
    const profile = item.user?.profile || item.profile || {};
    const profileName = [profile.first_name, profile.middle_name, profile.last_name].filter(present).join(' ');

    return profileName || item.user?.name || item.name || item.user?.email || item.email || 'Applicant';
};
const isSubmittedApplication = (application) => Boolean(application && (application.submitted_at || (application.status && application.status !== 'Draft')));
const qualificationOptions = ['B.Sc.', 'B.Tech', 'B.A.', 'B.Ed.', 'HND', 'ND', 'NCE', 'M.Sc.', 'M.A.', 'MBA', 'M.Tech', 'Ph.D.', 'Professional Certificate', 'Other'];
const cgpaScaleOptions = ['5.0', '4.0'];
const degreeClassOptions = ['FIRST-CLASS (1st class)', 'SECOND CLASS UPPER', 'SECOND CLASS LOWER', 'THIRD CLASS', 'DISTINCTION', 'UPPER CREDIT', 'LOWER CREDIT', 'PASS', 'MERIT', 'CREDIT', 'NOT APPLICABLE'];
const educationTemplate = { institution: '', qualification: '', field_of_study: '', scale: '', cgpa: '', class_of_degree: '', start_year: '', end_year: '' };
const oLevelExamTypes = ['WAEC', 'NECO', 'NABTEB','GCE', 'Other'];
const oLevelGrades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
const oLevelSubjects = [
    'English Language',
    'Mathematics',
    'General Mathematics',
    'Civic Education',
    'Biology',
    'Chemistry',
    'Physics',
    'Agricultural Science',
    'Further Mathematics',
    'Geography',
    'Health Education / Health Science',
    'Physical Education',
    'Commerce',
    'Financial Accounting (Accounting)',
    'Economics',
    'Book Keeping',
    'Business Management',
    'Marketing',
    'Literature in English',
    'Government',
    'History',
    'Christian Religious Studies (CRS)',
    'Islamic Studies (IRS)',
    'Music',
    'Visual Art',
    'Arabic',
    'French',
    'Hausa',
    'Igbo',
    'Yoruba',
    'Auto Mechanics',
    'Building Construction',
    'Metal Work',
    'Technical Drawing',
    'Woodwork',
    'Basic Electricity',
    'Basic Electronics',
    'Clothing and Textiles',
    'Foods and Nutrition',
    'Home Management',
    'Computer Studies',
    'Cosmetology',
    'Animal Husbandry',
    'Crop Husbandry and Horticulture',
    'Fisheries',
    'Blocklaying, Bricklaying and Concreting',
    'Basketry',
    'Clerical Office Duties',
    'Auto Electrical Work',
    'Auto Body Repairs and Spray Painting',
];
const currentYear = new Date().getFullYear();
const oLevelYears = Array.from({ length: currentYear - 1949 }, (_, index) => String(currentYear - index));
const oLevelTemplate = () => ({ school_name: '', exam_number: '', exam_year: '', exam_type: '', subjects: [] });
const experienceTemplate = { organization: '', position: '', start_date: '', end_date: '', is_current: false, responsibilities: '' };
const certificationTemplate = { name: '', issuer: '', issued_at: '', expires_at: '' };
const toBool = (value) => value === true || value === 1 || value === '1' || value === 'true';
const hasEntry = (item = {}) => Object.values(item).some((value) => value !== null && value !== undefined && value !== '' && value !== false);
const fieldLabel = (key) => key === 'is_current' ? 'Current role' : key === 'cgpa' ? 'CGPA' : key.replaceAll('_', ' ');
const normalizeCollection = (items = [], template = {}) => items.filter(hasEntry).map((item) => Object.keys(template).reduce((normalized, key) => {
    if (typeof template[key] === 'boolean') {
        normalized[key] = toBool(item[key]);
    } else if (key === 'cgpa') {
        normalized[key] = item[key] === '' || item[key] === undefined ? null : Number(item[key]);
    } else if (key.includes('year')) {
        normalized[key] = item[key] === '' || item[key] === undefined ? null : Number(item[key]);
    } else if (key.includes('date')) {
        normalized[key] = item[key] || null;
    } else {
        normalized[key] = item[key] ?? '';
    }

    return normalized;
}, {}));
const normalizeOLevels = (items = []) => items.filter((item) => {
    return present(item.school_name) || present(item.exam_number) || present(item.exam_year) || present(item.exam_type) || (item.subjects || []).some((row) => present(row.subject) || present(row.grade));
}).map((item) => ({
    school_name: item.school_name || '',
    exam_number: item.exam_number || '',
    exam_year: item.exam_year === '' || item.exam_year === undefined ? null : Number(item.exam_year),
    exam_type: item.exam_type || '',
    subjects: (item.subjects || []).slice(0, 9).map((row) => ({
        subject: row.subject || '',
        grade: row.grade || '',
    })),
}));
const profileFields = [
    'first_name',
    'middle_name',
    'last_name',
    'gender',
    'nationality',
    'state_of_origin',
    'local_government',
    'date_of_birth',
    'address',
];
const emptyVacancy = {
    title: '',
    faculty_id: '',
    department_id: '',
    unit_id: '',
    employment_type: 'Full-time',
    staff_category: 'Academic',
    rank_or_grade: '',
    vacant_positions: 1,
    minimum_qualification: '',
    required_documents: [],
    requirements: [''],
    job_description: '',
    eligibility_criteria: '',
    start_date: dateValue(new Date().toISOString()),
    deadline: '',
    status: 'draft',
};

const applicationSlipFileName = (application) => `${application?.application_number || 'candidate-number'}.pdf`;

async function applicationSlipBlob(application) {
    const response = await api.get(`/applications/${application.id}/slip?disposition=inline`, { responseType: 'blob' });
    return response.data;
}

async function downloadApplicationSlip(application) {
    if (!application) return;
    const blob = await applicationSlipBlob(application);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = applicationSlipFileName(application);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

async function appointmentLetterBlob(application) {
    const response = await api.get(`/applications/${application.id}/appointment-letter?disposition=inline`, { responseType: 'blob' });
    return response.data;
}

const appointmentLetterFileName = (application) => `${application?.application_number || 'appointment-letter'}-appointment-letter.pdf`;

async function downloadAppointmentLetter(application) {
    if (!application) return;
    const blob = await appointmentLetterBlob(application);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = appointmentLetterFileName(application);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

const getPasswordStrength = (password) => {
    let score = 0;
    let text = 'Too short';
    let color = 'var(--red)';
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password && password.length >= 8;

    const requirements = [
        { label: '8+ Characters', met: isLongEnough },
        { label: 'Uppercase', met: hasUppercase },
        { label: 'Number', met: hasNumber },
        { label: 'Symbol', met: hasSpecial },
    ];

    if (!password || password.length < 6) {
        return { score: 0, text, color, requirements };
    }

    // Score logic
    if (isLongEnough) score++;
    if (password.length >= 12) score++;
    
    let charTypeCount = 0;
    if (hasLowercase) charTypeCount++;
    if (hasUppercase) charTypeCount++;
    if (hasNumber) charTypeCount++;
    if (hasSpecial) charTypeCount++;

    if (charTypeCount >= 2) score++;
    if (charTypeCount >= 3) score++;
    if (charTypeCount >= 4) score++;

    // Cap score at 4 for visual representation
    score = Math.min(score, 4);

    if (score === 1) { text = 'Weak'; color = 'var(--red)'; }
    else if (score === 2) { text = 'Fair'; color = 'var(--gold)'; }
    else if (score === 3) { text = 'Good'; color = 'var(--blue)'; }
    else if (score === 4) { text = 'Strong'; color = 'var(--green)'; }
    else { text = 'Too short'; color = 'var(--red)'; }

    return { score, text, color, requirements };
};

const playErrorSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, ctx.currentTime); // Low frequency for "thud"
        osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.06, ctx.currentTime); // Soft volume
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.12);
        osc.onended = () => ctx.close(); // Clean up context to free memory
    } catch (e) {
        // Audio blocked by browser policy or unsupported
    }
};

const AnimatedNumber = ({ value, duration = 2000, start = false, suffix = "", delay = 0 }) => {
    const [count, setCount] = useState(0);
    const end = parseInt(value, 10) || 0;

    useEffect(() => {
        if (!start || end === 0) {
            setCount(0);
            return;
        }

        const timeout = setTimeout(() => {
            let startTime = null;
            const animate = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                setCount(Math.floor(progress * end));
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        }, delay);

        return () => clearTimeout(timeout);
    }, [end, start, duration, delay]);

    return <>{count}{suffix}</>;
};

function Topbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className={`topbar ${isOpen ? 'is-open' : ''}`}>
            <div className="topbar-inner">
                        <Link className="brand" to="/" onClick={() => setIsOpen(false)}><span className="brand-mark"><GraduationCap size={22} /></span>{useConfig()?.config?.branding?.portal_name ?? defaultBranding.portal_name}</Link>
                <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            <nav className="nav-actions" onClick={() => setIsOpen(false)}>
                <a className="nav-link" href="/#vacancies">Vacancies</a>
                <a className="nav-link" href="/#steps">Steps</a>
                <a className="nav-link" href="/#news">News</a>
                <a className="nav-link" href="/#contact">Contact</a>
                {user ? <Link className="btn dashboard-btn" to="/dashboard"><LayoutDashboard size={18} /> Dashboard</Link> : <Link className="btn" to="/login"><LogIn size={18} /> Login</Link>}
                {user ? <button className="btn icon logout-btn" title="Logout" onClick={logout}><LogOut size={18} /></button> : <Link className="btn primary register-btn" to="/register"><UserPlus size={18} /> Register</Link>}
            </nav>
        </header>
    );
}

function Home() {
    const { config, loading: configLoading } = useConfig();
    const branding = config?.branding ?? (config?.portal_name ? { portal_name: config.portal_name, university_name: config.portal_name, contact_email: config.contact_email } : defaultBranding);
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subscribeEmail, setSubscribeEmail] = useState('');
    const [subscribeStatus, setSubscribeStatus] = useState('idle'); // idle, loading, success, error
    const [selectedNews, setSelectedNews] = useState(null);
    const [toast, setToast] = useState(null);
    const statsRef = useRef(null);
    const [statsVisible, setStatsVisible] = useState(false);

    const urgentVacancies = useMemo(() => vacancies.filter(v => {
        if (!v.deadline) return false;
        const deadline = new Date(v.deadline);
        const now = new Date();
        const diff = (deadline - now) / (1000 * 60 * 60 * 24);

        // Custom thresholds: 7 days for Academic, 3 days for Non-Academic
        const threshold = v.staff_category === 'Academic' ? 7 : 3;
        return diff > 0 && diff <= threshold;
    }), [vacancies]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Live clock to update countdowns
    const [, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const newsArticles = [
        { id: 1, date: 'May 20, 2024', title: '2024 Recruitment Portal Launched', summary: 'The official recruitment portal for the 2024 academic session is now live. All interested candidates are invited to create accounts.', content: 'We are pleased to announce the official launch of the JOSTUM Recruitment Portal for the 2024 academic session. This state-of-the-art platform is designed to streamline the application process for both academic and non-academic positions. Prospective candidates can now create accounts, build their profiles, and apply for available vacancies with ease. We encourage all applicants to read the instructions carefully and ensure all required documents are uploaded before the specified deadlines.' },
        { id: 2, date: 'May 15, 2024', title: 'Extension of Application Deadlines', summary: 'Deadlines for administrative and technical roles have been extended by 14 days to accommodate more applications.', content: 'In response to numerous requests and to ensure a broad pool of qualified candidates, the university management has approved a 14-day extension for all administrative and technical vacancy deadlines. The new deadline for these roles is now June 15, 2024. This extension provides additional time for interested individuals to complete their applications and secure necessary documentation. Please note that this extension does not apply to academic positions unless otherwise stated.' },
        { id: 3, date: 'May 10, 2024', title: 'Important Notice on Documentation', summary: 'Please ensure all uploaded credentials are in PDF format and clearly legible to avoid disqualification during the review stage.', content: 'A recent review of submitted applications has revealed a high number of illegible documents and unsupported file formats. To ensure your application is processed successfully, all uploaded credentials (certificates, transcripts, ID cards, etc.) must be in PDF format. Each file must be clearly scanned and under 4MB in size. Photographed documents that are blurry or cut off will result in automatic disqualification. Applicants are advised to double-check their uploads using the "Application Preview" feature before final submission.' },
    ];

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setSubscribeStatus('loading');
        try {
            // Simulate API delay for subscription
            await new Promise(resolve => setTimeout(resolve, 800));
            setSubscribeStatus('success');
            setSubscribeEmail('');
            setTimeout(() => setSubscribeStatus('idle'), 4000);
        } catch (err) {
            setSubscribeStatus('error');
        }
    };

    const handleShare = async (article) => {
        if (!article) return;
        const shareData = {
            title: article.title,
            text: article.summary,
            url: window.location.origin + '/#news',
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
                showToast('Link copied to clipboard!');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
                showToast('Sharing failed. Please try again.', 'error');
            }
        }
    };

    const statCardsData = useMemo(() => [
        { icon: BriefcaseBusiness, value: vacancies.length, suffix: '', label: 'Active Adverts' },
        { icon: GraduationCap, value: 35, suffix: '+', label: 'Departments' },
        { icon: CheckCircle2, value: 100, suffix: '%', label: 'Online Process' },
        { icon: Bell, value: 24, suffix: '/7', label: 'Tracking Access' },
    ], [vacancies.length]);

    // Filters and search (URL-persistent)
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [filterDept, setFilterDept] = useState(searchParams.get('dept') || '');
    const [filterCategory, setFilterCategory] = useState(searchParams.get('cat') || '');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Debounced URL sync for search/filters to reduce thrash and improve perceived performance
    useEffect(() => {
        const id = setTimeout(() => {
            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            if (filterDept) params.set('dept', filterDept);
            if (filterCategory) params.set('cat', filterCategory);
            navigate({ search: params.toString() }, { replace: true });
        }, 300);
        return () => clearTimeout(id);
    }, [searchQuery, filterDept, filterCategory, navigate]);

    const filteredVacancies = useMemo(() => {
        const q = (searchQuery || '').toLowerCase().trim();
        return vacancies.filter((v) => {
            if (filterDept && String(v.department?.name || '').toLowerCase() !== filterDept.toLowerCase()) return false;
            if (filterCategory && String(v.staff_category || '').toLowerCase() !== filterCategory.toLowerCase()) return false;
            if (!q) return true;
            return (`${v.title} ${v.department?.name || ''} ${v.rank_or_grade} ${v.minimum_qualification}`.toLowerCase().includes(q));
        });
    }, [vacancies, searchQuery, filterDept, filterCategory]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setStatsVisible(true);
            },
            { threshold: 0.1 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
            // Check immediately if the element is already in view on initial load
            const initialEntry = observer.takeRecords()[0];
            if (initialEntry && initialEntry.isIntersecting) {
                setStatsVisible(true);
                observer.disconnect(); // Disconnect if already visible, as it's a one-time animation
            }
        }
        return () => observer.disconnect();
    }, [vacancies.length]);

    useEffect(() => {
        api.get('/vacancies')
            .then(({ data }) => setVacancies(rows(data)))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);
    return (
        <div className="app-shell">
            <Topbar />
            {urgentVacancies.length > 0 && (
                <div className="urgent-banner">
                    <div className="urgent-banner-inner">
                        <Bell size={16} className="animate-pulse" />
                        <strong>Closing Soon:</strong>
                        <div className="urgent-list">
                            {urgentVacancies.map((v) => {
                                const now = new Date();
                                const deadline = new Date(v.deadline);
                                const diff = Math.max(0, deadline - now);
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                                const mins = Math.floor((diff / (1000 * 60)) % 60);
                                const secs = Math.floor((diff / 1000) % 60);
                                const countdown = diff > 0 ? `${days}d ${hours}h ${mins}m ${secs}s` : 'Closed';

                                return (
                                    <div className="urgent-item" key={v.id}>
                                        <Link to={`/apply?vacancy=${v.id}`} className="urgent-item-link">{v.title}</Link>
                                        <span className="urgent-countdown">{countdown}</span>
                                        <Link to={`/apply?vacancy=${v.id}`} className="btn gold urgent-apply">Apply Now</Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            <section className="hero">
                <div className="hero-inner">
                    <span className="badge gold">Academic and Non-Academic Recruitment</span>
                    <h1>{branding.university_name}</h1>
                    <p>Apply, review, shortlist, interview, approve, and report on staff recruitment through one secure university workflow.</p>
                    <div className="inline-actions hero-ctas">
                        <Link className="btn gold hero-primary" to="/register"><UserPlus size={18} /> Start Application</Link>
                        <Link className="btn" to="/login"><LogIn size={18} /> Applicant Login</Link>
                    </div>
                </div>
            </section>
            <section className="stats-section">
                <div className="section" style={{ padding: 0 }}>
                    <div className="grid cols-4 responsive-grid" ref={statsRef}>
                        {statCardsData.map((card, i) => (
                            <div className={`stat-card ${statsVisible ? 'animate' : ''}`} key={card.label} style={{ '--index': i }}>
                                <div className="stat-icon"><card.icon size={26} /></div>
                                <strong><AnimatedNumber value={card.value} start={statsVisible} suffix={card.suffix} delay={i * 120} /></strong>
                                <span>{card.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="section governance-section">
                <h2>Recruitment Built For University Governance</h2>
                <p className="section-lead">The portal supports HR officers, departments, interview panels, applicants, and final approving officers with auditable workflows from vacancy publication to final list generation.</p>
                <div className="grid cols-4 responsive-grid">
                    {[
                        ['Secure applications', ShieldCheck],
                        ['Reviewer scoring', ClipboardCheck],
                        ['Interview batches', CalendarClock],
                        ['Recruitment reports', FileText],
                    ].map(([title, Icon]) => <div className="card" key={title}><Icon color="#0b6b4f" /><h3>{title}</h3><p className="muted">Structured tools for each stage of the process.</p></div>)}
                </div>
            </section>
            <section id="vacancies" className="section">
                <div className="toolbar" style={{ alignItems: 'flex-start' }}>
                    <h2>Available Vacancies</h2>
                    {vacancies.length > 3 && (
                        <Link to="/vacancies" className="view-all-link">View All Vacancies &rarr;</Link>
                    )}
                </div>

                <div className="filters">
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input className="search-input" type="search" placeholder="Search vacancies, department, role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        {searchQuery && <button className="clear-btn" onClick={() => setSearchQuery('')} aria-label="Clear search"><X size={14} /></button>}
                        <button className="btn filter-toggle" onClick={() => setShowMobileFilters(!showMobileFilters)} aria-expanded={showMobileFilters}><Settings size={16} /> <span className="filter-label">Filters</span></button>
                    </div>

                    <div className={`filter-inputs ${showMobileFilters ? 'show' : ''}`}>
                        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                            <option value="">All Departments</option>
                            {[...new Set(vacancies.map(v => v.department?.name).filter(Boolean))].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="">All Categories</option>
                            {[...new Set(vacancies.map(v => v.staff_category).filter(Boolean))].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn" onClick={() => { setSearchQuery(''); setFilterDept(''); setFilterCategory(''); setShowMobileFilters(false); }}>Clear</button>
                        </div>
                    </div>
                </div>

                <VacancySlider vacancies={filteredVacancies} />
            </section>
            <section id="news" className="section">
                <h2>Latest News & Updates</h2>
                <p className="section-lead">Stay informed with the latest recruitment announcements, procedure updates, and university news.</p>
                <div className="grid cols-3 responsive-grid">
                    {newsArticles.map((news) => (
                        <div className="card news-card" key={news.id}>
                            <span className="news-date">{news.date}</span>
                            <h3>{news.title}</h3>
                            <p className="muted">{news.summary}</p>
                            <button className="news-link" onClick={() => setSelectedNews(news)}>Read More &rarr;</button>
                        </div>
                    ))}
                </div>
            </section>
            <section id="steps" className="section">
                <h2>Application Steps</h2>
                <div className="grid cols-4 responsive-grid">
                    {['Create account', 'Complete profile', 'Upload documents', 'Apply and track'].map((step, i) => <div className="card" key={step}><span className="badge">{`Step ${i + 1}`}</span><h3>{step}</h3><p className="muted">Keep your application accurate before the vacancy deadline.</p></div>)}
                </div>
            </section>
            <section className="section requirements-section">
                <h2>Requirements</h2>
                <div className="grid cols-2 responsive-grid">
                    <div className="card"><span><GraduationCap size={20} color="var(--green)" /></span><h3>Academic Staff</h3><p className="muted">Graduate Assistant through Professor ranks with qualification, teaching, research, NYSC, and publication evidence as applicable.</p></div>
                    <div className="card"><span><BriefcaseBusiness size={20} color="var(--navy)" /></span><h3>Non-Academic Staff</h3><p className="muted">Administrative, technical, registry, library, ICT, laboratory, security, works, and maintenance roles with role-specific credentials.</p></div>
                </div>
            </section>
            <section className="section faq-section">
                <h2>Frequently Asked Questions</h2>
                <div className="grid cols-2 responsive-grid">
                    {['Can I edit after submission?', 'Can I apply twice?', 'Which file types are accepted?', 'How do I know my status?'].map((q) => <div className="card" key={q}><HelpCircle size={18} color="var(--gold)" /><h3>{q}</h3><p className="muted">The portal validates deadlines, duplicate applications, file types, and status notifications automatically.</p></div>)}
                </div>
            </section>
            <section id="contact" className="section contact-section">
                <div className="contact-head">
                    <span className="badge green">Recruitment Support</span>
                    <h2>Get in Touch</h2>
                    <p className="section-lead">Reach out to our team for any assistance or inquiries regarding our hiring process.</p>
                </div>
                
                <div className="grid cols-2 contact-layout responsive-grid">
                    <div className="card no-padding overflow-hidden shadow-sm h-full" style={{ minHeight: '400px' }}>
                        <iframe
                            title="Recruitment Office Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63246.392664092025!2d8.538522720336921!3d7.800459559455059!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x105085ba2dc8e08f%3A0x859c26a6f98966ff!2sJoseph%20Sarwuan%20Tarka%20University!5e0!3m2!1sen!2sng!4v1780845463534!5m2!1sen!2sng"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>

                    <div className="card shadow-sm h-full contact-details-card">
                        <div className="contact-card-inner">
                            <h3>Recruitment Support</h3>
                            <p className="muted">Our team is available to assist you with any part of the application process.</p>
                            
                            <div className="contact-info-list">
                                <div className="contact-info-item">
                                    <div className="contact-info-icon office"><MapPin size={20} /></div>
                                    <div>
                                        <h6>Office Location</h6>
                                        <p className="muted small">Recruitment Office, Registrar Building, {branding.university_name}</p>
                                    </div>
                                </div>

                                <a className="contact-info-item" href="tel:+2348000000000">
                                    <div className="contact-info-icon phone"><Phone size={20} /></div>
                                    <div>
                                        <h6>Phone Number</h6>
                                        <p className="muted small">+234 800 000 0000</p>
                                    </div>
                                </a>

                                <a className="contact-info-item" href={`mailto:${branding.contact_email}`}>
                                    <div className="contact-info-icon email"><Mail size={20} /></div>
                                    <div>
                                        <h6>Email Address</h6>
                                        <p className="muted small">{branding.contact_email}</p>
                                    </div>
                                </a>

                                <div className="contact-info-item">
                                    <div className="contact-info-icon hours"><CalendarClock size={20} /></div>
                                    <div>
                                        <h6>Working Hours</h6>
                                        <p className="muted small">Mon - Fri, 9:00 AM - 4:00 PM</p>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-cta">
                                <button className="btn primary" style={{ width: '100%' }} onClick={() => window.location.href = `mailto:${branding.contact_email}`}>Send Support Request</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <footer className="footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <Link className="brand" to="/"><span className="brand-mark"><GraduationCap size={22} /></span>{useConfig()?.config?.branding?.portal_name ?? defaultBranding.portal_name}</Link>
                        <p>Secure university staff recruitment from vacancy publication to final appointment decision.</p>
                    </div>
                    <div className="footer-links">
                        <div>
                            <h3>Portal</h3>
                            <a href="#vacancies">Vacancies</a>
                            <a href="#steps">Application Steps</a>
                            <Link to="/login">Applicant Login</Link>
                        </div>
                        <div>
                            <h3>Support</h3>
                            <a href={`mailto:${branding.contact_email}`}>Email Support</a>
                            <a href="tel:+2348000000000">Call Office</a>
                            <a href="#contact">Contact Details</a>
                        </div>
                        <div className="footer-newsletter">
                            <h3>Stay Updated</h3>
                            <p className="small">Subscribe to our newsletter for the latest vacancy alerts and recruitment news.</p>
                            <form className="newsletter-form" onSubmit={handleSubscribe}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={subscribeEmail}
                                    onChange={(e) => setSubscribeEmail(e.target.value)}
                                    required
                                    disabled={subscribeStatus === 'loading'}
                                />
                                <button className="btn primary" type="submit" disabled={subscribeStatus === 'loading'}>
                                    {subscribeStatus === 'loading' ? '...' : 'Join'}
                                </button>
                            </form>
                            {subscribeStatus === 'success' && <p className="subscribe-message success">Subscribed successfully!</p>}
                            {subscribeStatus === 'error' && <p className="subscribe-message error">Subscription failed. Try again.</p>}
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <span>{branding.university_name}</span>
                        <span>&copy; {new Date().getFullYear()} Recruitment Office. All rights reserved.</span>
                    </div>
                </div>
            </footer>

            {selectedNews && (
                <Modal
                    title={selectedNews.title}
                    onClose={() => setSelectedNews(null)}
                    actions={<button className="btn" onClick={() => handleShare(selectedNews)}><Share size={18} /> Share</button>}
                >
                    <div className="news-modal-content">
                        <span className="news-date">{selectedNews.date}</span>
                        <p>{selectedNews.content}</p>
                    </div>
                </Modal>
            )}

            {toast && (
                <div className={`toast ${toast.type}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}

function VacancySlider({ vacancies }) {
    const scrollRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasEntered, setHasEntered] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft } = scrollRef.current;
            const item = scrollRef.current.querySelector('.vacancy-slider-item');
            if (item) {
                const itemWidth = item.offsetWidth + 20; // Width + 20px gap
                const index = Math.round(scrollLeft / itemWidth);
                setActiveIndex(index);
            }
        }
    }, []);

    const scrollToItem = useCallback((index) => {
        if (scrollRef.current) {
            const item = scrollRef.current.querySelector('.vacancy-slider-item');
            if (item) {
                const itemWidth = item.offsetWidth + 20;
                scrollRef.current.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
            }
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
                if (entry.isIntersecting) setHasEntered(true);
            },
            { threshold: 0.1 }
        );

        if (scrollRef.current) observer.observe(scrollRef.current);
        return () => observer.disconnect();
    }, [vacancies.length]);

    const scroll = useCallback((direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            let scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

            if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - 10) {
                scrollTo = 0;
            } else if (direction === 'left' && scrollLeft <= 10) {
                scrollTo = scrollWidth;
            }

            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isPaused || !isVisible || prefersReducedMotion || !vacancies.length) return;

        const interval = setInterval(() => scroll('right'), 5000);
        return () => clearInterval(interval);
    }, [isPaused, isVisible, scroll, vacancies.length]);

    if (!vacancies.length) return <div className="empty">No active vacancies are currently published.</div>;

    return (
        <div 
            className="vacancy-slider-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            <div className="vacancy-slider" ref={scrollRef} onScroll={handleScroll}>
                {vacancies.map((vacancy, i) => (
                    <div 
                        className={`vacancy-slider-item ${hasEntered ? 'animate' : ''}`} 
                        key={vacancy.id}
                        style={{ '--index': i }}
                    >
                        <VacancyCard vacancy={vacancy} />
                    </div>
                ))}
            </div>
            <button className="slider-nav prev" onClick={() => scroll('left')} aria-label="Previous"><ChevronLeft size={24} /></button>
            <button className="slider-nav next" onClick={() => scroll('right')} aria-label="Next"><ChevronRight size={24} /></button>
            
            <div className="slider-dots">
                {vacancies.map((_, i) => (
                    <button
                        key={i}
                        className={`dot ${i === activeIndex ? 'active' : ''}`}
                        onClick={() => scrollToItem(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

function PasswordStrengthMeter({ password }) {
    const { score, text, color, requirements } = getPasswordStrength(password);
    const width = (score / 4) * 100; // Normalize score to 0-100% for the bar

    return (
        <div className="password-strength-meter">
            <div className="strength-bar-container">
                <div className="strength-bar" style={{ width: `${password ? width : 0}%`, backgroundColor: color }}></div>
            </div>
            <span className="strength-text" style={{ color: color }}>{text}</span>
            <div className="password-requirements">
                {requirements.map((req, i) => (
                    <div key={i} className={`requirement-item ${req.met ? 'met' : ''}`}>
                        {req.met ? <CheckCircle2 size={12} /> : <X size={12} />}
                        {req.label}
                    </div>
                ))}
            </div>
        </div>
    );
}


function VacancyCard({ vacancy }) {
    const isNew = vacancy.created_at && (new Date() - new Date(vacancy.created_at)) / (1000 * 60 * 60) <= 48;
    const diffHours = vacancy.deadline ? (new Date(vacancy.deadline) - new Date()) / 3600000 : 0;
    const isClosingToday = diffHours > 0 && diffHours <= 24;
    const daysRemaining = Math.floor(diffHours / 24);

    return (
        <div className="card vacancy-card">
            
            <div className="vacancy-badges">
                <span className={`badge ${vacancy.staff_category === 'Academic' ? 'green' : 'gold'}`}>{vacancy.staff_category}</span>
                {isNew && <span className="badge animate-pulse" title={`Posted on: ${new Date(vacancy.created_at).toLocaleString()}`}><Sparkles size={12} style={{ marginRight: '4px' }} /> New</span>}
                {isClosingToday && <span className="badge red animate-pulse"><AlarmClock size={12} style={{ marginRight: '4px' }} /> Closing Today</span>}
            </div>
            <h3>{vacancy.title}</h3>
            <p className="muted">{vacancy.department?.name || 'General'} · {vacancy.rank_or_grade}</p>
            <p className="muted">{vacancy.vacant_positions || 1} vacant position(s)</p>
            <p>{vacancy.minimum_qualification}</p>
            {Boolean(vacancy.requirements?.length) && <ul className="mini-list">{vacancy.requirements.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>}
            <div className="inline-actions">
                <span className="muted">
                    Deadline: {fmt(vacancy.deadline)}
                    {vacancy.deadline && diffHours > 0 && (
                        <span 
                            className={isClosingToday ? 'animate-pulse' : ''}
                            style={{ fontWeight: 800, color: isClosingToday ? 'var(--red)' : 'var(--gold)', marginLeft: '4px' }}
                        >
                            {isClosingToday ? '(Closing today)' : `(${daysRemaining}d left)`}
                        </span>
                    )}
                </span>
                <Link className="btn primary" to={`/apply?vacancy=${vacancy.id}`}>Apply</Link>
            </div>
        </div>
    );
}

function VacancySkeleton() {
    return (
        <div className="card vacancy-card skeleton-card">
            <div className="skeleton-badge"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
            <div className="skeleton-text mini"></div>
            <div className="skeleton-footer">
                <div className="skeleton-text tiny"></div>
                <div className="skeleton-button"></div>
            </div>
        </div>
    );
}

function AuthPage({ mode }) {
    const navigate = useNavigate();
    const routeLocation = useLocation();
    const auth = useAuth();
    const params = new URLSearchParams(routeLocation.search);
    const isRegister = mode === 'register';
    const isForgot = mode === 'forgot';
    const isReset = mode === 'reset';
    const [form, setForm] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: params.get('email') || '',
        phone: '',
        password: '',
        password_confirmation: '',
        token: params.get('token') || '',
        remember_me: false,
        terms_accepted: false,
    });
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [submitCount, setSubmitCount] = useState(0);
    const [message, setMessage] = useState(params.get('verified') ? 'Email verified successfully. You can now login.' : '');
    const [verificationEmail, setVerificationEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const registrationComplete = isRegister && Boolean(verificationEmail);
    const title = registrationComplete ? 'Check your inbox' : isRegister ? 'Create account' : isForgot ? 'Recover your password' : isReset ? 'Set a new password' : 'Welcome back';
    const subtitle = registrationComplete
        ? 'Your details have been saved. Open the confirmation link sent to your email to activate your applicant account.'
        : isRegister
        ? 'Enter your applicant details. Your account becomes active only after you confirm the email sent to your inbox.'
        : isForgot
            ? 'Enter your email and we will send a secure reset link if the account exists.'
            : isReset
                ? 'Choose a strong password to regain access to your recruitment dashboard.'
                : 'Login to continue your application, view documents, and track recruitment status.';

    const submit = async (e) => {
        e.preventDefault();
        setSubmitCount(c => c + 1);
        if (emailError || phoneError) return;
        setError('');
        setMessage('');
        setLoading(true);
        try {
            if (isForgot) {
                const { data } = await api.post('/auth/forgot-password', { email: form.email });
                setMessage(data.message);
            } else if (isReset) {
                const { data } = await api.post('/auth/reset-password', form);
                setMessage(data.message);
                setTimeout(() => navigate('/login'), 900);
            } else if (isRegister) {
                if (!form.terms_accepted) {
                    setError('You must agree to the Terms of Service and Privacy Policy.');
                    setLoading(false);
                    return;
                }
                const registrationPayload = {
                    first_name: form.first_name.trim(),
                    middle_name: form.middle_name.trim(),
                    last_name: form.last_name.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    password_confirmation: form.password_confirmation,
                };
                const { data } = await api.post('/auth/register', registrationPayload);
                setMessage(data.message);
                setVerificationEmail(data.email || form.email);
                setForm({ ...form, password: '', password_confirmation: '' });
            } else {
                const { data } = await api.post('/auth/login', form);
                auth.login(data);
                navigate('/dashboard');
            }
        } catch (err) {
            if (!isRegister && errorMessage(err).toLowerCase().includes('confirm your email')) {
                setVerificationEmail(form.email);
            }
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    };
    const resendVerification = async () => {
        setError('');
        setMessage('');
        setResending(true);
        try {
            const { data } = await api.post('/auth/resend-verification', { email: verificationEmail || form.email });
            setMessage(data.message);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setResending(false);
        }
    };

    // Local email change handler for the Auth form
    const handleEmailChange = (email) => {
        setForm({ ...form, email });
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
    };

    // Local phone change handler: normalize and auto-prefix +234 when needed
    const handlePhoneChange = (phone) => {
        let value = (phone || '').trim();
        // remove common separators (spaces, dashes, parentheses)
        value = value.replace(/[\s()-]/g, '');

        if (!value) {
            setForm({ ...form, phone: '' });
            setPhoneError('');
            return;
        }

        // if already starts with + or with 0, keep as-is
        if (value.startsWith('+') || value.startsWith('0')) {
            setForm({ ...form, phone: value });
            // basic validation: digits (and optional leading +)
            const digitsOnly = value.replace(/[^\d]/g, '');
            if (digitsOnly.length < 7) {
                setPhoneError('Please enter a valid phone number.');
            } else {
                setPhoneError('');
            }
            return;
        }

        // if starts with digits but not 0, prefix with +234
        if (/^\d+$/.test(value)) {
            const prefixed = `+234${value}`;
            setForm({ ...form, phone: prefixed });
            const digitsOnly = prefixed.replace(/[^\d]/g, '');
            setPhoneError(digitsOnly.length < 7 ? 'Please enter a valid phone number.' : '');
            return;
        }

        // fallback: set raw value and flag as invalid
        setForm({ ...form, phone: value });
        setPhoneError('Please enter a valid phone number.');
    };

    return (
        <div className="auth-wrap">
            <div className="auth-layout">
                <aside className="auth-visual">
                    <div>
                        <span className="badge gold">Secure Applicant Access</span>
                        <h1>Manage every step of your university recruitment journey.</h1>
                        <p>Submit applications, receive status updates, preview PDF slips, and track decisions from one focused dashboard.</p>
                    </div>
                    <div className="auth-stats">
                        <div><MousePointerClick size={20} /><strong>8</strong><span>Tracking stages</span></div>
                        <div><FileCheck size={20} /><strong>PDF</strong><span>Application slip</span></div>
                        <div><Smartphone size={20} /><strong>Email</strong><span>Status alerts</span></div>
                    </div>
                </aside>
                <main className="auth-card">
                    <Link className="brand auth-brand" to="/">
                    {(useConfig()?.config?.branding?.portal_name ?? defaultBranding.portal_name).toUpperCase()}
                    </Link>
                    <img src="/assets/jlogo.png" alt={useConfig()?.config?.branding?.portal_name ?? defaultBranding.portal_name} className="auth-logo-right" />
                    <div className="auth-card-head">
                        <div>
                            <h2>{title}</h2>
                            <p className="muted">{subtitle}</p>
                        </div>
                    </div>
                    {error && <div className="error" key={error + submitCount}>{error}</div>}
                    {message && <div className="success">{message}</div>}
                    {verificationEmail && (
                        <div className="verify-card">
                            <span className="auth-icon"><Mail size={20} /></span>
                            <div>
                                <strong>Confirm your email to complete registration</strong>
                                <p>A confirmation link was sent to {verificationEmail}. The account will remain locked until the link is opened.</p>
                                <button className="btn" type="button" disabled={resending} onClick={resendVerification}>{resending ? 'Sending...' : 'Resend confirmation email'}</button>
                            </div>
                        </div>
                    )}
                    {!registrationComplete && (
                        <form className="form auth-form" onSubmit={submit}>
                            {isRegister && (
                                <div className="grid cols-3">
                                    <Field label="First name" value={form.first_name} onChange={(first_name) => setForm({ ...form, first_name })} required />
                                    <Field label="Last name" value={form.last_name} onChange={(last_name) => setForm({ ...form, last_name })} required />
                                    <Field label="Other name" value={form.middle_name} onChange={(middle_name) => setForm({ ...form, middle_name })} />
                                </div>
                            )}

                            {isRegister ? (
                                <div className="grid cols-2">
                                    <Field label="Email address" type="email" value={form.email} onChange={handleEmailChange} error={emailError} isValid={Boolean(form.email && !emailError)} required />
                                    <Field label="Phone" type="tel" value={form.phone} onChange={handlePhoneChange} error={phoneError} isValid={Boolean(form.phone && !phoneError)} shakeTrigger={submitCount} required />
                                </div>
                            ) : (
                                <Field label="Email address" type="email" value={form.email} onChange={handleEmailChange} error={emailError} isValid={Boolean(form.email && !emailError)} required />
                            )}

                            {!isForgot && (
                                <>
                                    {isRegister ? (
                                        <>
                                            <div className="grid cols-2">
                                                <Field label={isReset ? 'New password' : 'Password'} type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} required showPasswordToggle={true} />
                                                <Field label="Confirm password" type="password" value={form.password_confirmation} onChange={(password_confirmation) => setForm({ ...form, password_confirmation })} required showPasswordToggle />
                                            </div>
                                            <PasswordStrengthMeter password={form.password} />
                                        </>
                                    ) : (
                                        <>
                                            <Field label={isReset ? 'New password' : 'Password'} type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} required showPasswordToggle={true} />
                                            {isReset && <Field label="Confirm password" type="password" value={form.password_confirmation} onChange={(password_confirmation) => setForm({ ...form, password_confirmation })} required showPasswordToggle />}
                                        </>
                                    )}
                                </>
                            )}
                            {isRegister && (
                                <div className="terms-row">
                                    <Field
                                        label="I agree to the Terms of Service and Privacy Policy regarding the handling of my recruitment data."
                                        type="checkbox"
                                        value={form.terms_accepted}
                                        onChange={(terms_accepted) => setForm({ ...form, terms_accepted })}
                                        required
                                    />
                                </div>
                            )}
                            {!isRegister && !isForgot && !isReset && (
                                <div className="remember-row">
                                    <Field
                                        label="Remember me"
                                        type="checkbox"
                                        value={form.remember_me}
                                        onChange={(remember_me) => setForm({ ...form, remember_me })}
                                    />
                                    <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                                </div>
                            )}
                            {isReset && <input type="hidden" value={form.token} readOnly />}
                            <button className="btn primary auth-submit" disabled={loading}>
                                {isForgot ? <Mail size={18} /> : isReset ? <KeyRound size={18} /> : isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                                {loading ? 'Please wait...' : isForgot ? 'Send Reset Link' : isReset ? 'Reset Password' : isRegister ? 'Create Account' : 'Login'}
                            </button>
                        </form>
                    )}
                    {registrationComplete ? (
                        <div className="auth-links">
                            <span>Use this after confirming your email.</span>
                        </div>
                    ) : (
                        <div className="auth-links">
                            {(isForgot || isReset) && <Link to="/login">Back to login</Link>}
                            {/* Forgot password moved into the form row when present */}
                            {!isReset && <span>{isRegister ? 'Already registered?' : 'New applicant?'}</span>}
                            <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Login' : 'Create an account'}</Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function EmailVerifiedPage() {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(15);

    useEffect(() => {
        const countdown = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
        const redirect = setTimeout(() => navigate('/login?verified=1'), 15000);

        return () => {
            clearInterval(countdown);
            clearTimeout(redirect);
        };
    }, [navigate]);

    return (
        <div className="auth-wrap">
            <main className="auth-card auth-success-card">
                <div className="auth-card-head">
                    <div>
                        <h2>Account Creation Successful</h2>
                        <p className="muted">Your email has been confirmed and your applicant account is now active.</p>
                    </div>
                </div>
                <div className="success">You will be redirected to login in {seconds} second{seconds === 1 ? '' : 's'}.</div>
                <Link className="btn primary auth-submit" to="/login?verified=1"><LogIn size={18} /> Login</Link>
            </main>
        </div>
    );
}

function Field({ label, value, onChange, type = 'text', as = 'input', options = [], required = false, placeholder = '', disabled = false, showPasswordToggle = false, error = '', isValid = false, shakeTrigger }) {
    const [isVisible, setIsVisible] = useState(false);
    const inputRef = useRef(null);
    const normalized = type === 'date' ? dateValue(value) : (value ?? '');
    const hasError = !!error;

    useEffect(() => {
        if (hasError && inputRef.current) {
            playErrorSound();
            inputRef.current.style.animation = 'none';
            void inputRef.current.offsetHeight; // trigger reflow
            inputRef.current.style.animation = '';
        }
    }, [shakeTrigger]);

    const inputClass = `${as === 'input' ? 'input' : as} ${hasError ? 'has-error' : ''} ${isValid && !hasError ? 'is-valid' : ''}`;

    if (type === 'checkbox') {
        const checked = toBool(value);

        return (
            <div className="field">
                <label className="checkbox-field inline-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
                    <span className="checkbox-label" style={{ display: 'inline-block', fontSize: '15px' }}>{label}{required && <b> *</b>}</span>
                </label>
                {error && <div className="field-error">{error}</div>}
            </div>
        );
    }

    return (
        <label className="field">
            <span>{label}{required && <b> *</b>}</span>
            {as === 'select' ? (
                <select ref={inputRef} className={inputClass} value={normalized} required={required} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
                    <option value="">{placeholder || 'Select'}</option>
                    {options.map((item) => <option key={item.value || item} value={item.value || item}>{item.label || item}</option>)}
                </select>
            ) : as === 'textarea' ? (
                <textarea ref={inputRef} className={inputClass} value={normalized} required={required} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
            ) : (
                <div className="input-with-toggle">
                    <input
                        ref={inputRef}
                        className={inputClass}
                        type={type === 'password' && isVisible ? 'text' : type}
                        value={normalized}
                        required={required}
                        disabled={disabled}
                        placeholder={placeholder}
                        onChange={(e) => onChange(e.target.value)}
                    />
                    {type === 'password' && showPasswordToggle && (
                        <button type="button" className="password-toggle-btn" onClick={() => setIsVisible(!isVisible)} aria-label={isVisible ? 'Hide password' : 'Show password'}>
                            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                    {isValid && !error && type !== 'password' && (
                        <div className="password-toggle-btn" style={{ color: 'var(--green)', pointerEvents: 'none' }}>
                            <CheckCircle2 size={18} />
                        </div>
                    )}
                </div>
            )}
            {error && <div className="field-error">{error}</div>}
        </label>
    );
}

function Modal({ title, children, actions, onClose, wide = false }) {
    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
            <section className={`modal-panel ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
                <div className="modal-head">
                    <h2>{title}</h2>
                    <button className="btn icon" type="button" title="Close" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="modal-body">{children}</div>
                {actions && <div className="modal-actions">{actions}</div>}
            </section>
        </div>
    );
}

function RecaptchaCheckbox({ siteKey, onVerify, onExpire, resetKey }) {
    const containerRef = useRef(null);
    const widgetRef = useRef(null);

    useEffect(() => {
        if (!siteKey) return undefined;

        let active = true;
        let script = document.querySelector('script[data-recaptcha-script]');

        const renderWidget = () => {
            if (!active || !containerRef.current || !window.grecaptcha) return;
            if (widgetRef.current !== null) window.grecaptcha.reset(widgetRef.current);

            containerRef.current.innerHTML = '';
            widgetRef.current = window.grecaptcha.render(containerRef.current, {
                sitekey: siteKey,
                theme: 'light',
                callback: onVerify,
                'expired-callback': onExpire,
                'error-callback': onExpire,
            });
        };

        if (window.grecaptcha) {
            renderWidget();
        } else {
            if (!script) {
                script = document.createElement('script');
                script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
                script.async = true;
                script.defer = true;
                script.dataset.recaptchaScript = 'true';
                document.head.appendChild(script);
            }

            script.addEventListener('load', renderWidget, { once: true });
        }

        return () => {
            active = false;
            if (widgetRef.current !== null && window.grecaptcha) {
                window.grecaptcha.reset(widgetRef.current);
            }
            widgetRef.current = null;
        };
    }, [siteKey, onVerify, onExpire, resetKey]);

    if (!siteKey) {
        return <div className="error">Captcha is not configured. Add VITE_RECAPTCHA_SITE_KEY to the frontend environment.</div>;
    }

    return <div className="recaptcha-box" ref={containerRef} />;
}

function DetailGrid({ items }) {
    return (
        <div className="detail-grid">
            {items.map(([label, value]) => (
                <div className="detail-item" key={label}>
                    <span>{label}</span>
                    <strong>{value || 'Not provided'}</strong>
                </div>
            ))}
        </div>
    );
}

function ApplicantDetails({ profile = {} }) {
    return <DetailGrid items={profileFields.map((key) => [fieldLabel(key), key === 'date_of_birth' ? fmt(profile[key]) : profile[key]])} />;
}

function ApplicationSummary({ application, payload }) {
    const profile = payload?.profile || application?.user?.profile || {};
    const vacancy = application?.vacancy || {};

    if (!application) return <p className="muted">No submitted application is available.</p>;

    return (
        <div className="grid">
            <DetailGrid items={[
                ['Applicant', fullName(profile)],
                ['Application number', application.application_number],
                ['Vacancy', vacancy.title],
                ['Role / grade', vacancy.rank_or_grade || vacancy.staff_category],
                ['Department', vacancy.department?.name],
                ['Status', application.status],
                ['Submitted', fmt(application.submitted_at)],
            ]} />
            {application.cover_letter && (
                <div className="preview-panel">
                    <h3>Cover Letter</h3>
                    <p>{application.cover_letter}</p>
                </div>
            )}
            <div className="preview-panel">
                <h3>Documents</h3>
                {application.documents?.length ? (
                    <ul className="preview-list">
                        {application.documents.map((document) => <li key={document.id}><FileText size={14} /> {document.label || document.original_name}</li>)}
                    </ul>
                ) : <p className="muted">No documents attached.</p>}
            </div>
        </div>
    );
}

const roleLabels = {
    super_admin: 'Super Admin',
    hr_admin: 'HR/Admin Officer',
    reviewer: 'Department Reviewer',
    panel_member: 'Interview Panel Member',
    applicant: 'Applicant',
    registrar: 'Registrar',
};

const nav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['applicant', 'super_admin', 'hr_admin', 'reviewer', 'panel_member', 'registrar'] },
    { path: '/profile', label: 'Profile', icon: UsersRound, roles: ['applicant'] },
    { path: '/settings', label: 'Account Settings', icon: Settings, roles: ['applicant', 'hr_admin', 'reviewer', 'panel_member', 'registrar'] },
    { path: '/vacancies', label: 'Vacancies', icon: BriefcaseBusiness, roles: ['super_admin', 'hr_admin'] },
    { path: '/apply', label: 'Application Form', icon: FileText, roles: ['applicant'] },
    { path: '/tracking', label: 'Tracking', icon: Bell, roles: ['applicant'] },
    { path: '/application-preview', label: 'Application Preview', icon: Eye, roles: ['applicant'], requiresSubmittedApplication: true },
    { path: '/appointment-letter', label: 'Appointment Letter', icon: FileCheck2, roles: ['applicant'], requiresApprovedApplication: true },
    { path: '/admin/applicants', label: 'Applicants', icon: UsersRound, roles: ['super_admin', 'hr_admin'] },
    { path: '/admin/reviews', label: 'Reviews', icon: ClipboardCheck, roles: ['super_admin', 'hr_admin', 'reviewer'] },
    { path: '/reviewer/completed', label: 'Completed Reviews', icon: CheckCircle2, roles: ['reviewer'] },
    { path: '/reviewer/guide', label: 'Review Guide', icon: ShieldCheck, roles: ['reviewer'] },
    { path: '/admin/shortlists', label: 'Shortlist', icon: CheckCircle2, roles: ['super_admin', 'hr_admin'] },
    { path: '/admin/interviews', label: 'Interviews', icon: CalendarClock, roles: ['super_admin', 'hr_admin', 'panel_member'] },
    { path: '/admin/final-approvals', label: 'Final Approvals', icon: ShieldCheck, roles: ['super_admin', 'registrar'] },
    { path: '/admin/successful-list', label: 'Successful List', icon: Download, roles: ['super_admin', 'hr_admin', 'registrar'] },
    { path: '/admin/reports', label: 'Reports', icon: Download, roles: ['super_admin', 'hr_admin', 'registrar'] },
    { path: '/admin/users', label: 'Users', icon: UserCog, roles: ['super_admin'] },
    { path: '/admin/settings', label: 'Settings', icon: Settings, roles: ['super_admin'] },
    { path: '/admin/audit', label: 'Audit Logs', icon: ShieldCheck, roles: ['super_admin'] },
];

function canAccess(user, allowedRoles) {
    if (!user) return false;
    return (user.roles || []).some((role) => allowedRoles.includes(role.name));
}

function PassportAvatar({ user, initials }) {
    const [src, setSrc] = useState('');
    const passportPath = user?.profile?.passport_path;

    useEffect(() => {
        if (!passportPath) {
            setSrc('');
            return undefined;
        }

        let active = true;
        let objectUrl = '';
        const requestPath = passportPath.startsWith('/api/') ? passportPath.slice(4) : '/profile/passport';
        api.get(requestPath, { responseType: 'blob' })
            .then(({ data }) => {
                if (!active) return;
                objectUrl = URL.createObjectURL(data);
                setSrc(objectUrl);
            })
            .catch(() => {
                if (active) setSrc('');
            });

        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [passportPath]);

    return (
        <div className="passport-avatar" title="Applicant passport">
            {src ? <img src={src} alt="" /> : <span>{initials}</span>}
        </div>
    );
}

function PassportUploadField({ profile = {}, selectedFile = null, uploading = false, onSelect }) {
    const [src, setSrc] = useState('');
    const passportPath = profile.passport_path;

    useEffect(() => {
        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setSrc(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }

        if (!passportPath) {
            setSrc('');
            return undefined;
        }

        let active = true;
        let objectUrl = '';
        const requestPath = passportPath.startsWith('/api/') ? passportPath.slice(4) : '/profile/passport';
        api.get(requestPath, { responseType: 'blob' })
            .then(({ data }) => {
                if (!active) return;
                objectUrl = URL.createObjectURL(data);
                setSrc(objectUrl);
            })
            .catch(() => {
                if (active) setSrc('');
            });

        return () => {
            active = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [passportPath, selectedFile]);

    return (
        <label className="field passport-upload-field">
            <span>Passport photograph<b> *</b></span>
            <div className="passport-upload-box">
                <div className="passport-upload-preview">{src ? <img src={src} alt="" /> : <Upload size={24} />}</div>
                <div>
                    <input className="input" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" disabled={uploading} onChange={(event) => onSelect(event.target.files?.[0] || null)} />
                    <p className="muted">{uploading ? 'Uploading passport...' : selectedFile ? 'Selected. Save this step to update your passport.' : 'JPG or PNG, maximum 4MB.'}</p>
                </div>
            </div>
        </label>
    );
}

function DashboardShell({ children }) {
    const { user, loading, logout } = useAuth();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', isCollapsed);
    }, [isCollapsed]);

    const [hasSubmittedApplication, setHasSubmittedApplication] = useState(false);
    const [hasApprovedApplication, setHasApprovedApplication] = useState(false);
    const [hasTrackingUpdate, setHasTrackingUpdate] = useState(false);

    useEffect(() => {
        if (!user || !canAccess(user, ['applicant'])) return;

        api.get('/applications')
            .then(({ data }) => {
                const applications = rows(data);
                const lastSeen = JSON.parse(localStorage.getItem('tracking-last-seen') || '{}');
                const currentStatuses = {};
                let updated = false;

                applications.forEach(app => {
                    currentStatuses[app.id] = app.status;
                    if (lastSeen[app.id] && lastSeen[app.id] !== app.status) updated = true;
                });

                setHasTrackingUpdate(updated);
                if (location.pathname === '/tracking') {
                    localStorage.setItem('tracking-last-seen', JSON.stringify(currentStatuses));
                    setHasTrackingUpdate(false);
                }
            })
            .catch(() => {});
    }, [user, location.pathname]);

    useEffect(() => {
        if (!user || !canAccess(user, ['applicant'])) {
            setHasSubmittedApplication(false);
            setHasApprovedApplication(false);
            return;
        }

        let active = true;
        api.get('/applications')
            .then(({ data }) => {
                if (!active) return;
                const applications = rows(data);
                setHasSubmittedApplication(applications.some(isSubmittedApplication));
                setHasApprovedApplication(applications.some((application) => application.status === 'Approved'));
            })
            .catch(() => {
                if (!active) return;
                setHasSubmittedApplication(false);
                setHasApprovedApplication(false);
            });

        return () => { active = false; };
    }, [user]);

    if (loading) return <div className="auth-wrap"><div className="card">Loading portal...</div></div>;
    if (!user) return <Navigate to="/login" />;
    const visibleNav = nav.filter((item) => canAccess(user, item.roles)
        && (!item.requiresSubmittedApplication || hasSubmittedApplication)
        && (!item.requiresApprovedApplication || hasApprovedApplication));
    const primaryRole = user.roles?.[0]?.name;
    const initials = user.name?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
    return (
        <div className={`dash-layout ${isCollapsed ? 'collapsed' : ''}`}>
            <aside className={`sidebar ${menuOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-top">
                    <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
                        <span className="brand-mark"><GraduationCap size={22} /></span>
                        <span>Recruitment</span>
                    </Link>
                    <div className="sidebar-actions">
                        <button className="collapse-toggle" type="button" onClick={() => setIsCollapsed(!isCollapsed)} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
                {!isCollapsed && primaryRole !== 'applicant' && <div className="role-chip">{roleLabels[primaryRole] || 'Portal User'}</div>}
                <nav className="side-nav">
                    {visibleNav.map(({ path, label, icon: Icon }) => (
                        <NavLink className="side-link" to={path} key={path} onClick={() => setMenuOpen(false)} data-tooltip={label}>
                            <div className="side-link-icon">
                                <Icon size={18} />
                                {label === 'Tracking' && hasTrackingUpdate && <span className="notification-dot" />}
                            </div>
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="main">
                <div className="main-head">
                    <div><strong>{user.name}</strong><div className="muted">{user.roles?.map((r) => r.label).join(', ')}</div></div>
                    <div className="header-actions">
                        <PassportAvatar user={user} initials={initials} />
                        <button className="btn" onClick={logout}><LogOut size={18} /> Logout</button>
                    </div>
                </div>
                <div className="content">{children}</div>
            </main>
        </div>
    );
}

function RoleRoute({ roles, children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="auth-wrap"><div className="card">Loading portal...</div></div>;
    if (!user) return <Navigate to="/login" />;
    if (!canAccess(user, roles)) return <Navigate to="/dashboard" replace />;
    return children;
}

function Dashboard() {
    const { hasRole } = useAuth();
    const [data, setData] = useState(null);
    useEffect(() => {
        const endpoint = hasRole('applicant')
            ? '/applications'
            : hasRole('reviewer')
                ? '/reviews'
                : hasRole('panel_member')
                    ? '/panel/interviews'
                    : '/dashboard';

        api.get(endpoint)
            .then(({ data }) => setData(data))
            .catch(() => setData({ data: [] }));
    }, []);

    if (hasRole('applicant')) {
        const applicationRows = rows(data);
        const currentApplication = applicationRows[0];
        const applicationAction = currentApplication
            ? currentApplication.status === 'Draft'
                ? { label: 'Continue Application', path: '/apply', icon: FileText }
                : { label: 'Track Application', path: '/tracking', icon: Bell }
            : { label: 'Start Application', path: '/apply', icon: FileText };
        const ActionIcon = applicationAction.icon;

        return <DashboardShell>
            <div className="toolbar"><h1>Applicant Dashboard</h1><Link className="btn primary" to={applicationAction.path}><ActionIcon size={18} /> {applicationAction.label}</Link></div>
            <DataTable title="My Application" items={applicationRows} columns={['application_number', 'status', 'submitted_at']} />
        </DashboardShell>;
    }

    if (hasRole('reviewer')) {
        const applicationRows = rows(data);
        const completed = applicationRows.filter((application) => application.reviews?.length).length;
        return <DashboardShell>
            <div className="toolbar"><h1>Reviewer Dashboard</h1><Link className="btn primary" to="/admin/reviews"><ClipboardCheck size={18} /> Open Review Queue</Link></div>
            <div className="grid cols-4">
                <div className="card metric"><span className="muted">assigned applications</span><strong>{applicationRows.length}</strong></div>
                <div className="card metric"><span className="muted">completed reviews</span><strong>{completed}</strong></div>
                <div className="card metric"><span className="muted">pending reviews</span><strong>{Math.max(0, applicationRows.length - completed)}</strong></div>
                <div className="card metric"><span className="muted">shortlisted</span><strong>{applicationRows.filter((application) => application.status === 'Shortlisted').length}</strong></div>
            </div>
            <DataTable title="Recent Review Assignments" items={applicationRows} columns={['applicant', 'application_number', 'vacancy', 'status']} />
        </DashboardShell>;
    }

    if (hasRole('panel_member')) {
        return <DashboardShell>
            <div className="toolbar"><h1>Panel Dashboard</h1><Link className="btn primary" to="/admin/interviews"><CalendarClock size={18} /> View Interviews</Link></div>
            <DataTable title="Assigned Interview Batches" items={rows(data)} columns={['title', 'mode', 'interview_date', 'venue']} />
        </DashboardShell>;
    }

    const metrics = data?.metrics || { 
        total_vacancies: 0, 
        active_vacancies: 0, 
        shortlisted_applicants: 0, 
        approved_applicants: 0,
        pending_users: 0,
        system_health: 'Optimal'
    };

    return <DashboardShell>
        <div className="toolbar">
            <h1>{hasRole('super_admin') ? 'Super Admin Control Center' : hasRole('registrar') ? 'Registrar Dashboard' : 'Administrative Dashboard'}</h1>
            {hasRole('registrar') ? <Link className="btn primary" to="/admin/final-approvals"><ShieldCheck size={18} /> Final Approvals</Link> : <Link className="btn primary" to="/vacancies"><BriefcaseBusiness size={18} /> Manage Vacancies</Link>}
        </div>

        {hasRole('super_admin') && (
            <div className="grid cols-4 mb-6">
                <div className="card metric border-green">
                    <span className="muted flex items-center gap-2"><ShieldCheck size={14} /> System Status</span>
                    <strong className="text-green-600">{metrics.system_health || 'Optimal'}</strong>
                </div>
                <div className="card metric border-gold">
                    <span className="muted flex items-center gap-2"><UserPlus size={14} /> Pending Verifications</span>
                    <strong>{metrics.pending_users || 0}</strong>
                </div>
                <div className="card metric">
                    <span className="muted">Active Sessions</span>
                    <strong>{data?.active_sessions || 0}</strong>
                </div>
                <div className="card metric">
                    <span className="muted">Total Errors (24h)</span>
                    <strong className={data?.error_count > 0 ? 'text-red-600' : ''}>{data?.error_count || 0}</strong>
                </div>
            </div>
        )}

        <div className="grid cols-4">
            {Object.entries(metrics).filter(([k]) => !['system_health', 'pending_users'].includes(k)).map(([key, value]) => (
                <div className="card metric" key={key}>
                    <span className="muted">{key.replaceAll('_', ' ')}</span>
                    <strong>{value}</strong>
                </div>
            ))}
        </div>

        {/* Charts row: full width two-column */}
        <div className="charts-row grid cols-2 mb-6">
            <PieChart title="Applicant Status Distribution" items={data?.status_distribution || []} labelKey="status" valueKey="total" />
            <BarChart title="Applicants by Status" items={data?.applicants_by_status || data?.status_distribution || []} labelKey="status" valueKey="total" />
        </div>

        {/* Below charts: Recent Applications and Recent System Activity side-by-side */}
        <div className="grid cols-2 gap-6">
            <DataTable title="Recent Applications" items={data?.recent_applications || []} columns={['applicant', 'application_number', 'vacancy', 'status']} />
            {hasRole('super_admin') ? (
                <div className="card">
                    <div className="toolbar">
                        <h2>Recent System Activity</h2>
                        <Link to="/admin/audit" className="small muted">View Logs</Link>
                    </div>
                    <div className="activity-feed">
                        {(data?.recent_activities || []).map((act, i) => (
                            <div key={i} className="activity-item py-2 border-b border-line last:border-0">
                                <div className="text-sm font-bold">{act.action}</div>
                                <div className="text-xs muted">{act.user} • {fmt(act.created_at)}</div>
                            </div>
                        ))}
                        {(!data?.recent_activities || data.recent_activities.length === 0) && <p className="muted text-center py-4">No recent critical activity.</p>}
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="toolbar"><h2>Recent System Activity</h2></div>
                    <div className="empty">No system activity available for your role.</div>
                </div>
            )}
        </div>
    </DashboardShell>;
}

function ProfilePage() {
    const [payload, setPayload] = useState({ profile: {}, education: [], olevels: [], experience: [], certifications: [] });
    const [applications, setApplications] = useState([]);
    const [pdfPreview, setPdfPreview] = useState(null);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        Promise.all([api.get('/profile'), api.get('/applications')])
            .then(([profileRes, applicationRes]) => {
                setPayload(profileRes.data);
                setApplications(rows(applicationRes.data));
            })
            .catch(() => {});
    }, []);

    const submittedApplications = applications.filter((application) => application.submitted_at || application.status !== 'Draft');
    const latestSubmitted = submittedApplications[0];
    const closePdfPreview = () => {
        if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
        setPdfPreview(null);
    };
    const previewSlip = async (application) => {
        setActionError('');
        try {
            const blob = await applicationSlipBlob(application);
            setPdfPreview({
                title: applicationSlipFileName(application),
                url: URL.createObjectURL(blob),
                application,
            });
        } catch (err) {
            setActionError(errorMessage(err));
        }
    };
    const downloadSlip = async (application) => {
        setActionError('');
        try {
            await downloadApplicationSlip(application);
        } catch (err) {
            setActionError(errorMessage(err));
        }
    };

    return <DashboardShell>
        <div className="toolbar">
            <div>
                <h1>Applicant Profile</h1>
                <p className="muted">Your submitted profile details are shown as read-only records.</p>
            </div>
            <div className="inline-actions">
                <button className="btn" type="button" disabled={!latestSubmitted} onClick={() => previewSlip(latestSubmitted)}><Eye size={16} /> Preview Application</button>
                <button className="btn primary" type="button" disabled={!latestSubmitted} onClick={() => downloadSlip(latestSubmitted)}><Download size={16} /> Download</button>
            </div>
        </div>
        {actionError && <div className="error">{actionError}</div>}

        <div className="card profile-card">
            <ApplicantDetails profile={payload.profile || {}} />
        </div>

        {submittedApplications.length > 1 && (
            <div className="card">
                <h2>Submitted Applications</h2>
                <div className="advert-list">
                    {submittedApplications.map((application) => (
                        <div className="advert-item" key={application.id}>
                            <div>
                                <span className={`badge ${statusClass(application.status)}`}>{application.status}</span>
                                <h3>{application.vacancy?.title || 'Application'}</h3>
                                <p className="muted">{application.application_number} · Submitted {fmt(application.submitted_at)}</p>
                            </div>
                            <div className="inline-actions">
                                <button className="btn" type="button" onClick={() => previewSlip(application)}><Eye size={16} /> Preview</button>
                                <button className="btn" type="button" onClick={() => downloadSlip(application)}><Download size={16} /> Download</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {pdfPreview && (
            <Modal title={pdfPreview.title} wide onClose={closePdfPreview} actions={<button className="btn primary" type="button" onClick={() => downloadSlip(pdfPreview.application)}><Download size={16} /> Download PDF</button>}>
                <iframe className="document-preview-frame" src={pdfPreview.url} title={pdfPreview.title} />
            </Modal>
        )}
    </DashboardShell>;
}

function PreviewInfoGrid({ items = [] }) {
    return (
        <div className="application-preview-info-grid">
            {items.map(([label, value]) => (
                <div className="application-preview-info" key={label}>
                    <span>{label}</span>
                    <strong>{present(value) ? value : 'Not provided'}</strong>
                </div>
            ))}
        </div>
    );
}

function PreviewSection({ title, icon: Icon, children, className = '' }) {
    return (
        <section className={`application-preview-section ${className}`}>
            <div className="application-preview-section-title">
                <span><Icon size={18} /></span>
                <h2>{title}</h2>
            </div>
            {children}
        </section>
    );
}

function ApplicationPreviewPage() {
    const [payload, setPayload] = useState({ profile: {}, education: [], olevels: [], experience: [], certifications: [] });
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState('');
    const [documentPreview, setDocumentPreview] = useState(null);
    const [pdfPreview, setPdfPreview] = useState(null);

    useEffect(() => {
        let active = true;

        Promise.all([api.get('/profile'), api.get('/applications')])
            .then(([profileRes, applicationRes]) => {
                if (!active) return;
                setPayload(profileRes.data);
                setApplication(rows(applicationRes.data).find(isSubmittedApplication) || null);
            })
            .catch((err) => {
                if (active) setActionError(errorMessage(err));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    const closeDocumentPreview = () => {
        if (documentPreview?.url) URL.revokeObjectURL(documentPreview.url);
        setDocumentPreview(null);
    };
    const closePdfPreview = () => {
        if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
        setPdfPreview(null);
    };
    const viewDocument = async (document) => {
        setActionError('');
        try {
            const response = await api.get(`/documents/${document.id}?disposition=inline`, { responseType: 'blob' });
            setDocumentPreview({
                title: document.label || document.original_name || 'Document',
                url: URL.createObjectURL(response.data),
                mime: response.data.type || document.mime_type,
            });
        } catch (err) {
            setActionError(errorMessage(err));
        }
    };
    const previewSlip = async () => {
        if (!application) return;
        setActionError('');
        try {
            const blob = await applicationSlipBlob(application);
            setPdfPreview({
                title: applicationSlipFileName(application),
                url: URL.createObjectURL(blob),
                application,
            });
        } catch (err) {
            setActionError(errorMessage(err));
        }
    };
    const downloadSlip = async () => {
        if (!application) return;
        setActionError('');
        try {
            await downloadApplicationSlip(application);
        } catch (err) {
            setActionError(errorMessage(err));
        }
    };

    if (loading) {
        return <DashboardShell><div className="card">Loading application preview...</div></DashboardShell>;
    }

    if (!application) {
        return <DashboardShell>
            <div className="application-preview-empty">
                <FileText size={34} />
                <div>
                    <h1>Application preview unavailable</h1>
                    <p className="muted">This page becomes available after you submit an application.</p>
                </div>
                <Link className="btn primary" to="/apply"><FileText size={18} /> Continue Application</Link>
            </div>
        </DashboardShell>;
    }

    const profile = payload.profile || application.user?.profile || {};
    const vacancy = application.vacancy || {};
    const education = (payload.education || []).filter(hasEntry);
    const olevels = (payload.olevels || []).filter(hasEntry);
    const experience = (payload.experience || []).filter(hasEntry);
    const certifications = (payload.certifications || []).filter(hasEntry);
    const applicantName = fullName(profile);
    const applicantLocation = [profile.state_of_origin].filter(present).join(', ');

    return <DashboardShell>
        <div className="application-preview-page">
            <section className="application-preview-hero">
                <div>
                    <span className={`badge ${statusClass(application.status)}`}>{application.status}</span>
                    <h1>Application Preview</h1>
                    <p>Review the submitted application exactly as the recruitment office receives it.</p>
                </div>
                <div className="inline-actions">
                    <button className="btn" type="button" onClick={previewSlip}><Eye size={16} /> Preview Slip</button>
                    <button className="btn primary" type="button" onClick={downloadSlip}><Download size={16} /> Download PDF</button>
                </div>
            </section>

            {actionError && <div className="error">{actionError}</div>}

            <div className="application-preview-stat-grid">
                <div><span>Application Number</span><strong>{application.application_number}</strong></div>
                <div><span>Submitted</span><strong>{fmt(application.submitted_at)}</strong></div>
                <div><span>Vacancy</span><strong>{vacancy.title || 'Not provided'}</strong></div>
                <div><span>Department</span><strong>{vacancy.department?.name || 'General'}</strong></div>
            </div>

            <div className="application-preview-layout">
                <aside className="application-preview-identity">
                    <PassportAvatar user={{ profile }} initials={applicantName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()} />
                    <div>
                        <h2>{applicantName}</h2>
                    </div>
                    <div className="application-preview-contact-list">
                        <span><Mail size={15} /> {profile.email || application.user?.email || 'Email not provided'}</span>
                        <span><Phone size={15} /> {profile.phone || application.user?.phone || 'Phone not provided'}</span>
                        <span><MapPin size={15} /> {applicantLocation || 'Location not provided'}</span>
                    </div>
                </aside>

                <div className="application-preview-content">
                    <PreviewSection title="Applicant Information" icon={UsersRound}>
                        <PreviewInfoGrid items={[
                            ['Gender', profile.gender],
                            ['Date of birth', profile.date_of_birth ? fmt(profile.date_of_birth) : ''],
                            ['Nationality', profile.nationality],
                            ['State of origin', profile.state_of_origin],
                            ['Local government', profile.local_government],
                            ['Address', profile.address],
                        ]} />
                    </PreviewSection>

                    <PreviewSection title="Vacancy Details" icon={BriefcaseBusiness}>
                        <PreviewInfoGrid items={[
                            ['Position', vacancy.title],
                            ['Staff category', vacancy.staff_category],
                            ['Rank / grade', vacancy.rank_or_grade],
                            ['Employment type', vacancy.employment_type],
                            ['Faculty', vacancy.department?.faculty?.name],
                            ['Cover letter', application.cover_letter],
                        ]} />
                    </PreviewSection>

                    <PreviewSection title="Qualifications" icon={GraduationCap}>
                        <div className="application-preview-list">
                            {education.length ? education.map((item, index) => (
                                <article key={item.id || index}>
                                    <h3>{[item.qualification, item.field_of_study].filter(present).join(' in ') || 'Qualification'}</h3>
                                    <p>{[item.institution, item.start_year && item.end_year ? `${item.start_year} - ${item.end_year}` : '', item.cgpa ? `CGPA ${item.cgpa}/${item.scale || '-'}` : '', item.class_of_degree].filter(present).join(' · ')}</p>
                                </article>
                            )) : <p className="muted">No education records were provided.</p>}
                            {olevels.length ? olevels.map((item, index) => (
                                <article key={item.id || index}>
                                    <h3>{[item.exam_type, item.exam_year].filter(present).join(' ') || "O'Level Result"}</h3>
                                    <p>{[item.school_name, item.exam_number, `${(item.subjects || []).filter((row) => row.subject && row.grade).length} subject(s)`].filter(present).join(' · ')}</p>
                                </article>
                            )) : <p className="muted">No O'Level records were provided.</p>}
                        </div>
                    </PreviewSection>

                    <PreviewSection title="Experience & Certifications" icon={ClipboardCheck}>
                        <div className="application-preview-list two-column">
                            {experience.length ? experience.map((item, index) => (
                                <article key={item.id || index}>
                                    <h3>{item.position || 'Work experience'}</h3>
                                    <p>{[item.organization, item.start_date ? fmt(item.start_date) : '', item.is_current ? 'Current' : item.end_date ? fmt(item.end_date) : ''].filter(present).join(' · ')}</p>
                                </article>
                            )) : <p className="muted">No work experience records were provided.</p>}
                            {certifications.length ? certifications.map((item, index) => (
                                <article key={item.id || index}>
                                    <h3>{item.name || 'Certification'}</h3>
                                    <p>{[item.issuer, item.issued_at ? fmt(item.issued_at) : '', item.expires_at ? `Expires ${fmt(item.expires_at)}` : ''].filter(present).join(' · ')}</p>
                                </article>
                            )) : <p className="muted">No certifications were provided.</p>}
                        </div>
                    </PreviewSection>

                    <PreviewSection title="Submitted Documents" icon={Upload}>
                        {application.documents?.length ? (
                            <div className="application-preview-documents">
                                {application.documents.map((document) => (
                                    <div key={document.id}>
                                        <span><FileText size={16} /></span>
                                        <div>
                                            <strong>{document.label || document.original_name || 'Document'}</strong>
                                            <p>{document.original_name || document.mime_type || 'Uploaded file'}</p>
                                        </div>
                                        <button className="btn" type="button" onClick={() => viewDocument(document)}><Eye size={16} /> View</button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="muted">No documents were attached.</p>}
                    </PreviewSection>
                </div>
            </div>
        </div>

        {documentPreview && (
            <Modal title={documentPreview.title} wide onClose={closeDocumentPreview}>
                {documentPreview.mime?.startsWith('image/') ? (
                    <img className="document-preview-image" src={documentPreview.url} alt={documentPreview.title} />
                ) : (
                    <iframe className="document-preview-frame" src={documentPreview.url} title={documentPreview.title} />
                )}
            </Modal>
        )}
        {pdfPreview && (
            <Modal title={pdfPreview.title} wide onClose={closePdfPreview} actions={<button className="btn primary" type="button" onClick={downloadSlip}><Download size={16} /> Download PDF</button>}>
                <iframe className="document-preview-frame" src={pdfPreview.url} title={pdfPreview.title} />
            </Modal>
        )}
    </DashboardShell>;
}

function CollectionEditor({ title, items = [], setItems, template, requiredKeys = [], fieldOptions = {} }) {
    const updateItem = (index, key, value) => {
        setItems(items.map((row, i) => i === index ? { ...row, [key]: value } : row));
    };

    return (
        <div className="collection">
            <div className="toolbar">
                <h3>{title}</h3>
                <button type="button" className="btn" onClick={() => setItems([...(items || []), { ...template }])}><Plus size={16} /> Add</button>
            </div>
            {!items.length && <div className="empty compact">No entries yet.</div>}
            {(items || []).map((item, index) => (
                <div className="collection-row card" key={item.id || index}>
                    <div className="toolbar compact-toolbar">
                        <strong>{title} #{index + 1}</strong>
                        <button type="button" className="btn icon" title="Remove" onClick={() => setItems(items.filter((_, i) => i !== index))}><Trash2 size={16} /></button>
                    </div>
                    <div className="grid cols-3">
                        {Object.keys(template).map((key) => (
                            <Field
                                key={key}
                                label={fieldLabel(key)}
                                type={typeof template[key] === 'boolean' ? 'checkbox' : key.includes('date') ? 'date' : key.includes('year') || key === 'cgpa' ? 'number' : 'text'}
                                as={fieldOptions[key] ? 'select' : key === 'responsibilities' ? 'textarea' : 'input'}
                                value={item[key]}
                                options={fieldOptions[key] || []}
                                required={requiredKeys.includes(key)}
                                onChange={(v) => updateItem(index, key, v)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function OLevelEditor({ items = [], setItems }) {
    const updateResult = (index, key, value) => {
        setItems(items.map((item, i) => i === index ? { ...item, [key]: value } : item));
    };
    const updateSubject = (resultIndex, subjectIndex, key, value) => {
        setItems(items.map((item, i) => {
            if (i !== resultIndex) return item;

            const subjects = (item.subjects || []).map((row, rowIndex) => (
                rowIndex === subjectIndex ? { ...row, [key]: value } : row
            ));

            return { ...item, subjects };
        }));
    };
    const addSubject = (resultIndex) => {
        setItems(items.map((item, i) => {
            if (i !== resultIndex) return item;
            const subjects = item.subjects?.length ? item.subjects : [];
            if (subjects.length >= 9) return item;
            return { ...item, subjects: [...subjects, { subject: '', grade: '' }] };
        }));
    };
    const removeSubject = (resultIndex, subjectIndex) => {
        setItems(items.map((item, i) => {
            if (i !== resultIndex) return item;
            return { ...item, subjects: (item.subjects || []).filter((_, rowIndex) => rowIndex !== subjectIndex) };
        }));
    };
    const addResult = () => {
        if ((items || []).length >= 2) return;
        setItems([...(items || []), oLevelTemplate()]);
    };

    return (
        <div className="collection">
            <div className="toolbar">
                <h3>O'Level Results</h3>
                <button type="button" className="btn" disabled={(items || []).length >= 2} onClick={addResult}><Plus size={16} /> Add Result</button>
            </div>
            {(items || []).map((item, index) => {
                const subjects = item.subjects || [];
                const selectedSubjects = subjects.map((row) => row.subject).filter(Boolean);

                return (
                    <div className="collection-row card" key={item.id || index}>
                        <div className="toolbar compact-toolbar">
                            <strong>O'Level Result #{index + 1}</strong>
                            <button type="button" className="btn icon" title="Remove" disabled={(items || []).length <= 1} onClick={() => setItems(items.filter((_, i) => i !== index))}><Trash2 size={16} /></button>
                        </div>
                        <div className="olevel-meta-grid">
                            <Field label="School name" required value={item.school_name} onChange={(value) => updateResult(index, 'school_name', value)} />
                            <Field label="Exam number" required value={item.exam_number} onChange={(value) => updateResult(index, 'exam_number', value)} />
                            <Field as="select" label="Year" required value={item.exam_year} options={oLevelYears} onChange={(value) => updateResult(index, 'exam_year', value)} />
                            <Field as="select" label="Type" required value={item.exam_type} options={oLevelExamTypes} onChange={(value) => updateResult(index, 'exam_type', value)} />
                        </div>
                        <div className="table-wrap olevel-table-wrap">
                            <table className="olevel-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Grade</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.length ? subjects.map((row, subjectIndex) => (
                                        <tr key={subjectIndex}>
                                            <td>
                                                <select className="select" required value={row.subject} onChange={(event) => updateSubject(index, subjectIndex, 'subject', event.target.value)}>
                                                    <option value="">Select Subject</option>
                                                    {oLevelSubjects.map((subject) => (
                                                        <option key={subject} value={subject} disabled={selectedSubjects.includes(subject) && subject !== row.subject}>{subject}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <select className="select" required value={row.grade} onChange={(event) => updateSubject(index, subjectIndex, 'grade', event.target.value)}>
                                                    <option value="">Select Grade</option>
                                                    {oLevelGrades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <button className="btn danger" type="button" onClick={() => removeSubject(index, subjectIndex)}>Remove</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3"><span className="muted">No subjects added yet. Click Add Subject to begin.</span></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="inline-actions">
                            <button className="btn" type="button" disabled={subjects.length >= 9} onClick={() => addSubject(index)}><Plus size={16} /> Add Subject</button>
                            <span className="muted">{subjects.length}/9 subjects</span>
                        </div>
                    </div>
                );
            })}
            {!items.length && <div className="empty compact">Add at least one O'Level result.</div>}
        </div>
    );
}

function VacancyList() {
    const { hasRole } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const endpoint = hasRole('super_admin') || hasRole('hr_admin') ? '/admin/vacancies' : '/vacancies';

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            api.get(endpoint, { params: { search: searchTerm } })
                .then(({ data }) => setItems(rows(data)))
                .catch(() => {})
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [endpoint, searchTerm]);

    if (hasRole('super_admin') || hasRole('hr_admin')) {
        return <VacancyManager items={items} setItems={setItems} searchTerm={searchTerm} onSearchChange={setSearchTerm} />;
    }

    return <DashboardShell>
        <div className="toolbar">
            <h1>{hasRole('applicant') ? 'Available Vacancies' : 'Vacancies'}</h1>
            <div className="header-actions">
                <div className="queue-search" style={{ margin: 0, width: '280px' }}>
                    <Search size={16} />
                    <input
                        type="search"
                        value={searchTerm}
                        placeholder="Search by title..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {hasRole('applicant') && <Link className="btn primary" to="/apply"><FileText size={18} /> Start Application</Link>}
            </div>
        </div>
        <div className="grid cols-3 responsive-grid">
            {loading ? (
                Array.from({ length: 6 }).map((_, i) => <VacancySkeleton key={i} />)
            ) : (
                items.map((vacancy) => <VacancyCard key={vacancy.id} vacancy={vacancy} />)
            )}
        </div>
    </DashboardShell>;
}

function VacancyManager({ items, setItems, searchTerm, onSearchChange }) {
    const [lookups, setLookups] = useState({ faculties: [], departments: [], document_types: [], academic_ranks: [], non_academic_categories: [] });
    const [form, setForm] = useState(emptyVacancy);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { api.get('/lookups').then(({ data }) => setLookups(data)).catch(() => {}); }, []);

    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const refresh = () => api.get('/admin/vacancies').then(({ data }) => setItems(rows(data)));
    const edit = (vacancy) => {
        setEditingId(vacancy.id);
        setForm({
            ...emptyVacancy,
            ...vacancy,
            faculty_id: vacancy.faculty_id || '',
            department_id: vacancy.department_id || '',
            unit_id: vacancy.unit_id || '',
            vacant_positions: vacancy.vacant_positions || 1,
            requirements: vacancy.requirements?.length ? vacancy.requirements : [''],
            required_documents: vacancy.required_documents || [],
            start_date: dateValue(vacancy.start_date),
            deadline: dateValue(vacancy.deadline),
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const reset = () => {
        setEditingId(null);
        setForm(emptyVacancy);
        setError('');
        setMessage('');
    };
    const save = async (status = form.status) => {
        setError('');
        setMessage('');
        const payload = {
            ...form,
            status,
            faculty_id: form.faculty_id || null,
            department_id: form.department_id || null,
            unit_id: form.unit_id || null,
            vacant_positions: Number(form.vacant_positions || 1),
            requirements: (form.requirements || []).map((item) => item.trim()).filter(Boolean),
            required_documents: form.required_documents || [],
        };
        try {
            if (editingId) {
                await api.put(`/admin/vacancies/${editingId}`, payload);
            } else {
                await api.post('/admin/vacancies', payload);
            }
            await refresh();
            setMessage(status === 'published' ? 'Vacancy advert published.' : 'Vacancy advert saved.');
            reset();
        } catch (err) {
            setError(errorMessage(err));
        }
    };
    const publishExisting = async (vacancy) => {
        setError('');
        setMessage('');
        try {
            await api.put(`/admin/vacancies/${vacancy.id}`, {
                ...vacancy,
                status: 'published',
                faculty_id: vacancy.faculty_id || null,
                department_id: vacancy.department_id || null,
                unit_id: vacancy.unit_id || null,
                vacant_positions: Number(vacancy.vacant_positions || 1),
                requirements: vacancy.requirements || [],
                required_documents: vacancy.required_documents || [],
                start_date: dateValue(vacancy.start_date),
                deadline: dateValue(vacancy.deadline),
            });
            await refresh();
            setMessage('Vacancy advert published.');
        } catch (err) {
            setError(errorMessage(err));
        }
    };

    return (
        <DashboardShell>
            <div className="toolbar">
                <h1>Vacancy Advert Management</h1>
                <div className="header-actions">
                    <div className="queue-search" style={{ margin: 0, width: '280px' }}>
                        <Search size={16} />
                        <input
                            type="search"
                            value={searchTerm}
                            placeholder="Search adverts..."
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <button className="btn" onClick={reset}>New Advert</button>
                </div>
            </div>
            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}
            <div className="grid cols-2 vacancy-admin-grid">
                <div className="card form">
                    <div className="toolbar"><h2>{editingId ? 'Edit Advert' : 'Create Advert'}</h2><span className={`badge ${form.status === 'published' ? 'green' : 'gold'}`}>{form.status}</span></div>
                    <Field label="Job title" required value={form.title} onChange={(value) => update('title', value)} />
                    <div className="grid cols-2">
                        <Field as="select" label="Faculty" value={form.faculty_id} options={lookups.faculties.map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => update('faculty_id', value)} />
                        <Field as="select" label="Department / Unit" value={form.department_id} options={lookups.departments.map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => update('department_id', value)} />
                        <Field as="select" label="Staff category" required value={form.staff_category} options={['Academic', 'Non-Academic']} onChange={(value) => update('staff_category', value)} />
                        <Field as="select" label="Rank / category" value={form.rank_or_grade} options={form.staff_category === 'Academic' ? lookups.academic_ranks : lookups.non_academic_categories} onChange={(value) => update('rank_or_grade', value)} />
                        <Field label="Employment type" required value={form.employment_type} onChange={(value) => update('employment_type', value)} />
                        <Field label="Vacant positions" type="number" required value={form.vacant_positions} onChange={(value) => update('vacant_positions', value)} />
                        <Field label="Application start date" type="date" required value={form.start_date} onChange={(value) => update('start_date', value)} />
                        <Field label="Application deadline" type="date" required value={form.deadline} onChange={(value) => update('deadline', value)} />
                    </div>
                    <Field label="Minimum qualification" required value={form.minimum_qualification} onChange={(value) => update('minimum_qualification', value)} />
                    <RequirementsEditor items={form.requirements || []} setItems={(items) => update('requirements', items)} />
                    <DocumentChecklist documentTypes={lookups.document_types || []} selected={form.required_documents || []} onChange={(selected) => update('required_documents', selected)} />
                    <Field as="textarea" label="Job description" required value={form.job_description} onChange={(value) => update('job_description', value)} />
                    <Field as="textarea" label="Eligibility criteria" value={form.eligibility_criteria} onChange={(value) => update('eligibility_criteria', value)} />
                    <Field as="select" label="Advert status" value={form.status} options={['draft', 'published', 'unpublished', 'closed']} onChange={(value) => update('status', value)} />
                    <div className="inline-actions">
                        <button className="btn" type="button" onClick={() => save(form.status)}>Save Advert</button>
                        <button className="btn green" type="button" onClick={() => save('published')}>Publish Advert</button>
                    </div>
                </div>
                <div className="card">
                    <div className="toolbar"><h2>Published and Draft Adverts</h2><span className="badge">{items.length} adverts</span></div>
                    <div className="advert-list">
                        {items.map((vacancy) => (
                            <div className="advert-item" key={vacancy.id}>
                                <div>
                                    <span className={`badge ${vacancy.status === 'published' ? 'green' : vacancy.status === 'closed' ? 'red' : 'gold'}`}>{vacancy.status}</span>
                                    <h3>{vacancy.title}</h3>
                                    <p className="muted">{vacancy.department?.name || 'General'} · {vacancy.vacant_positions || 1} position(s) · {vacancy.applications_count || 0} applicant(s)</p>
                                </div>
                                <div className="inline-actions">
                                    <button className="btn" type="button" onClick={() => edit(vacancy)}>Edit</button>
                                    {vacancy.status !== 'published' && <button className="btn green" type="button" onClick={() => publishExisting(vacancy)}>Publish</button>}
                                </div>
                            </div>
                        ))}
                        {!items.length && <div className="empty compact">No vacancy adverts yet.</div>}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

function RequirementsEditor({ items, setItems }) {
    return (
        <div className="collection">
            <div className="toolbar compact-toolbar">
                <h3>Requirements</h3>
                <button className="btn" type="button" onClick={() => setItems([...(items || []), ''])}><Plus size={16} /> Add</button>
            </div>
            {(items || ['']).map((item, index) => (
                <div className="requirement-row" key={index}>
                    <Field label={`Requirement ${index + 1}`} value={item} onChange={(value) => setItems(items.map((current, i) => i === index ? value : current))} />
                    <button className="btn icon" type="button" onClick={() => setItems(items.filter((_, i) => i !== index))}><Trash2 size={16} /></button>
                </div>
            ))}
        </div>
    );
}

function DocumentChecklist({ documentTypes, selected, onChange }) {
    const toggle = (name) => {
        onChange(selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name]);
    };

    return (
        <div className="field">
            <span>Required documents</span>
            <div className="check-grid">
                {documentTypes.map((type) => (
                    <label className="check-item" key={type.id}>
                        <input type="checkbox" checked={selected.includes(type.name)} onChange={() => toggle(type.name)} />
                        <span>{type.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function ApplicationWizard() {
    const auth = useAuth();
    const params = new URLSearchParams(location.search);
    const [step, setStep] = useState(0);
    const [vacancies, setVacancies] = useState([]);
    const [lookups, setLookups] = useState({ document_types: [] });
    const [payload, setPayload] = useState({ profile: {}, education: [], olevels: [], experience: [], certifications: [] });
    const [form, setForm] = useState({ vacancy_id: params.get('vacancy') || '', cover_letter: '' });
    const [documents, setDocuments] = useState([{ label: 'CV', document_type_id: '', file: null }]);
    const [documentPreview, setDocumentPreview] = useState(null);
    const [declarationAccepted, setDeclarationAccepted] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [recaptchaResetKey, setRecaptchaResetKey] = useState(0);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [passportFile, setPassportFile] = useState(null);
    const [passportUploading, setPassportUploading] = useState(false);
    const [locationOptions, setLocationOptions] = useState({ countries: [], states: [], localGovernments: [] });
    const [locationLoading, setLocationLoading] = useState({ countries: false, states: false, localGovernments: false });
    const [locationError, setLocationError] = useState('');
    const steps = ['Personal', 'Contact', 'Education', 'Experience', 'Certifications', 'Documents', 'Vacancy', 'Preview'];
    const selectedVacancy = vacancies.find((vacancy) => String(vacancy.id) === String(form.vacancy_id));
    const handleRecaptchaVerify = useCallback((token) => setRecaptchaToken(token), []);
    const handleRecaptchaExpire = useCallback(() => setRecaptchaToken(''), []);
    const resetRecaptcha = useCallback(() => {
        setRecaptchaToken('');
        setRecaptchaResetKey((current) => current + 1);
    }, []);

    useEffect(() => {
        Promise.all([api.get('/profile'), api.get('/vacancies'), api.get('/lookups'), api.get('/applications')])
            .then(([profileRes, vacancyRes, lookupRes, applicationRes]) => {
                const profile = profileRes.data.profile || {};
                const wizardPayload = profile.application_wizard_payload || {};
                const draft = rows(applicationRes.data).find((application) => application.status === 'Draft') || rows(applicationRes.data)[0];
                const vacancyId = params.get('vacancy') || wizardPayload.vacancy_id || draft?.vacancy_id || '';
                setPayload({
                    profile,
                    education: profileRes.data.education?.length ? profileRes.data.education : [{ ...educationTemplate }],
                    olevels: profileRes.data.olevels?.length ? profileRes.data.olevels : [oLevelTemplate()],
                    experience: profileRes.data.experience || [],
                    certifications: profileRes.data.certifications || [],
                });
                setVacancies(rows(vacancyRes.data));
                setLookups(lookupRes.data);
                setForm({
                    vacancy_id: vacancyId,
                    cover_letter: wizardPayload.cover_letter || draft?.cover_letter || '',
                });
                setDeclarationAccepted(Boolean(wizardPayload.declaration_accepted || draft?.submitted_at));
                setDocuments((draft?.documents?.length ? draft.documents : wizardPayload.documents)?.map((document) => ({
                    id: document.id,
                    label: document.label || document.original_name || 'Document',
                    document_type_id: document.document_type_id || '',
                    file: null,
                    uploaded: Boolean(document.id || document.uploaded),
                    original_name: document.original_name,
                    error: '',
                })) || [{ label: 'CV', document_type_id: '', file: null, error: '' }]);
                setStep(Math.min(7, Math.max(0, Number(profile.application_wizard_step || 0))));
            })
            .catch((err) => setError(errorMessage(err)));
    }, []);

    useEffect(() => {
        let active = true;
        setLocationLoading((current) => ({ ...current, countries: true }));
        api.get('/locations/countries')
            .then(({ data }) => {
                if (active) setLocationOptions((current) => ({ ...current, countries: data || [] }));
                if (active) setLocationError('');
            })
            .catch(() => {
                if (active) setLocationError('Location lists could not be loaded. You can still type values manually if needed.');
            })
            .finally(() => {
                if (active) setLocationLoading((current) => ({ ...current, countries: false }));
            });

        return () => { active = false; };
    }, []);

    useEffect(() => {
        const country = payload.profile?.nationality;
        if (!country) {
            setLocationOptions((current) => ({ ...current, states: [], localGovernments: [] }));
            return;
        }

        let active = true;
        setLocationLoading((current) => ({ ...current, states: true }));
        setLocationOptions((current) => ({ ...current, states: [], localGovernments: [] }));
        api.get('/locations/states', { params: { country } })
            .then(({ data }) => {
                if (!active) return;
                const states = data || [];
                setLocationOptions((current) => ({ ...current, states }));
                setLocationError('');
                const currentState = payload.profile?.state_of_origin || '';
                const matchedState = canonicalState(states, currentState);
                if (currentState && matchedState && matchedState !== currentState) {
                    setPayload((current) => ({
                        ...current,
                        profile: { ...current.profile, state_of_origin: matchedState },
                    }));
                }
            })
            .catch(() => {
                if (active) setLocationError('State list could not be loaded for the selected country.');
            })
            .finally(() => {
                if (active) setLocationLoading((current) => ({ ...current, states: false }));
            });

        return () => { active = false; };
    }, [payload.profile?.nationality]);

    useEffect(() => {
        const country = payload.profile?.nationality;
        const selectedState = payload.profile?.state_of_origin;
        const stateForLookup = canonicalState(locationOptions.states, selectedState || '') || selectedState;

        if (!country || !stateForLookup) {
            setLocationOptions((current) => ({ ...current, localGovernments: [] }));
            return;
        }

        let active = true;
        setLocationLoading((current) => ({ ...current, localGovernments: true }));
        setLocationOptions((current) => ({ ...current, localGovernments: [] }));
        api.get('/locations/local-governments', { params: { country, state: stateForLookup } })
            .then(({ data }) => {
                if (active) setLocationOptions((current) => ({ ...current, localGovernments: data || [] }));
                if (active) setLocationError('');
            })
            .catch(() => {
                if (active) setLocationError('Local government list could not be loaded for the selected state.');
            })
            .finally(() => {
                if (active) setLocationLoading((current) => ({ ...current, localGovernments: false }));
            });

        return () => { active = false; };
    }, [payload.profile?.nationality, payload.profile?.state_of_origin, locationOptions.states]);

    const updateProfile = (key, value) => setPayload({ ...payload, profile: { ...payload.profile, [key]: value } });
    const updateNationality = (nationality) => setPayload({
        ...payload,
        profile: { ...payload.profile, nationality, state_of_origin: '', local_government: '' },
    });
    const updateStateOfOrigin = (state_of_origin) => setPayload({
        ...payload,
        profile: { ...payload.profile, state_of_origin, local_government: '' },
    });
    const uploadPassport = async (file) => {
        if (!file) return;

        setPassportUploading(true);
        try {
            const data = new FormData();
            data.append('passport', file);
            const response = await api.post('/profile/passport', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            setPayload((current) => ({ ...current, profile: response.data.profile || current.profile }));
            await auth.refreshUser?.();
            setPassportFile(null);
            return response.data.profile;
        } catch (err) {
            setError(errorMessage(err));
            throw err;
        } finally {
            setPassportUploading(false);
        }
    };
    const wizardPayload = () => ({
        vacancy_id: form.vacancy_id,
        cover_letter: form.cover_letter,
        declaration_accepted: declarationAccepted,
        documents: documents.map((document) => ({
            id: document.id,
            label: document.label,
            document_type_id: document.document_type_id,
            uploaded: document.uploaded,
            original_name: document.original_name || document.file?.name,
        })),
    });
    const saveProfile = (nextStep, profileOverride = payload.profile) => api.put('/profile', {
        education: normalizeCollection(payload.education, educationTemplate),
        olevels: normalizeOLevels(payload.olevels),
        experience: normalizeCollection(payload.experience, experienceTemplate),
        certifications: normalizeCollection(payload.certifications, certificationTemplate),
        profile: {
            ...profileOverride,
            application_wizard_step: nextStep,
            application_wizard_payload: wizardPayload(),
        },
    });
    const collectionHasIncompleteRows = (items = [], requiredKeys = []) => items.some((item) => hasEntry(item) && requiredKeys.some((key) => !present(item[key])));
    const validateStep = (targetStep = step) => {
        const profile = payload.profile || {};
        const educationRows = (payload.education || []).filter(hasEntry);
        const oLevelRows = payload.olevels || [];
        const experienceRows = payload.experience || [];
        const certificationRows = payload.certifications || [];
        const attachedDocuments = documents.filter((document) => document.file || document.id || document.uploaded);

        if (targetStep === 0) {
            const missing = [
                ['first name', profile.first_name],
                ['last name', profile.last_name],
                ['passport photograph', profile.passport_path || passportFile],
                ['gender', profile.gender],
                ['date of birth', profile.date_of_birth],
                ['nationality', profile.nationality],
                ['state of origin', profile.state_of_origin],
                ['local government', profile.local_government],
            ].filter(([, value]) => !present(value)).map(([label]) => label);

            if (missing.length) return { valid: false, step: 0, message: `Complete personal information: ${missing.join(', ')}.` };
        }

        if (targetStep === 1) {
            const missing = [
                ['address', profile.address],
            ].filter(([, value]) => !present(value)).map(([label]) => label);

            if (missing.length) return { valid: false, step: 1, message: `Complete contact information: ${missing.join(', ')}.` };
        }

        if (targetStep === 2) {
            if (!educationRows.length) return { valid: false, step: 2, message: 'Add at least one educational qualification.' };
            if (collectionHasIncompleteRows(educationRows, ['institution', 'qualification', 'scale', 'cgpa', 'class_of_degree'])) {
                return { valid: false, step: 2, message: 'Complete institution, qualification, scale, CGPA, and class of degree for every education entry.' };
            }

            if (!oLevelRows.length) return { valid: false, step: 2, message: 'Add at least one O-Level result.' };
            if (oLevelRows.length > 2) return { valid: false, step: 2, message: 'You can add a maximum of two O-Level results.' };
            for (const result of oLevelRows) {
                if (!present(result.school_name) || !present(result.exam_number) || !present(result.exam_year) || !present(result.exam_type)) {
                    return { valid: false, step: 2, message: 'Complete O-Level school name, exam number, year, and exam type.' };
                }
                if ((result.subjects || []).length !== 9) {
                    return { valid: false, step: 2, message: 'Each O-Level result must contain exactly 9 subjects.' };
                }
                if ((result.subjects || []).some((row) => !present(row.subject) || !present(row.grade))) {
                    return { valid: false, step: 2, message: 'Select subject and grade for all 9 O-Level subjects.' };
                }
                const subjects = result.subjects.map((row) => row.subject);
                if (new Set(subjects).size !== subjects.length) {
                    return { valid: false, step: 2, message: 'O-Level subjects must not be duplicated within the same result.' };
                }
            }
        }

        if (targetStep === 3 && collectionHasIncompleteRows(experienceRows, ['organization', 'position'])) {
            return { valid: false, step: 3, message: 'Complete the organization and position for every work experience entry, or remove incomplete entries.' };
        }

        if (targetStep === 4 && collectionHasIncompleteRows(certificationRows, ['name'])) {
            return { valid: false, step: 4, message: 'Complete the name for every certification entry, or remove incomplete entries.' };
        }

        if (targetStep === 5) {
            if (!attachedDocuments.length) return { valid: false, step: 5, message: 'Upload at least one required document before continuing.' };
            const incompleteDocument = documents.find((document) => (document.file || document.id || document.uploaded) && !present(document.document_type_id));
            if (incompleteDocument) return { valid: false, step: 5, message: 'Select a document type for every uploaded document.' };

            const hasFileError = documents.some(document => document.error);
            if (hasFileError) return { valid: false, step: 5, message: 'Please resolve document upload errors before continuing.' };
        }

        if (targetStep === 6 && !present(form.vacancy_id)) {
            return { valid: false, step: 6, message: 'Select a vacancy before continuing.' };
        }

        if (targetStep === 7) {
            if (!declarationAccepted) return { valid: false, step: 7, message: 'Confirm the declaration before submitting your application.' };
            if (captchaEnabled && !recaptchaToken) return { valid: false, step: 7, message: 'Complete the captcha verification before submitting your application.' };
        }

        return { valid: true };
    };
    const validateThrough = (targetStep) => {
        for (let index = 0; index <= targetStep; index += 1) {
            const result = validateStep(index);
            if (!result.valid) return result;
        }

        return { valid: true };
    };
    const showValidationError = (result) => {
        setError(result.message);
        setMessage('');
        if (Number.isInteger(result.step)) setStep(result.step);
    };
    const goToStep = (targetStep) => {
        setError('');
        setMessage('');
        if (targetStep <= step) {
            setStep(targetStep);
            return;
        }

        const result = validateThrough(targetStep - 1);
        if (!result.valid) {
            showValidationError(result);
            return;
        }

        setStep(targetStep);
    };
    const uploadDocuments = async (applicationId) => {
        const uploaded = [];
        const toUpload = documents.map((doc, index) => ({ doc, index })).filter(item => item.doc.file);
        for (const { doc: document, index } of toUpload) {
            const data = new FormData();
            data.append('label', document.label || document.file.name);
            if (document.document_type_id) data.append('document_type_id', document.document_type_id);
            data.append('file', document.file);
            const response = await api.post(`/applications/${applicationId}/documents`, data, { 
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setDocuments(current => current.map((d, i) => i === index ? { ...d, progress: percent } : d));
                }
            });
            uploaded.push({ localName: document.file.name, saved: response.data });
        }
        if (uploaded.length) {
            setDocuments((current) => current.map((document) => {
                const match = uploaded.find((item) => item.localName === document.file?.name);
                return match ? { ...document, ...match.saved, file: null, uploaded: true, progress: 100 } : document;
            }));
            await auth.refreshUser?.();
        }
    };
    const closeDocumentPreview = () => {
        if (documentPreview?.revokeUrl) URL.revokeObjectURL(documentPreview.url);
        setDocumentPreview(null);
    };
    const viewDocument = async (document) => {
        const title = document.label || document.original_name || document.file?.name || 'Document';
        if (document.file) {
            setDocumentPreview({
                title,
                url: URL.createObjectURL(document.file),
                mime: document.file.type,
                revokeUrl: true,
            });
            return;
        }

        if (!document.id) return;

        const response = await api.get(`/documents/${document.id}?disposition=inline`, { responseType: 'blob' });
        setDocumentPreview({
            title,
            url: URL.createObjectURL(response.data),
            mime: response.data.type || document.mime_type,
            revokeUrl: true,
        });
    };

    const persistStep = async (nextStep, final = false) => {
        setError('');
        setMessage('');

        const validation = final ? validateThrough(7) : validateThrough(Math.max(0, nextStep - 1));
        if (!validation.valid) {
            showValidationError(validation);
            return;
        }

        setSaving(true);
        try {
            let profileForSave = payload.profile;
            if (nextStep > 0 && passportFile) {
                const uploadedProfile = await uploadPassport(passportFile);
                if (uploadedProfile) profileForSave = uploadedProfile;
            }
            await saveProfile(nextStep, profileForSave);
            let response = null;
            if (form.vacancy_id) {
                if (final && documents.some((document) => document.file)) {
                    response = await api.post('/applications', { ...form, submit: false, wizard_step: nextStep, declaration_accepted: false });
                    await uploadDocuments(response.data.id);
                    response = await api.post('/applications', {
                        ...form,
                        submit: true,
                        wizard_step: nextStep,
                        declaration_accepted: declarationAccepted,
                        ...(captchaEnabled ? { g_recaptcha_response: recaptchaToken } : {}),
                    });
                } else {
                    response = await api.post('/applications', {
                        ...form,
                        submit: final,
                        wizard_step: nextStep,
                        declaration_accepted: final ? declarationAccepted : false,
                        ...(final && captchaEnabled ? { g_recaptcha_response: recaptchaToken } : {}),
                    });
                    if (documents.some((document) => document.file)) await uploadDocuments(response.data.id);
                }
            }
            setPayload((current) => ({
                ...current,
                profile: {
                    ...current.profile,
                    application_wizard_step: nextStep,
                    application_wizard_payload: wizardPayload(),
                },
            }));
            setMessage(response?.data?.application_number ? `${final ? 'Submitted' : 'Progress saved'}: ${response.data.application_number}` : 'Progress saved.');
            setConfirmSubmit(false);
            if (final) resetRecaptcha();
            setStep(nextStep);
        } catch (err) {
            setError(errorMessage(err));
            if (final) resetRecaptcha();
        } finally {
            setSaving(false);
        }
    };

    const saveAndContinue = () => persistStep(Math.min(step + 1, 7));
    const submit = () => {
        setError('');
        const validation = validateThrough(7);
        if (!validation.valid) {
            showValidationError(validation);
            return;
        }
        setConfirmSubmit(true);
    };

    return (
        <DashboardShell>
            <div className="toolbar">
                <h1>Application Form</h1>
                <span className="badge">{steps[step]}</span>
            </div>
            <div className="wizard-tabs">
                {steps.map((label, i) => (
                    <button key={label} className={`wizard-tab ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => goToStep(i)} type="button">
                        <span>{i + 1}</span>{label}
                    </button>
                ))}
            </div>
            <div className="wizard-steps">{steps.map((_, i) => <div className={`step ${i <= step ? 'active' : ''}`} key={i} />)}</div>
            {message && <div className="success">{message}</div>}
            {error && <div className="error">{error}</div>}

            <div className="card form wizard-panel">
                {step === 0 && (
                    <>
                        <h2>Personal Information</h2>
                        {locationError && <p className="muted">{locationError}</p>}
                        <div className="grid cols-3">
                            <PassportUploadField profile={payload.profile} selectedFile={passportFile} uploading={passportUploading || saving} onSelect={setPassportFile} />
                            <Field label="First name" required value={payload.profile.first_name} onChange={(v) => updateProfile('first_name', v)} />
                            <Field label="Middle name" value={payload.profile.middle_name} onChange={(v) => updateProfile('middle_name', v)} />
                            <Field label="Last name" required value={payload.profile.last_name} onChange={(v) => updateProfile('last_name', v)} />
                            <Field as="select" label="Gender" required value={payload.profile.gender} onChange={(v) => updateProfile('gender', v)} options={['Female', 'Male', 'Prefer not to say']} />
                            <Field label="Date of birth" required type="date" value={payload.profile.date_of_birth} onChange={(v) => updateProfile('date_of_birth', v)} />
                            <Field
                                as={locationOptions.countries.length ? 'select' : 'input'}
                                label={locationLoading.countries ? 'Nationality (loading...)' : 'Nationality'}
                                required
                                value={payload.profile.nationality}
                                onChange={updateNationality}
                                options={withCurrentOption(locationOptions.countries, payload.profile.nationality)}
                                placeholder="Select country"
                            />
                            <Field
                                as={locationOptions.states.length ? 'select' : 'input'}
                                label={locationLoading.states ? 'State of origin (loading...)' : 'State of origin'}
                                required
                                value={payload.profile.state_of_origin}
                                onChange={updateStateOfOrigin}
                                options={withCurrentOption(locationOptions.states, payload.profile.state_of_origin)}
                                placeholder={payload.profile.nationality ? 'Select state' : 'Select nationality first'}
                                disabled={!payload.profile.nationality || locationLoading.states}
                            />
                            <Field
                                as={locationOptions.localGovernments.length ? 'select' : 'input'}
                                label={locationLoading.localGovernments ? 'Local government (loading...)' : 'Local government'}
                                required
                                value={payload.profile.local_government}
                                onChange={(v) => updateProfile('local_government', v)}
                                options={withCurrentOption(locationOptions.localGovernments, payload.profile.local_government)}
                                placeholder={payload.profile.state_of_origin ? 'Select local government' : 'Select state first'}
                                disabled={!payload.profile.state_of_origin || locationLoading.localGovernments}
                            />
                        </div>
                    </>
                )}

                {step === 1 && (
                    <>
                        <h2>Contact Information</h2>
                        <div className="grid cols-1">
                            <Field label="Address" required as="textarea" value={payload.profile.address} onChange={(v) => updateProfile('address', v)} />
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <CollectionEditor
                            title="Educational Qualifications"
                            items={payload.education}
                            setItems={(education) => setPayload({ ...payload, education })}
                            template={educationTemplate}
                            requiredKeys={['institution', 'qualification', 'scale', 'cgpa', 'class_of_degree']}
                            fieldOptions={{
                                qualification: qualificationOptions,
                                scale: cgpaScaleOptions,
                                class_of_degree: degreeClassOptions,
                            }}
                        />
                        <OLevelEditor items={payload.olevels || []} setItems={(olevels) => setPayload({ ...payload, olevels })} />
                    </>
                )}
                {step === 3 && <CollectionEditor title="Work Experience" items={payload.experience} setItems={(experience) => setPayload({ ...payload, experience })} template={experienceTemplate} requiredKeys={['organization', 'position']} />}
                {step === 4 && <CollectionEditor title="Certifications and Skills" items={payload.certifications} setItems={(certifications) => setPayload({ ...payload, certifications })} template={certificationTemplate} requiredKeys={['name']} />}

                {step === 5 && (
                    <DocumentStep
                        documents={documents}
                        setDocuments={setDocuments}
                        documentTypes={(lookups.document_types || []).filter((type) => !String(type.slug || type.name || '').toLowerCase().includes('passport'))}
                        onView={viewDocument}
                    />
                )}

                {step === 6 && (
                    <>
                        <h2>Vacancy Selection</h2>
                        <Field as="select" label="Vacancy" required value={form.vacancy_id} onChange={(vacancy_id) => setForm({ ...form, vacancy_id })} options={vacancies.map((v) => ({ value: v.id, label: `${v.title} (${v.staff_category})` }))} />
                        <div className="field">
                            <Field
                                as="textarea"
                                label="Cover letter"
                                placeholder="Explain your suitability for this position (maximum 5000 characters)"
                                value={form.cover_letter}
                                onChange={(value) => setForm({ ...form, cover_letter: value.slice(0, 5000) })}
                            />
                            <div className="character-count muted">
                                {form.cover_letter?.length || 0} / 5000 characters
                            </div>
                        </div>
                        {selectedVacancy && (
                            <div className="vacancy-preview">
                                <span className={`badge ${selectedVacancy.staff_category === 'Academic' ? 'green' : 'gold'}`}>{selectedVacancy.staff_category}</span>
                                <h3>{selectedVacancy.title}</h3>
                                <p className="muted">{selectedVacancy.department?.name || 'General'} · {selectedVacancy.rank_or_grade}</p>
                                <p>{selectedVacancy.minimum_qualification}</p>
                                <p className="muted">Deadline: {fmt(selectedVacancy.deadline)}</p>
                            </div>
                        )}
                    </>
                )}

                {step === 7 && (
                    <>
                        <h2>Preview and Submit</h2>
                        <ApplicationPreview payload={payload} documents={documents} vacancy={selectedVacancy} />
                        <label className="declaration-card">
                            <input type="checkbox" checked={declarationAccepted} onChange={(event) => setDeclarationAccepted(event.target.checked)} />
                            <span>
                                I, <strong>{fullName(payload.profile)}</strong>, certify that the information and documents provided in this application are true, complete, and belong to me. I understand that false information, forged documents, or material omissions may lead to disqualification, withdrawal of any offer, or disciplinary/legal action.
                            </span>
                        </label>
                        {captchaEnabled && (
                            <div className="captcha-card">
                                <div>
                                    <strong>Captcha verification</strong>
                                    <p className="muted">Complete this verification before final submission.</p>
                                </div>
                                <RecaptchaCheckbox
                                    siteKey={recaptchaSiteKey}
                                    onVerify={handleRecaptchaVerify}
                                    onExpire={handleRecaptchaExpire}
                                    resetKey={recaptchaResetKey}
                                />
                            </div>
                        )}
                    </>
                )}

                <div className="inline-actions wizard-actions">
                    <button className="btn" type="button" disabled={step === 0 || saving} onClick={() => goToStep(Math.max(0, step - 1))}>Back</button>
                    {step < 7 ? (
                        <button className="btn primary" type="button" disabled={saving} onClick={saveAndContinue}>{saving ? 'Saving...' : 'Save & Continue'}</button>
                    ) : (
                        <>
                            <button className="btn" type="button" disabled={saving} onClick={() => persistStep(7)}>{saving ? 'Saving...' : 'Save Progress'}</button>
                            <button className="btn green" type="button" disabled={saving} onClick={submit}>{saving ? 'Submitting...' : 'Submit Application'}</button>
                        </>
                    )}
                </div>
            </div>
            {documentPreview && (
                <Modal title={documentPreview.title} wide onClose={closeDocumentPreview}>
                    {documentPreview.mime?.startsWith('image/') ? (
                        <img className="document-preview-image" src={documentPreview.url} alt={documentPreview.title} />
                    ) : (
                        <iframe className="document-preview-frame" src={documentPreview.url} title={documentPreview.title} />
                    )}
                </Modal>
            )}
            {confirmSubmit && (
                <Modal
                    title="Confirm Final Submission"
                    onClose={() => setConfirmSubmit(false)}
                    actions={(
                        <>
                            <button className="btn" type="button" disabled={saving} onClick={() => setConfirmSubmit(false)}>Cancel</button>
                            <button className="btn green" type="button" disabled={saving} onClick={() => persistStep(7, true)}>{saving ? 'Submitting...' : 'Confirm Submit'}</button>
                        </>
                    )}
                >
                    <p><strong>Once submitted, your application details and uploaded documents cannot be changed.</strong></p>
                    <p className="muted">Please confirm that your application for {selectedVacancy?.title || 'the selected vacancy'} is complete and ready for review.</p>
                </Modal>
            )}
        </DashboardShell>
    );
}

function DocumentStep({ documents, setDocuments, documentTypes, onView }) {
    const [draggingIndex, setDraggingIndex] = useState(null);
    const MAX_SIZE = 300 * 1024;

    const addDocument = () => setDocuments([...documents, { label: '', document_type_id: '', file: null, error: '' }]);
    const updateDocument = (index, key, value) => {
        setDocuments(documents.map((document, i) => {
            if (i !== index) return document;
            const next = { ...document, [key]: value };

            if (key === 'file') {
                if (value && value.size > MAX_SIZE) {
                    next.error = `File size exceeds 300KB limit (Current: ${Math.round(value.size / 1024)}KB)`;
                    next.file = null;
                } else {
                    next.error = '';
                }
            }

            if (key === 'document_type_id') {
                const type = documentTypes.find((item) => String(item.id) === String(value));
                if (type && !document.label) next.label = type.name;
            }
            return next;
        }));
    };
    const documentName = (document) => {
        const selectedType = documentTypes.find((item) => String(item.id) === String(document.document_type_id));
        return document.file?.name || document.original_name || document.label || selectedType?.name || 'No file selected';
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        setDraggingIndex(null);
        const file = e.dataTransfer.files?.[0];
        if (file) updateDocument(index, 'file', file);
    };

    return (
        <>
            <div className="toolbar">
                <div>
                    <h2>Document Uploads</h2>
                    <p className="muted">Accepted files: PDF, JPG, JPEG, PNG. Maximum file size is 4MB.</p>
                </div>
                <button className="btn" type="button" onClick={addDocument}><Plus size={16} /> Add Document</button>
            </div>
            <div className="grid">
                {documents.map((document, index) => (
                    <div 
                        className={`document-row ${draggingIndex === index ? 'is-dragging' : ''} ${document.error ? 'has-error' : ''}`} 
                        key={document.id || index}
                        onDragOver={(e) => { e.preventDefault(); setDraggingIndex(index); }}
                        onDragLeave={() => setDraggingIndex(null)}
                        onDrop={(e) => handleDrop(e, index)}
                    >
                        <Field
                            as="select"
                            label="Document type"
                            required
                            value={document.document_type_id}
                            options={documentTypes.map((type) => ({ value: type.id, label: type.name }))}
                            onChange={(value) => updateDocument(index, 'document_type_id', value)}
                        />
                        <label className="field">
                            <span>File<b> *</b></span>
                            <input key={document.error + (document.file ? '1' : '0')} className="input" type="file" required={!document.id && !document.uploaded} accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => updateDocument(index, 'file', event.target.files?.[0] || null)} />
                            {document.error && <p className="field-error">{document.error}</p>}
                            {document.progress > 0 && document.progress < 100 && (
                                <div className="progress-container">
                                    <div className="progress-fill" style={{ width: `${document.progress}%` }}></div>
                                </div>
                            )}
                        </label>
                        <div className="document-actions">
                            <span className="muted">{documentName(document)}</span>
                            {(document.file || document.id) && <button className="btn" type="button" onClick={() => onView(document)}><Eye size={16} /> View</button>}
                            <button className="btn icon" type="button" title="Remove document" onClick={() => setDocuments(documents.filter((_, i) => i !== index))}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

function ApplicationPreview({ payload, documents, vacancy }) {
    const profile = payload.profile || {};
    const applicantName = fullName(profile);
    const attachedDocuments = documents.filter((document) => document.file || document.id || document.uploaded);

    return (
        <div className="preview-grid">
                <div className="preview-panel">
                <h3>Applicant</h3>
                <p><strong>{applicantName}</strong></p>
                <p className="muted">{profile.state_of_origin || 'Location not provided'}</p>
            </div>
            <div className="preview-panel">
                <h3>Vacancy</h3>
                <p><strong>{vacancy?.title || 'No vacancy selected'}</strong></p>
                <p className="muted">{vacancy ? `${vacancy.staff_category} · ${vacancy.rank_or_grade || 'Rank not set'}` : 'Select a vacancy before submission.'}</p>
            </div>
            <div className="preview-panel">
                <h3>Qualifications</h3>
                {payload.education?.filter(hasEntry).length ? (
                    <ul className="preview-list">
                        {payload.education.filter(hasEntry).map((item, index) => (
                            <li key={item.id || index}>
                                <GraduationCap size={14} />
                                {[
                                    item.qualification,
                                    item.field_of_study,
                                    item.institution,
                                    item.cgpa ? `CGPA ${item.cgpa}/${item.scale || '-'}` : '',
                                    item.class_of_degree,
                                ].filter(Boolean).join(' · ')}
                            </li>
                        ))}
                    </ul>
                ) : <p className="muted">No education records yet.</p>}
                {payload.olevels?.length ? (
                    <ul className="preview-list">
                        {payload.olevels.map((item, index) => (
                            <li key={item.id || index}>
                                <FileText size={14} />
                                {[item.school_name, `${item.exam_type} ${item.exam_year}`, item.exam_number, `${(item.subjects || []).filter((row) => row.subject && row.grade).length} subject(s)`].filter(Boolean).join(' · ')}
                            </li>
                        ))}
                    </ul>
                ) : <p className="muted">No O'Level result yet.</p>}
                <p>{payload.experience?.length || 0} work experience record(s)</p>
                <p>{payload.certifications?.length || 0} certification record(s)</p>
            </div>
            <div className="preview-panel">
                <h3>Documents</h3>
                {attachedDocuments.length ? (
                    <ul className="preview-list">
                        {attachedDocuments.map((document, index) => <li key={document.id || index}><Upload size={14} /> {document.label || document.original_name || document.file?.name}</li>)}
                    </ul>
                ) : <p className="muted">No files selected yet.</p>}
            </div>
        </div>
    );
}

function TrackingPage() {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get('/applications').then(({ data }) => setItems(rows(data))).catch(() => {}); }, []);
    return (
        <DashboardShell>
            <div className="toolbar"><h1>Application Timeline</h1><span className="badge">{items.length} application(s)</span></div>
            <div className="grid">
                {items.map((application) => <ApplicationTimeline key={application.id} application={application} />)}
                {!items.length && <div className="empty card">No applications submitted yet.</div>}
            </div>
        </DashboardShell>
    );
}

function AppointmentLetterPage() {
    const [applications, setApplications] = useState([]);
    const [loadingLetter, setLoadingLetter] = useState(true);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        api.get('/applications')
            .then(({ data }) => setApplications(rows(data)))
            .catch((err) => setError(errorMessage(err)))
            .finally(() => setLoadingLetter(false));
    }, []);

    const approvedApplication = applications.find((application) => application.status === 'Approved');
    const latestApplication = approvedApplication || applications[0];
    const downloadLetter = async () => {
        if (!approvedApplication) return;
        setDownloading(true);
        setError('');
        try {
            await downloadAppointmentLetter(approvedApplication);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setDownloading(false);
        }
    };

    return (
        <DashboardShell>
            <div className="toolbar appointment-toolbar">
                <div>
                    <h1>Appointment Letter</h1>
                    <p className="muted">Available after your recruitment timeline has been completed.</p>
                </div>
                {approvedApplication && <button className="btn primary" type="button" disabled={downloading} onClick={downloadLetter}><Download size={18} /> {downloading ? 'Downloading...' : 'Download PDF'}</button>}
            </div>

            {loadingLetter && <div className="card">Loading appointment letter...</div>}
            {error && <div className="error">{error}</div>}
            {!loadingLetter && !approvedApplication && (
                <div className="card appointment-locked">
                    <FileCheck2 size={34} />
                    <div>
                        <h2>Appointment letter is not available yet</h2>
                        <p className="muted">
                            Your current application status is <strong>{latestApplication?.status || 'Not submitted'}</strong>. The appointment letter will appear here automatically when your timeline reaches Approved.
                        </p>
                        <Link className="btn" to="/tracking"><Bell size={18} /> View Tracking Timeline</Link>
                    </div>
                </div>
            )}
            {approvedApplication && <AppointmentLetterDocument application={approvedApplication} />}
        </DashboardShell>
    );
}

function AppointmentLetterDocument({ application }) {
    const profile = application.user?.profile || {};
    const vacancy = application.vacancy || {};
    const department = vacancy.department?.name || 'the relevant Department';
    const applicantName = fullName(profile);
    const firstName = profile.first_name || applicantName.split(' ')[0] || 'Candidate';
    const salaryGrade = vacancy.rank_or_grade || 'the approved salary grade';
    const role = vacancy.title || 'the approved position';
    const ref = `R/OPA/JOSTUM/${application.staff?.pf_number || 'PF/PENDING'}`;
    const letterDate = appointmentDate(application.updated_at || application.submitted_at || new Date());
    const subject = `MEMORANDUM OF APPOINTMENT TO ${vacancy.staff_category || 'STAFF'} POSITION`;

    return (
        <div className="appointment-print-area">
            <section className="appointment-sheet" aria-label="Appointment letter">
                <header className="appointment-letter-head">
                    {/* <img src="/appointment-assets/country_ranking_9th.png" alt="Country rankings 9th badge" className="appointment-ranking" /> */}
                    <h2>JOSEPH SARWUAN TARKA UNIVERSITY</h2>
                    <h3>MAKURDI - NIGERIA</h3>
                    <p className="appointment-formerly">(Formerly FEDERAL UNIVERSITY OF AGRICULTURE, MAKURDI)</p>
                    <h4>OFFICE OF THE REGISTRAR</h4>

                    <div className="appointment-office-left">
                        <p><strong>VICE-CHANCELLOR:</strong></p>
                        <p><b>Eng. Professor Isaac N. Itodo</b></p>
                        <p>FNSE, FNIAE, FSES, FAEng, NPOM</p>
                        <p>BEng (Jos), MSc (Ibadan), PhD (Ibadan)</p>
                        <br />
                        <p><strong>REGISTRAR:</strong></p>
                        <p><b>Dr. John Ujo David</b></p>
                        <p>B.A (Jos), MPIA (Lagos), Ph.D (BSU)</p>
                        <p>FCIA, ANUPA, mni, MNIM, MHSN</p>
                    </div>

                    <img src="/appointment-assets/jostum_middle_logo.png" alt="Joseph Sarwuan Tarka University logo" className="appointment-logo" />

                    <div className="appointment-office-right">
                        <p><b>Private Mail Bag 2373</b></p>
                        <p>Makurdi, Nigeria</p>
                        <p>Tel: +234 803 812 4991</p>
                        <p>E-mail: registrar@uam.edu.ng</p>
                        <p className="appointment-email-indent">registrar@gmail.com</p>
                        <p>http://www.uam.edu.ng</p>
                        <p className="appointment-date"><b>Date:</b><span>{letterDate}</span></p>
                    </div>

                    <p className="appointment-ref"><b>Our Ref:</b><span>{ref}</span></p>
                </header>

                <div className="appointment-recipient">
                    <p>{applicantName},</p>
                    <p>{profile.address || 'Address not provided'},</p>
                    <p>{[profile.local_government, profile.state_of_origin].filter(Boolean).join(', ') || 'Location not provided'}.</p>
                </div>

                <p className="appointment-dear">Dear <b>{firstName}</b>,</p>
                <h1 className="appointment-subject"><b>{subject}</b></h1>

                <article className="appointment-copy">
                    <p><span className="appointment-num">1.</span><span>I write on the directive of the Vice-Chancellor, Joseph Sarwuan Tarka University, Makurdi and on behalf of Council to offer you an appointment as <b>{role}</b> on <b>{salaryGrade}</b> in <b>{department}</b>, Joseph Sarwuan Tarka University, Makurdi.</span></p>
                    <p><span className="appointment-num">2.</span><span>The appointment is subject to the provisions of the University Laws, Statutes and Ordinances made thereunder, and to regulations governing the conditions of appointment of staff as may be approved by the University Council from time to time.</span></p>
                    <p><span className="appointment-num">3.</span><span>The appointment is also subject to your being declared medically fit on submission of a medical report of fitness from the University Health Services.</span></p>
                    <p><span className="appointment-num">4.</span><span>You will be required to perform your duties diligently, support the mandate of the University, and carry out other assignments as may be assigned to you by your Head of Department or the University Administration.</span></p>
                    <p><span className="appointment-num">5.</span><span>Please indicate your acceptance or otherwise of this offer within six (6) weeks from the date of this letter. If you accept the offer, return a signed copy of this memorandum to the Registrar.</span></p>
                    <p className="appointment-standalone">Congratulations!</p>
                </article>

                <footer className="appointment-signoff">
                    <img src="/appointment-assets/signature.png" alt="" />
                    <p><b>Dr. John U. David, <small>FCIA</small></b></p>
                    <p><i>Registrar</i></p>
                </footer>
            </section>
        </div>
    );
}

const applicationStatuses = [
    'Draft',
    'Submitted',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Interview Completed',
    'Recommended',
    'Approved',
];

function ApplicationTimeline({ application }) {
    const timelineStatus = application.status;
    const rejected = ['Not Shortlisted', 'Rejected'].includes(application.status);
    const statuses = rejected
        ? [...applicationStatuses.slice(0, Math.max(2, applicationStatuses.indexOf('Under Review') + 1)), application.status]
        : applicationStatuses;
    const currentIndex = statuses.indexOf(timelineStatus);
    const activeIndex = currentIndex >= 0 ? currentIndex : 0;

    return (
        <div className="card timeline-card">
            <div className="toolbar">
                <div>
                    <h2>{application.vacancy?.title || 'Application'}</h2>
                    <p className="muted">{application.application_number} · Submitted {fmt(application.submitted_at)}</p>
                </div>
                <span className={`badge ${statusClass(application.status)}`}>{application.status}</span>
            </div>
            <ol className="timeline">
                {statuses.map((status, index) => {
                    const done = index <= activeIndex;
                    const current = status === timelineStatus;
                    const tone = statusTone(status);
                    return (
                        <li className={`timeline-item status-${tone} ${done ? 'done' : ''} ${current ? 'current' : ''} ${statusClass(status) === 'red' ? 'negative' : ''}`} key={status}>
                            <span className="timeline-dot">{done ? <CheckCircle2 size={14} /> : index + 1}</span>
                            <div>
                                <strong>{status}</strong>
                                <p className="muted">{timelineText(status, application, current, done)}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

function timelineText(status, application, current, done) {
    if (status === 'Draft') return `Created ${fmt(application.created_at)}`;
    if (status === 'Submitted') return application.submitted_at ? `Submitted ${fmt(application.submitted_at)}` : 'Awaiting final submission';
    if (current) return currentTimelineText(status, application);
    if (done) return completedTimelineText(status, application);
    return 'Pending';
}

function currentTimelineText(status, application) {
    const date = fmt(application.updated_at || application.submitted_at);
    return ({
        'Under Review': `Under review since ${date}`,
        Shortlisted: `Shortlisted on ${date}`,
        'Interview Scheduled': `Interview scheduled on ${date}`,
        'Interview Completed': `Interview completed on ${date}`,
        Recommended: `Recommended on ${date}`,
        Approved: `Approved on ${date}`,
        'Not Shortlisted': `Not shortlisted on ${date}`,
        Rejected: `Rejected on ${date}`,
    })[status] || `Current stage as of ${date}`;
}

function completedTimelineText(status, application) {
    const date = fmt(application.updated_at || application.submitted_at);
    return ({
        'Under Review': 'Review completed',
        Shortlisted: 'Shortlisting completed',
        'Interview Scheduled': 'Interview was scheduled',
        'Interview Completed': 'Interview completed',
        Recommended: 'Recommended for final consideration',
        Approved: `Approved on ${date}`,
        'Not Shortlisted': `Not shortlisted on ${date}`,
        Rejected: `Rejected on ${date}`,
    })[status] || 'Completed';
}

function AdminApplicants() {
    return <DashboardShell><RemoteTable title="Applicant Management" endpoint="/applications" columns={['applicant', 'application_number', 'vacancy', 'status', 'submitted_at']} /></DashboardShell>;
}

function ReviewsPage({ mode = 'queue' }) {
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const loadReviews = useCallback(() => {
        setLoading(true);
        setError('');
        api.get('/reviews')
            .then(({ data }) => {
                const applications = rows(data);
                setItems(applications);
                setSelectedId((current) => current && applications.some((item) => item.id === current) ? current : applications[0]?.id || null);
            })
            .catch((err) => setError(errorMessage(err)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadReviews(); }, [loadReviews]);

    const userReview = useCallback((application) => (application.reviews || []).find((review) => review.reviewer_id === user?.id), [user?.id]);
    const pendingItems = items.filter((application) => !userReview(application) && !['Shortlisted', 'Not Shortlisted'].includes(application.status));
    const completedItems = items.filter((application) => userReview(application));
    const visibleItems = mode === 'completed' ? completedItems : pendingItems.length ? pendingItems : items;
    const selected = visibleItems.find((item) => item.id === selectedId) || visibleItems[0] || null;
    const metrics = {
        pending: pendingItems.length,
        completed: completedItems.length,
        recommended: items.filter((application) => (application.reviews || []).some((review) => review.decision === 'recommended')).length,
        rejected: items.filter((application) => (application.reviews || []).some((review) => review.decision === 'rejected')).length,
    };

    return <DashboardShell>
        <div className="review-workspace">
            <section className="review-hero">
                <div>
                    <span className="badge green">Faculty Review</span>
                    <h1>{mode === 'completed' ? 'Completed Reviews' : 'Application Review Queue'}</h1>
                    <p>Evaluate each submission against transparent criteria, inspect supporting documents, and record a professional recommendation.</p>
                </div>
                <div className="inline-actions">
                    <Link className="btn" to="/reviewer/guide"><ShieldCheck size={16} /> Review Guide</Link>
                    <button className="btn primary" type="button" onClick={loadReviews}><Search size={16} /> Refresh Queue</button>
                </div>
            </section>

            <div className="review-metrics">
                <div><span>Pending</span><strong>{metrics.pending}</strong></div>
                <div><span>Completed</span><strong>{metrics.completed}</strong></div>
                <div><span>Recommended</span><strong>{metrics.recommended}</strong></div>
                <div><span>Rejected</span><strong>{metrics.rejected}</strong></div>
            </div>

            {error && <div className="error">{error}</div>}
            {loading && <div className="card">Loading review workspace...</div>}

            {!loading && (
                <div className="review-layout">
                    <ReviewQueueList
                        items={visibleItems}
                        selectedId={selected?.id}
                        userReview={userReview}
                        onSelect={(application) => setSelectedId(application.id)}
                    />
                    <ReviewDetailPanel application={selected} existingReview={selected ? userReview(selected) : null} onReviewed={loadReviews} />
                </div>
            )}
        </div>
    </DashboardShell>;
}

function ReviewQueueList({ items, selectedId, userReview, onSelect }) {
    return (
        <aside className="review-queue-panel">
            <div className="review-panel-head">
                <h2>Applications</h2>
                <span className="badge">{items.length} records</span>
            </div>
            <div className="review-queue-list">
                {items.map((application) => {
                    const review = userReview(application);
                    const profile = application.user?.profile || {};
                    return (
                        <button
                            className={`review-queue-item ${selectedId === application.id ? 'active' : ''}`}
                            type="button"
                            key={application.id}
                            onClick={() => onSelect(application)}
                        >
                            <span className={`badge ${review?.decision === 'rejected' ? 'red' : review?.decision === 'recommended' ? 'green' : statusClass(application.status)}`}>{review ? review.decision : application.status}</span>
                            <strong>{fullName(profile)}</strong>
                            <small>{application.application_number}</small>
                            <small>{application.vacancy?.title || 'Vacancy not set'}</small>
                        </button>
                    );
                })}
                {!items.length && <div className="empty compact">No applications in this view.</div>}
            </div>
        </aside>
    );
}

function ReviewDetailPanel({ application, existingReview, onReviewed }) {
    const [form, setForm] = useState({
        qualification_score: 0,
        experience_score: 0,
        publication_score: 0,
        fit_score: 0,
        decision: 'recommended',
        comments: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [documentPreview, setDocumentPreview] = useState(null);

    useEffect(() => {
        setError('');
        setMessage('');
        setDocumentPreview(null);
        setForm({
            qualification_score: existingReview?.qualification_score ?? 0,
            experience_score: existingReview?.experience_score ?? 0,
            publication_score: existingReview?.publication_score ?? 0,
            fit_score: existingReview?.fit_score ?? 0,
            decision: existingReview?.decision || 'recommended',
            comments: existingReview?.comments || '',
        });
    }, [application?.id, existingReview]);

    if (!application) {
        return <section className="review-detail-panel empty-review-panel"><ClipboardCheck size={34} /><h2>Select an application</h2><p className="muted">Choose an application from the queue to begin review.</p></section>;
    }

    const profile = application.user?.profile || {};
    const vacancy = application.vacancy || {};
    const total = ['qualification_score', 'experience_score', 'publication_score', 'fit_score'].reduce((sum, key) => sum + Number(form[key] || 0), 0);
    const updateScore = (key, value) => setForm((current) => ({ ...current, [key]: Math.max(0, Math.min(25, Number(value) || 0)) }));
    const viewDocument = async (document) => {
        setError('');
        try {
            const response = await api.get(`/documents/${document.id}?disposition=inline`, { responseType: 'blob' });
            setDocumentPreview({
                title: document.label || document.original_name || 'Document',
                url: URL.createObjectURL(response.data),
                mime: response.data.type || document.mime_type,
            });
        } catch (err) {
            setError(errorMessage(err));
        }
    };
    const closeDocumentPreview = () => {
        if (documentPreview?.url) URL.revokeObjectURL(documentPreview.url);
        setDocumentPreview(null);
    };
    const submitReview = async (decision = form.decision) => {
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await api.post(`/applications/${application.id}/reviews`, { ...form, decision });
            setMessage(decision === 'rejected' ? 'Review saved. Candidate marked not shortlisted.' : 'Review saved. Candidate recommended for HR shortlisting.');
            onReviewed?.();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="review-detail-panel">
            <div className="review-detail-head">
                <div>
                    <span className={`badge ${statusClass(application.status)}`}>{application.status}</span>
                    <h2>{fullName(profile)}</h2>
                    <p>{application.application_number} · {vacancy.title || 'Vacancy not set'}</p>
                </div>
                <strong>{total}/100</strong>
            </div>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}

            <div className="review-detail-grid">
                <div className="review-card">
                    <h3>Applicant Snapshot</h3>
                    <PreviewInfoGrid items={[
                        ['Gender', profile.gender],
                        ['State', profile.state_of_origin],
                        ['Local government', profile.local_government],
                        ['Submitted', fmt(application.submitted_at)],
                    ]} />
                </div>
                <div className="review-card">
                    <h3>Vacancy Context</h3>
                    <PreviewInfoGrid items={[
                        ['Department', vacancy.department?.name],
                        ['Faculty', vacancy.department?.faculty?.name],
                        ['Category', vacancy.staff_category],
                        ['Rank / grade', vacancy.rank_or_grade],
                        ['Employment type', vacancy.employment_type],
                        ['Deadline', fmt(vacancy.deadline)],
                    ]} />
                </div>
            </div>

            {application.cover_letter && (
                <div className="review-card">
                    <h3>Cover Letter</h3>
                    <p className="review-copy">{application.cover_letter}</p>
                </div>
            )}

            <div className="review-card">
                <h3>Documents</h3>
                <div className="review-documents">
                    {(application.documents || []).map((document) => (
                        <div key={document.id}>
                            <FileText size={18} />
                            <div>
                                <strong>{document.label || document.document_type?.name || 'Document'}</strong>
                                <small>{document.original_name || document.mime_type || 'Uploaded file'}</small>
                            </div>
                            <button className="btn" type="button" onClick={() => viewDocument(document)}><Eye size={16} /> View</button>
                        </div>
                    ))}
                    {!application.documents?.length && <p className="muted">No documents were attached.</p>}
                </div>
            </div>

            <div className="review-card">
                <div className="review-score-head">
                    <h3>Scorecard</h3>
                    <span className={`badge ${total >= 60 ? 'green' : 'gold'}`}>{total >= 60 ? 'Meets threshold' : 'Below threshold'}</span>
                </div>
                <div className="review-score-grid">
                    {[
                        ['qualification_score', 'Qualification', 'Academic and professional credential strength'],
                        ['experience_score', 'Experience', 'Relevant work, teaching, technical or administrative exposure'],
                        ['publication_score', 'Publications', 'Research, publications, portfolio or evidence of contribution'],
                        ['fit_score', 'Role fit', 'Alignment with vacancy requirements and departmental needs'],
                    ].map(([key, label, help]) => (
                        <label className="review-score-field" key={key}>
                            <span><strong>{label}</strong><em>{help}</em></span>
                            <input type="range" min="0" max="25" value={form[key]} onChange={(event) => updateScore(key, event.target.value)} />
                            <input className="input" type="number" min="0" max="25" value={form[key]} onChange={(event) => updateScore(key, event.target.value)} />
                        </label>
                    ))}
                </div>
                <Field as="select" label="Decision" value={form.decision} options={[
                    { value: 'recommended', label: 'Recommend for shortlisting' },
                    { value: 'rejected', label: 'Do not shortlist' },
                    { value: 'pending', label: 'Keep under review' },
                ]} onChange={(decision) => setForm({ ...form, decision })} />
                <Field as="textarea" label="Reviewer comments" value={form.comments} onChange={(comments) => setForm({ ...form, comments })} />
                <div className="inline-actions review-actions">
                    <button className="btn green" type="button" disabled={saving} onClick={() => submitReview('recommended')}><CheckCircle2 size={16} /> Recommend</button>
                    <button className="btn danger" type="button" disabled={saving} onClick={() => submitReview('rejected')}>Reject</button>
                    <button className="btn" type="button" disabled={saving} onClick={() => submitReview(form.decision)}><ClipboardCheck size={16} /> Save Review</button>
                </div>
            </div>

            {documentPreview && (
                <Modal title={documentPreview.title} wide onClose={closeDocumentPreview}>
                    {documentPreview.mime?.startsWith('image/') ? (
                        <img className="document-preview-image" src={documentPreview.url} alt={documentPreview.title} />
                    ) : (
                        <iframe className="document-preview-frame" src={documentPreview.url} title={documentPreview.title} />
                    )}
                </Modal>
            )}
        </section>
    );
}

function ReviewerGuidePage() {
    return <DashboardShell>
        <div className="review-guide-page">
            <section className="review-hero">
                <div>
                    <span className="badge green">Review Standards</span>
                    <h1>Reviewer Guide</h1>
                    <p>Use the same criteria for every applicant so recommendations are fair, traceable, and defensible.</p>
                </div>
                <Link className="btn primary" to="/admin/reviews"><ClipboardCheck size={16} /> Open Queue</Link>
            </section>
            <div className="grid cols-2">
                {[
                    ['Check eligibility first', 'Confirm minimum qualification, relevant discipline, documents, and vacancy-specific requirements before assigning high scores.'],
                    ['Score with evidence', 'Use certificates, publications, work history, cover letter, and uploaded documents as the basis for each score.'],
                    ['Write useful comments', 'Record concise strengths, risks, and reasons. HR should understand why you recommended or rejected the candidate.'],
                    ['Use the threshold', 'A total score of 60 or above supports recommendation, but your comments should explain the final decision.'],
                ].map(([title, body]) => <div className="card review-guide-card" key={title}><ShieldCheck size={22} /><h2>{title}</h2><p className="muted">{body}</p></div>)}
            </div>
        </div>
    </DashboardShell>;
}

function reviewSummary(application = {}) {
    const recommendedReviews = (application.reviews || []).filter((review) => review.decision === 'recommended');
    const reviews = recommendedReviews.length ? recommendedReviews : (application.reviews || []);
    const bestScore = reviews.reduce((max, review) => Math.max(max, Number(review.total_score || 0)), 0);

    return {
        bestScore,
        recommendedCount: recommendedReviews.length,
        reviewCount: (application.reviews || []).length,
        latest: reviews[0] || null,
    };
}

function ShortlistPage() {
    const [applications, setApplications] = useState([]);
    const [shortlists, setShortlists] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [autoForm, setAutoForm] = useState({ vacancy_id: '', minimum_score: 60 });
    const [notes, setNotes] = useState({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadShortlistData = useCallback(() => {
        setLoading(true);
        setError('');
        Promise.all([api.get('/applications'), api.get('/shortlists'), api.get('/vacancies')])
            .then(([applicationsRes, shortlistsRes, vacanciesRes]) => {
                setApplications(rows(applicationsRes.data));
                setShortlists(rows(shortlistsRes.data));
                setVacancies(rows(vacanciesRes.data));
            })
            .catch((err) => setError(errorMessage(err)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadShortlistData(); }, [loadShortlistData]);

    const shortlistedIds = new Set(shortlists.map((shortlist) => shortlist.application_id || shortlist.application?.id));
    const eligibleApplications = applications.filter((application) => {
        const summary = reviewSummary(application);
        return !shortlistedIds.has(application.id)
            && !['Shortlisted', 'Not Shortlisted', 'Rejected', 'Approved'].includes(application.status)
            && summary.recommendedCount > 0;
    });

    const shortlistApplication = async (application) => {
        setSavingId(application.id);
        setError('');
        setMessage('');
        try {
            await api.post('/shortlists', {
                application_id: application.id,
                method: 'manual',
                notes: notes[application.id] || 'Shortlisted after HR/Admin review of reviewer recommendation.',
            });
            setMessage(`${application.application_number} has been shortlisted successfully.`);
            loadShortlistData();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSavingId(null);
        }
    };

    const handleEmailChange = (email) => {
        setForm({ ...form, email });
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Please enter a valid email address.');
        } else {
            setEmailError('');
        }
    };

    const runAutoShortlist = async () => {
        if (!autoForm.vacancy_id) {
            setError('Select a vacancy before running auto-shortlist.');
            return;
        }

        setSavingId('auto');
        setError('');
        setMessage('');
        try {
            const { data } = await api.post('/shortlists/auto', {
                vacancy_id: autoForm.vacancy_id,
                minimum_score: Number(autoForm.minimum_score || 60),
            });
            setMessage(data.message ? `${data.message} ${data.count || 0} candidate(s) shortlisted.` : 'Auto-shortlist completed.');
            loadShortlistData();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSavingId(null);
        }
    };

    return <DashboardShell>
        <div className="shortlist-workspace">
            <section className="review-hero">
                <div>
                    <span className="badge green">HR/Admin Shortlisting</span>
                    <h1>Shortlist Candidates</h1>
                    <p>Move reviewer-recommended applicants into the next recruitment stage manually, or generate an automatic shortlist using a minimum review score.</p>
                </div>
                <button className="btn primary" type="button" onClick={loadShortlistData}><Search size={16} /> Refresh</button>
            </section>

            <div className="review-metrics">
                <div><span>Eligible</span><strong>{eligibleApplications.length}</strong></div>
                <div><span>Shortlisted</span><strong>{shortlists.length}</strong></div>
                <div><span>Reviewed</span><strong>{applications.filter((application) => reviewSummary(application).reviewCount > 0).length}</strong></div>
                <div><span>Recommended</span><strong>{applications.filter((application) => reviewSummary(application).recommendedCount > 0).length}</strong></div>
            </div>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            {loading && <div className="card">Loading shortlist workspace...</div>}

            {!loading && (
                <div className="shortlist-layout">
                    <section className="shortlist-auto-card">
                        <div>
                            <h2>Auto Shortlist</h2>
                            <p className="muted">Select a vacancy and minimum score. Applicants with recommended reviews at or above the score will be shortlisted.</p>
                        </div>
                        <Field
                            as="select"
                            label="Vacancy"
                            value={autoForm.vacancy_id}
                            options={vacancies.map((vacancy) => ({ value: vacancy.id, label: vacancy.title }))}
                            onChange={(vacancy_id) => setAutoForm({ ...autoForm, vacancy_id })}
                        />
                        <Field
                            label="Minimum score"
                            type="number"
                            value={autoForm.minimum_score}
                            onChange={(minimum_score) => setAutoForm({ ...autoForm, minimum_score })}
                        />
                        <button className="btn green" type="button" disabled={savingId === 'auto'} onClick={runAutoShortlist}><CheckCircle2 size={16} /> Generate Auto Shortlist</button>
                    </section>

                    <section className="shortlist-panel">
                        <div className="review-panel-head">
                            <h2>Eligible Recommendations</h2>
                            <span className="badge">{eligibleApplications.length} candidate(s)</span>
                        </div>
                        <div className="shortlist-candidate-list">
                            {eligibleApplications.map((application) => {
                                const profile = application.user?.profile || {};
                                const summary = reviewSummary(application);
                                return (
                                    <article className="shortlist-candidate-card" key={application.id}>
                                        <div className="shortlist-candidate-head">
                                            <div>
                                                <span className={`badge ${statusClass(application.status)}`}>{application.status}</span>
                                                <h3>{fullName(profile)}</h3>
                                                <p className="muted">{application.application_number} · {application.vacancy?.title || 'Vacancy not set'}</p>
                                            </div>
                                            <strong>{summary.bestScore}/100</strong>
                                        </div>
                                        <PreviewInfoGrid items={[
                                            ['Department', application.vacancy?.department?.name],
                                            ['Reviewer decision', summary.latest?.decision],
                                            ['Reviewer comments', summary.latest?.comments],
                                        ]} />
                                        <Field
                                            as="textarea"
                                            label="Shortlist notes"
                                            value={notes[application.id] || ''}
                                            onChange={(value) => setNotes({ ...notes, [application.id]: value })}
                                        />
                                        <div className="inline-actions review-actions">
                                            <button className="btn green" type="button" disabled={savingId === application.id} onClick={() => shortlistApplication(application)}><CheckCircle2 size={16} /> Shortlist Candidate</button>
                                        </div>
                                    </article>
                                );
                            })}
                            {!eligibleApplications.length && <div className="empty compact">No reviewer-recommended candidates are waiting for shortlisting.</div>}
                        </div>
                    </section>

                    <section className="shortlist-panel">
                        <div className="review-panel-head">
                            <h2>Shortlisted Candidates</h2>
                            <span className="badge">{shortlists.length} record(s)</span>
                        </div>
                        <div className="shortlist-candidate-list compact-list">
                            {shortlists.map((shortlist) => (
                                <article className="shortlist-candidate-card" key={shortlist.id}>
                                    <div className="shortlist-candidate-head">
                                        <div>
                                            <span className="badge green">{shortlist.method || 'manual'}</span>
                                            <h3>{fullName(shortlist.application?.user?.profile || {})}</h3>
                                            <p className="muted">{shortlist.application?.application_number} · {shortlist.application?.vacancy?.title || 'Vacancy not set'}</p>
                                        </div>
                                        <strong>{fmt(shortlist.created_at)}</strong>
                                    </div>
                                    {shortlist.notes && <p className="review-copy">{shortlist.notes}</p>}
                                </article>
                            ))}
                            {!shortlists.length && <div className="empty compact">No candidates have been shortlisted yet.</div>}
                        </div>
                    </section>
                </div>
            )}
        </div>
    </DashboardShell>;
}

function InterviewsPage() {
    const { hasRole } = useAuth();
    const [interviews, setInterviews] = useState([]);
    const [applications, setApplications] = useState([]);
    const [panelMembers, setPanelMembers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        vacancy_id: '',
        title: '',
        batch_name: '',
        interview_date: '',
        interview_time: '',
        venue: '',
        mode: 'physical',
        meeting_link: '',
        application_ids: [],
        panel_member_ids: [],
    });

    const endpoint = hasRole('panel_member') ? '/panel/interviews' : '/interviews';
    const loadInterviewData = useCallback(() => {
        setLoading(true);
        setError('');
        const requests = hasRole('panel_member')
            ? [api.get(endpoint)]
            : [api.get(endpoint), api.get('/applications'), api.get('/interviews/panel-members')];

        Promise.all(requests)
            .then(([interviewRes, applicationRes, panelRes]) => {
                const schedules = rows(interviewRes.data);
                setInterviews(schedules);
                setSelectedId((current) => current && schedules.some((item) => item.id === current) ? current : schedules[0]?.id || null);
                if (applicationRes) setApplications(rows(applicationRes.data));
                if (panelRes) setPanelMembers(rows(panelRes.data));
            })
            .catch((err) => setError(errorMessage(err)))
            .finally(() => setLoading(false));
    }, [endpoint, hasRole]);

    useEffect(() => { loadInterviewData(); }, [loadInterviewData]);

    const selected = interviews.find((interview) => interview.id === selectedId) || interviews[0] || null;
    const shortlistedApplications = applications.filter((application) => application.status === 'Shortlisted' || application.status === 'Interview Scheduled');
    const vacancies = Array.from(new Map(shortlistedApplications.map((application) => [application.vacancy?.id, application.vacancy]).filter(([id]) => id)).values());
    const selectedVacancyApplications = shortlistedApplications.filter((application) => String(application.vacancy_id) === String(form.vacancy_id));
    const createSchedule = async () => {
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await api.post('/interviews', form);
            setMessage('Interview schedule created and applicants notified.');
            setForm({ vacancy_id: '', title: '', batch_name: '', interview_date: '', interview_time: '', venue: '', mode: 'physical', meeting_link: '', application_ids: [], panel_member_ids: [] });
            loadInterviewData();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };
    const toggleArray = (key, value) => {
        const values = form[key] || [];
        setForm({ ...form, [key]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] });
    };

    return <DashboardShell>
        <div className="interview-workspace">
            <section className="review-hero">
                <div>
                    <span className="badge green">{hasRole('panel_member') ? 'Panel Workspace' : 'HR/Admin Interviews'}</span>
                    <h1>{hasRole('panel_member') ? 'Assigned Interviews' : 'Interview Management'}</h1>
                    <p>{hasRole('panel_member') ? 'Score shortlisted candidates assigned to your panel.' : 'Create interview batches, assign panel members, and move shortlisted candidates into interview stage.'}</p>
                </div>
                <button className="btn primary" type="button" onClick={loadInterviewData}><Search size={16} /> Refresh</button>
            </section>

            <div className="review-metrics">
                <div><span>Schedules</span><strong>{interviews.length}</strong></div>
                <div><span>Candidates</span><strong>{interviews.reduce((sum, item) => sum + (item.applications?.length || 0), 0)}</strong></div>
                <div><span>Panel Members</span><strong>{interviews.reduce((sum, item) => sum + (item.panel_members?.length || item.panelMembers?.length || 0), 0)}</strong></div>
                <div><span>Scores</span><strong>{interviews.reduce((sum, item) => sum + (item.scores?.length || 0), 0)}</strong></div>
            </div>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            {loading && <div className="card">Loading interview workspace...</div>}

            {!loading && (
                <div className="interview-layout">
                    {!hasRole('panel_member') && (
                        <section className="interview-schedule-card">
                            <h2>Create Interview Schedule</h2>
                            <div className="grid cols-2">
                                <Field as="select" label="Vacancy" value={form.vacancy_id} options={vacancies.map((vacancy) => ({ value: vacancy.id, label: vacancy.title }))} onChange={(vacancy_id) => setForm({ ...form, vacancy_id, application_ids: [] })} />
                                <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
                                <Field label="Batch name" value={form.batch_name} onChange={(batch_name) => setForm({ ...form, batch_name })} />
                                <Field label="Date" type="date" value={form.interview_date} onChange={(interview_date) => setForm({ ...form, interview_date })} />
                                <Field label="Time" type="time" value={form.interview_time} onChange={(interview_time) => setForm({ ...form, interview_time })} />
                                <Field as="select" label="Mode" value={form.mode} options={[{ value: 'physical', label: 'Physical' }, { value: 'online', label: 'Online' }]} onChange={(mode) => setForm({ ...form, mode })} />
                                <Field label="Venue" value={form.venue} onChange={(venue) => setForm({ ...form, venue })} />
                                <Field label="Meeting link" value={form.meeting_link} onChange={(meeting_link) => setForm({ ...form, meeting_link })} />
                            </div>
                            <InterviewChecklist title="Candidates" items={selectedVacancyApplications} selected={form.application_ids} label={(application) => `${fullName(application.user?.profile || {})} (${application.application_number})`} onToggle={(id) => toggleArray('application_ids', id)} />
                            <InterviewChecklist title="Panel Members" items={panelMembers} selected={form.panel_member_ids} label={(member) => `${member.name} (${member.email})`} onToggle={(id) => toggleArray('panel_member_ids', id)} />
                            <button className="btn green" type="button" disabled={saving} onClick={createSchedule}><CalendarClock size={16} /> Schedule Interview</button>
                        </section>
                    )}

                    <section className="interview-list-panel">
                        <div className="review-panel-head"><h2>Interview Batches</h2><span className="badge">{interviews.length} records</span></div>
                        <div className="review-queue-list">
                            {interviews.map((interview) => (
                                <button className={`review-queue-item ${selected?.id === interview.id ? 'active' : ''}`} type="button" key={interview.id} onClick={() => setSelectedId(interview.id)}>
                                    <span className="badge green">{interview.mode}</span>
                                    <strong>{interview.title}</strong>
                                    <small>{interview.vacancy?.title || 'Vacancy not set'}</small>
                                    <small>{fmt(interview.interview_date)} {interview.interview_time || ''}</small>
                                </button>
                            ))}
                            {!interviews.length && <div className="empty compact">No interview schedules yet.</div>}
                        </div>
                    </section>

                    <InterviewDetail interview={selected} canScore={hasRole('panel_member') || hasRole('super_admin')} onScored={loadInterviewData} />
                </div>
            )}
        </div>
    </DashboardShell>;
}

function InterviewChecklist({ title, items, selected, label, onToggle }) {
    return (
        <div className="interview-checklist">
            <h3>{title}</h3>
            <div>
                {items.map((item) => (
                    <label className="check-item" key={item.id}>
                        <input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} />
                        <span>{label(item)}</span>
                    </label>
                ))}
                {!items.length && <p className="muted">No records available.</p>}
            </div>
        </div>
    );
}

function InterviewDetail({ interview, canScore, onScored }) {
    if (!interview) return <section className="review-detail-panel empty-review-panel"><CalendarClock size={34} /><h2>Select an interview</h2><p className="muted">Choose a batch to inspect candidates and scores.</p></section>;

    return (
        <section className="review-detail-panel">
            <div className="review-detail-head">
                <div>
                    <span className="badge green">{interview.mode}</span>
                    <h2>{interview.title}</h2>
                    <p>{interview.vacancy?.title || 'Vacancy not set'} · {fmt(interview.interview_date)} {interview.interview_time || ''}</p>
                </div>
                <strong>{interview.applications?.length || 0}</strong>
            </div>
            <PreviewInfoGrid items={[
                ['Batch', interview.batch_name],
                ['Venue', interview.venue],
                ['Meeting link', interview.meeting_link],
                ['Department', interview.vacancy?.department?.name],
            ]} />
            <div className="review-card">
                <h3>Panel Members</h3>
                <div className="interview-chip-list">
                    {(interview.panel_members || interview.panelMembers || []).map((member) => <span className="badge" key={member.id}>{member.user?.name || `User #${member.user_id}`}</span>)}
                    {!(interview.panel_members || interview.panelMembers || []).length && <p className="muted">No panel members assigned.</p>}
                </div>
            </div>
            <div className="interview-candidate-list">
                {(interview.applications || []).map((application) => <InterviewCandidateScore key={application.id} interview={interview} application={application} canScore={canScore} onScored={onScored} />)}
                {!interview.applications?.length && <div className="empty compact">No candidates assigned to this interview.</div>}
            </div>
        </section>
    );
}

function InterviewCandidateScore({ interview, application, canScore, onScored }) {
    const [form, setForm] = useState({ technical_score: 0, communication_score: 0, leadership_score: 0, decision: 'recommended', remarks: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const profile = application.user?.profile || {};
    const existing = (interview.scores || []).find((score) => score.application_id === application.id);
    const total = Number(form.technical_score || 0) + Number(form.communication_score || 0) + Number(form.leadership_score || 0);

    useEffect(() => {
        setForm({
            technical_score: existing?.technical_score ?? 0,
            communication_score: existing?.communication_score ?? 0,
            leadership_score: existing?.leadership_score ?? 0,
            decision: existing?.decision || 'recommended',
            remarks: existing?.remarks || '',
        });
    }, [existing?.id, application.id]);

    const updateScore = (key, value, max) => setForm((current) => ({ ...current, [key]: Math.max(0, Math.min(max, Number(value) || 0)) }));
    const submit = async () => {
        setSaving(true);
        setError('');
        try {
            await api.post('/panel/interview-scores', { ...form, interview_schedule_id: interview.id, application_id: application.id });
            onScored?.();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <article className="interview-candidate-card">
            <div className="shortlist-candidate-head">
                <div>
                    <span className={`badge ${statusClass(application.status)}`}>{application.status}</span>
                    <h3>{fullName(profile)}</h3>
                        <p className="muted">{application.application_number}</p>
                </div>
                <strong>{total}/100</strong>
            </div>
            {error && <div className="error">{error}</div>}
            {canScore && (
                <div className="review-score-grid">
                    <label className="review-score-field"><span><strong>Technical</strong><em>Role knowledge and competence</em></span><input type="range" min="0" max="40" value={form.technical_score} onChange={(e) => updateScore('technical_score', e.target.value, 40)} /><input className="input" type="number" min="0" max="40" value={form.technical_score} onChange={(e) => updateScore('technical_score', e.target.value, 40)} /></label>
                    <label className="review-score-field"><span><strong>Communication</strong><em>Clarity, confidence, and expression</em></span><input type="range" min="0" max="30" value={form.communication_score} onChange={(e) => updateScore('communication_score', e.target.value, 30)} /><input className="input" type="number" min="0" max="30" value={form.communication_score} onChange={(e) => updateScore('communication_score', e.target.value, 30)} /></label>
                    <label className="review-score-field"><span><strong>Leadership</strong><em>Judgment, maturity, and team fit</em></span><input type="range" min="0" max="30" value={form.leadership_score} onChange={(e) => updateScore('leadership_score', e.target.value, 30)} /><input className="input" type="number" min="0" max="30" value={form.leadership_score} onChange={(e) => updateScore('leadership_score', e.target.value, 30)} /></label>
                    <Field as="select" label="Decision" value={form.decision} options={[{ value: 'recommended', label: 'Recommend' }, { value: 'rejected', label: 'Do not recommend' }, { value: 'pending', label: 'Pending' }]} onChange={(decision) => setForm({ ...form, decision })} />
                </div>
            )}
            {canScore && <Field as="textarea" label="Panel remarks" value={form.remarks} onChange={(remarks) => setForm({ ...form, remarks })} />}
            {canScore && <div className="inline-actions review-actions"><button className="btn green" type="button" disabled={saving} onClick={submit}><ClipboardCheck size={16} /> Save Interview Score</button></div>}
        </article>
    );
}

function FinalApprovalsPage() {
    const [items, setItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [bulkApproving, setBulkApproving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadFinalApprovals = useCallback(() => {
        setLoading(true);
        setError('');
        api.get('/final-approvals')
            .then(({ data }) => {
                const applications = rows(data);
                setItems(applications);
                setSelectedId((current) => current && applications.some((item) => item.id === current) ? current : applications[0]?.id || null);
            })
            .catch((err) => setError(errorMessage(err)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadFinalApprovals(); }, [loadFinalApprovals]);

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredItems = normalizedSearch
        ? items.filter((application) => {
            const profile = application.user?.profile || {};
            const haystack = [
                application.application_number,
                fullName(profile),
                application.user?.name,
                application.user?.email,
            ].filter(Boolean).join(' ').toLowerCase();

            return haystack.includes(normalizedSearch);
        })
        : items;
    const selected = filteredItems.find((item) => item.id === selectedId) || filteredItems[0] || null;
    const recommendedItems = items.filter((item) => item.status === 'Recommended');
    const approveAll = async () => {
        if (!recommendedItems.length) return;

        setBulkApproving(true);
        setError('');
        setMessage('');
        try {
            for (const application of recommendedItems) {
                await api.post(`/final-approvals/${application.id}`, {
                    decision: 'Approved',
                    reason: 'Approved through registrar bulk appointment approval.',
                });
            }
            setMessage(`${recommendedItems.length} appointment(s) approved successfully.`);
            loadFinalApprovals();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBulkApproving(false);
        }
    };

    return <DashboardShell>
        <div className="final-approval-workspace">
            <section className="review-hero">
                <div>
                    <span className="badge gold">Registrar Workflow</span>
                    <h1>Final Approvals</h1>
                    <p>Inspect each recommended applicant, review uploaded documents and assessment evidence, then approve or decline the appointment decision.</p>
                </div>
                <div className="inline-actions">
                    <button className="btn green" type="button" disabled={bulkApproving || !recommendedItems.length} onClick={approveAll}><CheckCircle2 size={16} /> {bulkApproving ? 'Approving...' : 'Approve All'}</button>
                    <button className="btn primary" type="button" disabled={bulkApproving} onClick={loadFinalApprovals}><Search size={16} /> Refresh</button>
                </div>
            </section>

            <div className="review-metrics">
                <div><span>Recommended</span><strong>{recommendedItems.length}</strong></div>
                <div><span>Approved</span><strong>{items.filter((item) => item.status === 'Approved').length}</strong></div>
                <div><span>Rejected</span><strong>{items.filter((item) => item.status === 'Rejected').length}</strong></div>
                <div><span>Total</span><strong>{items.length}</strong></div>
            </div>

            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            {loading && <div className="card">Loading final approval workspace...</div>}

            {!loading && (
                <div className="final-approval-layout">
                    <aside className="review-queue-panel">
                        <div className="review-panel-head">
                            <h2>Applicants</h2>
                            <span className="badge">{filteredItems.length} records</span>
                        </div>
                        <label className="queue-search">
                            <Search size={16} />
                            <input
                                type="search"
                                value={searchTerm}
                                placeholder="Search ref or name"
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </label>
                        <div className="review-queue-list">
                            {filteredItems.map((application) => (
                                <button className={`review-queue-item ${selected?.id === application.id ? 'active' : ''}`} type="button" key={application.id} onClick={() => setSelectedId(application.id)}>
                                    <span className={`badge ${statusClass(application.status)}`}>{application.status}</span>
                                    <strong>{fullName(application.user?.profile || {})}</strong>
                                    <small>{application.application_number}</small>
                                    <small>{application.vacancy?.title || 'Vacancy not set'}</small>
                                </button>
                            ))}
                            {!filteredItems.length && <div className="empty compact">{items.length ? 'No applicant matches that search.' : 'No applicants awaiting final approval.'}</div>}
                        </div>
                    </aside>
                    <FinalApprovalDetail
                        application={selected}
                        onMessage={setMessage}
                        onError={setError}
                        onDecided={loadFinalApprovals}
                    />
                </div>
            )}
        </div>
    </DashboardShell>;
}

function FinalApprovalDetail({ application, onMessage, onError, onDecided }) {
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [documentPreview, setDocumentPreview] = useState(null);

    useEffect(() => {
        setReason(application?.final_approval?.reason || '');
        setDocumentPreview(null);
    }, [application?.id]);

    if (!application) {
        return <section className="review-detail-panel empty-review-panel"><ShieldCheck size={34} /><h2>Select an applicant</h2><p className="muted">Choose an applicant to view details and documents.</p></section>;
    }

    const profile = application.user?.profile || {};
    const vacancy = application.vacancy || {};
    const bestReviewScore = (application.reviews || []).reduce((max, review) => Math.max(max, Number(review.total_score || 0)), 0);
    const closeDocumentPreview = () => {
        if (documentPreview?.url) URL.revokeObjectURL(documentPreview.url);
        setDocumentPreview(null);
    };
    const viewDocument = async (document) => {
        onError('');
        try {
            const response = await api.get(`/documents/${document.id}?disposition=inline`, { responseType: 'blob' });
            setDocumentPreview({
                title: document.label || document.original_name || 'Document',
                url: URL.createObjectURL(response.data),
                mime: response.data.type || document.mime_type,
            });
        } catch (err) {
            onError(errorMessage(err));
        }
    };
    const decide = async (decision) => {
        setSaving(true);
        onError('');
        onMessage('');
        try {
            await api.post(`/final-approvals/${application.id}`, {
                decision,
                reason: reason || (decision === 'Approved' ? 'Approved after final registrar review.' : 'Not approved after final registrar review.'),
            });
            onMessage(`${application.application_number} has been ${decision.toLowerCase()}.`);
            onDecided?.();
        } catch (err) {
            onError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="review-detail-panel">
            <div className="review-detail-head">
                <div>
                    <span className={`badge ${statusClass(application.status)}`}>{application.status}</span>
                    <h2>{fullName(profile)}</h2>
                    <p>{application.application_number} · {vacancy.title || 'Vacancy not set'}</p>
                </div>
                <strong>{bestReviewScore}/100</strong>
            </div>

            <div className="review-detail-grid">
                <div className="review-card">
                    <h3>Applicant Information</h3>
                    <PreviewInfoGrid items={[
                        ['Gender', profile.gender],
                        ['Date of birth', profile.date_of_birth ? fmt(profile.date_of_birth) : ''],
                        ['State', profile.state_of_origin],
                        ['Local government', profile.local_government],
                        ['Address', profile.address],
                    ]} />
                </div>
                <div className="review-card">
                    <h3>Vacancy Information</h3>
                    <PreviewInfoGrid items={[
                        ['Position', vacancy.title],
                        ['Department', vacancy.department?.name],
                        ['Faculty', vacancy.department?.faculty?.name],
                        ['Rank / grade', vacancy.rank_or_grade],
                        ['Category', vacancy.staff_category],
                        ['Submitted', fmt(application.submitted_at)],
                    ]} />
                </div>
            </div>

            {application.cover_letter && <div className="review-card"><h3>Cover Letter</h3><p className="review-copy">{application.cover_letter}</p></div>}

            <div className="review-card">
                <h3>Assessment Evidence</h3>
                <div className="application-preview-list two-column">
                    {(application.reviews || []).map((review) => (
                        <article key={review.id}>
                            <h3>{review.decision || 'Review'}</h3>
                            <p>{review.total_score || 0}/100 · {review.reviewer?.name || 'Reviewer'}</p>
                            {review.comments && <p>{review.comments}</p>}
                        </article>
                    ))}
                    {!application.reviews?.length && <p className="muted">No review records found.</p>}
                </div>
            </div>

            <div className="review-card">
                <h3>Uploaded Documents</h3>
                <div className="review-documents">
                    {(application.documents || []).map((document) => (
                        <div key={document.id}>
                            <FileText size={18} />
                            <div>
                                <strong>{document.label || document.document_type?.name || 'Document'}</strong>
                                <small>{document.original_name || document.mime_type || 'Uploaded file'}</small>
                            </div>
                            <button className="btn" type="button" onClick={() => viewDocument(document)}><Eye size={16} /> View</button>
                        </div>
                    ))}
                    {!application.documents?.length && <p className="muted">No documents were uploaded.</p>}
                </div>
            </div>

            <div className="review-card">
                <h3>Registrar Decision</h3>
                <Field as="textarea" label="Decision reason / note" value={reason} onChange={setReason} />
                {['Approved', 'Rejected'].includes(application.status) ? (
                    <span className={`badge ${statusClass(application.status)}`}>{application.status}</span>
                ) : (
                    <div className="inline-actions review-actions">
                        <button className="btn green" type="button" disabled={saving} onClick={() => decide('Approved')}><CheckCircle2 size={16} /> Approve Appointment</button>
                        <button className="btn danger" type="button" disabled={saving} onClick={() => decide('Rejected')}>Reject</button>
                    </div>
                )}
            </div>

            {documentPreview && (
                <Modal title={documentPreview.title} wide onClose={closeDocumentPreview}>
                    {documentPreview.mime?.startsWith('image/') ? (
                        <img className="document-preview-image" src={documentPreview.url} alt={documentPreview.title} />
                    ) : (
                        <iframe className="document-preview-frame" src={documentPreview.url} title={documentPreview.title} />
                    )}
                </Modal>
            )}
        </section>
    );
}

function SuccessfulListPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState('all');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);

    const loadSuccessfulList = useCallback(() => {
        setLoading(true);
        setError('');
        api.get('/successful-list')
            .then(({ data }) => setItems(rows(data)))
            .catch((err) => setError(errorMessage(err)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadSuccessfulList(); }, [loadSuccessfulList]);

    const options = useMemo(() => {
        const roleOptions = new Set();
        const departmentOptions = new Set();

        items.forEach((item) => {
            const role = item.rank || item.application?.vacancy?.rank_or_grade || item.application?.vacancy?.staff_category;
            const department = item.department || item.application?.vacancy?.department?.name;
            if (role) roleOptions.add(role);
            if (department) departmentOptions.add(department);
        });

        return {
            roles: [...roleOptions].sort((a, b) => a.localeCompare(b)),
            departments: [...departmentOptions].sort((a, b) => a.localeCompare(b)),
        };
    }, [items]);

    const filteredItems = useMemo(() => {
        let next = [...items];
        if (filterMode === 'role' && selectedRole) {
            next = next.filter((item) => (item.rank || item.application?.vacancy?.rank_or_grade || item.application?.vacancy?.staff_category || '') === selectedRole);
        }
        if (filterMode === 'department' && selectedDepartment) {
            next = next.filter((item) => (item.department || item.application?.vacancy?.department?.name || '') === selectedDepartment);
        }
        return next.sort((a, b) => String(a.pf_number || '').localeCompare(String(b.pf_number || ''), undefined, { numeric: true, sensitivity: 'base' }));
    }, [filterMode, items, selectedDepartment, selectedRole]);

    const exportPdf = async () => {
        setDownloading(true);
        setError('');
        try {
            const response = await api.get('/successful-list/export/pdf', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'successful-list.pdf';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setDownloading(false);
        }
    };

    return <DashboardShell>
        <div className="review-guide-page">
            <section className="review-hero">
                <div>
                    <span className="badge green">Successful Appointment List</span>
                    <h1>Successful List</h1>
                    <p>View appointed staff records, filter by role or department, and download the sorted table as a PDF.</p>
                </div>
                <div className="inline-actions">
                    <button className="btn" type="button" onClick={loadSuccessfulList}><Search size={16} /> Refresh</button>
                    <button className="btn primary" type="button" disabled={downloading} onClick={exportPdf}><Download size={16} /> {downloading ? 'Exporting...' : 'Download PDF'}</button>
                </div>
            </section>

            <div className="card">
                <div className="toolbar">
                    <h2>Filters</h2>
                    <span className="badge">{filteredItems.length} records</span>
                </div>
                <div className="inline-actions">
                    {[
                        { value: 'all', label: 'All' },
                        { value: 'role', label: 'Role' },
                        { value: 'department', label: 'Department' },
                    ].map((option) => (
                        <button
                            key={option.value}
                            className={`btn ${filterMode === option.value ? 'primary' : ''}`}
                            type="button"
                            onClick={() => setFilterMode(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                {filterMode === 'role' && (
                    <div style={{ marginTop: 12, maxWidth: 360 }}>
                        <Field
                            as="select"
                            label="Select role"
                            value={selectedRole}
                            options={[{ value: '', label: 'Choose a role' }, ...options.roles.map((role) => ({ value: role, label: role }))]}
                            onChange={(value) => setSelectedRole(value)}
                        />
                    </div>
                )}
                {filterMode === 'department' && (
                    <div style={{ marginTop: 12, maxWidth: 360 }}>
                        <Field
                            as="select"
                            label="Select department"
                            value={selectedDepartment}
                            options={[{ value: '', label: 'Choose a department' }, ...options.departments.map((department) => ({ value: department, label: department }))]}
                            onChange={(value) => setSelectedDepartment(value)}
                        />
                    </div>
                )}
            </div>

            {error && <div className="error">{error}</div>}
            {loading && <div className="card">Loading successful list...</div>}

            {!loading && (
                <div className="card">
                    <div className="toolbar">
                        <h2>Successful Staff</h2>
                        <span className="badge">{filteredItems.length} records</span>
                    </div>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>S/N</th>
                                    <th>PF Number</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((item, index) => {
                                    const name = [item.first_name, item.surname, item.other_name].filter(Boolean).join(' ') || item.user?.name || 'Staff Member';
                                    const role = item.rank || item.application?.vacancy?.rank_or_grade || item.application?.vacancy?.staff_category || 'N/A';
                                    const department = item.department || item.application?.vacancy?.department?.name || 'General';
                                    return (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.pf_number || 'N/A'}</td>
                                            <td>{name}</td>
                                            <td>{role}</td>
                                            <td>{department}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {!filteredItems.length && <div className="empty">No successful records found.</div>}
                    </div>
                </div>
            )}
        </div>
    </DashboardShell>;
}

function ReportsPage() {
    const [data, setData] = useState(null);
    useEffect(() => { api.get('/reports').then(({ data }) => setData(data)).catch(() => {}); }, []);
    return <DashboardShell><div className="toolbar"><h1>Reports</h1><a className="btn primary" href="/api/reports/export/all"><Download size={18} /> Export CSV</a></div><Chart title="Applicants by Status" items={data?.applicants_by_status || []} labelKey="status" valueKey="total" /><DataTable title="Approved Candidates" items={data?.approved_candidates || []} columns={['application_number', 'status']} /></DashboardShell>;
}

function UsersPage() {
    return <DashboardShell><RemoteTable title="User Management" endpoint="/admin/users" columns={['name', 'email', 'status']} /></DashboardShell>;
}

function SettingsPage() {
    return <DashboardShell>
        <div className="grid cols-2">
            <div>
                <RemoteTable title="Settings" endpoint="/admin/settings" columns={['key', 'group']} />
                <SettingsEditor />
            </div>
            <RemoteTable title="Document Types" endpoint="/admin/document-types" columns={['name', 'max_size_kb']} />
        </div>
    </DashboardShell>;
}

function SettingsEditor() {
    const [settings, setSettings] = useState([]);
    const [selected, setSelected] = useState('');
    const [valueText, setValueText] = useState('');
    const [group, setGroup] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        api.get('/admin/settings').then(({ data }) => setSettings(rows(data))).catch(() => {});
    }, []);

    useEffect(() => {
        const s = settings.find((it) => it.key === selected);
        if (!s) {
            setValueText('');
            setGroup('');
            return;
        }
        setGroup(s.group || '');
        try {
            setValueText(JSON.stringify(s.value ?? null, null, 2));
        } catch (e) {
            setValueText(String(s.value ?? ''));
        }
    }, [selected, settings]);

    const handleSave = async () => {
        if (!selected) return setMessage({ type: 'error', text: 'Select a setting to save.' });
        let payloadValue;
        try {
            payloadValue = JSON.parse(valueText);
        } catch (e) {
            // fallback to raw string
            payloadValue = valueText;
        }
        setSaving(true);
        try {
            const resp = await api.post('/admin/settings', { key: selected, value: payloadValue, group: group || 'system' });
            setMessage({ type: 'success', text: 'Saved successfully.' });
            const { data } = await api.get('/admin/settings');
            setSettings(rows(data));
        } catch (err) {
            setMessage({ type: 'error', text: errorMessage(err) });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="card">
            <h2>Settings Editor</h2>
            <div style={{ display: 'grid', gap: 8 }}>
                <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                    <option value="">-- Select setting --</option>
                    {settings.map((s) => <option key={s.key} value={s.key}>{s.key} ({s.group})</option>)}
                </select>
                <input placeholder="Group (optional)" value={group} onChange={(e) => setGroup(e.target.value)} />
                <textarea rows={8} value={valueText} onChange={(e) => setValueText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 12 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    <button className="btn" onClick={() => { setSelected(''); setValueText(''); setGroup(''); }}>Clear</button>
                </div>
                {message && <div className={`field-error`} style={{ color: message.type === 'error' ? 'var(--red)' : 'var(--green)' }}>{message.text}</div>}
            </div>
        </div>
    );
}

function UserSettingsPage() {
    const { user } = useAuth();
    const [mfa, setMfa] = useState(user?.mfa_enabled || false);
    const [sessions] = useState([
        { id: 1, device: 'Chrome on Windows', ip: '192.168.1.1', last_active: 'Now', current: true },
        { id: 2, device: 'Safari on iPhone', ip: '10.0.0.5', last_active: '2 hours ago', current: false },
    ]);

    return (
        <DashboardShell>
            <div className="toolbar">
                <h1>Account Settings</h1>
                <p className="muted">Manage your security and communication preferences.</p>
            </div>

            <div className="grid cols-2 responsive-grid">
                <div className="card">
                    <div className="toolbar">
                        <h2><ShieldCheck size={20} /> Security</h2>
                    </div>
                    <div className="field">
                        <label className="checkbox-field inline-checkbox">
                            <input type="checkbox" checked={mfa} onChange={(e) => setMfa(e.target.checked)} />
                            <span className="checkbox-label">Enable Two-Factor Authentication (2FA)</span>
                        </label>
                        <p className="muted small" style={{ marginTop: '8px' }}>
                            Adds an extra layer of security by requiring a code from your email or authenticator app.
                        </p>
                    </div>
                    <hr />
                    <Link to="/forgot-password" title="Click to trigger reset flow" className="btn">
                        <KeyRound size={16} /> Change Password
                    </Link>
                </div>

                <div className="card">
                    <div className="toolbar">
                        <h2><MonitorSmartphone size={20} /> Active Sessions</h2>
                    </div>
                    <div className="activity-feed">
                        {sessions.map(s => (
                            <div key={s.id} className="activity-item py-2 border-b border-line last:border-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div className="text-sm font-bold">{s.device} {s.current && <span className="badge green">This device</span>}</div>
                                    <div className="text-xs muted">{s.ip} • {s.last_active}</div>
                                </div>
                                {!s.current && <button className="btn icon text-red-600"><LogOut size={16} /></button>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="toolbar">
                        <h2><Bell size={20} /> Notifications</h2>
                    </div>
                    <Field as="select" label="Notification Frequency" options={['Immediate', 'Daily Digest', 'Weekly Summary']} />
                    <Field type="checkbox" label="Email me about status changes" value={true} />
                    <Field type="checkbox" label="SMS alerts for interview schedules" value={false} />
                </div>

                <div className="card border-red">
                    <h2 className="text-red-600">Danger Zone</h2>
                    <p className="muted small">Permanently delete your account and withdraw all active applications. This action cannot be undone.</p>
                    <button className="btn danger mt-4">Delete Account</button>
                </div>
            </div>
        </DashboardShell>
    );
}

function AuditPage() {
    return <DashboardShell><RemoteTable title="Audit Logs" endpoint="/admin/audit-logs" columns={['action', 'ip_address', 'created_at']} /></DashboardShell>;
}

function RemoteTable({ title, endpoint, columns }) {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get(endpoint).then(({ data }) => setItems(rows(data))).catch(() => {}); }, [endpoint]);
    return <DataTable title={title} items={items} columns={columns} />;
}

function DataTable({ title, items = [], columns = [], action }) {
    return <div className="card"><div className="toolbar"><h2>{title}</h2><span className="badge">{items.length} records</span></div><div className="table-wrap"><table><thead><tr>{columns.map((c) => <th key={c}>{c.replaceAll('_', ' ')}</th>)}{action && <th>Action</th>}</tr></thead><tbody>{items.map((item) => <tr key={item.id}>{columns.map((c) => <td key={c}>{renderCell(item, c)}</td>)}{action && <td>{action(item)}</td>}</tr>)}</tbody></table>{!items.length && <div className="empty">No records found.</div>}</div></div>;
}

function renderCell(item, key) {
    if (key === 'applicant') return applicantDisplayName(item);
    if (key === 'vacancy') return item.vacancy?.title || 'General';

    const value = item[key] ?? item.application?.[key] ?? item.user?.[key] ?? item.vacancy?.[key];
    if (key === 'status') return <span className={`badge ${statusClass(value)}`}>{value}</span>;
    if (key.includes('date') || key.endsWith('_at')) return fmt(value);
    return String(value ?? '—');
}

function Chart({ title, items = [], labelKey, valueKey }) {
    const max = useMemo(() => Math.max(1, ...items.map((item) => Number(item[valueKey] || 0))), [items]);
    return <div className="card"><h2>{title}</h2><div className="grid">{items.map((item) => <div className="chart-bar" key={item[labelKey]}><div className="toolbar"><span>{item[labelKey]}</span><strong>{item[valueKey]}</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${(Number(item[valueKey] || 0) / max) * 100}%` }} /></div></div>)}</div>{!items.length && <div className="empty">No chart data yet.</div>}</div>;
}

function PieChart({ title, items = [], labelKey, valueKey }) {
    const labels = useMemo(() => items.map((it) => it[labelKey] ?? ''), [items, labelKey]);
    const dataValues = useMemo(() => items.map((it) => Number(it[valueKey] || 0)), [items, valueKey]);
    const colors = ['#0b6b4f', '#c79a2b', '#1f5fa8', '#7c3aed', '#e11d48', '#06b6d4', '#f97316'];

    const data = useMemo(() => ({
        labels,
        datasets: [{
            data: dataValues,
            backgroundColor: labels.map((_, i) => colors[i % colors.length]),
            hoverOffset: 8,
        }],
    }), [labels, dataValues]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { boxWidth: 12, boxHeight: 12 } },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const val = context.parsed;
                        const sum = dataValues.reduce((s, v) => s + v, 0) || 1;
                        const pct = ((val / sum) * 100).toFixed(1);
                        return `${context.label}: ${val} (${pct}%)`;
                    }
                }
            },
            title: { display: false },
        }
    }), [dataValues]);

    return (
        <div className="card" style={{ minHeight: 240 }}>
            <h2>{title}</h2>
            {items.length ? (
                <div style={{ height: 220 }}>
                    <Pie data={data} options={options} />
                </div>
            ) : (
                <div className="empty">No chart data yet.</div>
            )}
        </div>
    );
}

function BarChart({ title, items = [], labelKey, valueKey }) {
    const labels = useMemo(() => items.map((it) => it[labelKey] ?? ''), [items, labelKey]);
    const dataValues = useMemo(() => items.map((it) => Number(it[valueKey] || 0)), [items, valueKey]);
    const colors = ['#1f5fa8', '#0b6b4f', '#c79a2b', '#7c3aed', '#e11d48'];

    const data = useMemo(() => ({
        labels,
        datasets: [{
            label: title,
            data: dataValues,
            backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        }]
    }), [labels, dataValues]);

    const options = useMemo(() => ({
        indexAxis: 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            y: { beginAtZero: true },
            x: { ticks: { autoSkip: false } }
        }
    }), []);

    return (
        <div className="card" style={{ minHeight: 320 }}>
            <h2>{title}</h2>
            {items.length ? (
                <div style={{ height: 300 }}>
                    <Bar data={data} options={options} />
                </div>
            ) : (
                <div className="empty">No chart data yet.</div>
            )}
        </div>
    );
}

function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 400) setIsVisible(true);
            else setIsVisible(false);
        };
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <button
            className={`back-to-top ${isVisible ? 'visible' : ''}`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
        ><ChevronUp size={22} /></button>
    );
}

function App() {
    return <ConfigProvider><AuthProvider><BrowserRouter><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
        <Route path="/reset-password" element={<AuthPage mode="reset" />} />
        <Route path="/dashboard" element={<RoleRoute roles={['applicant', 'super_admin', 'hr_admin', 'reviewer', 'panel_member', 'registrar']}><Dashboard /></RoleRoute>} />
        <Route path="/profile" element={<RoleRoute roles={['applicant']}><ProfilePage /></RoleRoute>} />
        <Route path="/settings" element={<RoleRoute roles={['applicant', 'super_admin', 'hr_admin', 'reviewer', 'panel_member', 'registrar']}><UserSettingsPage /></RoleRoute>} />
        <Route path="/vacancies" element={<RoleRoute roles={['applicant', 'super_admin', 'hr_admin']}><VacancyList /></RoleRoute>} />
        <Route path="/apply" element={<RoleRoute roles={['applicant']}><ApplicationWizard /></RoleRoute>} />
        <Route path="/application-preview" element={<RoleRoute roles={['applicant']}><ApplicationPreviewPage /></RoleRoute>} />
        <Route path="/tracking" element={<RoleRoute roles={['applicant']}><TrackingPage /></RoleRoute>} />
        <Route path="/appointment-letter" element={<RoleRoute roles={['applicant']}><AppointmentLetterPage /></RoleRoute>} />
        <Route path="/admin/applicants" element={<RoleRoute roles={['super_admin', 'hr_admin']}><AdminApplicants /></RoleRoute>} />
        <Route path="/admin/reviews" element={<RoleRoute roles={['super_admin', 'hr_admin', 'reviewer']}><ReviewsPage /></RoleRoute>} />
        <Route path="/reviewer/completed" element={<RoleRoute roles={['reviewer']}><ReviewsPage mode="completed" /></RoleRoute>} />
        <Route path="/reviewer/guide" element={<RoleRoute roles={['reviewer']}><ReviewerGuidePage /></RoleRoute>} />
        <Route path="/admin/shortlists" element={<RoleRoute roles={['super_admin', 'hr_admin']}><ShortlistPage /></RoleRoute>} />
        <Route path="/admin/interviews" element={<RoleRoute roles={['super_admin', 'hr_admin', 'panel_member']}><InterviewsPage /></RoleRoute>} />
        <Route path="/admin/final-approvals" element={<RoleRoute roles={['super_admin', 'registrar']}><FinalApprovalsPage /></RoleRoute>} />
        <Route path="/admin/successful-list" element={<RoleRoute roles={['super_admin', 'hr_admin', 'registrar']}><SuccessfulListPage /></RoleRoute>} />
        <Route path="/admin/reports" element={<RoleRoute roles={['super_admin', 'hr_admin', 'registrar']}><ReportsPage /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute roles={['super_admin']}><UsersPage /></RoleRoute>} />
        <Route path="/admin/settings" element={<RoleRoute roles={['super_admin']}><SettingsPage /></RoleRoute>} />
        <Route path="/admin/audit" element={<RoleRoute roles={['super_admin']}><AuditPage /></RoleRoute>} />
    </Routes><BackToTop /></BrowserRouter></AuthProvider></ConfigProvider>;
}

createRoot(document.getElementById('root')).render(<App />);
