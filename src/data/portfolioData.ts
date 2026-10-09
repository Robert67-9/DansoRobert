import { ProfileData, Project, WorkExperience, Education, SkillGroup } from '../types';

export const defaultProfile: ProfileData = {
  name: 'Danso Robert Opoku',
  title: 'UI/UX Designer | IT Consultant | Certified Drone Pilot (RPAS)',
  tagline: 'Translating client and user needs into clean, usable digital experiences, responsive websites, robust IT systems, and precision aerial drone operations.',
  bio: 'UI/UX-focused designer, IT consultant, and certified Drone Pilot (RPAS / Ghana Civil Aviation Authority). Proficient in Figma, Adobe XD, Photoshop, and Tableau, with strong engineering in full-stack web, databases, network infrastructure, and aerial systems operations. Experienced delivering high-impact solutions for US and Ghanaian teams.',
  backgroundStory: `Danso Robert Opoku is a Ghanaian UI/UX designer, web developer, IT consultant, and certified RPAS Drone Pilot based in Lakeside Estate, Adenta, Accra. He holds a Higher National Diploma in Computer & Network Management (Second Class Upper Division) from Koforidua Technical University, certified by the Commission for Technical and Vocational Education and Training (CTVET), and is currently pursuing his Bachelor of Technology in Computer Science.

Danso combines aesthetic visual arts training with practical computer systems engineering and certified drone aviation. In September 2026, he completed the Remotely Piloted Aircraft Systems (RPAS) Safety Training certified by the Ghana Civil Aviation Authority (GCAA).

He has designed and built flagship digital platforms including the Aradad Homes real estate platform, Honeycave Market e-commerce marketplace, and the Maxi Auto Brokers USA website, alongside corporate digital media design for Lenzy Acquisition Company Limited (USA).

His multifaceted background spans UI/UX prototyping in Figma and Adobe XD, data visualization in Tableau, database administration in MySQL and PostgreSQL, network infrastructure with Apotica and Jams Tech, aerial drone flight operations with GCAA safety certification, and hands-on smart office deployments for institutions like ABSA Bank Head Office and Republic Bank Head Office.`,
  location: 'Lakeside Estate, Adenta, Accra, Ghana',
  email: 'dansorobert360@gmail.com',
  phone: '+233 591 784 205',
  website: '', // Site URL omitted as requested
  avatarUrl: '/avatar.jpg',
  statusText: 'Available for UI/UX Design, IT Consulting & Drone Operations',
  availableForHire: true,
  socials: {
    github: 'https://github.com/robert67-9',
    linkedin: 'https://linkedin.com/in/rober-opoku-danso',
    twitter: 'https://twitter.com/dansorobert360',
    email: 'mailto:dansorobert360@gmail.com',
  },
};

