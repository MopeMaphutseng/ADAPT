// Shared content constants. Structured marketing copy (not DB-editable).

export const PRIMARY_EMAIL = "pulamaliboho@gmail.com";
export const FOUNDER_NAME = "Mope Samuel Maphutseng";
export const FOUNDER_TITLE = "Founder & CEO";
export const COMPANY_NAME = "ADAPT Technologies";
export const LOCATION = "Lesotho";

export const BRAND_TAGLINE = "Intelligent Solutions. Real Impact.";
export const BRAND_TALENT = "Local Talent. Global Vision.";
export const BRAND_PHILOSOPHY = "Adapt → Adjust → Advance.";
export const BRAND_LONG = "Building intelligent technology from Lesotho for Africa and the world.";
export const BRAND_POSITION = "Built in Lesotho. For Africa. For the World.";

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Achievements", href: "/achievements" },
  { label: "Investors", href: "/investors" },
  { label: "Contact", href: "/contact" },
] as const;

export interface ServiceGroup {
  slug: string;
  title: string;
  description: string;
  items: string[];
  icon: string;
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    slug: "ai-software",
    title: "AI & Software Development",
    description:
      "Intelligent applications, AI agents and modern software systems built to move businesses forward.",
    items: [
      "AI applications",
      "AI agents",
      "Web applications",
      "Mobile applications",
      "Backend systems",
      "Cloud applications",
      "Business automation",
      "Custom software",
    ],
    icon: "cpu",
  },
  {
    slug: "embedded-iot",
    title: "Embedded Systems & IoT",
    description:
      "Connected hardware, sensors and embedded intelligence that turn the physical world into data.",
    items: [
      "Arduino systems",
      "ESP32 systems",
      "IoT devices",
      "Sensors",
      "Embedded monitoring",
      "Electronics prototypes",
      "Connected devices",
    ],
    icon: "chip",
  },
  {
    slug: "robotics-autonomous",
    title: "Robotics & Autonomous Systems",
    description:
      "Robotic platforms and autonomous systems engineered to perceive, decide and act.",
    items: [
      "Robotics prototypes",
      "Autonomous systems",
      "Drone technology",
      "Remote monitoring",
      "Intelligent control systems",
    ],
    icon: "robot",
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    description:
      "Security engineering that protects networks, devices, software and people.",
    items: [
      "Network security",
      "Security assessments",
      "Security monitoring",
      "Cybersecurity training",
      "IoT security",
    ],
    icon: "shield",
  },
  {
    slug: "industrial-automation",
    title: "Industrial Automation",
    description:
      "Automated monitoring and intelligent control for industrial and infrastructure environments.",
    items: [
      "Monitoring systems",
      "Automation",
      "Predictive maintenance",
      "Intelligent control",
      "Industrial IoT",
    ],
    icon: "factory",
  },
  {
    slug: "agricultural-technology",
    title: "Agricultural Technology",
    description:
      "Data-driven agriculture that helps farmers monitor, decide and grow intelligently.",
    items: [
      "Smart farming",
      "Agricultural monitoring",
      "Soil monitoring",
      "Irrigation intelligence",
      "Agricultural automation",
    ],
    icon: "leaf",
  },
  {
    slug: "education-technology",
    title: "Education Technology",
    description:
      "Digital campuses, intelligent learning platforms and academic systems for modern institutions.",
    items: [
      "University systems",
      "Learning platforms",
      "AI tutoring",
      "Academic management systems",
      "Digital campus solutions",
    ],
    icon: "school",
  },
  {
    slug: "technology-consulting",
    title: "Technology Consulting",
    description:
      "Practical strategy and architecture guidance for organisations in digital transformation.",
    items: [
      "Digital transformation",
      "AI strategy",
      "Technology architecture",
      "Product development",
      "Innovation consulting",
    ],
    icon: "compass",
  },
];

