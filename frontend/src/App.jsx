import React, {  useCallback, useEffect, useMemo, useRef, useState , Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
    AlarmClock, Bell, BriefcaseBusiness, CalendarClock, CheckCircle2, ClipboardCheck,
    Download, Eye, FileCheck2, FileText, GraduationCap, KeyRound, LayoutDashboard, LogIn, LogOut, Mail, MapPin, Menu, Phone,
    Plus, Search, Settings, ShieldCheck, Trash2, Upload, UserCog, UserPlus, UsersRound, X, ChevronUp, HelpCircle, Share,
    ChevronLeft, ChevronRight, MousePointerClick, Smartphone, EyeOff, FileCheck, Sparkles, MonitorSmartphone,
    Award, Users, TrendingUp, Star, Check, ArrowRight, Globe
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
import Home from './pages/Home';
import Modal from './components/ui/Modal';
import { Separator } from './components/ui/separator';
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






import { PasswordStrengthMeter, AuthPage, EmailVerifiedPage, Field, RecaptchaCheckbox } from './pages/auth';
import { VacancyCard, VacancySkeleton, DetailGrid, PassportAvatar, PassportUploadField, DashboardShell, RoleRoute, DataTable, RemoteTable, Chart, PieChart, BarChart, BackToTop, PreviewInfoGrid, PreviewSection, ApplicationSummary, ApplicantDetails, AppointmentLetterDocument, ApplicationTimeline } from './components/shared';

// Lazy loaded dashboard and role-specific views
const Dashboard = lazy(() => import('./pages/dashboard').then(m => ({ default: m.Dashboard })));

// Applicant Pages
const ProfilePage = lazy(() => import('./pages/applicant').then(m => ({ default: m.ProfilePage })));
const ApplicationPreviewPage = lazy(() => import('./pages/applicant').then(m => ({ default: m.ApplicationPreviewPage })));
const VacancyList = lazy(() => import('./pages/applicant').then(m => ({ default: m.VacancyList })));
const ApplicationWizard = lazy(() => import('./pages/applicant').then(m => ({ default: m.ApplicationWizard })));
const TrackingPage = lazy(() => import('./pages/applicant').then(m => ({ default: m.TrackingPage })));
const AppointmentLetterPage = lazy(() => import('./pages/applicant').then(m => ({ default: m.AppointmentLetterPage })));

// Admin Pages
const VacancyManager = lazy(() => import('./pages/admin').then(m => ({ default: m.VacancyManager })));
const AdminApplicants = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminApplicants })));
const ReviewsPage = lazy(() => import('./pages/admin').then(m => ({ default: m.ReviewsPage })));
const ReviewerGuidePage = lazy(() => import('./pages/admin').then(m => ({ default: m.ReviewerGuidePage })));
const ShortlistPage = lazy(() => import('./pages/admin').then(m => ({ default: m.ShortlistPage })));
const InterviewsPage = lazy(() => import('./pages/admin').then(m => ({ default: m.InterviewsPage })));
const FinalApprovalsPage = lazy(() => import('./pages/admin').then(m => ({ default: m.FinalApprovalsPage })));
const SuccessfulListPage = lazy(() => import('./pages/admin').then(m => ({ default: m.SuccessfulListPage })));
const ReportsPage = lazy(() => import('./pages/admin').then(m => ({ default: m.ReportsPage })));
const UsersPage = lazy(() => import('./pages/admin').then(m => ({ default: m.UsersPage })));
const SettingsPage = lazy(() => import('./pages/admin').then(m => ({ default: m.SettingsPage })));
const UserSettingsPage = lazy(() => import('./pages/admin').then(m => ({ default: m.UserSettingsPage })));
const AuditPage = lazy(() => import('./pages/admin').then(m => ({ default: m.AuditPage })));

function App() {
    return <ConfigProvider><AuthProvider><BrowserRouter><Suspense fallback={<div className="loading-state">Loading portal...</div>}><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/email-verified" element={<EmailVerifiedPage />} />
        <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
        <Route path="/reset-password" element={<AuthPage mode="reset" />} />
        <Route path="/dashboard" element={<RoleRoute roles={['applicant', 'super_admin', 'hr_admin', 'reviewer', 'panel_member', 'registrar']}><Dashboard /></RoleRoute>} />
        <Route path="/profile" element={<RoleRoute roles={['applicant']}><ProfilePage /></RoleRoute>} />
        <Route path="/settings" element={<RoleRoute roles={['applicant', 'super_admin', 'hr_admin', 'reviewer', 'panel_member', 'registrar']}><UserSettingsPage /></RoleRoute>} />
        <Route path="/vacancies" element={<RoleRoute roles={['applicant']}><VacancyList /></RoleRoute>} />
        <Route path="/admin/vacancies" element={<RoleRoute roles={['super_admin', 'hr_admin']}><VacancyManager /></RoleRoute>} />
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
    </Routes></Suspense><BackToTop /></BrowserRouter></AuthProvider></ConfigProvider>;
}

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(<App />);
}