export const projectsData: Project[] = [
  {
    id: 'aradad-homes',
    title: 'Aradad Homes Real Estate Platform',
    category: 'Full-Stack',
    tagline: 'Modern luxury property discovery & real estate management portal with seamless user experience.',
    description: 'Designed and built the full digital web presence for Aradad Homes. Features responsive property filtering, high-resolution architectural galleries, interactive inquiry scheduling, and clean minimalist typography.',
    fullCaseStudy: {
      overview: 'Aradad Homes required a high-end digital real estate platform to showcase residential properties, land acquisitions, and modern developments with effortless client navigation.',
      challenge: 'Creating a visually captivating, image-rich interface that loads instantly on mobile devices across both Ghanaian and international prospective buyers.',
      architecture: 'Prototyped end-to-end in Figma with custom design system tokens. Built using modern responsive web technologies, optimized media compression, and structured inquiry workflows.',
      databaseDesign: 'Structured property catalog schema organizing listings by location, price, property type, amenities, and agent assignment.',
      keyResults: [
        'Increased prospective property inquiry conversions by 65%',
        'Seamless mobile responsiveness across iOS and Android devices',
        'Intuitive search allowing buyers to filter by budget, location, and bedrooms in under 2 seconds'
      ]
    },
    metrics: ['High-Res UI/UX', 'Mobile Optimized', 'Lead Gen Ready'],
    techStack: ['Figma', 'UI/UX Design', 'HTML5', 'CSS3', 'JavaScript', 'Responsive Web'],
    githubUrl: 'https://github.com/robert67-9',
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    year: '2025'
  },
  {
    id: 'honeycave-market',
    title: 'Honeycave Market Digital Marketplace',
    category: 'Full-Stack',
    tagline: 'Vibrant e-commerce shopping experience with vendor catalogs, mobile checkout, and loyalty rewards.',
    description: 'An all-in-one digital marketplace engineered for seamless browsing, product categorization, customer carts, and swift mobile checkout with intuitive UI/UX.',
    fullCaseStudy: {
      overview: 'Honeycave Market is an e-commerce platform designed to give merchants an accessible storefront and give shoppers a delightful, clutter-free buying experience.',
      challenge: 'Minimizing friction during cart checkout on mobile networks while maintaining clear visual hierarchy across extensive inventory categories.',
      architecture: 'Designed user journey maps and checkout wireframes in Figma. Implemented clean front-end architecture, customer loyalty reward integration, and responsive layouts.',
      databaseDesign: 'E-commerce relational inventory model tracking products, categories, customer orders, and loyalty reward tiers.',
      keyResults: [
        'Integrated customer loyalty retention workflows (Google Satisfaction Guaranteed model)',
        'Cart abandonment rate reduced through streamlined 2-step checkout flow',
        '100% mobile-friendly responsive design tested across multiple viewport sizes'
      ]
    },
    metrics: ['E-Commerce Hub', 'Loyalty Integration', 'Figma Prototyped'],
    techStack: ['Figma', 'UI/UX', 'JavaScript', 'E-Commerce', 'MySQL', 'Customer Loyalty'],
    githubUrl: 'https://github.com/robert67-9',
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
    year: '2025'
  },
  {
    id: 'maxiautobrokers-site',
    title: 'Maxi Auto Brokers USA Platform',
    category: 'Full-Stack',
    tagline: 'Automotive brokerage web portal and digital marketing hub for US auto buyers and importers.',
    description: 'Designed and developed the full company website for Maxi Auto Brokers USA (Dec 2025). Shaped layout and user experience, built inventory showcase, and managed digital marketing creative assets.',
    fullCaseStudy: {
      overview: 'Maxi Auto Brokers USA needed an authoritative online presence to present vehicle brokerage services, auction sourcing, and customer import testimonials.',
      challenge: 'Structuring vehicle specs, pricing estimates, and brokerage inquiry forms into an accessible interface for both retail and commercial clients.',
      architecture: 'Designed complete layout in Adobe XD and Figma; developed responsive web interface, vehicle inquiry routing, and coordinated digital marketing campaign assets.',
      databaseDesign: 'Inventory catalog database categorizing vehicles by make, model, year, mileage, condition, and status.',
      keyResults: [
        'Delivered complete brand website and graphic assets on schedule for US launch',
        'Direct inquiry form routing customer leads directly to sales management',
        'Unified social media marketing visuals with website brand identity'
      ]
    },
    metrics: ['US Brokerage Launch', 'Vehicle Showcase', 'Digital Marketing'],
    techStack: ['Website Development', 'Figma', 'Adobe XD', 'Photoshop', 'Digital Marketing'],
    githubUrl: 'https://github.com/robert67-9',
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    year: '2025'
  },
  {
    id: 'lenzy-acquisition',
    title: 'Lenzy Acquisition Company Limited (USA)',
    category: 'Full-Stack',
    tagline: 'Corporate digital identity, brand design, and web development for US acquisition firm.',
    description: 'Led website development and logo design for the organization’s digital presence (Nov 2024). Produced marketing graphic assets and trained the 5-person remote digital marketing team on design workflows.',
    fullCaseStudy: {
      overview: 'Lenzy Acquisition required an executive corporate portal to reflect institutional credibility, business services, and transaction advisory.',
      challenge: 'Aligning corporate branding across the website, presentation collateral, and training remote team members on design asset workflows.',
      architecture: 'Created logo, brand style guidelines, and responsive web interface. Conducted hands-on technical coaching for the digital marketing squad.',
      databaseDesign: 'Inquiry and client lead management database with automated notifications and status tracking.',
      keyResults: [
        'Successfully launched corporate website and official brand identity',
        'Trained and upskilled 5-person remote marketing team on graphic production tools',
        'Standardized marketing creative templates across all company communications'
      ]
    },
    metrics: ['Corporate Brand', 'Team Training', 'Logo & UI/UX'],
    techStack: ['Web Development', 'Photoshop', 'Canva', 'Branding', 'Digital Marketing'],
    githubUrl: 'https://github.com/robert67-9',
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    year: '2024'
  },
  {
    id: 'tableau-analytics-dashboard',
    title: 'Tableau Business Intelligence & Visual Analytics',
    category: 'Cloud & Database',
    tagline: 'Interactive data visualization dashboards delivering actionable metrics and trend analytics.',
    description: 'Engineered comprehensive Tableau analytics dashboards transforming raw business and operational data into clear, interactive visual stories with KPI tracking and drill-down filtering.',
    fullCaseStudy: {
      overview: 'Designed dynamic Tableau dashboards for monitoring business performance, customer loyalty metrics, inventory turnover, and operational bottlenecks.',
      challenge: 'Aggregating disparate data sources into intuitive visual reports that non-technical managers and executives can immediately understand and act upon.',
      architecture: 'Data modeling, calculated fields, parameter controls, interactive tooltips, and responsive layout containers in Tableau Desktop and Tableau Server.',
      databaseDesign: 'Integrated with relational MySQL and PostgreSQL database views with normalized star-schema reporting tables.',
      keyResults: [
        'Reduced executive reporting preparation time by 80% through automated visual dashboards',
        'Interactive drill-down filters by region, product category, and customer loyalty cohort',
        'Presented clear visual insights supporting strategic decision-making'
      ]
    },
    metrics: ['Tableau Expert', 'Interactive KPIs', 'Data Modeling'],
    techStack: ['Tableau', 'Data Visualization', 'MySQL', 'Data Modeling', 'Business Intelligence'],
    githubUrl: 'https://github.com/robert67-9',
    featured: true,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    year: '2025'
  },
  {
    id: 'washing-bay-management',
    title: 'Washing Bay Management System',
    category: 'Full-Stack',
    tagline: 'Web-based car wash operations & customer booking system built with Python, Django, and MySQL.',
    description: 'Final Year Project at Koforidua Technical University (2025). Designed and engineered an automated management system covering customer bookings, service tracking, worker assignments, and daily payment records.',
    fullCaseStudy: {
      overview: 'Built to replace error-prone manual paper record-keeping in commercial car wash and auto-detailing centers with an automated web portal.',
      challenge: 'Designing a straightforward UI that staff on the bay floor can quickly operate on mobile tablets while managing customer queues.',
      architecture: 'Python and Django web framework architecture with custom administrative dashboard, booking calendar, and receipt generation.',
      databaseDesign: 'MySQL relational database with tables for customers, vehicle registrations, service tiers, daily revenue ledger, and staff shifts.',
      keyResults: [
        'Awarded high academic distinction for KTU Computer Science Final Year Project',
        'Streamlined car wash throughput and queue tracking in real time',
        'Automated daily revenue reconciliation and sales reporting'
      ]
    },
    metrics: ['Python/Django', 'MySQL DB', 'KTU Capstone 2025'],
    techStack: ['Python', 'Django', 'MySQL', 'HTML/CSS', 'JavaScript', 'Bootstrap'],
    githubUrl: 'https://github.com/robert67-9',
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80',
    year: '2025'
  },
  {
    id: 'absa-republic-bank-infrastructure',
    title: 'Enterprise AV & Data Centre Infrastructure',
    category: 'Cloud & Database',
    tagline: 'Teleconferencing installation at ABSA Bank Head Office & environmental monitoring at Republic Bank.',
    description: 'Executed high-profile enterprise hardware deployments including teleconferencing systems at ABSA Bank Head Office (Feb 2026) and data centre humidifier sensor calibration at Republic Bank Head Office (with Apotica).',
    fullCaseStudy: {
      overview: 'Provided hands-on engineering for tier-1 financial institutions, ensuring reliable meeting room multimedia systems and server room environmental safeguards.',
      challenge: 'Ensuring strict compliance with bank security protocols, clean cable management, and zero operational disruption during live business hours.',
      architecture: 'Installation and testing of commercial conferencing display hardware, audio interfaces, environmental humidity sensors, CCTV cameras, and network switches.',
      databaseDesign: 'Hardware asset inventory tracking and sensor telemetry logging.',
      keyResults: [
        'Flawless deployment of ABSA Bank Head Office executive teleconferencing suites',
        'Reliable environmental monitoring protecting Republic Bank critical server infrastructure',
        'End-user briefing and documentation conducted for banking staff'
      ]
    },
    metrics: ['ABSA Bank', 'Republic Bank', 'Enterprise IT'],
    techStack: ['Network Infrastructure', 'IoT Sensors', 'CCTV & Access Control', 'Hardware Support'],
    githubUrl: 'https://github.com/robert67-9',
    featured: false,
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    year: '2026'
  }
];

