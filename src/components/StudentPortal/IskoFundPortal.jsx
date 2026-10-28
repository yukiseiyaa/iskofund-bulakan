import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  ChevronRight,
  ChevronDown,
  Clock,
  FileText,
  GraduationCap,
  Menu,
  Search,
  ShieldCheck,
  Upload,
  User,
  Users,
  X
} from 'lucide-react';
import '../../styles/figma-portal.css';

const ICON_MAP = {
  arrow: ArrowRight,
  award: Award,
  building: Building2,
  check: Check,
  chevron: ChevronRight,
  chevronDown: ChevronDown,
  clock: Clock,
  document: FileText,
  graduation: GraduationCap,
  menu: Menu,
  search: Search,
  shield: ShieldCheck,
  upload: Upload,
  user: User,
  users: Users,
  x: X,
};

function Icon({ name, size = 18 }) {
  const Component = ICON_MAP[name] || ArrowRight;
  return <Component size={size} strokeWidth={1.7} aria-hidden="true" />;
}

const programs = [
  {
    number: "01",
    label: "Academic merit",
    title: "Excellence Grant",
    amount: "₱4,000–₱8,000",
    body: "For students with a GWA of 1.00–2.00 and a consistent record of academic excellence."
  },
  {
    number: "02",
    label: "Need-based",
    title: "Tulong-Dunong",
    amount: "₱3,000–₱5,000",
    body: "Priority support for low-income, 4Ps, solo-parent, farming, and fishing households."
  },
  {
    number: "03",
    label: "Urgent support",
    title: "Emergency Subsidy",
    amount: "Up to ₱5,000",
    body: "Rapid financial relief for students affected by medical emergencies or natural disasters."
  }
];

const barangays = [
  "Bagumbayan", "Balubad", "Bambang", "Matungao", "Maysantol", "Perez", "Pitpitan",
  "San Francisco", "San Jose", "San Nicolas", "Santa Ana", "Santa Ines", "Taliptip", "Tibaguin"
];

const colleges = [
  { name: "Bulacan State University – Meneses Campus", location: "Matungao, Bulakan", type: "Public" },
  { name: "Bulacan Polytechnic College – Bulakan", location: "Poblacion, Bulakan", type: "Public" },
  { name: "Bulacan State University – Main Campus", location: "City of Malolos", type: "Public" },
  { name: "Bulacan Polytechnic College – Malolos Main", location: "City of Malolos", type: "Public" },
  { name: "Bulacan State University – Bustos Campus", location: "Bustos, Bulacan", type: "Public" },
  { name: "Bulacan Agricultural State University", location: "San Ildefonso, Bulacan", type: "Public" },
  { name: "Centro Escolar University – Malolos", location: "City of Malolos", type: "Private" },
  { name: "La Consolacion University Philippines", location: "City of Malolos", type: "Private" },
  { name: "STI College – Malolos", location: "City of Malolos", type: "Private" },
  { name: "Dr. Yanga’s Colleges, Inc.", location: "Bocaue, Bulacan", type: "Private" },
  { name: "Colegio de San Pascual Baylon", location: "Obando, Bulacan", type: "Private" },
  { name: "Immaculate Conception Major Seminary & College", location: "Guiguinto, Bulacan", type: "Private" }
];

const announcements = [
  {
    id: 1,
    type: "Deadline",
    date: "05 SEP 2026",
    title: "AY 2026–2027 application window is now open",
    text: "Online and physical submissions will be accepted until September 30, 2026. Applicants are encouraged to submit early."
  },
  {
    id: 2,
    type: "Payout",
    date: "28 AUG 2026",
    title: "Second-semester payout schedule released",
    text: "Approved scholars may view barangay-specific Landbank release dates through the application tracker."
  },
  {
    id: 3,
    type: "Memorandum",
    date: "18 AUG 2026",
    title: "Updated proof-of-income guidelines",
    text: "Applicants from informal-income households may now use the municipal Household Income Declaration form."
  },
  {
    id: 4,
    type: "Deadline",
    date: "02 AUG 2026",
    title: "Document verification assistance days",
    text: "Walk-in scanning and document review are available every Tuesday and Thursday at the MSWDO Annex."
  }
];

const requirements = {
  Eligibility: [
    ["Residency", "Resident of Bulakan for at least one year."],
    ["Enrollment", "Currently enrolled in an accredited college or university."],
    ["Academic standing", "Passing GWA of 3.00 or better; merit grants require 2.00 or better."],
    ["Financial need", "Priority is given to low-income, 4Ps, solo-parent, farming, and fishing households."]
  ],
  Documents: [
    ["Certificate of Registration", "Current semester COR issued by your registrar."],
    ["Copy of Grades", "Certified grades from the immediately preceding semester."],
    ["Barangay Indigency", "Original or digitally verified certificate issued within six months."],
    ["Identity and income", "Student ID plus proof of household income or 4Ps certification."]
  ],
  Forms: [
    ["Household Income Declaration", "For households with informal or seasonal income.", "Download"],
    ["Barangay Indigency Request", "Template request for your barangay office.", "Download"],
    ["LGU Scholarship Form", "Printable application for physical submission.", "Download"]
  ],
  "Drop-off": [
    ["Location", "MSWDO Scholarship Affairs, Ground Floor Annex, Bulakan Municipal Hall."],
    ["Hours", "Monday to Friday, 8:00 AM–5:00 PM, excluding holidays."],
    ["Free assistance", "Document scanning, printing, and application encoding are provided at no cost."]
  ]
};

const faqs = [
  ["How are scholars selected?", "Applications are ranked using verified financial need, academic standing, household circumstances, and published program criteria. Political endorsement is never required."],
  ["Is there an application fee?", "No. Online application, physical assistance, document scanning, and all IskoFund services are completely free."],
  ["What if I do not have internet access?", "Visit the MSWDO Scholarship Desk at the Municipal Hall Annex. Staff can encode your application and scan documents free of charge."],
  ["Which schools and universities are covered?", "The scholarship program covers accredited public and private higher education institutions located in Bulakan and neighboring municipalities within Bulacan province."]
];