export const PROJECT_STATUSES = [
  { value: "IDEA", label: "Idea" },
  { value: "RESEARCH", label: "Research" },
  { value: "PROTOTYPE", label: "Prototype" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "TESTING", label: "Testing" },
  { value: "BETA", label: "Beta" },
  { value: "PRODUCTION", label: "Production" },
  { value: "COMPLETED", label: "Completed" },
] as const;

export const ACHIEVEMENT_CATEGORIES = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "MILESTONE", label: "Milestone" },
  { value: "AWARD", label: "Award" },
  { value: "PRODUCT_LAUNCH", label: "Product Launch" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "COMPANY_NEWS", label: "Company News" },
] as const;

export const INVESTOR_TYPES = [
  { value: "ANGEL_INVESTOR", label: "Angel Investor" },
  { value: "VENTURE_CAPITAL", label: "Venture Capital" },
  { value: "CORPORATE_INVESTOR", label: "Corporate Investor" },
  { value: "STRATEGIC_PARTNER", label: "Strategic Partner" },
  { value: "TECHNOLOGY_PARTNER", label: "Technology Partner" },
  { value: "OTHER", label: "Other" },
] as const;

export const INQUIRY_TYPES = [
  { value: "GENERAL", label: "General Inquiry" },
  { value: "BUSINESS", label: "Business" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "MEDIA", label: "Media" },
  { value: "CAREERS", label: "Careers" },
  { value: "OTHER", label: "Other" },
] as const;

export const MESSAGE_STATUSES = [
  { value: "NEW", label: "New" },
  { value: "READ", label: "Read" },
  { value: "RESPONDED", label: "Responded" },
  { value: "CLOSED", label: "Closed" },
] as const;

export const INVESTOR_STATUSES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "IN_DISCUSSION", label: "In Discussion" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "CLOSED", label: "Closed" },
] as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_ADMIN: "Content Admin",
  COMMS_ADMIN: "Communications Admin",
};

