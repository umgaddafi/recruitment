import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
    AlarmClock, Bell, BriefcaseBusiness, CalendarClock, CheckCircle2, ClipboardCheck,
    Download, Eye, FileCheck2, FileText, GraduationCap, KeyRound, LayoutDashboard, LogIn, LogOut, Mail, MapPin, Menu, Phone,
    Plus, Search, Settings, ShieldCheck, Trash2, Upload, UserCog, UserPlus, UsersRound, X, ChevronUp, HelpCircle, Share, Loader2,
    ChevronLeft, ChevronRight, MousePointerClick, Smartphone, EyeOff, FileCheck, Sparkles, MonitorSmartphone,
    Award, Users, TrendingUp, Star, Check, Pencil, ArrowRight, Globe
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
import { PasswordStrengthMeter, AuthPage, EmailVerifiedPage, Field, RecaptchaCheckbox } from '../pages/auth';
import { VacancyCard, VacancySkeleton, DetailGrid, PassportAvatar, PassportUploadField, DashboardShell, RoleRoute, DataTable, RemoteTable, Chart, PieChart, BarChart, BackToTop, PreviewInfoGrid, PreviewSection, ApplicationSummary, ApplicantDetails, AppointmentLetterDocument, ApplicationTimeline } from '../components/shared';


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