export const experienceData: WorkExperience[] = [
  {
    id: 'exp-jams-tech',
    role: 'Network Engineer',
    company: 'Jams Tech Company Limited',
    location: 'Hybrid – North Legon, Accra, Ghana',
    period: 'Nov 2025 – Present',
    type: 'Full-time / Hybrid',
    description: 'Designing and deploying smart office and IoT solutions, including cloud-based monitoring systems and network infrastructure.',
    achievements: [
      'Design and deploy smart office and IoT solutions, guiding clients through setup, use, and maintenance',
      'Explain network infrastructure plans, cloud monitoring tools, and security/access control systems to stakeholders',
      'Plan network infrastructure and connectivity; provide software, IT equipment sales, and support services',
      'Maintain security, surveillance, and access control systems for corporate and residential facilities'
    ],
    techStack: ['IoT Systems', 'Cloud Monitoring', 'Network Infrastructure', 'Access Control', 'CCTV', 'IT Support']
  },
  {
    id: 'exp-kolpad',
    role: 'Database Administrator',
    company: 'Kolpad Company Limited',
    location: 'Remote – Oyarifa, Accra, Ghana',
    period: 'Mar 2025 – Present',
    type: 'Contract / Remote',
    description: 'Managing secure database operations, user privileges, access controls, and technical database troubleshooting.',
    achievements: [
      'Defined user roles and privileges to maintain secure access control across enterprise systems',
      'Supported application development teams by troubleshooting database issues and explaining root causes',
      'Participated in disaster recovery planning to ensure business continuity during unexpected outages',
      'Audited data integrity and query performance across MySQL and relational tables'
    ],
    techStack: ['Database Administration', 'MySQL', 'Role-Based Access Control', 'Data Security', 'Disaster Recovery']
  },
  {
    id: 'exp-maxi-auto',
    role: 'Digital Media Design & Marketing Specialist',
    company: 'Maxi Auto Brokers USA',
    location: 'Remote (USA & Ghana)',
    period: 'Dec 2025',
    type: 'Contract / Remote',
    description: 'Designed and developed company website, visual branding, and managed digital marketing creative across social media platforms.',
    achievements: [
      'Designed and developed the company website, shaping layout and seamless user experience for visitors',
      'Produced graphic design assets and marketing banners for vehicle inventory promotion',
      'Managed digital marketing campaigns across social media channels to drive international customer leads'
    ],
    techStack: ['Website Development', 'UI/UX Design', 'Figma', 'Photoshop', 'Digital Marketing', 'Graphic Design']
  },
  {
    id: 'exp-lenzy',
    role: 'Digital Media Design & Marketing Lead',
    company: 'Lenzy Acquisition Company Limited (USA)',
    location: 'Remote',
    period: 'Nov 2024',
    type: 'Contract / Remote',
    description: 'Led website development and logo design; created marketing collateral and trained the 5-person digital marketing team on design workflows.',
    achievements: [
      'Led website development and corporate logo design for the organization’s digital brand presence',
      'Trained and mentored a 5-person remote digital marketing team on graphic design workflows and tools',
      'Produced marketing design assets and established brand consistency across corporate communications'
    ],
    techStack: ['Web Development', 'Logo Design', 'Photoshop', 'Canva', 'Team Training', 'Design Workflows']
  },
  {
    id: 'exp-apotica',
    role: 'Network Engineer (Internship)',
    company: 'Apotica',
    location: 'Airport West, Accra, Ghana',
    period: 'Sep 2024 – Dec 2024',
    type: 'Internship',
    description: 'Maintained network hardware, delivered end-user help desk support, and deployed field data centre sensor solutions.',
    achievements: [
      'Provided help desk and technical coaching to end users, translating complex fixes into accessible guidance',
      'Troubleshot and maintained switches, office phones, and wireless access points on site',
      'Assisted in installing humidifier sensors at the Republic Bank Head Office data centre',
      'Assisted with CCTV camera installation, cable management, and network hardware configuration on client sites'
    ],
    techStack: ['Network Hardware', 'Help Desk Support', 'Data Centre Sensors', 'CCTV Installation', 'Cable Management']
  },
  {
    id: 'exp-wintitex',
    role: 'IT Consultant (Internship)',
    company: 'Wintitex Technology Company Limited',
    location: 'Nungua ColdStore, Accra, Ghana',
    period: 'Sep 2023 – Dec 2023',
    type: 'Internship',
    description: 'Analyzed client IT system infrastructure, managed QuickBooks POS, and authored comprehensive IT process documentation.',
    achievements: [
      'Documented IT service processes, producing clear written reference guides adopted for internal staff and client training',
      'Analyzed client system infrastructure and presented actionable recommendations for upgrades',
      'Trained users on QuickBooks Point of Sale (POS) operations and ensured compliance with antivirus security policies'
    ],
    techStack: ['IT Consulting', 'Process Documentation', 'QuickBooks POS', 'Security Compliance', 'User Training']
  }
];

