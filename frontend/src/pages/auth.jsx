import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
    AlarmClock, Bell, BriefcaseBusiness, CalendarClock, CheckCircle2, ClipboardCheck,
    Download, Eye, FileCheck2, FileText, GraduationCap, KeyRound, LayoutDashboard, LogIn, LogOut, Mail, MapPin, Menu, Phone,
    Plus, Search, Settings, ShieldCheck, Trash2, Upload, UserCog, UserPlus, UsersRound, X, ChevronUp, HelpCircle, Share,
    ChevronLeft, ChevronRight, MousePointerClick, Smartphone, EyeOff, FileCheck, Sparkles, MonitorSmartphone,
    Award, Users, TrendingUp, Star, Check, ArrowRight, Globe
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import Home from '../pages/Home';
import Modal from '../components/ui/Modal';
import { Separator } from '../components/ui/separator';
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
                        <h1>Manage every step of your JOSTUM recruitment journey.</h1>
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
                <div className="auth-card-head" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ecfdf5', border: '2px solid #b7ead2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
                        color: 'var(--green)',
                    }}>
                        <CheckCircle2 size={40} />
                    </div>
                    <div>
                        <h2>Account Creation Successful</h2>
                        <p className="muted">Your email has been confirmed and your applicant account is now active.</p>
                    </div>
                </div>
                <div className="success" style={{ textAlign: 'center' }}>You will be redirected to login in {seconds} second{seconds === 1 ? '' : 's'}.</div>
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

export { PasswordStrengthMeter, AuthPage, EmailVerifiedPage, Field, RecaptchaCheckbox };