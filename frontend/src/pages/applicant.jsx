import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
    AlarmClock, Bell, BriefcaseBusiness, CalendarClock, CheckCircle2, ClipboardCheck,
    Download, Eye, FileCheck2, FileText, GraduationCap, KeyRound, LayoutDashboard, LogIn, LogOut, Mail, MapPin, Menu, Phone,
    Plus, Search, Settings, ShieldCheck, Trash2, Upload, UserCog, UserPlus, UsersRound, X, ChevronUp, HelpCircle, Share,
    ChevronLeft, ChevronRight, MousePointerClick, Smartphone, EyeOff, FileCheck, Sparkles, MonitorSmartphone,
    Award, Users, TrendingUp, Star, Check, ArrowRight, Globe, UserCircle
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
const refereeTemplate = { name: '', email: '', phone: '', organization: '', position: '' };
const certificationTemplate = { name: '', issuer: '', issued_at: '' };
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





function ProfilePage() {
    const [payload, setPayload] = useState({ profile: {}, education: [], olevels: [], experience: [], certifications: [], referees: [] });
    const [applications, setApplications] = useState([]);
    const [pdfPreview, setPdfPreview] = useState(null);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        Promise.all([api.get('/profile'), api.get('/applications')])
            .then(([profileRes, applicationRes]) => {
                setPayload(profileRes.data);
                setApplications(rows(applicationRes.data));
            })
            .catch(() => { });
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

function ApplicationPreviewPage() {
    const [payload, setPayload] = useState({ profile: {}, education: [], olevels: [], experience: [], certifications: [], referees: [] });
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
                            ['College', vacancy.college?.name],
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

function CollectionEditor({ title, items = [], setItems, template, requiredKeys = [], fieldOptions = {}, maxItems, pairedFields = [] }) {
    const updateItem = (index, key, value) => {
        setItems(items.map((row, i) => i === index ? { ...row, [key]: value } : row));
    };

    const pairedSet = new Set(pairedFields.flat());
    const pairMap = {};
    pairedFields.forEach(([a, b]) => { pairMap[a] = b; });

    const renderFields = (item, index) => {
        const keys = Object.keys(template);
        const rendered = new Set();
        return keys.map((key) => {
            if (rendered.has(key)) return null;
            if (pairMap[key]) {
                const partner = pairMap[key];
                rendered.add(key);
                rendered.add(partner);
                return (
                    <div key={key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', gridColumn: 'span 1' }}>
                        <Field
                            label={fieldLabel(key)}
                            type={typeof template[key] === 'boolean' ? 'checkbox' : key.includes('date') ? 'date' : 'text'}
                            as={fieldOptions[key] ? 'select' : 'input'}
                            value={item[key]}
                            options={fieldOptions[key] || []}
                            required={requiredKeys.includes(key)}
                            onChange={(v) => updateItem(index, key, v)}
                        />
                        <Field
                            label={fieldLabel(partner)}
                            type={typeof template[partner] === 'boolean' ? 'checkbox' : partner.includes('date') ? 'date' : 'text'}
                            as={fieldOptions[partner] ? 'select' : 'input'}
                            value={item[partner]}
                            options={fieldOptions[partner] || []}
                            required={requiredKeys.includes(partner)}
                            onChange={(v) => updateItem(index, partner, v)}
                        />
                    </div>
                );
            }
            if (pairedSet.has(key)) return null;
            rendered.add(key);
            return (
                <Field
                    key={key}
                    label={fieldLabel(key)}
                    type={typeof template[key] === 'boolean' ? 'checkbox' : (key.includes('date') || key.endsWith('_at')) ? 'date' : key.includes('year') || key === 'cgpa' ? 'number' : 'text'}
                    as={fieldOptions[key] ? 'select' : key === 'responsibilities' ? 'textarea' : 'input'}
                    value={item[key]}
                    options={fieldOptions[key] || []}
                    required={requiredKeys.includes(key)}
                    onChange={(v) => updateItem(index, key, v)}
                />
            );
        });
    };

    return (
        <div className="collection">
            <div className="toolbar">
                <h3>{title}</h3>
                {(!maxItems || (items || []).length < maxItems) && <button type="button" className="btn" onClick={() => setItems([...(items || []), { ...template }])}><Plus size={16} /> Add</button>}
            </div>
            {!(items || []).length && <div className="empty compact">No entries yet.</div>}
            {(items || []).map((item, index) => (
                <div className="collection-row card" key={item.id || index}>
                    <div className="toolbar compact-toolbar">
                        <strong>{title} #{index + 1}</strong>
                        <button type="button" className="btn icon" title="Remove" onClick={() => setItems(items.filter((_, i) => i !== index))}><Trash2 size={16} /></button>
                    </div>
                    <div className="grid cols-3">
                        {renderFields(item, index)}
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
                                        <th style={{ width: '100%' }}>Subject</th>
                                        <th style={{ width: '1%', whiteSpace: 'nowrap', textAlign: 'right' }}>Grade</th>
                                        <th style={{ width: '1%', whiteSpace: 'nowrap', textAlign: 'right' }}>Action</th>
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
                                            <td style={{ textAlign: 'right' }}>
                                                <select className="select" required value={row.grade} onChange={(event) => updateSubject(index, subjectIndex, 'grade', event.target.value)}>
                                                    <option value="">Select Grade</option>
                                                    {oLevelGrades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                                                </select>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="btn icon danger" title="Remove" type="button" onClick={() => removeSubject(index, subjectIndex)}><Trash2 size={16} /></button>
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
                            <span className="muted">{subjects.length}/9 subjects (max)</span>
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
    const endpoint = '/vacancies';

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setLoading(true);
            api.get(endpoint, { params: { search: searchTerm } })
                .then(({ data }) => setItems(rows(data)))
                .catch(() => { })
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [endpoint, searchTerm]);



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

function ApplicationWizard() {
    const auth = useAuth();
    const params = new URLSearchParams(location.search);
    const [step, setStep] = useState(0);
    const [vacancies, setVacancies] = useState([]);
    const [lookups, setLookups] = useState({ document_types: [] });
    const [payload, setPayload] = useState({ profile: {}, education: [], olevels: [], experience: [], certifications: [], referees: [] });
    const [form, setForm] = useState({ vacancy_id: params.get('vacancy') || '', cover_letter: '' });
    const [documents, setDocuments] = useState([{ label: 'CV', document_type_id: '', file: null }]);
    const [documentPreview, setDocumentPreview] = useState(null);
    const [declarationAccepted, setDeclarationAccepted] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [recaptchaResetKey, setRecaptchaResetKey] = useState(0);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [passportFile, setPassportFile] = useState(null);
    const [passportUploading, setPassportUploading] = useState(false);
    const [locationOptions, setLocationOptions] = useState({ countries: [], states: [], localGovernments: [] });
    const [locationLoading, setLocationLoading] = useState({ countries: false, states: false, localGovernments: false });
    const [locationError, setLocationError] = useState('');
    const tabsRef = useRef(null);
    const steps = ['Personal', 'Contact', 'Education', 'Experience', 'Certifications', 'Referees', 'Documents', 'Vacancy', 'Preview'];
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
                    referees: wizardPayload.referees?.length ? wizardPayload.referees : [
                        { name: '', email: '', phone: '' },
                        { name: '', email: '', phone: '' },
                    ],
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
                const isAppSubmitted = Boolean(draft?.submitted_at || draft?.status !== 'Draft');
                if (isAppSubmitted) {
                    setIsSubmitted(true);
                    setStep(8);
                } else {
                    setStep(Math.min(8, Math.max(0, Number(profile.application_wizard_step || 0))));
                }
            })
            .catch((err) => setError(errorMessage(err)));
    }, []);

    useEffect(() => {
        if (tabsRef.current) {
            const activeTab = tabsRef.current.querySelector('.wizard-tab-wrapper.active-step');
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [step]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

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
        referees: payload.referees,
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
                if (!(result.subjects || []).length) {
                    return { valid: false, step: 2, message: 'Add at least one subject for each O-Level result.' };
                }
                if ((result.subjects || []).some((row) => !present(row.subject) || !present(row.grade))) {
                    return { valid: false, step: 2, message: 'Select a subject and grade for all O-Level entries.' };
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
            const refereeRows = (payload.referees || []).filter(hasEntry);
            if (refereeRows.length < 2) {
                return { valid: false, step: 5, message: `You need exactly 2 referees. ${refereeRows.length === 0 ? 'No referees have been added yet.' : 'Only 1 referee has been added — please add one more.'}` };
            }
            if (collectionHasIncompleteRows(refereeRows, ['name', 'email', 'phone'])) {
                return { valid: false, step: 5, message: 'Each referee must have a name, email, and phone number filled in.' };
            }
        }

        if (targetStep === 6) {
            if (!attachedDocuments.length) return { valid: false, step: 6, message: 'Upload at least one required document before continuing.' };
            const incompleteDocument = documents.find((document) => (document.file || document.id || document.uploaded) && !present(document.document_type_id));
            if (incompleteDocument) return { valid: false, step: 6, message: 'Select a document type for every uploaded document.' };

            const hasFileError = documents.some(document => document.error);
            if (hasFileError) return { valid: false, step: 6, message: 'Please resolve document upload errors before continuing.' };
        }

        if (targetStep === 7) {
            if (!present(form.vacancy_id)) {
                return { valid: false, step: 7, message: 'Select a vacancy before continuing.' };
            }
            if (selectedVacancy && selectedVacancy.required_documents?.length) {
                const uploadedTypeIds = attachedDocuments.map((doc) => String(doc.document_type_id));
                const missingDocs = [];
                for (const docName of selectedVacancy.required_documents) {
                    const typeObj = lookups.document_types?.find((dt) => dt.name === docName);
                    if (typeObj && !uploadedTypeIds.includes(String(typeObj.id))) {
                        missingDocs.push(docName);
                    }
                }
                if (missingDocs.length > 0) {
                    return { valid: false, step: 6, message: `Please upload the required documents for this vacancy: ${missingDocs.join(', ')}.` };
                }
            }
        }

        if (targetStep === 8) {
            if (!declarationAccepted) return { valid: false, step: 8, message: 'Confirm the declaration before submitting your application.' };
            if (captchaEnabled && !recaptchaToken) return { valid: false, step: 8, message: 'Complete the captcha verification before submitting your application.' };
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
            const tabName = steps[step];
            const actionText = final ? 'Application submitted' : (['Referees', 'Documents', 'Certifications', 'Experience'].includes(tabName) ? `${tabName} saved` : `${tabName} details saved`);
            setMessage(response?.data?.application_number ? `${actionText}: ${response.data.application_number}` : actionText);
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

    const saveAndContinue = () => persistStep(Math.min(step + 1, 8));
    const submit = () => {
        setError('');
        const validation = validateThrough(8);
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
            <div className="wizard-tabs" ref={tabsRef}>
                {steps.map((label, i) => (
                    <div key={label} className={`wizard-tab-wrapper ${i === step ? 'active-step' : ''}`}>
                        <button className={`wizard-tab ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => goToStep(i)} type="button">
                            <span>{i + 1}</span>{label}
                        </button>
                        <div className={`step ${i <= step ? 'active' : ''}`} />
                    </div>
                ))}
            </div>
            {message && (
                <div className="toast success" style={{ zIndex: 1000 }}>
                    {message}
                    <button type="button" className="btn icon" style={{ color: 'inherit', minHeight: 'unset', padding: 0, marginLeft: '8px', border: 'none', background: 'transparent' }} onClick={() => setMessage('')}><X size={16} /></button>
                </div>
            )}
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
                                start_year: oLevelYears,
                                end_year: oLevelYears,
                            }}
                            pairedFields={[['start_year', 'end_year']]}
                        />
                        <OLevelEditor items={payload.olevels || []} setItems={(olevels) => setPayload({ ...payload, olevels })} />
                    </>
                )}
                {step === 3 && <CollectionEditor title="Work Experience" items={payload.experience} setItems={(experience) => setPayload({ ...payload, experience })} template={experienceTemplate} requiredKeys={['organization', 'position']} />}
                {step === 4 && <CollectionEditor title="Certifications and Skills" items={payload.certifications} setItems={(certifications) => setPayload({ ...payload, certifications })} template={certificationTemplate} requiredKeys={['name']} />}

                {step === 5 && <CollectionEditor title="Referees" items={payload.referees} setItems={(referees) => setPayload({ ...payload, referees })} template={refereeTemplate} maxItems={2} requiredKeys={['name', 'email', 'phone']} />}

                {step === 6 && (
                    <DocumentStep
                        documents={documents}
                        setDocuments={setDocuments}
                        documentTypes={(lookups.document_types || []).filter((type) => !String(type.slug || type.name || '').toLowerCase().includes('passport'))}
                        onView={viewDocument}
                    />
                )}

                {step === 7 && (
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

                {step === 8 && (
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
                    <button className="btn" type="button" disabled={step === 0 || saving} onClick={() => goToStep(Math.max(0, step - 1))}>Prev</button>
                    {isSubmitted ? (
                        <button className="btn primary" type="button" disabled={step === 8 || saving} onClick={() => goToStep(Math.min(8, step + 1))}>Next</button>
                    ) : step < 8 ? (
                        <button className="btn primary" type="button" disabled={saving} onClick={saveAndContinue}>{saving ? 'Saving...' : 'Save & Continue'}</button>
                    ) : (
                        <button className="btn green" type="button" disabled={saving} onClick={submit}>{saving ? 'Submitting...' : 'Submit Application'}</button>
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
                {payload.referees?.length > 0 && (
                    <>
                        <h4 style={{ margin: '12px 0 4px', fontSize: '13px', color: 'var(--muted)' }}>Referees</h4>
                        <ul className="preview-list">
                            {payload.referees.map((item, index) => (
                                <li key={item.id || index}>
                                    <UserCircle size={14} />
                                    {[item.name, item.position, item.organization, item.phone].filter(Boolean).join(' · ')}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
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
    useEffect(() => { api.get('/applications').then(({ data }) => setItems(rows(data))).catch(() => { }); }, []);
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

export { ProfilePage, ApplicationPreviewPage, CollectionEditor, OLevelEditor, VacancyList, ApplicationWizard, DocumentStep, ApplicationPreview, TrackingPage, AppointmentLetterPage };