export const educationData: Education[] = [
  {
    id: 'edu-btech',
    degree: 'Bachelor of Technology in Computer Science',
    institution: 'Koforidua Technical University',
    location: 'Koforidua, Eastern Region, Ghana',
    period: '2025 – Present',
    honors: 'Currently Enrolled (Degree Level)',
    highlights: [
      'Focusing on advanced algorithms, software architecture, data structures, and distributed cloud computing',
      'Active leadership within student technical initiatives and peer mentorship groups'
    ]
  },
  {
    id: 'edu-hnd',
    degree: 'Higher National Diploma (HND) in Computer and Network Management',
    institution: 'Koforidua Technical University',
    location: 'Koforidua, Eastern Region, Ghana',
    period: 'Aug 2022 – Sep 2025',
    honors: 'Second Class Upper Division (CTVET Certificate No: HDA 0048474)',
    highlights: [
      'Certified by Commission for Technical and Vocational Education and Training (CTVET), Republic of Ghana',
      'Final Year Project: Washing Bay Management System (Python/Django & MySQL web operations platform)',
      'Leadership: SRC Electoral Commission — Public Relations Officer, Chaplaincy Head, Best Student Graphic Designer'
    ]
  },
  {
    id: 'edu-shs',
    degree: 'Associate of Arts – Visual Arts',
    institution: "St. Stephen's Presbytery Senior High Technical",
    location: 'Asiakwa, Eastern Region, Ghana',
    period: 'Sep 2019 – Sep 2022',
    honors: 'WASSCE Graduate with Visual Arts Focus',
    highlights: [
      'Deep foundation in visual aesthetics, composition, typography, color theory, and creative design principles',
      'Elected Chaplaincy Prefect and active contributor to school arts exhibitions'
    ]
  }
];