function VacancyManager() {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [lookups, setLookups] = useState({ colleges: [], departments: [], document_types: [], academic_ranks: [], non_academic_categories: [], ranks: [], staff_categories: [] });
    const [form, setForm] = useState(emptyVacancy);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { api.get('/lookups').then(({ data }) => setLookups(data)).catch(() => { }); }, []);
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            api.get('/admin/vacancies', { params: { search: searchTerm } })
                .then(({ data }) => setItems(rows(data)))
                .catch(() => { });
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const refresh = () => api.get('/admin/vacancies').then(({ data }) => setItems(rows(data)));
    const edit = (vacancy) => {
        setEditingId(vacancy.id);
        setForm({
            ...emptyVacancy,
            ...vacancy,
            college_id: vacancy.college_id || '',
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
            college_id: form.college_id || null,
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
                college_id: vacancy.college_id || null,
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
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                        <Field as="select" label="College" value={form.college_id} options={lookups.colleges.map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => { update('college_id', value); update('department_id', ''); }} />
                        <Field as="select" label="Department / Unit" value={form.department_id} options={lookups.departments.filter(item => !form.college_id || Number(item.college_id) === Number(form.college_id)).map((item) => ({ value: item.id, label: item.name }))} onChange={(value) => update('department_id', value)} />
                        <Field as="select" label="Staff category" required value={form.staff_category} options={['Academic', 'Non-Academic']} onChange={(value) => update('staff_category', value)} />
                        <Field as="select" label="Rank / category" value={form.rank_or_grade} options={
                            (() => {
                                if (form.staff_category === 'Academic') return lookups.academic_ranks;
                                if (form.staff_category === 'Non-Academic') {
                                    const deptRanks = lookups.ranks?.filter(r => r.department_id === Number(form.department_id));
                                    if (deptRanks && deptRanks.length > 0) {
                                        return deptRanks.map(r => r.name);
                                    }
                                }
                                return lookups.non_academic_categories;
                            })()
                        } onChange={(value) => update('rank_or_grade', value)} />
                        <Field as="select" label="Employment type" required value={form.employment_type} options={['Permanent', 'Contract', 'Casual', 'Part-Time']} onChange={(value) => update('employment_type', value)} />
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
                                    <button className="btn icon" title="Edit Advert" type="button" onClick={() => edit(vacancy)}><Pencil size={16} /></button>
                                    {vacancy.status !== 'published' && <button className="btn icon green" title="Publish Advert" type="button" onClick={() => publishExisting(vacancy)}><CheckCircle2 size={16} /></button>}
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

function AdminApplicants() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const loadApplications = useCallback(() => {
        setLoading(true);
        api.get('/applications')
            .then(({ data }) => setItems(rows(data)))
            .catch((err) => setError(errorMessage(err)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadApplications(); }, [loadApplications]);

    const handleView = (application) => {
        setSelectedApplication(application);
        setIsViewModalOpen(true);
    };

    const handleEdit = (application) => {
        setSelectedApplication(application);
        setIsEditModalOpen(true);
    };

    const renderAction = (item) => (
        <div className="inline-actions">
            <button className="btn icon" type="button" title="View Application" onClick={() => handleView(item)}><Eye size={16} /></button>
            <button className="btn icon primary" type="button" title="Edit Application Support Data" onClick={() => handleEdit(item)}><UserCog size={16} /></button>
        </div>
    );

    return (
        <DashboardShell>
            <div className="toolbar">
                <h1>Applicant Management</h1>
                <button className="btn" onClick={loadApplications}><Search size={16} /> Refresh List</button>
            </div>
            {error && <div className="error">{error}</div>}
            
            {loading ? <div className="card">Loading applications...</div> : (
                <DataTable 
                    title="Applications Directory" 
                    items={items} 
                    columns={['applicant', 'application_number', 'vacancy', 'status', 'submitted_at']} 
                    action={renderAction} 
                />
            )}

            {isViewModalOpen && selectedApplication && (
                <Modal title={`Application: ${selectedApplication.application_number}`} wide onClose={() => setIsViewModalOpen(false)}>
                    <ApplicationSummary application={selectedApplication} />
                    <ApplicantDetails application={selectedApplication} />
                </Modal>
            )}

            {isEditModalOpen && selectedApplication && (
                <AdminApplicationEditModal 
                    application={selectedApplication} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onSaved={() => {
                        setIsEditModalOpen(false);
                        loadApplications();
                    }} 
                />
            )}
        </DashboardShell>
    );
}

function AdminApplicationEditModal({ application, onClose, onSaved }) {
    const [status, setStatus] = useState(application.status || 'Submitted');
    const [adminNotes, setAdminNotes] = useState(application.admin_notes || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await api.put(`/applications/${application.id}`, { status, admin_notes: adminNotes });
            onSaved();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal title={`Edit Applicant: ${applicantDisplayName(application)}`} wide onClose={onClose}>
            <div className="card form">
                <div className="toolbar">
                    <h2>Applicant Support Data</h2>
                    <span className="badge">{application.application_number}</span>
                </div>
                {error && <div className="error">{error}</div>}
                
                <Field as="select" label="Application Status" value={status} options={[
                    'Draft', 'Submitted'
                ]} onChange={setStatus} />
                
                <Field as="textarea" label="Administrative Notes" value={adminNotes} onChange={setAdminNotes} />

                <div className="inline-actions">
                    <button className="btn" type="button" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="btn primary" type="button" onClick={handleSave} disabled={saving}>Save Changes</button>
                </div>
            </div>
        </Modal>
    );
}

function ReviewsPage({ mode = 'queue' }) {
    const [items, setItems] = useState([]);
    const [vacancies, setVacancies] = useState([]);
    const [filterVacancyId, setFilterVacancyId] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const loadReviews = useCallback(() => {
        setLoading(true);
        setError('');
        Promise.all([api.get('/reviews'), api.get('/vacancies')])
            .then(([reviewsRes, vacanciesRes]) => {
                const applications = rows(reviewsRes.data);
                setItems(applications);
                setVacancies(rows(vacanciesRes.data));
                setSelectedId((current) => current && applications.some((item) => item.id === current) ? current : applications[0]?.id || null);
            })
            .catch((err) => setError(errorMessage(err)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadReviews(); }, [loadReviews]);

    const userReview = useCallback((application) => (application.reviews || []).find((review) => review.reviewer_id === user?.id), [user?.id]);
    const filteredItems = filterVacancyId ? items.filter((app) => String(app.vacancy_id) === String(filterVacancyId)) : items;
    const pendingItems = filteredItems.filter((application) => !userReview(application) && !['Shortlisted', 'Not Shortlisted'].includes(application.status));
    const completedItems = filteredItems.filter((application) => userReview(application));
    const visibleItems = mode === 'completed' ? completedItems : pendingItems.length ? pendingItems : filteredItems;
    const selected = visibleItems.find((item) => item.id === selectedId) || visibleItems[0] || null;
    const metrics = {
        pending: pendingItems.length,
        completed: completedItems.length,
        recommended: filteredItems.filter((application) => (application.reviews || []).some((review) => review.decision === 'recommended')).length,
        rejected: filteredItems.filter((application) => (application.reviews || []).some((review) => review.decision === 'rejected')).length,
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

            {!loading && (
                <div className="card form" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                    <Field
                        as="select"
                        label="Filter by Vacancy"
                        value={filterVacancyId}
                        options={[{ value: '', label: 'All Vacancies' }, ...vacancies.map((v) => ({ value: v.id, label: v.title }))]}
                        onChange={(val) => { setFilterVacancyId(val); setSelectedId(null); }}
                    />
                </div>
            )}

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
                        ['College', vacancy.college?.name],
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
                            <button className="btn icon" title="View" type="button" onClick={() => viewDocument(document)}><Eye size={16} /></button>
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
                    <button className="btn danger" type="button" disabled={saving} onClick={() => submitReview('rejected')}><X size={16} /> Reject</button>
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
    const [progressCount, setProgressCount] = useState(0);
    const [isAutoShortlistModalOpen, setIsAutoShortlistModalOpen] = useState(false);

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

    const previewAutoShortlist = () => {
        if (!autoForm.vacancy_id) {
            setError('Select a vacancy before running auto-shortlist.');
            return;
        }
        setIsAutoShortlistModalOpen(true);
    };

    const autoShortlistCandidates = eligibleApplications.filter(app => {
        if (String(app.vacancy_id) !== String(autoForm.vacancy_id)) return false;
        const summary = reviewSummary(app);
        return summary.bestScore >= Number(autoForm.minimum_score || 60);
    });

    const totalApplicantsForVacancy = applications.filter(app => String(app.vacancy_id) === String(autoForm.vacancy_id)).length;

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
        setProgressCount(0);
        
        try {
            for (let i = 0; i < autoShortlistCandidates.length; i++) {
                const application = autoShortlistCandidates[i];
                await api.post('/shortlists', {
                    application_id: application.id,
                    method: 'auto',
                    notes: 'Auto-shortlisted based on reviewer recommendations.',
                });
                setProgressCount(i + 1);
            }
            setMessage(`Auto-shortlist completed. ${autoShortlistCandidates.length} candidate(s) shortlisted.`);
            loadShortlistData();
            
            setSavingId('auto-done');
            setTimeout(() => {
                setIsAutoShortlistModalOpen(false);
                setSavingId(null);
                setProgressCount(0);
            }, 5000);
            
        } catch (err) {
            setError(errorMessage(err));
            setSavingId(null);
            setProgressCount(0);
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
                        <button className="btn green" type="button" disabled={savingId === 'auto'} onClick={previewAutoShortlist}><CheckCircle2 size={16} /> Generate Auto Shortlist</button>
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

            {isAutoShortlistModalOpen && (
                <Modal title="Auto Shortlist Preview" wide onClose={() => savingId !== 'auto' && setIsAutoShortlistModalOpen(false)}>
                    <style>{`
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                        .spin { animation: spin 1s linear infinite; }
                    `}</style>
                    <div style={{ padding: '0 0.5rem' }}>
                        {savingId === 'auto' ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ background: 'var(--primary-color)', color: 'white', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', boxShadow: '0 8px 24px rgba(0, 104, 55, 0.25)' }}>
                                    <Loader2 size={36} className="spin" />
                                </div>
                                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.5rem', color: 'var(--heading-color)' }}>Shortlisting Applicants Progress</h3>
                                
                                <div style={{ width: '100%', maxWidth: '320px', background: 'var(--border-color)', height: '10px', borderRadius: '5px', overflow: 'hidden', margin: '1rem 0' }}>
                                    <div style={{ width: `${(progressCount / Math.max(autoShortlistCandidates.length, 1)) * 100}%`, background: 'var(--primary-color)', height: '100%', transition: 'width 0.3s ease' }}></div>
                                </div>
                                
                                <strong style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}>{progressCount} / {autoShortlistCandidates.length}</strong>
                                <p className="muted" style={{ maxWidth: '420px', margin: '0.5rem auto 0', lineHeight: '1.6', fontSize: '1rem' }}>Sending emails and updating candidate records...</p>
                            </div>
                        ) : savingId === 'auto-done' ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'auth-fade-in 0.5s ease-out' }}>
                                <div style={{ background: '#f0fdf4', color: 'var(--primary-color)', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex' }}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.75rem', color: 'var(--primary-color)' }}>Operation Successful</h3>
                                <p className="muted" style={{ maxWidth: '420px', margin: '0 auto', lineHeight: '1.6', fontSize: '1.1rem' }}>
                                    {autoShortlistCandidates.length} candidate(s) have been successfully shortlisted and notified via email.
                                </p>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem 0 0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                                    <div style={{ background: '#f0fdf4', color: 'var(--primary-color)', padding: '1rem', borderRadius: '16px' }}>
                                        <Sparkles size={32} />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', color: 'var(--heading-color)' }}>Confirm Shortlist Generation</h2>
                                        <p className="muted" style={{ margin: 0, fontSize: '1rem' }}>Target Role: <strong style={{ color: 'var(--text-color)' }}>{vacancies.find(v => String(v.id) === String(autoForm.vacancy_id))?.title}</strong></p>
                                    </div>
                                </div>

                                <div className="grid cols-2" style={{ gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', background: 'var(--surface-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                        <span className="muted" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Candidates to Shortlist</span>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                            <strong style={{ fontSize: '3rem', color: 'var(--primary-color)', lineHeight: 1 }}>{autoShortlistCandidates.length}</strong>
                                        </div>
                                    </div>
                                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', background: 'var(--surface-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                        <span className="muted" style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Applicants</span>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                            <strong style={{ fontSize: '3rem', color: 'var(--heading-color)', lineHeight: 1 }}>{totalApplicantsForVacancy}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--surface-color)', borderLeft: '4px solid var(--primary-color)', padding: '1.25rem 1.5rem', borderRadius: '0 12px 12px 0', marginBottom: '2.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-color)' }}>
                                        <strong>Configuration Applied: </strong> The system will select candidates who were explicitly recommended by reviewers and achieved a minimum review score of <strong>{autoForm.minimum_score}</strong>.
                                    </p>
                                </div>
                                
                                <div className="inline-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button className="btn" style={{ padding: '0.75rem 1.5rem' }} type="button" onClick={() => setIsAutoShortlistModalOpen(false)}>Cancel</button>
                                    <button className="btn primary" style={{ padding: '0.75rem 1.5rem' }} type="button" disabled={autoShortlistCandidates.length === 0} onClick={async () => {
                                        await runAutoShortlist();
                                    }}>
                                        <CheckCircle2 size={18} /> Finalize Shortlist
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
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
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [schedulePhase, setSchedulePhase] = useState('idle');
    const [progressText, setProgressText] = useState('');
    const [progressCount, setProgressCount] = useState(0);
    const [progressTotal, setProgressTotal] = useState(0);
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
    const startScheduleProcess = async () => {
        if (form.mode === 'physical' && !form.venue?.trim()) return setError('Please provide a venue for the physical interview.');
        if (form.mode === 'online' && !form.meeting_link?.trim()) return setError('Please provide a meeting link for the online interview.');
        if (!form.vacancy_id) return setError('Please select a vacancy.');
        if (!form.title?.trim()) return setError('Please provide a title.');
        if (!form.interview_date) return setError('Please provide an interview date.');
        if (form.application_ids.length === 0) return setError('Please select at least one candidate.');
        if (form.panel_member_ids.length === 0) return setError('Please select at least one panel member.');
        
        setError('');
        setIsScheduleModalOpen(true);
        setSchedulePhase('sending');
        
        const panelCount = form.panel_member_ids.length;
        const appCount = form.application_ids.length;
        setProgressTotal(panelCount + appCount);
        setProgressCount(0);
        
        setProgressText('Sending invitations to Panel Members...');
        for (let i = 0; i < panelCount; i++) {
            await new Promise(r => setTimeout(r, 400));
            setProgressCount(prev => prev + 1);
        }
        
        setProgressText('Sending interview schedules to Candidates...');
        for (let i = 0; i < appCount; i++) {
            await new Promise(r => setTimeout(r, 400));
            setProgressCount(prev => prev + 1);
        }
        
        setProgressText('Finalizing schedule...');
        try {
            await api.post('/interviews', form);
            
            setSchedulePhase('done');
            
            setTimeout(() => {
                setIsScheduleModalOpen(false);
                setSchedulePhase('idle');
                setProgressCount(0);
                setMessage('Interview schedule created and notifications sent successfully.');
                setForm({ vacancy_id: '', title: '', batch_name: '', interview_date: '', interview_time: '', venue: '', mode: 'physical', meeting_link: '', application_ids: [], panel_member_ids: [] });
                loadInterviewData();
            }, 5000);
            
        } catch (err) {
            setError(errorMessage(err));
            setIsScheduleModalOpen(false);
            setSchedulePhase('idle');
        }
    };
    const toggleArray = (key, value) => {
        const values = form[key] || [];
        const strVal = String(value);
        setForm({ ...form, [key]: values.some(v => String(v) === strVal) ? values.filter((item) => String(item) !== strVal) : [...values, value] });
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
                                <Field as="select" label="Vacancy" value={form.vacancy_id} options={vacancies.map((vacancy) => ({ value: vacancy.id, label: vacancy.title }))} onChange={(vacancy_id) => {
                                    const vacancyApps = shortlistedApplications.filter((application) => String(application.vacancy_id) === String(vacancy_id));
                                    setForm({ ...form, vacancy_id, application_ids: vacancyApps.map(a => a.id) });
                                }} />
                                <Field label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
                                <Field as="select" label="Batch name" value={form.batch_name} options={[{ value: 'Batch A', label: 'Batch A' }, { value: 'Batch B', label: 'Batch B' }, { value: 'Batch C', label: 'Batch C' }, { value: 'Batch D', label: 'Batch D' }]} onChange={(batch_name) => setForm({ ...form, batch_name })} />
                                <Field label="Date" type="date" value={form.interview_date} onChange={(interview_date) => setForm({ ...form, interview_date })} />
                                <Field label="Time" type="time" value={form.interview_time} onChange={(interview_time) => setForm({ ...form, interview_time })} />
                                <Field as="select" label="Mode" value={form.mode} options={[{ value: 'physical', label: 'Physical' }, { value: 'online', label: 'Online' }]} onChange={(mode) => setForm({ ...form, mode })} />
                                {form.mode === 'physical' && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <Field label="Venue" value={form.venue} onChange={(venue) => setForm({ ...form, venue })} />
                                    </div>
                                )}
                                {form.mode === 'online' && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <Field label="Meeting link" value={form.meeting_link} onChange={(meeting_link) => setForm({ ...form, meeting_link })} />
                                    </div>
                                )}
                            </div>
                            <InterviewChecklist title="Candidates" items={selectedVacancyApplications} selected={form.application_ids} label={(application) => `${fullName(application.user?.profile || {})} (${application.application_number})`} onToggle={(id) => toggleArray('application_ids', id)} />
                            <InterviewChecklist title="Panel Members" items={panelMembers} selected={form.panel_member_ids} label={(member) => `${member.name} (${member.email})`} onToggle={(id) => toggleArray('panel_member_ids', id)} />
                            <button className="btn green" type="button" disabled={schedulePhase === 'sending'} onClick={startScheduleProcess}><CalendarClock size={16} /> Schedule Interview</button>
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

            {isScheduleModalOpen && (
                <Modal title="Scheduling Process" wide onClose={() => schedulePhase !== 'sending' && setIsScheduleModalOpen(false)}>
                    <style>{`
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                        .spin { animation: spin 1s linear infinite; }
                    `}</style>
                    <div style={{ padding: '0 0.5rem' }}>
                        {schedulePhase === 'sending' ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ background: 'var(--green)', color: 'white', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', boxShadow: '0 8px 24px var(--brand-green-light)' }}>
                                    <Loader2 size={36} className="spin" />
                                </div>
                                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.5rem', color: 'var(--navy)' }}>Processing Interview Schedule</h3>
                                
                                <div style={{ width: '100%', maxWidth: '320px', background: 'var(--line)', height: '10px', borderRadius: '5px', overflow: 'hidden', margin: '1rem 0' }}>
                                    <div style={{ width: `${(progressCount / Math.max(progressTotal, 1)) * 100}%`, background: 'var(--green)', height: '100%', transition: 'width 0.3s ease' }}></div>
                                </div>
                                
                                <strong style={{ fontSize: '1.25rem', color: 'var(--green)' }}>{progressCount} / {progressTotal} Emails Sent</strong>
                                <p className="muted" style={{ maxWidth: '420px', margin: '0.5rem auto 0', lineHeight: '1.6', fontSize: '1rem' }}>{progressText}</p>
                            </div>
                        ) : schedulePhase === 'done' ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'auth-fade-in 0.5s ease-out' }}>
                                <div style={{ background: 'var(--brand-green-light)', color: 'var(--green)', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex' }}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.75rem', color: 'var(--green)' }}>Operation Successful</h3>
                                <p className="muted" style={{ maxWidth: '420px', margin: '0 auto', lineHeight: '1.6', fontSize: '1.1rem' }}>
                                    Interview schedule has been created and all parties have been notified via email.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </Modal>
            )}
        </div>
    </DashboardShell>;
}

function InterviewChecklist({ title, items, selected, label, onToggle }) {
    const selectedCount = selected?.length || 0;
    return (
        <div className="interview-checklist" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {title}
                <span style={{ fontSize: '0.8rem', padding: '0.15rem 0.6rem', borderRadius: '12px', background: selectedCount > 0 ? 'var(--green)' : 'var(--line)', color: selectedCount > 0 ? 'white' : 'var(--muted)', fontWeight: 600 }}>
                    {selectedCount} selected
                </span>
            </h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--line)', borderRadius: '8px', padding: '0.5rem', background: 'var(--surface)' }}>
                {items.map((item) => {
                    const isSelected = selected.some(id => String(id) === String(item.id));
                    return (
                        <label className="check-item" key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', cursor: 'pointer', borderRadius: '4px', margin: '0 0 0.25rem 0', transition: 'all 0.2s ease', background: isSelected ? 'var(--brand-green-light)' : 'transparent', border: isSelected ? '1px solid rgba(0, 104, 55, 0.3)' : '1px solid transparent' }} onMouseOver={(e) => !isSelected && (e.currentTarget.style.background = 'var(--surface-2)')} onMouseOut={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}>
                            <input type="checkbox" checked={isSelected} onChange={() => onToggle(item.id)} />
                            <span style={{ color: isSelected ? 'var(--green)' : 'inherit', fontWeight: isSelected ? 600 : 400 }}>{label(item)}</span>
                        </label>
                    );
                })}
                {!items.length && <p className="muted" style={{ padding: '0.5rem', margin: 0 }}>No records available.</p>}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--surface)' }}>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <strong style={{ display: 'block', color: 'var(--navy)', fontSize: '0.95rem' }}>Technical</strong>
                            <span className="muted" style={{ fontSize: '0.8rem' }}>Role knowledge and competence</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input type="range" min="0" max="40" value={form.technical_score} onChange={(e) => updateScore('technical_score', e.target.value, 40)} style={{ flex: 1, accentColor: 'var(--green)', margin: 0 }} />
                            <input className="input" type="number" min="0" max="40" value={form.technical_score} onChange={(e) => updateScore('technical_score', e.target.value, 40)} style={{ width: '60px', padding: '0.25rem 0.5rem', margin: 0, textAlign: 'center' }} />
                        </div>
                    </div>
                    <div style={{ padding: '1rem', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--surface)' }}>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <strong style={{ display: 'block', color: 'var(--navy)', fontSize: '0.95rem' }}>Communication</strong>
                            <span className="muted" style={{ fontSize: '0.8rem' }}>Clarity, confidence, and expression</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input type="range" min="0" max="30" value={form.communication_score} onChange={(e) => updateScore('communication_score', e.target.value, 30)} style={{ flex: 1, accentColor: 'var(--green)', margin: 0 }} />
                            <input className="input" type="number" min="0" max="30" value={form.communication_score} onChange={(e) => updateScore('communication_score', e.target.value, 30)} style={{ width: '60px', padding: '0.25rem 0.5rem', margin: 0, textAlign: 'center' }} />
                        </div>
                    </div>
                    <div style={{ padding: '1rem', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--surface)' }}>
                        <div style={{ marginBottom: '0.75rem' }}>
                            <strong style={{ display: 'block', color: 'var(--navy)', fontSize: '0.95rem' }}>Leadership</strong>
                            <span className="muted" style={{ fontSize: '0.8rem' }}>Judgment, maturity, and team fit</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input type="range" min="0" max="30" value={form.leadership_score} onChange={(e) => updateScore('leadership_score', e.target.value, 30)} style={{ flex: 1, accentColor: 'var(--green)', margin: 0 }} />
                            <input className="input" type="number" min="0" max="30" value={form.leadership_score} onChange={(e) => updateScore('leadership_score', e.target.value, 30)} style={{ width: '60px', padding: '0.25rem 0.5rem', margin: 0, textAlign: 'center' }} />
                        </div>
                    </div>
                    <div style={{ padding: '0.25rem 1rem', border: '1px solid var(--line)', borderRadius: '8px', background: 'var(--surface)' }}>
                        <Field as="select" label="Decision" value={form.decision} options={[{ value: 'recommended', label: 'Recommend' }, { value: 'rejected', label: 'Do not recommend' }, { value: 'pending', label: 'Pending' }]} onChange={(decision) => setForm({ ...form, decision })} />
                    </div>
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
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [approvalPhase, setApprovalPhase] = useState('idle');
    const [progressCount, setProgressCount] = useState(0);

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
        setIsApprovalModalOpen(true);
        setApprovalPhase('sending');
        setProgressCount(0);
        
        try {
            for (let i = 0; i < recommendedItems.length; i++) {
                const application = recommendedItems[i];
                await api.post(`/final-approvals/${application.id}`, {
                    decision: 'Approved',
                    reason: 'Approved through registrar bulk appointment approval.',
                });
                setProgressCount(i + 1);
            }
            
            setApprovalPhase('done');
            setTimeout(() => {
                setIsApprovalModalOpen(false);
                setApprovalPhase('idle');
                setProgressCount(0);
                setMessage(`${recommendedItems.length} appointment(s) approved successfully.`);
                loadFinalApprovals();
                setBulkApproving(false);
            }, 5000);
            
        } catch (err) {
            setError(errorMessage(err));
            setIsApprovalModalOpen(false);
            setApprovalPhase('idle');
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

            {isApprovalModalOpen && (
                <Modal title="Bulk Approval Process" wide onClose={() => approvalPhase !== 'sending' && setIsApprovalModalOpen(false)}>
                    <style>{`
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                        .spin { animation: spin 1s linear infinite; }
                    `}</style>
                    <div style={{ padding: '0 0.5rem' }}>
                        {approvalPhase === 'sending' ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ background: 'var(--green)', color: 'white', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', boxShadow: '0 8px 24px var(--brand-green-light)' }}>
                                    <Loader2 size={36} className="spin" />
                                </div>
                                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.5rem', color: 'var(--navy)' }}>Processing Approvals</h3>
                                
                                <div style={{ width: '100%', maxWidth: '320px', background: 'var(--line)', height: '10px', borderRadius: '5px', overflow: 'hidden', margin: '1rem 0' }}>
                                    <div style={{ width: `${(progressCount / Math.max(recommendedItems.length, 1)) * 100}%`, background: 'var(--green)', height: '100%', transition: 'width 0.3s ease' }}></div>
                                </div>
                                
                                <strong style={{ fontSize: '1.25rem', color: 'var(--green)' }}>{progressCount} / {recommendedItems.length} Processed</strong>
                                <p className="muted" style={{ maxWidth: '420px', margin: '0.5rem auto 0', lineHeight: '1.6', fontSize: '1rem' }}>Updating candidate records and sending appointment letters...</p>
                            </div>
                        ) : approvalPhase === 'done' ? (
                            <div style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'auth-fade-in 0.5s ease-out' }}>
                                <div style={{ background: 'var(--brand-green-light)', color: 'var(--green)', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex' }}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 style={{ marginBottom: '0.75rem', fontSize: '1.75rem', color: 'var(--green)' }}>Operation Successful</h3>
                                <p className="muted" style={{ maxWidth: '420px', margin: '0 auto', lineHeight: '1.6', fontSize: '1.1rem' }}>
                                    {recommendedItems.length} candidate(s) have been approved and notified of their appointment.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </Modal>
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
                        ['College', vacancy.college?.name],
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
                            <button className="btn icon" title="View" type="button" onClick={() => viewDocument(document)}><Eye size={16} /></button>
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
                        <button className="btn danger" type="button" disabled={saving} onClick={() => decide('Rejected')}><X size={16} /> Reject</button>
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
                <DataTable
                    title="Successful Staff"
                    items={filteredItems.map((item, index) => {
                        const name = [item.first_name, item.surname, item.other_name].filter(Boolean).join(' ') || item.user?.name || 'Staff Member';
                        const role = item.rank || item.application?.vacancy?.rank_or_grade || item.application?.vacancy?.staff_category || 'N/A';
                        const department = item.department || item.application?.vacancy?.department?.name || 'General';
                        return {
                            id: item.id || `idx-${index}`,
                            'S/N': index + 1,
                            'PF Number': item.pf_number || 'N/A',
                            'Name': name,
                            'Role': role,
                            'Department': department
                        };
                    })}
                    columns={['S/N', 'PF Number', 'Name', 'Role', 'Department']}
                />
            )}
        </div>
    </DashboardShell>;
}

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

            <div className="card" style={{ marginBottom: '32px', padding: '28px', background: 'linear-gradient(to right bottom, #f8fafc, #f1f5f9)', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '16px' }}>
                    <Search size={20} color="var(--primary)" /> Advanced Filtering
                </h3>
                <div className="grid cols-2" style={{ gap: '24px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Department</label>
                        <select 
                            style={{ width: '100%', marginTop: '8px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#1e293b', fontWeight: 500, outline: 'none', transition: 'all 0.2s', cursor: 'pointer' }} 
                            value={filters.department_id} 
                            onChange={(e) => setFilters({...filters, department_id: e.target.value})}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        >
                            <option value="">All Departments</option>
                            {lookups.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Vacancy</label>
                        <select 
                            style={{ width: '100%', marginTop: '8px', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: '#1e293b', fontWeight: 500, outline: 'none', transition: 'all 0.2s', cursor: 'pointer' }} 
                            value={filters.vacancy_id} 
                            onChange={(e) => setFilters({...filters, vacancy_id: e.target.value})}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                        >
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
            <div style={{ marginBottom: '24px' }}>
                {loading ? <div className="card" style={{ padding: '40px', textAlign: 'center' }}>Loading users...</div> : (
                    <DataTable
                        title="User Management"
                        headerAction={<button className="btn primary" onClick={() => openModal()}><Plus size={16} /> Add User</button>}
                        items={users.map(u => ({
                            id: u.id,
                            Name: u.name,
                            Email: u.email,
                            Roles: u.roles?.map(r => r.label || r.name).join(', '),
                            status: u.status,
                            _raw: u
                        }))}
                        columns={['Name', 'Email', 'Roles', 'status']}
                        action={(item) => action(item._raw)}
                    />
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
        api.get('/admin/settings').then(({ data }) => setSettings(rows(data))).catch(() => { });
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
    return <DashboardShell><RemoteTable title="Audit Logs" endpoint="/admin/audit-logs" columns={['name', 'action', 'ip_address', 'created_at']} /></DashboardShell>;
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

export { VacancyManager, RequirementsEditor, DocumentChecklist, AdminApplicants, ReviewsPage, ReviewQueueList, ReviewDetailPanel, ReviewerGuidePage, ShortlistPage, InterviewsPage, InterviewChecklist, InterviewDetail, InterviewCandidateScore, FinalApprovalsPage, FinalApprovalDetail, SuccessfulListPage, ReportsPage, UsersPage, SettingsPage, SettingsEditor, UserSettingsPage, AuditPage };