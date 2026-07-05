import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
    AlarmClock, Bell, BriefcaseBusiness, CalendarClock, CheckCircle2, ClipboardCheck,
    Download, Eye, FileCheck2, FileText, GraduationCap, KeyRound, LayoutDashboard, LogIn, LogOut, Mail, MapPin, Menu, Phone,
    Plus, Search, Settings, ShieldCheck, Trash2, Upload, UserCog, UserPlus, UsersRound, X, ChevronUp, HelpCircle, Share,
    ChevronLeft, ChevronRight, MousePointerClick, Smartphone, EyeOff, FileCheck, Sparkles, MonitorSmartphone,
    Award, Users, TrendingUp, Star, Check, ArrowRight, Globe, Flame, Building2, Briefcase, Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Home from '../pages/Home';
import Modal from './ui/Modal';
import { Separator } from './ui/separator';
import '../bootstrap';
import '../app.css';                                                                                                                                                                                                                                                                                                                                                             
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
import api, { errorMessage } from '../services/api';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ConfigProvider, useConfig } from '../context/ConfigContext';
import { PasswordStrengthMeter, AuthPage, EmailVerifiedPage, Field, RecaptchaCheckbox } from '../pages/auth';


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
const statusClass = (status = '') => status.includes('Approved') || status.includes('Shortlisted') || status.includes('Recommended') || status === 'active' ? 'green' : status.includes('Rejected') || status.includes('Not') || status === 'inactive' ? 'red' : status.includes('Draft') ? 'gold' : '';
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
const oLevelExamTypes = ['WAEC', 'NECO', 'NABTEB', 'GCE', 'Other'];
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
    college_id: '',
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
    else if (score === 3) { text = 'Good'; color = 'var(--green)'; }
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