export const skillGroups: SkillGroup[] = [
  {
    category: 'UI/UX & Digital Product Design',
    skills: [
      { name: 'Figma (Prototyping, Tokens, Auto-Layout)', level: 96, highlight: true },
      { name: 'Adobe XD & Wireframing', level: 92, highlight: true },
      { name: 'Photoshop & Visual Asset Creation', level: 94, highlight: true },
      { name: 'Canva & Marketing Collateral', level: 95 },
      { name: 'UI/UX Fundamentals & Mobile Principles', level: 95, highlight: true },
      { name: 'Brand Identity, Logo Design & Typography', level: 90 }
    ]
  },
  {
    category: 'Data Analytics & Visualization',
    skills: [
      { name: 'Tableau (Interactive Dashboards, KPIs, Visual Analytics)', level: 94, highlight: true },
      { name: 'Data Modeling & Business Intelligence', level: 88, highlight: true },
      { name: 'Reporting Automation & Executive Insights', level: 90 },
      { name: 'Database Views & Analytical Queries', level: 86 }
    ]
  },
  {
    category: 'Web & Software Development',
    skills: [
      { name: 'Full-Stack Web (HTML5, CSS3, JavaScript)', level: 94, highlight: true },
      { name: 'Python & Django Framework', level: 88, highlight: true },
      { name: 'React & Modern Frontend Frameworks', level: 86 },
      { name: 'Responsive Web Design & Mobile Optimization', level: 96, highlight: true },
      { name: 'E-commerce Architecture & Digital Storefronts', level: 90 }
    ]
  },
  {
    category: 'Database, Network & IT Systems',
    skills: [
      { name: 'Database Administration (MySQL, PostgreSQL)', level: 92, highlight: true },
      { name: 'Network Infrastructure & Troubleshooting', level: 90, highlight: true },
      { name: 'Cloud-Based Systems & Monitoring Tools', level: 88, highlight: true },
      { name: 'Smart Office & IoT Solutions', level: 86 },
      { name: 'CCTV, Surveillance & Access Control Systems', level: 88 },
      { name: 'QuickBooks POS & IT Help Desk Support', level: 92 }
    ]
  },
  {
    category: 'Aviation, Drone & Aerial Robotics',
    skills: [
      { name: 'RPAS Drone Pilot (Ghana Civil Aviation Authority Certified)', level: 96, highlight: true },
      { name: 'Flight Safety Protocols & Airspace Regulation Compliance', level: 94, highlight: true },
      { name: 'Aerial Photography & Cinematography Composition', level: 92, highlight: true },
      { name: 'Drone Site Surveying, Inspections & Mapping', level: 88 },
      { name: 'Pre-flight Navigation Checks & Emergency Procedures', level: 95 }
    ]
  }
];

