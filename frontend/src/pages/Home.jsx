import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronRight, GraduationCap, Search, Building2, Briefcase,
    Clock, ArrowRight, MapPin, Filter, X, ChevronLeft, UserCircle, CheckCircle2, Menu,
    BriefcaseBusiness, Bell, ShieldCheck, ClipboardCheck, CalendarClock, FileText,
    HelpCircle, Phone, Mail, Share, LayoutDashboard, LogIn, LogOut, UserPlus, Settings,
    Sun, Moon
} from 'lucide-react';
import api from '../services/api';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import Modal from '../components/ui/Modal';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { motion } from 'framer-motion';
import { VacancyCard } from '../components/shared';

// Shared utilities that were at the top of App.jsx
const defaultBranding = {
    university_name: 'JOSEPH SARWUAN TARKA UNIVERSITY MAKURDI, BENUE STATE',
    portal_name: 'JOSTUM Recruitment',
    contact_email: 'recruitment@jostum.edu.ng',
};

const rows = (data) => Array.isArray(data) ? data : data?.data || [];

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
                <Link className="brand" to="/" onClick={() => setIsOpen(false)}><span className="brand-mark"><img src="/assets/jlogo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></span>{useConfig()?.config?.branding?.portal_name ?? defaultBranding.portal_name}</Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
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
        { id: 1, category: 'Announcement', date: 'May 20, 2024', title: '2024 Recruitment Portal Launched', summary: 'The official recruitment portal for the 2024 academic session is now live. All interested candidates are invited to create accounts.', content: 'We are pleased to announce the official launch of the JOSTUM Recruitment Portal for the 2024 academic session. This state-of-the-art platform is designed to streamline the application process for both academic and non-academic positions. Prospective candidates can now create accounts, build their profiles, and apply for available vacancies with ease. We encourage all applicants to read the instructions carefully and ensure all required documents are uploaded before the specified deadlines.' },
        { id: 2, category: 'Notice', date: 'May 15, 2024', title: 'Extension of Application Deadlines', summary: 'Deadlines for administrative and technical roles have been extended by 14 days to accommodate more applications.', content: 'In response to numerous requests and to ensure a broad pool of qualified candidates, the university management has approved a 14-day extension for all administrative and technical vacancy deadlines. The new deadline for these roles is now June 15, 2024. This extension provides additional time for interested individuals to complete their applications and secure necessary documentation. Please note that this extension does not apply to academic positions unless otherwise stated.' },
        { id: 3, category: 'Policy', date: 'May 10, 2024', title: 'Important Notice on Documentation', summary: 'Please ensure all uploaded credentials are in PDF format and clearly legible to avoid disqualification during the review stage.', content: 'A recent review of submitted applications has revealed a high number of illegible documents and unsupported file formats. To ensure your application is processed successfully, all uploaded credentials (certificates, transcripts, ID cards, etc.) must be in PDF format. Each file must be clearly scanned and under 4MB in size. Photographed documents that are blurry or cut off will result in automatic disqualification. Applicants are advised to double-check their uploads using the "Application Preview" feature before final submission.' },
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
            .catch(() => { })
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
                    <h1>{useConfig()?.config?.branding?.university_name ?? defaultBranding.university_name}</h1>
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
            <section className="section core-features-section" style={{ background: '#f8fafc', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h2>A Transparent & Merit-Based Process</h2>
                        <p className="section-lead mx-auto" style={{ maxWidth: '640px' }}>Our platform ensures equal opportunity, rigorous evaluation, and seamless communication at every stage of the recruitment journey.</p>
                    </div>
                    <div className="grid cols-4 responsive-grid">
                        {[
                            { title: 'Secure Data Handling', desc: 'Your personal information and credentials are encrypted and strictly protected.', icon: ShieldCheck },
                            { title: 'Merit-Driven Scoring', desc: 'Objective reviewer rubrics and automated screening ensure fairness.', icon: ClipboardCheck },
                            { title: 'Real-Time Tracking', desc: 'Monitor your application status and receive immediate system notifications.', icon: Bell },
                            { title: 'Streamlined Interviews', desc: 'Digital scheduling and automated batching for successful candidates.', icon: CalendarClock },
                        ].map((item, i) => (
                            <motion.div
                                className="card"
                                key={item.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', background: '#fff' }}
                            >
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#edf8f2', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                    <item.icon size={28} />
                                </div>
                                <h3 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--navy)' }}>{item.title}</h3>
                                <p className="muted" style={{ fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
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
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>Latest News & Updates</h2>
                    <p className="section-lead">Stay informed with the latest recruitment announcements, procedure updates, and university news.</p>
                    <div className="grid cols-3 responsive-grid">
                        {newsArticles.map((news, i) => (
                            <motion.div
                                className="card news-card"
                                key={news.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                            >
                                <div className={`news-image-placeholder cat-${news.id % 3}`}></div>
                                <div className="news-content">
                                    <div className="news-meta">
                                        <span className="badge subtle">{news.category}</span>
                                        <span className="news-date">{news.date}</span>
                                    </div>
                                    <h3>{news.title}</h3>
                                    <p className="muted">{news.summary}</p>
                                    <button className="btn btn-outline news-link" onClick={() => setSelectedNews(news)}>Read Full Story &rarr;</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>
            <section id="steps" className="section steps-section">
                <div className="section-head text-center">
                    <h2>Application Steps</h2>
                    <p className="section-lead mx-auto">Follow this straightforward process to complete your application.</p>
                </div>
                <div className="steps-timeline grid cols-4 responsive-grid">
                    {[
                        { title: 'Create Account', desc: 'Sign up with a valid email.', icon: UserPlus },
                        { title: 'Complete Profile', desc: 'Add your details and qualifications.', icon: FileText },
                        { title: 'Upload Docs', desc: 'Upload required credentials securely.', icon: ClipboardCheck },
                        { title: 'Track Status', desc: 'Monitor your application progress.', icon: Bell }
                    ].map((step, i) => (
                        <div className="step-card" key={step.title}>
                            <div className="step-number">{i + 1}</div>
                            <div className="step-icon-wrapper"><step.icon size={24} /></div>
                            <h3>{step.title}</h3>
                            <p className="muted">{step.desc}</p>
                            {i < 3 && <div className="step-connector"></div>}
                        </div>
                    ))}
                </div>
            </section>
            <section className="section requirements-section">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2>Requirements</h2>
                    <div className="grid cols-2 responsive-grid">
                        <motion.div
                            className="card"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <span><GraduationCap size={20} color="var(--green)" /></span>
                            <h3>Academic Staff</h3>
                            <p className="muted">Graduate Assistant through Professor ranks with qualification, teaching, research, NYSC, and publication evidence as applicable.</p>
                        </motion.div>
                        <motion.div
                            className="card"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <span><BriefcaseBusiness size={20} color="var(--navy)" /></span>
                            <h3>Non-Academic Staff</h3>
                            <p className="muted">Administrative, technical, registry, library, ICT, laboratory, security, works, and maintenance roles with role-specific credentials.</p>
                        </motion.div>
                    </div>
                </motion.div>
            </section>
            <section className="section faq-section">
                <h2>Frequently Asked Questions</h2>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                    <Accordion type="single" collapsible className="w-full">
                        {[
                            { q: 'Can I edit after submission?', a: 'Once submitted, applications cannot be edited to ensure data integrity during the review process. Please review your details carefully before submitting.' },
                            { q: 'Can I apply twice?', a: 'No, our system prevents duplicate applications for the same vacancy. However, you may apply to different positions if you meet the minimum qualifications for each.' },
                            { q: 'Which file types are accepted?', a: 'We accept PDF files for all document uploads (CV, credentials, certificates). Passports must be in JPG, JPEG, or PNG format and under 500KB.' },
                            { q: 'How do I know my status?', a: 'You can track your application status in real-time by logging into the Applicant Dashboard. We will also send email notifications for major updates like shortlisting and interview schedules.' }
                        ].map((item, i) => (
                            <AccordionItem key={i} value={`item-${i}`} style={{ borderBottom: '1px solid var(--line)' }}>
                                <AccordionTrigger style={{ fontSize: '16px', fontWeight: '700', padding: '16px 0', color: 'var(--navy)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <HelpCircle size={18} color="var(--gold)" />
                                        {item.q}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6', paddingBottom: '16px', paddingLeft: '26px' }}>
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
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
                        <Link className="brand" to="/"><span className="brand-mark"><img src="/assets/jlogo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></span>{useConfig()?.config?.branding?.portal_name ?? defaultBranding.portal_name}</Link>
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

export default Home;