function VacancyCard({ vacancy }) {
    const isNew = vacancy.created_at && (new Date() - new Date(vacancy.created_at)) / (1000 * 60 * 60) <= 48;
    const diffHours = vacancy.deadline ? (new Date(vacancy.deadline) - new Date()) / 3600000 : 0;
    const isClosingToday = diffHours > 0 && diffHours <= 24;
    const daysRemaining = Math.floor(diffHours / 24);
    
    // Simulate "High Demand" for visual wow factor if there are multiple positions or it's popular
    const isHighDemand = vacancy.vacant_positions > 2;
    const borderClass = vacancy.staff_category === 'Academic' ? 'border-green' : 'border-gold';

    return (
        <div className={`card vacancy-card premium-card ${borderClass}`}>
            <div className="vacancy-badges-top" style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span className={`badge ${vacancy.staff_category === 'Academic' ? 'green' : 'gold'}`}>{vacancy.staff_category}</span>
                {isNew && <span className="badge blue animate-pulse" title={`Posted on: ${new Date(vacancy.created_at).toLocaleString()}`}><Sparkles size={12} style={{ marginRight: '4px' }} /> New</span>}
                {/* {isHighDemand && <span className="badge red"><Flame size={12} style={{ marginRight: '4px' }} /> High Demand</span>} */}
            </div>
            
            <h3 className="vacancy-title" style={{ fontSize: '18px', marginBottom: '8px' }}>{vacancy.title}</h3>
            
            <div className="vacancy-meta-pills" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <span className="meta-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}><Building2 size={14}/> {vacancy.department?.name || 'General'}</span>
                <span className="meta-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}><Briefcase size={14}/> {vacancy.rank_or_grade}</span>
                <span className="meta-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--muted)' }}><Users size={14}/> {vacancy.vacant_positions || 1} position(s)</span>
            </div>
            
            <p className="vacancy-qual" style={{ marginBottom: '10px', color: 'var(--ink)' }}>{vacancy.minimum_qualification}</p>
            
            {Boolean(vacancy.requirements?.length) && (
                <ul className="mini-list vacancy-reqs" style={{ marginBottom: '12px' }}>
                    {vacancy.requirements.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
                </ul>
            )}
            
            <div className="vacancy-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                <div className="vacancy-deadline-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> {fmt(vacancy.deadline)}</span>
                    {vacancy.deadline && diffHours > 0 && (
                        <span className={`badge ${isClosingToday ? 'red animate-pulse' : 'subtle'}`} style={{ fontSize: '11px' }}>
                            {isClosingToday ? 'Closing today' : `${daysRemaining}d left`}
                        </span>
                    )}
                </div>
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
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth <= 920) return true;
        const saved = localStorage.getItem('desktop-sidebar-collapsed');
        return saved === 'true';
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth > 920) {
            localStorage.setItem('desktop-sidebar-collapsed', isCollapsed);
        }
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
            .catch(() => { });
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
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-top">
                    <Link className="brand" to="/">
                        <span className="brand-mark"><img src="/assets/jlogo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></span>
                        <span>Recruitment</span>
                    </Link>
                    <div className="sidebar-actions">
                        <button className="collapse-toggle" type="button" onClick={() => setIsCollapsed(!isCollapsed)} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    </div>
                </div>
                {!isCollapsed && primaryRole !== 'applicant' && <div className="role-chip">{roleLabels[primaryRole] || 'Portal User'}</div>}
                <nav className="side-nav">
                    {visibleNav.map(({ path, label, icon: Icon }) => (
                        <NavLink className="side-link" to={path} key={path} data-tooltip={label}>
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
    { path: '/admin/vacancies', label: 'Vacancies', icon: BriefcaseBusiness, roles: ['super_admin', 'hr_admin'] },
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

function RoleRoute({ roles, children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="auth-wrap"><div className="card">Loading portal...</div></div>;
    if (!user) return <Navigate to="/login" />;
    if (!canAccess(user, roles)) return <Navigate to="/dashboard" replace />;
    return children;
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

function RemoteTable({ title, endpoint, columns, action }) {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get(endpoint).then(({ data }) => setItems(rows(data))).catch(() => { }); }, [endpoint]);
    return <DataTable title={title} items={items} columns={columns} action={action} />;
}

function DataTable({ title, items = [], columns = [], action, headerAction, pageSize = 15 }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [currentLimit, setCurrentLimit] = useState(pageSize);
    
    // Reset to page 1 if items change significantly
    useEffect(() => { setCurrentPage(1); }, [items.length, currentLimit]);

    const totalPages = Math.ceil(items.length / currentLimit) || 1;
    const startIndex = (currentPage - 1) * currentLimit;
    const paginatedItems = items.slice(startIndex, startIndex + currentLimit);

    return (
        <div className="card" style={{ padding: 0 }}>
            {title && (
                <div className="toolbar" style={{ padding: '20px 24px 16px', margin: 0, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>{title}</h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className="badge">{items.length} records</span>
                        {headerAction}
                    </div>
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
            
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', backgroundColor: '#fcfcfc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                        Showing {items.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + currentLimit, items.length)} of {items.length} entries
                    </span>
                    <select 
                        value={currentLimit} 
                        onChange={(e) => setCurrentLimit(Number(e.target.value))}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', cursor: 'pointer', backgroundColor: '#fff' }}
                    >
                        <option value={5}>5 entries</option>
                        <option value={10}>10 entries</option>
                        <option value={20}>20 entries</option>
                        <option value={50}>50 entries</option>
                        <option value={100}>100 entries</option>
                        <option value={500}>500 entries</option>
                    </select>
                </div>
                
                {items.length > currentLimit && (
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
                )}
            </div>
        </div>
    );
}

function Chart({ title, items = [], labelKey, valueKey }) {
    const max = useMemo(() => Math.max(1, ...items.map((item) => Number(item[valueKey] || 0))), [items]);
    return <div className="card"><h2>{title}</h2><div className="grid">{items.map((item) => <div className="chart-bar" key={item[labelKey]}><div className="toolbar"><span>{item[labelKey]}</span><strong>{item[valueKey]}</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${(Number(item[valueKey] || 0) / max) * 100}%` }} /></div></div>)}</div>{!items.length && <div className="empty">No chart data yet.</div>}</div>;
}

function PieChart({ title, items = [], labelKey, valueKey }) {
    const labels = useMemo(() => items.map((it) => it[labelKey] ?? ''), [items, labelKey]);
    const dataValues = useMemo(() => items.map((it) => Number(it[valueKey] || 0)), [items, valueKey]);
    const colors = ['#006837', '#004020', '#22c55e', '#84cc16', '#c79a2b', '#e11d48', '#0f766e'];

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
    const colors = ['#006837', '#004020', '#22c55e', '#c79a2b', '#e11d48'];

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


function renderCell(item, key) {
    if (key === 'applicant') return applicantDisplayName(item);
    if (key === 'vacancy') return item.vacancy?.title || 'General';

    const value = item[key] ?? item.application?.[key] ?? item.user?.[key] ?? item.vacancy?.[key];
    if (key === 'status') return <span className={`badge ${statusClass(value)}`}>{value}</span>;
    if (key.includes('date') || key.endsWith('_at')) return fmt(value);
    return String(value ?? '—');
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

export { VacancyCard, VacancySkeleton, DetailGrid, PassportAvatar, PassportUploadField, DashboardShell, RoleRoute, DataTable, RemoteTable, Chart, PieChart, BarChart, BackToTop, PreviewInfoGrid, PreviewSection, ApplicationSummary, ApplicantDetails, AppointmentLetterDocument, ApplicationTimeline };