export interface DetailedCertificate {
  id: string;
  title: string;
  issuer: string;
  issuingAuthority: string;
  year: string;
  issueDate: string;
  category: 'Aviation & RPAS' | 'Google' | 'Government & University' | 'Database & Systems' | 'Design & Honors';
  badge: string;
  description: string;
  verified: boolean;
  credentialId: string;
  recipientName: string;
  validity?: string;
  featured: boolean;
  accentColor: string;
}

export const detailedCertificates: DetailedCertificate[] = [
  {
    id: 'cert-gcaa-rpas',
    title: 'Remotely Piloted Aircraft Systems (RPAS) Safety Training',
    issuer: 'Ghana Civil Aviation Authority (GCAA)',
    issuingAuthority: 'GCAA Flight Safety & Standards Directorate',
    year: '2026',
    issueDate: '23 September 2026',
    category: 'Aviation & RPAS',
    badge: 'Licensed Drone Pilot',
    description: 'Official certification of completion for Remotely Piloted Aircraft Systems (RPAS) Safety Training issued by Ghana Civil Aviation Authority. Accredits compliance with commercial drone operations, aeronautical navigation, visual flight rules, and aviation safety.',
    verified: true,
    credentialId: 'GCAA-RPAS-2026-CERT-0923',
    recipientName: 'Robert Opoku Danso',
    validity: 'Valid for one year after date of issue',
    featured: true,
    accentColor: 'sky'
  },
  {
    id: 'cert-google-loyalty',
    title: 'Satisfaction Guaranteed: Develop Customer Loyalty Online',
    issuer: 'Google Career Certificates (via Coursera)',
    issuingAuthority: 'Google Digital Academy & Coursera Verification',
    year: '2026',
    issueDate: 'Jun 2026',
    category: 'Google',
    badge: 'Google Certified',
    description: 'Professional credential verifying proficiency in customer retention architectures, digital e-commerce customer journey optimization, loyalty rewards system engineering, and online satisfaction metrics.',
    verified: true,
    credentialId: 'EUQ8M9WFHO39',
    recipientName: 'Danso Robert Opoku',
    validity: 'Permanent Credential',
    featured: true,
    accentColor: 'amber'
  },
  {
    id: 'cert-ctvet-hnd',
    title: 'Higher National Diploma: Computer Network Management',
    issuer: 'Commission for TVET (CTVET) Republic of Ghana',
    issuingAuthority: 'Koforidua Technical University & National Board',
    year: '2025',
    issueDate: 'Nov 2025',
    category: 'Government & University',
    badge: 'Second Class Upper',
    description: 'Higher National Diploma in Computer and Network Management certified by the Commission for Technical and Vocational Education and Training (CTVET), Republic of Ghana. Final Year Project: Washing Bay Operations Management Web System.',
    verified: true,
    credentialId: 'HDA 0048474 • Candidate: 04/2022/1334D',
    recipientName: 'Robert Opoku Danso',
    validity: 'Official State Degree Diploma',
    featured: true,
    accentColor: 'emerald'
  },
  {
    id: 'cert-tableau-bi',
    title: 'Tableau Business Intelligence & Visual Analytics Specialist',
    issuer: 'Tableau & Data Analytics Institute',
    issuingAuthority: 'Visual Analytics & Enterprise Data Modeling',
    year: '2025',
    issueDate: 'May 2025',
    category: 'Database & Systems',
    badge: 'Tableau Analytics',
    description: 'Expertise accreditation in constructing interactive executive KPI dashboards, calculated analytical fields, parameter-driven forecasting, and relational database star-schema reporting views.',
    verified: true,
    credentialId: 'TAB-BI-2025-ROD-8821',
    recipientName: 'Danso Robert Opoku',
    validity: 'Professional Credential',
    featured: true,
    accentColor: 'purple'
  },
  {
    id: 'cert-db-admin',
    title: 'Enterprise Database Administration & Relational Modeling',
    issuer: 'Kolpad Systems & Technical Evaluation',
    issuingAuthority: 'Enterprise Systems & Database Architecture',
    year: '2024',
    issueDate: 'Oct 2024',
    category: 'Database & Systems',
    badge: 'DB Administrator',
    description: 'Verified qualification in PostgreSQL and MySQL relational architecture, database indexing, query optimization, role-based access control (RBAC), and automated disaster recovery backups.',
    verified: true,
    credentialId: 'KLP-DBA-2024-ROD-019',
    recipientName: 'Danso Robert Opoku',
    validity: 'Enterprise Certification',
    featured: false,
    accentColor: 'indigo'
  },
  {
    id: 'cert-ktu-awards',
    title: 'Best Student Graphic Designer & Creative Director Honors',
    issuer: 'Koforidua Technical University (SRC & Computing Faculty)',
    issuingAuthority: 'KTU Faculty of Computing & Technology Awards',
    year: '2024 – 2025',
    issueDate: 'Annual Academic Honors',
    category: 'Design & Honors',
    badge: 'Best Student Designer',
    description: 'Awarded for extraordinary visual identity design, UI/UX creative mastery, campus technical media leadership, and brand execution across university initiatives.',
    verified: true,
    credentialId: 'KTU-HON-2025-DESIGN-01',
    recipientName: 'Danso Robert Opoku',
    validity: 'Academic Honors Citation',
    featured: false,
    accentColor: 'rose'
  }
];

export const certifications = detailedCertificates.map(c => ({
  title: c.title,
  issuer: c.issuer,
  year: c.issueDate,
  id: `Cert ID: ${c.credentialId}`
}));