export default function IskoFundPortal({ onSwitchToAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submittedCode, setSubmittedCode] = useState("ISKO-BUL-8821");

  const [savedApplications, setSavedApplications] = useState(() => {
    try {
      const raw = localStorage.getItem('iskofund_portal_apps');
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        "ISKO-BUL-8821": {
          code: "ISKO-BUL-8821",
          name: "Maria Santos Bautista",
          program: "Tulong-Dunong (AY 2026–2027)",
          barangay: "Matungao",
          school: "Bulacan State University – Meneses Campus",
          date: "Sep 04",
          status: "IN REVIEW",
          stage: "Assessment",
          notes: "Verification complete. Expected municipal board endorsement within 24 hours.",
          disbursement: "October 15–20, 2026 via Landbank"
        },
        ...parsed
      };
    } catch {
      return {
        "ISKO-BUL-8821": {
          code: "ISKO-BUL-8821",
          name: "Maria Santos Bautista",
          program: "Tulong-Dunong (AY 2026–2027)",
          barangay: "Matungao",
          school: "Bulacan State University – Meneses Campus",
          date: "Sep 04",
          status: "IN REVIEW",
          stage: "Assessment",
          notes: "Verification complete. Expected municipal board endorsement within 24 hours.",
          disbursement: "October 15–20, 2026 via Landbank"
        }
      };
    }
  });

  const [tracking, setTracking] = useState("");
  const [trackResult, setTrackResult] = useState(false);
  const [activeTrackedApp, setActiveTrackedApp] = useState(null);
  const [trackNotFound, setTrackNotFound] = useState(false);

  const [files, setFiles] = useState({});
  const [language, setLanguage] = useState("English");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [toast, setToast] = useState("");

  const [income, setIncome] = useState("under12");
  const [circumstance, setCircumstance] = useState("4ps");
  const [grade, setGrade] = useState("honor");

  const [requirementTab, setRequirementTab] = useState("Eligibility");
  const [collegeQuery, setCollegeQuery] = useState("");
  const [collegeType, setCollegeType] = useState("All");

  const [announcementType, setAnnouncementType] = useState("All");
  const [expandedAnnouncement, setExpandedAnnouncement] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    phone: "",
    email: "",
    barangay: "",
    year: "",
    school: "",
    course: "",
    gwa: "",
    program: "Tulong-Dunong"
  });

  const [errors, setErrors] = useState({});
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Student Account Auth State
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authChannel, setAuthChannel] = useState('email'); // 'email' | 'mobile'
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirm: ''
  });
  const [authErrors, setAuthErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('iskofund_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || ''
      }));
    }
  }, [currentUser]);

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthChannel('email');
    setAuthErrors({});
    setAuthOpen(true);
  };

  const closeAuthModal = () => {
    setAuthOpen(false);
    setAuthErrors({});
  };

  const handleAuthChange = (field, val) => {
    setAuthData(prev => ({ ...prev, [field]: val }));
    if (authErrors[field]) {
      setAuthErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (authMode === 'signup') {
      if (!authData.name?.trim()) {
        errs.name = "Please enter your full name.";
      } else if (authData.name.trim().length < 2) {
        errs.name = "Name must be at least 2 characters.";
      }
    }

    if (authChannel === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!authData.email?.trim()) {
        errs.email = "Please enter your email address.";
      } else if (!emailRegex.test(authData.email.trim())) {
        errs.email = "Please enter a valid email address.";
      }
    } else {
      const cleanPhone = (authData.mobile || '').replace(/[\s-]/g, '');
      if (!cleanPhone) {
        errs.mobile = "Please enter your mobile number.";
      } else if (!/^(\+?63|0)?[0-9]{10,11}$/.test(cleanPhone)) {
        errs.mobile = "Please enter a valid mobile number (e.g. 09XX XXX XXXX).";
      }
    }

    if (!authData.password?.trim()) {
      errs.password = "Please enter your password.";
    } else if (authMode === 'signup' && authData.password.trim().length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    if (authMode === 'signup') {
      if (!authData.confirm?.trim()) {
        errs.confirm = "Please confirm your password.";
      } else if (authData.confirm.trim() !== authData.password.trim()) {
        errs.confirm = "Passwords do not match.";
      }
    }

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs);
      return;
    }

    const resolvedName = authMode === 'signup'
      ? authData.name.trim()
      : (authData.name.trim() || (authData.email ? authData.email.split('@')[0].replace('.', ' ') : "Juan Dela Cruz"));
    const formattedName = resolvedName.charAt(0).toUpperCase() + resolvedName.slice(1);

    const user = {
      name: formattedName,
      email: authChannel === 'email' ? authData.email.trim() : "juan@email.com",
      phone: authChannel === 'mobile' ? authData.mobile.trim() : "0917 123 4567",
      isLoggedIn: true
    };

    localStorage.setItem('iskofund_user', JSON.stringify(user));
    setCurrentUser(user);
    setAuthOpen(false);
    notify(authMode === 'login' ? `Welcome back, ${user.name}!` : `Account created successfully for ${user.name}!`);
  };

  const handleSocialAuth = (provider) => {
    const user = {
      name: "Juan Dela Cruz",
      email: "juan.delacruz@gmail.com",
      phone: "0917 123 4567",
      provider: provider,
      isLoggedIn: true
    };
    localStorage.setItem('iskofund_user', JSON.stringify(user));
    setCurrentUser(user);
    setAuthOpen(false);
    notify(`Logged in with ${provider} as Juan Dela Cruz.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('iskofund_user');
    setCurrentUser(null);
    setUserMenuOpen(false);
    notify("Logged out successfully.");
  };

  const clearError = (field) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!formData.name?.trim()) {
        errs.name = "Please enter your full official name.";
      } else if (formData.name.trim().length < 2) {
        errs.name = "Full name must be at least 2 characters.";
      }

      if (!formData.studentId?.trim()) {
        errs.studentId = "Please enter your official student ID number.";
      }

      const cleanPhone = (formData.phone || '').replace(/[\s-]/g, '');
      if (!cleanPhone) {
        errs.phone = "Please enter your mobile contact number.";
      } else if (!/^(\+?63|0)?[0-9]{10,11}$/.test(cleanPhone)) {
        errs.phone = "Please enter a valid mobile number (e.g. 09XX XXX XXXX).";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email?.trim()) {
        errs.email = "Please enter your email address.";
      } else if (!emailRegex.test(formData.email.trim())) {
        errs.email = "Please enter a valid email address (e.g. juan@email.com).";
      }

      if (!formData.barangay?.trim()) {
        errs.barangay = "Please select your barangay in Bulakan.";
      }

      if (!formData.year?.trim()) {
        errs.year = "Please select your current year level.";
      }

      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        notify("Please fill up all required student details before proceeding.");
        return false;
      }
    }

    if (s === 2) {
      if (!formData.program?.trim()) {
        errs.program = "Please select a scholarship program.";
      }

      if (!formData.school?.trim()) {
        errs.school = "Please enter your enrolled college or university.";
      }

      if (!formData.course?.trim()) {
        errs.course = "Please enter your course or degree program.";
      }

      const gwaNum = parseFloat(formData.gwa);
      if (!formData.gwa?.trim()) {
        errs.gwa = "Please enter your latest General Weighted Average (GWA).";
      } else if (isNaN(gwaNum) || gwaNum < 1.0 || gwaNum > 5.0) {
        errs.gwa = "Please enter a valid GWA between 1.00 and 5.00 (e.g. 1.75).";
      }

      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        notify("Please fill up all academic and program details before proceeding.");
        return false;
      }
    }

    if (s === 3) {
      const requiredDocs = [
        "Certificate of Registration",
        "Certified Copy of Grades",
        "Barangay Indigency",
        "Valid Student ID"
      ];
      const missing = requiredDocs.filter(d => !files[d]);
      if (missing.length > 0) {
        const missingMap = {};
        missing.forEach(d => { missingMap[d] = true; });
        setErrors({ docs: missingMap });
        notify(`Please upload all 4 required documents before proceeding (${missing.length} missing).`);
        return false;
      }
    }

    if (s === 4) {
      if (!termsAgreed) {
        setErrors({ terms: "Please agree to the scholarship terms and confirm that all details are true." });
        notify("Please confirm and accept the terms before submitting.");
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const goToStep = (target) => {
    if (target === step) return;
    if (target < step) {
      setStep(target);
      return;
    }
    for (let s = step; s < target; s++) {
      if (!validateStep(s)) return;
    }
    setStep(target);
  };

  const handleNextStep = () => {
    if (!validateStep(step)) return;
    if (step < 4) {
      setStep(s => s + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openAppModal = (prog = null) => {
    if (prog) setFormData(p => ({ ...p, program: prog }));
    setStep(1);
    setErrors({});
    setSubmitted(false);
    setApplicationOpen(true);
  };

  const saveDraft = () => {
    localStorage.setItem("iskofund-bulakan-react-draft", JSON.stringify({ formData, files, step }));
    notify("Application draft saved on this device.");
  };

  const loadDraft = () => {
    const raw = localStorage.getItem("iskofund-bulakan-react-draft");
    if (!raw) return notify("No saved draft was found on this device.");
    try {
      const data = JSON.parse(raw);
      if (data.formData) setFormData(data.formData);
      if (data.files) setFiles(data.files);
      if (data.step) setStep(data.step);
      setApplicationOpen(true);
      notify("Saved draft restored.");
    } catch {
      notify("Could not restore draft.");
    }
  };

  const downloadFormTemplate = (title) => {
    const content = `OFFICIAL TEMPLATE: ${title}\nMunicipality of Bulakan · IskoFund Portal\n\nPlease print, complete all details, and upload or submit to MSWDO Scholarship Desk.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IskoFund-${title.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`${title} downloaded.`);
  };

  const handleFileUpload = (docName, file) => {
    if (!file) return;
    setFiles(prev => ({ ...prev, [docName]: { name: file.name, size: file.size } }));
    setErrors(prev => {
      if (!prev.docs || !prev.docs[docName]) return prev;
      const nextDocs = { ...prev.docs };
      delete nextDocs[docName];
      return { ...prev, docs: nextDocs };
    });
    notify(`Uploaded ${docName}`);
  };

  const handleFinalSubmit = () => {
    const genCode = "ISKO-BUL-" + Math.floor(1000 + Math.random() * 9000);
    const newRecord = {
      code: genCode,
      name: formData.name || "Student Applicant",
      program: `${formData.program || 'Tulong-Dunong'} (AY 2026–2027)`,
      barangay: formData.barangay || "Bulakan",
      school: formData.school || "Bulacan State University",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      status: "SUBMITTED",
      stage: "Submitted",
      notes: "Application received. Initial document verification is queued with MSWDO scholarship officers.",
      disbursement: "Pending municipal committee approval"
    };
    setSavedApplications(prev => {
      const updated = { ...prev, [genCode]: newRecord };
      try { localStorage.setItem('iskofund_portal_apps', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setSubmittedCode(genCode);
    setSubmitted(true);
  };

  const handleTrackSearch = (codeToSearch) => {
    const q = (codeToSearch != null ? codeToSearch : tracking).trim().toUpperCase();
    if (!q) {
      notify("Please enter a reference code.");
      return;
    }
    const found = savedApplications[q];
    if (found) {
      setActiveTrackedApp(found);
      setTrackNotFound(false);
      setTrackResult(true);
      notify(`Loaded status for ${q}`);
    } else {
      setActiveTrackedApp(null);
      setTrackNotFound(true);
      setTrackResult(true);
      notify(`Application "${q}" not found.`);
    }
  };

  const filteredColleges = colleges.filter(c => 
    (collegeType === "All" || c.type === collegeType) &&
    (c.name + ' ' + c.location).toLowerCase().includes(collegeQuery.toLowerCase())
  );

  const filteredAnnouncements = announcements.filter(a => 
    announcementType === "All" || a.type === announcementType
  );

  const estimate = income === "under12" || circumstance !== "regular" ? {
    program: "Tulong-Dunong",
    amount: "₱5,000 / semester",
    priority: "High priority"
  } : grade === "honor" ? {
    program: "Excellence Grant",
    amount: "Up to ₱8,000 / semester",
    priority: "Merit priority"
  } : {
    program: "Tulong-Dunong",
    amount: "₱3,000–₱4,000 / semester",
    priority: "Standard eligibility"
  };

  const isFilipino = language === "Filipino";

  return (
    <div className="site">
      <button className="skip-link" onClick={() => scrollTo("main")}>Skip to content</button>

      {/* Utility Top Bar */}
      <div className="utility" style={{ display: 'block' }}>
        <div className="wrap utility-inner">
          <span>{isFilipino ? "Republika ng Pilipinas · Bayan ng Bulakan" : "Republic of the Philippines · Municipality of Bulakan"}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {onSwitchToAdmin && (
              <button
                onClick={onSwitchToAdmin}
                style={{
                  background: '#2b0404', color: '#fca5a5', border: '1px solid #7f1d1d',
                  padding: '3px 8px', fontSize: 10, fontWeight: 700, borderRadius: 4,
                  display: 'inline-flex', alignItems: 'center', gap: 5, cursor: 'pointer'
                }}
                title="Switch to Capstone Optimization & Analytics"
              >
                <Icon name="shield" size={12} />
                <span>Officer Dashboard &amp; Solver</span>
              </button>
            )}
            <button onClick={() => setLanguage(l => l === "English" ? "Filipino" : "English")}>
              {language === "English" ? "English / Filipino" : "Filipino / English"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="header">
        <div className="wrap header-inner">
          <button className="identity" onClick={() => scrollTo("home")} aria-label="IskoFund home">
            <span className="mark">
              <Icon name="graduation" size={23} />
            </span>
            <span>
              <strong>IskoFund</strong>
              <small>BULAKAN</small>
            </span>
          </button>

          <nav className={`nav ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
            <button onClick={() => scrollTo("programs")}>{isFilipino ? "Mga Programa" : "Programs"}</button>
            <button onClick={() => scrollTo("requirements")}>{isFilipino ? "Kwalipikasyon" : "Requirements"}</button>
            <button onClick={() => scrollTo("colleges")}>{isFilipino ? "Mga Kolehiyo" : "Colleges"}</button>
            <button onClick={() => scrollTo("updates")}>{isFilipino ? "Balita" : "Updates"}</button>
            <button onClick={() => scrollTo("tracker")}>{isFilipino ? "Subaybayan" : "Track application"}</button>
            <button className="nav-mobile-cta" onClick={() => openAppModal()}>
              {isFilipino ? "Mag-apply ngayon" : "Apply now"} <Icon name="arrow" size={17} />
            </button>
            <button
              className="nav-mobile-cta"
              style={{ background: '#17191c', marginTop: 8 }}
              onClick={() => {
                setMenuOpen(false);
                if (currentUser) {
                  openAppModal();
                } else {
                  openAuthModal('login');
                }
              }}
            >
              <span>{currentUser ? `Account: ${currentUser.name.split(' ')[0]}` : (isFilipino ? "Mag-log in" : "Student Log in")}</span>
              <Icon name="user" size={16} />
            </button>
          </nav>

          <div className="header-actions">
            <button className="quiet-link" onClick={() => setLanguage(l => l === "English" ? "Filipino" : "English")}>
              {isFilipino ? "FIL" : "EN"}
            </button>
            {currentUser ? (
              <div className="auth-logged-wrap">
                <button
                  className="auth-logged-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  title={`Student Account: ${currentUser.name}`}
                >
                  <Icon name="user" size={15} />
                  <span>{currentUser.name.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="auth-user-dropdown">
                    <div className="auth-user-dropdown-info">
                      <strong>{currentUser.name}</strong>
                      <small>{currentUser.email || currentUser.phone}</small>
                    </div>
                    <button
                      className="auth-dropdown-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        openAppModal();
                      }}
                    >
                      <Icon name="document" size={14} />
                      <span>Saved Application</span>
                    </button>
                    <button
                      className="auth-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <Icon name="x" size={14} />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="auth-header-btn"
                onClick={() => openAuthModal("login")}
              >
                <Icon name="user" size={16} />
                <span>Log in</span>
              </button>
            )}
            <button className="primary-button header-cta" onClick={() => openAppModal()}>
              {isFilipino ? "Mag-apply para sa tulong" : "Apply for aid"} <Icon name="arrow" size={17} />
            </button>
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero Section */}
        <section className="hero" id="home">
          <div className="wrap hero-stage">
            <div className="hero-center">
              <div className="open-label">
                <span /> {isFilipino ? "Bukas ang aplikasyon para sa TA 2026–2027" : "Applications open for AY 2026–2027"}
              </div>
              <span className="hero-symbol">
                <Icon name="graduation" size={25} />
              </span>
              <h1>
                {isFilipino ? (
                  <>Iskolarship na<br /><em>simple at transparent.</em></>
                ) : (
                  <>Scholarships made<br /><em>simple and transparent.</em></>
                )}
              </h1>
              <p>
                {isFilipino 
                  ? "Mag-apply, magpasa ng mga dokumento, at subaybayan ang bawat update sa isang maaasahang plataporma."
                  : "Apply, submit your documents, and follow every update in one trusted place."}
              </p>
              <div className="hero-actions">
                <button className="primary-button large" onClick={() => openAppModal()}>
                  {isFilipino ? "Simulan ang aplikasyon" : "Start your application"} <Icon name="arrow" size={20} />
                </button>
              </div>
              <button className="resume-draft" onClick={loadDraft}>
                <Icon name="document" size={15} /> {isFilipino ? "Ipagpatuloy ang draft" : "Resume a saved draft"}
              </button>
            </div>

            {/* Floating Hero Badges */}
            <div className="hero-float deadline-float">
              <span>APPLICATION WINDOW</span>
              <strong>Open until<br />September 30</strong>
              <small>AY 2026–2027</small>
            </div>

            <div className="hero-float status-float">
              <div>
                <Icon name="shield" size={19} />
                <span>APPLICATION STATUS</span>
              </div>
              <strong>Verified</strong>
              <p><i /><span>Ready for assessment</span></p>
            </div>

            <div className="hero-float checklist-float">
              <span>WHAT YOU’LL NEED</span>
              <p><i><Icon name="check" size={11} /></i>Registration form</p>
              <p><i><Icon name="check" size={11} /></i>Copy of grades</p>
              <p><i><Icon name="check" size={11} /></i>Proof of residency</p>
            </div>

            <div className="hero-float impact-float">
              <span>MUNICIPAL EDUCATION FUND</span>
              <strong>₱******</strong>
              <div><b>****+ scholars</b><b>14 barangays</b></div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="programs section" id="programs">
          <div className="wrap">
            <div className="section-intro">
              <div>
                <span className="section-index">01 / PROGRAMS</span>
                <h2>Support designed around <em>real lives.</em></h2>
              </div>
              <p>Three focused grants. Clear eligibility. No hidden criteria or unnecessary paperwork.</p>
            </div>

            <div className="program-list">
              {programs.map((p) => (
                <article className="program" key={p.number}>
                  <span className="program-number">{p.number}</span>
                  <div className="program-title">
                    <small>{p.label}</small>
                    <h3>{p.title}</h3>
                  </div>
                  <p>{p.body}</p>
                  <div className="program-value">
                    <small>Per semester</small>
                    <strong>{p.amount}</strong>
                  </div>
                  <button onClick={() => openAppModal(p.title)} aria-label={`Apply for ${p.title}`}>
                    <Icon name="arrow" size={20} />
                  </button>
                </article>
              ))}
            </div>

            {/* Quick Estimator */}
            <div className="estimator">
              <div className="estimator-intro">
                <span>QUICK ELIGIBILITY ESTIMATOR</span>
                <h3>Find the support that fits.</h3>
                <p>Answer three questions for an instant, non-binding estimate of your likely grant.</p>
              </div>

              <div className="estimator-fields">
                <label>
                  Monthly household income
                  <select value={income} onChange={(e) => setIncome(e.target.value)}>
                    <option value="under12">Below ₱12,000</option>
                    <option value="under25">₱12,000–₱25,000</option>
                    <option value="under40">₱25,000–₱40,000</option>
                    <option value="over40">Above ₱40,000</option>
                  </select>
                </label>
                <label>
                  Household circumstance
                  <select value={circumstance} onChange={(e) => setCircumstance(e.target.value)}>
                    <option value="4ps">4Ps / solo-parent household</option>
                    <option value="farmer">Farming or fishing household</option>
                    <option value="medical">PWD or medical expenses</option>
                    <option value="regular">None of these</option>
                  </select>
                </label>
                <label>
                  Current GWA
                  <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="honor">1.00–1.75</option>
                    <option value="regular">1.76–2.25</option>
                    <option value="passing">2.26–3.00</option>
                  </select>
                </label>
              </div>

              <div className="estimate-result">
                <div>
                  <small>{estimate.priority}</small>
                  <strong>{estimate.program}</strong>
                  <span>{estimate.amount}</span>
                </div>
                <button onClick={() => openAppModal(estimate.program)}>
                  Apply for this grant <Icon name="arrow" size={17} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="process section" id="process">
          <div className="wrap process-layout">
            <div className="process-copy">
              <span className="section-index light">02 / THE PROCESS</span>
              <h2>Less waiting.<br /><em>More certainty.</em></h2>
              <p>A complete online application takes less than eight minutes. Every submission receives a reference code and clear status updates.</p>
              <button className="light-button" onClick={() => openAppModal()}>
                Begin application <Icon name="arrow" size={18} />
              </button>
            </div>

            <div className="process-steps">
              <article>
                <span>01</span>
                <div>
                  <h3>Tell us about yourself</h3>
                  <p>Basic student, residency, and enrollment information.</p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h3>Choose your grant</h3>
                  <p>We help match your circumstances to the right support.</p>
                </div>
              </article>
              <article>
                <span>03</span>
                <div>
                  <h3>Upload your documents</h3>
                  <p>Clear digital copies of your COR, grades, and proof of residency.</p>
                </div>
              </article>
              <article>
                <span>04</span>
                <div>
                  <h3>Follow every update</h3>
                  <p>Track verification, assessment, approval, and payout in one place.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="impact section" id="impact">
          <div className="wrap">
            <div className="section-intro">
              <div>
                <span className="section-index">03 / OUR IMPACT</span>
                <h2>A public service that respects <em>your time.</em></h2>
              </div>
              <p>Designed with students, social workers, and communities across Bulakan.</p>
            </div>

            <div className="impact-grid">
              <div className="impact-statement">
                <blockquote>“No secret list. No special connections. Every decision follows the same published standards.”</blockquote>
                <div>
                  <span className="mini-mark">
                    <Icon name="building" size={19} />
                  </span>
                  <p>
                    <strong>MSWDO Scholarship Affairs</strong>
                    <small>Municipality of Bulakan</small>
                  </p>
                </div>
              </div>

              <div className="impact-metrics">
                <div>
                  <strong>48</strong><span>hours</span>
                  <p>Average document verification, down from 60 days.</p>
                </div>
                <div>
                  <strong>100</strong><span>%</span>
                  <p>Digital tracking from submission through payout.</p>
                </div>
                <div>
                  <strong>0</strong><span>fees</span>
                  <p>Applications and physical assistance are always free.</p>
                </div>
                <div>
                  <strong>14</strong><span>barangays</span>
                  <p>Fair representation across the municipality.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="resources section" id="requirements">
          <div className="wrap">
            <div className="section-intro">
              <div>
                <span className="section-index">04 / REQUIREMENTS</span>
                <h2>Everything you need,<br /><em>clearly organized.</em></h2>
              </div>
              <p>Review eligibility, prepare your documents, or download a form before starting.</p>
            </div>

            <div className="resource-shell">
              <div className="resource-tabs" role="tablist">
                {Object.keys(requirements).map(tab => (
                  <button
                    key={tab}
                    className={requirementTab === tab ? "active" : ""}
                    onClick={() => setRequirementTab(tab)}
                    role="tab"
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="requirement-content">
                <div className="requirement-list">
                  {requirements[requirementTab].map(([title, desc, action], idx) => (
                    <article key={title}>
                      <span>{String(idx + 1).padStart(2, '0')}</span>
                      <div>
                        <h3>{title}</h3>
                        <p>{desc}</p>
                      </div>
                      {action ? (
                        <button
                          onClick={() => downloadFormTemplate(title)}
                          style={{
                            background: 'var(--paper)', border: '1px solid var(--line)',
                            padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--accent)',
                            cursor: 'pointer', borderRadius: 3, marginLeft: 'auto'
                          }}
                        >
                          {action}
                        </button>
                      ) : (
                        <Icon name="check" size={17} />
                      )}
                    </article>
                  ))}
                </div>

                <aside className="resource-aside">
                  <Icon name="document" size={25} />
                  <h3>Check before you submit</h3>
                  <p>Documents must be readable, current, and issued in the applicant’s name.</p>
                  <button onClick={() => openAppModal()}>
                    Start application <Icon name="arrow" size={16} />
                  </button>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* School Directory Section */}
        <section className="directory section" id="colleges">
          <div className="wrap">
            <div className="section-intro">
              <div>
                <span className="section-index">05 / SCHOOL DIRECTORY</span>
                <h2>Recognized colleges<br />and <em>universities.</em></h2>
              </div>
              <p>Search participating public and private institutions located in and near Bulakan, Bulacan.</p>
            </div>

            <div className="directory-controls">
              <label>
                <Icon name="search" size={18} />
                <input
                  value={collegeQuery}
                  onChange={(e) => setCollegeQuery(e.target.value)}
                  placeholder="Search by school or location"
                />
              </label>
              <div>
                {["All", "Public", "Private"].map(t => (
                  <button
                    key={t}
                    className={collegeType === t ? "active" : ""}
                    onClick={() => setCollegeType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="college-grid">
              {filteredColleges.map((c) => (
                <article key={c.name}>
                  <span><Icon name="building" size={20} /></span>
                  <div>
                    <small>{c.type}</small>
                    <h3>{c.name}</h3>
                    <p>{c.location}</p>
                  </div>
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, school: c.name }));
                      openAppModal();
                      notify(`Selected ${c.name}`);
                    }}
                    aria-label={`Apply with ${c.name}`}
                  >
                    <Icon name="arrow" size={18} />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Updates Section */}
        <section className="updates section" id="updates">
          <div className="wrap updates-layout">
            <div className="updates-copy">
              <span className="section-index">06 / UPDATES</span>
              <h2>Official notices,<br /><em>without the noise.</em></h2>
              <p>Deadlines, payout schedules, and municipal memoranda in one reliable source.</p>
              <div className="announcement-filters">
                {["All", "Deadline", "Payout", "Memorandum"].map(type => (
                  <button
                    key={type}
                    className={announcementType === type ? "active" : ""}
                    onClick={() => setAnnouncementType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="announcement-list">
              {filteredAnnouncements.map((a) => {
                const isOpen = expandedAnnouncement === a.id;
                return (
                  <article key={a.id} className={isOpen ? "expanded" : ""}>
                    <button onClick={() => setExpandedAnnouncement(isOpen ? null : a.id)}>
                      <span>
                        <small>{a.type}</small>
                        <b>{a.date}</b>
                      </span>
                      <h3>{a.title}</h3>
                      <i>
                        <Icon name={isOpen ? "chevronDown" : "chevron"} size={18} />
                      </i>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 24px 20px 24px', color: 'var(--ink-soft)', fontSize: 13, borderBottom: '1px solid var(--line)' }}>
                        <p>{a.text}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq section">
          <div className="wrap faq-layout">
            <div>
              <span className="section-index">07 / COMMON QUESTIONS</span>
              <h2>Helpful answers.<br /><em>Plain language.</em></h2>
            </div>
            <div className="faq-list">
              {faqs.map(([q, a], idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <article key={q} className={isOpen ? "open" : ""}>
                    <button onClick={() => setExpandedFaq(isOpen ? -1 : idx)}>
                      <span>{q}</span>
                      <i>{isOpen ? "−" : "+"}</i>
                    </button>
                    {isOpen && <p>{a}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Application Tracker */}
        <section className="tracker section" id="tracker">
          <div className="wrap tracker-layout">
            <div className="tracker-copy">
              <span className="section-index">08 / APPLICATION TRACKER</span>
              <h2>One code.<br /><em>Complete clarity.</em></h2>
              <p>Enter the reference code from your confirmation receipt to see exactly where your application stands.</p>
              <div className="track-form">
                <Icon name="search" size={19} />
                <input
                  value={tracking}
                  onChange={(e) => {
                    setTracking(e.target.value);
                    setTrackResult(false);
                    setActiveTrackedApp(null);
                    setTrackNotFound(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTrackSearch();
                  }}
                  placeholder="ISKO-BUL-8821"
                  aria-label="Reference code"
                />
                <button onClick={() => handleTrackSearch()}>
                  Track <Icon name="arrow" size={17} />
                </button>
              </div>
              <small>
                Try the demo:{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTracking("ISKO-BUL-8821");
                    handleTrackSearch("ISKO-BUL-8821");
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                >
                  ISKO-BUL-8821
                </button>
              </small>
            </div>

            <div className="track-card" aria-live="polite">
              {trackResult && trackNotFound ? (
                <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Icon name="x" size={22} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#991b1b', margin: '0 0 6px' }}>Application Not Found</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '0 0 16px', lineHeight: 1.5 }}>
                    No record found for reference code <strong>"{tracking.toUpperCase()}"</strong>. Please verify the code on your receipt or submit a new application.
                  </p>
                </div>
              ) : trackResult && activeTrackedApp ? (
                <>
                  <div className="track-head">
                    <div>
                      <small>APPLICATION</small>
                      <strong>{activeTrackedApp.code}</strong>
                    </div>
                    <span>{activeTrackedApp.status}</span>
                  </div>

                  <div className="track-progress">
                    {[
                      ["Submitted", activeTrackedApp.date, "done"],
                      ["Verified", activeTrackedApp.stage === "Submitted" ? "Pending" : "Sep 05", activeTrackedApp.stage === "Submitted" ? "current" : "done"],
                      ["Assessment", activeTrackedApp.stage === "Submitted" ? "Queued" : "In progress", activeTrackedApp.stage === "Submitted" ? "" : "current"],
                      ["Approval", "Next", ""]
                    ].map(([t, date, state]) => (
                      <div key={t} className={state}>
                        <i>{state === "done" && <Icon name="check" size={12} />}</i>
                        <span><b>{t}</b><small>{date}</small></span>
                      </div>
                    ))}
                  </div>

                  <div className="track-message">
                    <Icon name="clock" size={18} />
                    <p>
                      <strong>{activeTrackedApp.name} ({activeTrackedApp.barangay})</strong>
                      <span>{activeTrackedApp.notes}</span>
                    </p>
                  </div>

                  <div style={{ marginTop: 16, padding: '12px 16px', background: '#faf8f5', border: '1px solid var(--line)', borderRadius: 4, fontSize: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: 9, fontWeight: 700 }}>Grant &amp; Institution</span>
                      <p style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{activeTrackedApp.program} — {activeTrackedApp.school}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--muted)', textTransform: 'uppercase', fontSize: 9, fontWeight: 700 }}>Disbursement Window</span>
                      <p style={{ fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{activeTrackedApp.disbursement}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="track-empty">
                  <span><Icon name="document" size={25} /></span>
                  <p>
                    <strong>Your status will appear here.</strong>
                    <small>Secure, current, and easy to understand.</small>
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="closing">
          <div className="wrap closing-inner">
            <div>
              <span>Applications close September 30, 2026</span>
              <h2>Your next semester<br />can start <em>here.</em></h2>
            </div>
            <div>
              <p>Five to eight minutes. No application fee. Support is available at the Municipal Hall if you need it.</p>
              <button className="light-button" onClick={() => openAppModal()}>
                Apply for financial aid <Icon name="arrow" size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap footer-main">
          <div className="footer-identity">
            <span className="mark">
              <Icon name="graduation" size={22} />
            </span>
            <div>
              <strong>IskoFund: Bulakan</strong>
              <p>Opportunity, made accessible.</p>
            </div>
          </div>

          <div>
            <small>VISIT</small>
            <p>MSWDO Scholarship Desk<br />Bulakan Municipal Hall<br />Bulakan, Bulacan 3017</p>
          </div>

          <div>
            <small>CONTACT</small>
            <p>(044) 762-XXXX loc. 140<br />scholarship@bulakan.gov.ph<br />Mon–Fri, 8AM–5PM</p>
          </div>

          <div>
            <small>PUBLIC SERVICE</small>
            <button onClick={() => scrollTo("programs")}>Programs</button>
            <button onClick={() => scrollTo("tracker")}>Track application</button>
            <button onClick={() => openAppModal()}>Apply now</button>
          </div>
        </div>

        <div className="wrap footer-bottom">
          <span>© 2026 Municipality of Bulakan</span>
          <span>Transparency · Freedom of Information · Data Privacy</span>
          <button onClick={() => setFeedbackOpen(true)}>Share feedback</button>
        </div>
      </footer>

      {/* Student Account Auth Modal */}
      {authOpen && (
        <div
          className="auth-modal-backdrop open"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
        >
          <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <div className="auth-modal-header">
              <div>
                <small className="auth-pretitle">ISKO FUND · STUDENT ACCOUNT</small>
                <h2 className="auth-title" id="auth-modal-title">
                  {authMode === 'login' ? "Welcome back" : "Create your account"}
                </h2>
              </div>
              <button className="auth-close-btn" onClick={closeAuthModal} aria-label="Close dialog">
                <Icon name="x" size={18} />
              </button>
            </div>

            <div className="auth-mode-tabs" role="tablist">
              <button
                type="button"
                className={`auth-mode-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('login');
                  setAuthErrors({});
                }}
              >
                Log in
              </button>
              <button
                type="button"
                className={`auth-mode-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('signup');
                  setAuthErrors({});
                }}
              >
                Sign up
              </button>
            </div>

            <div className="auth-modal-body">
              <p className="auth-subtitle">
                {authMode === 'login'
                  ? "Access your saved application and scholarship updates."
                  : "Save applications, upload documents, and receive status updates in one secure place."}
              </p>

              <div className="auth-social-row">
                <button
                  type="button"
                  className="auth-social-btn"
                  onClick={() => handleSocialAuth('Google')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  className="auth-social-btn"
                  onClick={() => handleSocialAuth('Facebook')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#1877F2"/>
                    <path d="M14.5 12h-2v7h-3v-7h-1.5v-2.5h1.5v-1.6c0-1.7 1-2.9 3-2.9h2v2.5h-1.3c-.8 0-1 .4-1 1v1h2.3l-.5 2.5z" fill="#fff"/>
                  </svg>
                  <span>Continue with Facebook</span>
                </button>
              </div>

              <div className="auth-divider">
                <span>OR CONTINUE WITH</span>
              </div>

              <div className="auth-channel-control" role="tablist">
                <button
                  type="button"
                  className={`auth-channel-btn ${authChannel === 'email' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthChannel('email');
                    setAuthErrors({});
                  }}
                >
                  Email address
                </button>
                <button
                  type="button"
                  className={`auth-channel-btn ${authChannel === 'mobile' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthChannel('mobile');
                    setAuthErrors({});
                  }}
                >
                  Mobile number
                </button>
              </div>

              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <div className="auth-field">
                    <label htmlFor="auth-field-name">Full name</label>
                    <input
                      id="auth-field-name"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={authData.name}
                      onChange={(e) => handleAuthChange('name', e.target.value)}
                      className={authErrors.name ? 'input-error' : ''}
                    />
                    {authErrors.name && <span className="auth-error-msg">{authErrors.name}</span>}
                  </div>
                )}

                {authChannel === 'email' ? (
                  <div className="auth-field">
                    <label htmlFor="auth-field-email">Email address</label>
                    <input
                      id="auth-field-email"
                      type="email"
                      placeholder="juan@email.com"
                      value={authData.email}
                      onChange={(e) => handleAuthChange('email', e.target.value)}
                      className={authErrors.email ? 'input-error' : ''}
                    />
                    {authErrors.email && <span className="auth-error-msg">{authErrors.email}</span>}
                  </div>
                ) : (
                  <div className="auth-field">
                    <label htmlFor="auth-field-mobile">Mobile number</label>
                    <input
                      id="auth-field-mobile"
                      type="tel"
                      placeholder="09XX XXX XXXX"
                      value={authData.mobile}
                      onChange={(e) => handleAuthChange('mobile', e.target.value)}
                      className={authErrors.mobile ? 'input-error' : ''}
                    />
                    {authErrors.mobile && <span className="auth-error-msg">{authErrors.mobile}</span>}
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="auth-field-password">Password</label>
                  <input
                    id="auth-field-password"
                    type="password"
                    placeholder={authMode === 'login' ? "Enter your password" : "At least 8 characters"}
                    value={authData.password}
                    onChange={(e) => handleAuthChange('password', e.target.value)}
                    className={authErrors.password ? 'input-error' : ''}
                  />
                  {authErrors.password && <span className="auth-error-msg">{authErrors.password}</span>}
                </div>

                {authMode === 'signup' && (
                  <div className="auth-field">
                    <label htmlFor="auth-field-confirm">Confirm password</label>
                    <input
                      id="auth-field-confirm"
                      type="password"
                      placeholder="Enter your password again"
                      value={authData.confirm}
                      onChange={(e) => handleAuthChange('confirm', e.target.value)}
                      className={authErrors.confirm ? 'input-error' : ''}
                    />
                    {authErrors.confirm && <span className="auth-error-msg">{authErrors.confirm}</span>}
                  </div>
                )}

                <button type="submit" className="auth-submit-btn">
                  <span>{authMode === 'login' ? "Log in" : "Create account"}</span>
                  <Icon name="arrow" size={17} />
                </button>
              </form>

              <p className="auth-privacy-notice">
                By continuing, you agree to the Municipality of Bulakan's Data Privacy Notice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4-Step Application Modal */}
      {applicationOpen && (
        <div className="modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) setApplicationOpen(false); }}>
          <div className="application-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <div>
                <small>ISKO FUND · ONLINE APPLICATION</small>
                <h2 id="modal-title">{submitted ? "Application received" : "Apply for financial aid"}</h2>
              </div>
              <button onClick={() => setApplicationOpen(false)} aria-label="Close application">
                <Icon name="x" size={20} />
              </button>
            </div>

            {!submitted && (
              <div className="modal-steps">
                <span className={step === 1 ? "active" : step > 1 ? "done" : ""} onClick={() => goToStep(1)} style={{ cursor: 'pointer' }}><i>1</i>Student</span>
                <span className={step === 2 ? "active" : step > 2 ? "done" : ""} onClick={() => goToStep(2)} style={{ cursor: 'pointer' }}><i>2</i>Program</span>
                <span className={step === 3 ? "active" : step > 3 ? "done" : ""} onClick={() => goToStep(3)} style={{ cursor: 'pointer' }}><i>3</i>Documents</span>
                <span className={step === 4 ? "active" : ""} onClick={() => goToStep(4)} style={{ cursor: 'pointer' }}><i>4</i>Review</span>
              </div>
            )}

            <div className="modal-body">
              {submitted ? (
                <div className="success">
                  <span><Icon name="check" size={30} /></span>
                  <h3>You’re all set.</h3>
                  <p>Save this reference code. You’ll use it to follow verification, assessment, and payout.</p>
                  
                  <button
                    className="reference-copy"
                    onClick={() => {
                      navigator.clipboard?.writeText(submittedCode);
                      notify("Reference code copied.");
                    }}
                  >
                    {submittedCode} <small>Copy code</small>
                  </button>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setApplicationOpen(false);
                        setTracking(submittedCode);
                        handleTrackSearch(submittedCode);
                        setTimeout(() => scrollTo("tracker"), 100);
                      }}
                    >
                      Track application <Icon name="arrow" size={17} />
                    </button>
                    <button
                      className="light-button"
                      onClick={() => {
                        const rec = `ISKO-FUND CONFIRMATION\nCode: ${submittedCode}\nName: ${formData.name || 'Applicant'}\nProgram: ${formData.program}\nSchool: ${formData.school}\nDate: ${new Date().toLocaleString()}`;
                        const b = new Blob([rec], { type: 'text/plain' });
                        const u = URL.createObjectURL(b);
                        const a = document.createElement('a'); a.href = u; a.download = `IskoFund-${submittedCode}.txt`;
                        a.click(); URL.revokeObjectURL(u);
                        notify("Confirmation receipt downloaded.");
                      }}
                    >
                      Download Receipt
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {step === 1 && (
                    <div className="form-section">
                      <div className="form-heading">
                        <h3>Student information</h3>
                        <p>Use the details shown in your official school records.</p>
                      </div>
                      <div className="form-grid">
                        <label className="full">
                          Full name
                          <input
                            className={errors.name ? 'input-error' : ''}
                            value={formData.name || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, name: e.target.value }));
                              clearError('name');
                            }}
                            placeholder="Juan Dela Cruz"
                          />
                          {errors.name && <span className="field-error">{errors.name}</span>}
                        </label>
                        <label>
                          Student ID
                          <input
                            className={errors.studentId ? 'input-error' : ''}
                            value={formData.studentId || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, studentId: e.target.value }));
                              clearError('studentId');
                            }}
                            placeholder="2026-00124"
                          />
                          {errors.studentId && <span className="field-error">{errors.studentId}</span>}
                        </label>
                        <label>
                          Contact number
                          <input
                            className={errors.phone ? 'input-error' : ''}
                            value={formData.phone || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, phone: e.target.value }));
                              clearError('phone');
                            }}
                            placeholder="09XX XXX XXXX"
                          />
                          {errors.phone && <span className="field-error">{errors.phone}</span>}
                        </label>
                        <label className="full">
                          Email address
                          <input
                            type="email"
                            className={errors.email ? 'input-error' : ''}
                            value={formData.email || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, email: e.target.value }));
                              clearError('email');
                            }}
                            placeholder="juan@email.com"
                          />
                          {errors.email && <span className="field-error">{errors.email}</span>}
                        </label>
                        <label>
                          Barangay
                          <select
                            className={errors.barangay ? 'input-error' : ''}
                            value={formData.barangay || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, barangay: e.target.value }));
                              clearError('barangay');
                            }}
                          >
                            <option value="">-- Select Barangay --</option>
                            {barangays.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          {errors.barangay && <span className="field-error">{errors.barangay}</span>}
                        </label>
                        <label>
                          Year level
                          <select
                            className={errors.year ? 'input-error' : ''}
                            value={formData.year || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, year: e.target.value }));
                              clearError('year');
                            }}
                          >
                            <option value="">-- Select Year Level --</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="5th Year">5th Year</option>
                          </select>
                          {errors.year && <span className="field-error">{errors.year}</span>}
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="form-section">
                      <div className="form-heading">
                        <h3>Program & Academic Information</h3>
                        <p>Select your intended grant and enrolled institution.</p>
                      </div>
                      <div className="form-grid">
                        <label className="full">
                          Scholarship Program
                          <select
                            className={errors.program ? 'input-error' : ''}
                            value={formData.program || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, program: e.target.value }));
                              clearError('program');
                            }}
                          >
                            <option value="">-- Select Scholarship Program --</option>
                            <option value="Excellence Grant">Excellence Grant (Academic Merit: ₱4,000–₱8,000)</option>
                            <option value="Tulong-Dunong">Tulong-Dunong (Need-based: ₱3,000–₱5,000)</option>
                            <option value="Emergency Subsidy">Emergency Subsidy (Urgent relief: Up to ₱5,000)</option>
                          </select>
                          {errors.program && <span className="field-error">{errors.program}</span>}
                        </label>
                        <label className="full">
                          College / University
                          <input
                            className={errors.school ? 'input-error' : ''}
                            value={formData.school || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, school: e.target.value }));
                              clearError('school');
                            }}
                            placeholder="e.g. Bulacan State University"
                          />
                          {errors.school && <span className="field-error">{errors.school}</span>}
                        </label>
                        <label>
                          Course / Degree
                          <input
                            className={errors.course ? 'input-error' : ''}
                            value={formData.course || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, course: e.target.value }));
                              clearError('course');
                            }}
                            placeholder="e.g. BS Information Technology"
                          />
                          {errors.course && <span className="field-error">{errors.course}</span>}
                        </label>
                        <label>
                          Latest GWA
                          <input
                            className={errors.gwa ? 'input-error' : ''}
                            value={formData.gwa || ''}
                            onChange={(e) => {
                              setFormData(p => ({ ...p, gwa: e.target.value }));
                              clearError('gwa');
                            }}
                            placeholder="e.g. 1.75"
                          />
                          {errors.gwa && <span className="field-error">{errors.gwa}</span>}
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="form-section">
                      <div className="form-heading">
                        <h3>Required documents</h3>
                        <p>Upload a clear PDF, PNG, or JPG. Maximum 5MB each. All 4 documents must be uploaded to proceed.</p>
                      </div>
                      <div className="upload-list">
                        {[
                          "Certificate of Registration",
                          "Certified Copy of Grades",
                          "Barangay Indigency",
                          "Valid Student ID"
                        ].map((doc) => {
                          const uploaded = files[doc];
                          const isMissing = errors.docs && errors.docs[doc];
                          return (
                            <label key={doc} className={`upload-row ${uploaded ? 'complete' : ''} ${isMissing ? 'upload-error' : ''}`}>
                              <span>
                                <Icon name={uploaded ? "check" : "upload"} size={18} />
                                <strong>{doc}</strong>
                              </span>
                              <div style={{ textAlign: 'right' }}>
                                <small style={{ color: uploaded ? 'var(--success)' : isMissing ? '#dc2626' : undefined, fontWeight: isMissing ? 600 : undefined }}>
                                  {uploaded ? uploaded.name : isMissing ? "Upload required" : "Select file"}
                                </small>
                              </div>
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(doc, e.target.files[0])}
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="review">
                      <span><Icon name="shield" size={27} /></span>
                      <h3>Ready for municipal review</h3>
                      <p>By submitting, you confirm that the information and documents provided are accurate and complete under the penalty of perjury.</p>
                      
                      <div style={{ background: '#faf8f5', border: '1px solid var(--line)', padding: 14, textAlign: 'left', fontSize: 12, borderRadius: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '14px 0' }}>
                        <div><strong>Applicant:</strong> {formData.name || 'Juan Dela Cruz'}</div>
                        <div><strong>Program:</strong> {formData.program || 'Tulong-Dunong'}</div>
                        <div><strong>Barangay:</strong> {formData.barangay || 'Bulakan'}</div>
                        <div><strong>School:</strong> {formData.school || 'Enrolled College'}</div>
                        <div><strong>Student ID:</strong> {formData.studentId || 'N/A'}</div>
                        <div><strong>Contact:</strong> {formData.phone || 'N/A'}</div>
                      </div>

                      <label id="terms-box" className={`terms-label ${errors.terms ? 'terms-error' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 12, border: '1px solid var(--line)', borderRadius: 4, marginTop: 14 }}>
                        <input
                          type="checkbox"
                          checked={termsAgreed}
                          onChange={(e) => {
                            setTermsAgreed(e.target.checked);
                            if (errors.terms) clearError('terms');
                          }}
                        />
                        <span>I confirm that all submitted details and uploaded records are true and correct.</span>
                      </label>
                      {errors.terms && <span className="field-error" style={{ textAlign: 'center' }}>{errors.terms}</span>}
                    </div>
                  )}
                </>
              )}
            </div>

            {!submitted && (
              <div className="modal-actions">
                <div>
                  <button className="secondary-button" disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>
                    Back
                  </button>
                  <button className="save-draft" onClick={saveDraft}>Save draft</button>
                </div>
                <button
                  className="primary-button"
                  onClick={handleNextStep}
                >
                  {step < 4 ? "Continue" : "Submit application"} <Icon name="arrow" size={17} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="feedback-modal-backdrop open" onClick={(e) => { if (e.target === e.currentTarget) setFeedbackOpen(false); }}>
          <div className="feedback-box">
            <div className="modal-header">
              <div>
                <small>COMMUNITY FEEDBACK</small>
                <h2>Share your thoughts</h2>
              </div>
              <button onClick={() => setFeedbackOpen(false)} aria-label="Close feedback">
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="feedback-form">
              <label>
                Rate your experience
                <div className="rating" style={{ marginTop: 10 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={star <= rating ? "active" : ""}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </label>
              <label>
                Topic
                <select>
                  <option>Ease of application</option>
                  <option>Clarity of guidelines</option>
                  <option>System speed & responsiveness</option>
                  <option>Suggestion for improvement</option>
                </select>
              </label>
              <label>
                Your comments
                <textarea placeholder="Tell us how we can improve this digital public service..." />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  className="primary-button"
                  onClick={() => {
                    setFeedbackOpen(false);
                    notify("Maraming salamat! Your feedback has been recorded.");
                  }}
                >
                  Submit feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="toast" style={{ display: 'flex' }}>
          <Icon name="check" size={18} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