export const SEED_PROJECTS = [
  {
    slug: "pula-maliboho",
    title: "PULA MALIBOHO",
    summary:
      "An AI platform focused on intelligent assistance, learning, knowledge, contextual interaction, and local-language capabilities.",
    description:
      "PULA MALIBOHO is an AI platform under development at ADAPT Technologies. It is designed around intelligent assistance, learning support, knowledge access and contextual interaction — with attention to local-language capability so that intelligent software can speak to people on their own terms.\n\nThe platform represents the company's conviction that Africa should build its own AI products: systems that understand local context, languages and needs rather than only importing them.",
    status: "DEVELOPMENT",
    category: "AI & Software",
    technologies: ["Artificial Intelligence", "Machine Learning", "NLP"],
    externalUrl: "https://pula-maliboho-backend.onrender.com",
    featured: true,
  },
  {
    slug: "campusos",
    title: "CampusOS",
    summary:
      "An intelligent university and campus technology platform designed for modern academic institutions.",
    description:
      "CampusOS is an intelligent university/campus technology platform concept at ADAPT Technologies. It targets the modern academic institution: student services, academic management, AI assistance, campus information and administrative systems unified in one platform.\n\nIt reflects the company's view that education technology should be built for African institutions — digital campuses designed from the ground up for how students, lecturers and administrators actually work.",
    status: "RESEARCH",
    category: "Education Technology",
    technologies: ["Education Technology", "Web Platforms", "AI Assistance"],
    featured: true,
  },
  {
    slug: "gridmind",
    title: "GridMind",
    summary:
      "An intelligent infrastructure and automation concept for smarter, more resilient operations.",
    description:
      "GridMind is an intelligent infrastructure/automation concept at ADAPT Technologies. It explores how intelligent control, monitoring and automation can make critical infrastructure — energy, water, utilities — more efficient, reliable and responsive.\n\nThe concept combines sensing, data and intelligent control to move infrastructure from reactive operation toward predictive, self-aware operation.",
    status: "IDEA",
    category: "Industrial Automation",
    technologies: ["Automation", "IoT", "Intelligent Control"],
    featured: true,
  },
  {
    slug: "rescuedrone-network",
    title: "RescueDrone Network",
    summary:
      "An autonomous drone and network concept for search, rescue, surveillance, mapping and disaster response.",
    description:
      "RescueDrone Network is a concept at ADAPT Technologies exploring autonomous drone systems for search and rescue, surveillance, mapping and disaster response. In environments where response speed and reachable terrain are the difference makers, autonomous aerial systems can extend the capability of emergency and field teams.\n\nADAPT is investigating the sensing, autonomy and networking layers required to make such a system practical and dependable.",
    status: "IDEA",
    category: "Robotics & Autonomous Systems",
    technologies: ["Drones", "Autonomous Systems", "Computer Vision"],
    featured: true,
  },
  {
    slug: "agroeye",
    title: "AgroEye",
    summary:
      "An agricultural intelligence concept combining sensors, monitoring, smart farming, irrigation, environmental data and AI.",
    description:
      "AgroEye is an agricultural technology concept at ADAPT Technologies. It combines sensors, environmental data, smart-farming practices, irrigation intelligence and AI to help farmers understand and act on what is happening in their fields.\n\nFor agriculture in Lesotho and across Africa, better data can mean better decisions about water, soil and yield — AgroEye is ADAPT's direction toward that outcome.",
    status: "RESEARCH",
    category: "Agricultural Technology",
    technologies: ["IoT", "Sensors", "AI", "Smart Farming"],
    featured: true,
  },
  {
    slug: "maliboho-security",
    title: "Maliboho Security",
    summary:
      "A cybersecurity and intelligent security concept concerned with protecting emerging African digital infrastructure.",
    description:
      "Maliboho Security is a cybersecurity and intelligent security concept at ADAPT Technologies. As African organisations build more digital infrastructure, the same infrastructure needs to be designed, deployed and monitored securely.\n\nADAPT sees security as a first-class engineering discipline: networks, devices, software and people protected as an integrated system.",
    status: "IDEA",
    category: "Cybersecurity",
    technologies: ["Network Security", "Monitoring", "IoT Security"],
    featured: true,
  },
  {
    slug: "smart-energy-monitor",
    title: "Smart Energy Monitor",
    summary:
      "An intelligent energy monitoring concept for electricity monitoring, energy efficiency, fault detection and real-time analytics.",
    description:
      "Smart Energy Monitor is an energy technology concept at ADAPT Technologies. It targets electricity monitoring, energy efficiency, fault detection and real-time analytics — the visibility every utility, campus, farm or facility needs to manage energy intelligently.\n\nThe concept aligns with a broader vision of energy technology that ADAPT is building toward.",
    status: "IDEA",
    category: "Energy Technology",
    technologies: ["Energy Monitoring", "IoT", "Real-time Analytics"],
    featured: true,
  },
];

export const ROADMAP_DEFAULT = {
  phases: [
    {
      key: "now",
      label: "Now",
      title: "AI & Software",
      items: [
        "AI & software platforms",
        "Business automation",
        "Web and mobile applications",
      ],
    },
    {
      key: "next",
      label: "Next",
      title: "IoT & Embedded Systems",
      items: [
        "Sensors and connected devices",
        "Embedded monitoring",
        "Hardware prototypes",
      ],
    },
    {
      key: "expansion",
      label: "Expansion",
      title: "Robotics & Automation",
      items: ["Robotics prototypes", "Industrial automation", "Autonomous systems research"],
    },
    {
      key: "advanced",
      label: "Advanced",
      title: "Advanced Engineering",
      items: ["Autonomous platforms", "Advanced sensors", "Systems engineering"],
    },
    {
      key: "long-term",
      label: "Long-Term",
      title: "Advanced Engineering & Aerospace",
      items: ["Advanced engineering", "Aerospace", "Next-generation systems"],
    },
  ],
};

export const SEO_KEYWORDS = [
  "technology company Lesotho",
  "AI company Lesotho",
  "software development Lesotho",
  "artificial intelligence Africa",
  "robotics Africa",
  "technology innovation Lesotho",
  "African technology company",
  "AI engineering Africa",
];