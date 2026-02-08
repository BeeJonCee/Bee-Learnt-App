export type UserRole = "student" | "parent";

export type Subject = {
  id: number;
  name: string;
  grade: number | string;
  description: string;
  imageUrl?: string | null;
};

export type Module = {
  id: number;
  subjectId: number;
  title: string;
  description: string;
  order: number;
  grade?: number;
};

export type LessonType = "text" | "video";

export type Lesson = {
  id: number;
  moduleId: number;
  title: string;
  content: string;
  type: LessonType;
  videoUrl?: string | null;
  order: number;
};

export type Quiz = {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  aiGenerated: boolean;
};

export type Question = {
  id: number;
  quizId: number;
  questionText: string;
  type: "multiple_choice" | "short_answer";
  options?: string[];
  correctAnswer: string;
  explanation?: string;
};

export type AssignmentType = "project" | "practical" | "research";

export type Assignment = {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  dueDate: string;
  type: AssignmentType;
  grade: number;
};

export type ParentOverview = {
  studentId: number;
  studentName: string;
  completedLessons: number;
  quizAverage: number;
};

const subjects: Subject[] = [
  {
    id: 1,
    name: "Mathematics",
    grade: 10,
    description:
      "Build confidence with algebra, functions, and graphs aligned to CAPS.",
  },
  {
    id: 2,
    name: "Physical Sciences",
    grade: 11,
    description:
      "Master motion, forces, and chemical systems with practical examples.",
  },
  {
    id: 3,
    name: "Life Sciences",
    grade: 12,
    description:
      "Explore cells, genetics, and modern biology with focused lessons.",
  },
  {
    id: 4,
    name: "Information Technology",
    grade: "10-12",
    description:
      "CAPS-aligned computing, programming, and digital systems across Grades 10-12.",
  },
];

const modules: Module[] = [
  {
    id: 101,
    subjectId: 1,
    title: "Algebraic Expressions",
    description: "Simplify expressions and understand algebraic structure.",
    order: 1,
    grade: 10,
  },
  {
    id: 102,
    subjectId: 1,
    title: "Functions and Graphs",
    description:
      "Analyze linear functions and interpret graphs with confidence.",
    order: 2,
    grade: 10,
  },
  {
    id: 201,
    subjectId: 2,
    title: "Motion and Force",
    description: "Explore vectors, Newton's laws, and motion in one dimension.",
    order: 1,
    grade: 11,
  },
  {
    id: 202,
    subjectId: 2,
    title: "Chemical Systems",
    description: "Understand atomic structure and key reaction types.",
    order: 2,
    grade: 11,
  },
  {
    id: 301,
    subjectId: 3,
    title: "Cell Biology",
    description: "Study the building blocks of life and cellular processes.",
    order: 1,
    grade: 12,
  },
  {
    id: 302,
    subjectId: 3,
    title: "Genetics and Inheritance",
    description: "Learn DNA basics and inheritance patterns.",
    order: 2,
    grade: 12,
  },
  {
    id: 401,
    subjectId: 4,
    title: "Computer Systems and Hardware",
    description: "Explore CPU, memory, storage, and peripheral devices.",
    order: 1,
    grade: 10,
  },
  {
    id: 402,
    subjectId: 4,
    title: "Programming Foundations",
    description:
      "Build problem-solving skills with pseudocode and control flow.",
    order: 2,
    grade: 10,
  },
  {
    id: 403,
    subjectId: 4,
    title: "Networks and the Internet",
    description: "Learn networking models, IP addressing, and connectivity.",
    order: 3,
    grade: 11,
  },
  {
    id: 404,
    subjectId: 4,
    title: "Data and Databases",
    description: "Model data and practice SQL fundamentals.",
    order: 4,
    grade: 11,
  },
  {
    id: 405,
    subjectId: 4,
    title: "Systems Analysis and Design",
    description: "Plan software solutions with the SDLC and UML tools.",
    order: 5,
    grade: 12,
  },
  {
    id: 406,
    subjectId: 4,
    title: "Cybersecurity and Ethics",
    description: "Protect systems, data, and users with responsible practice.",
    order: 6,
    grade: 12,
  },
];

const lessons: Lesson[] = [
  {
    id: 1001,
    moduleId: 101,
    title: "Intro to Algebra",
    content:
      "# Algebra introduction\n\nAlgebra uses symbols to represent unknown values. In CAPS, you will use algebra to model real problems and simplify expressions.\n\n## Goals\n- Understand variables and constants\n- Translate words into expressions\n- Simplify with basic rules\n\n## Key idea\nCombine like terms by adding their coefficients.",
    type: "text",
    order: 1,
  },
  {
    id: 1002,
    moduleId: 101,
    title: "Simplifying Expressions",
    content:
      "# Simplifying expressions\n\nYou can simplify by collecting like terms and factoring common factors.\n\n## Example\n2x + 3x - x = 4x\n\n## Practice\nSimplify: 5a - 2a + 7.",
    type: "video",
    videoUrl: "https://www.youtube.com/embed/6-yJXqkty6I",
    order: 2,
  },
  {
    id: 1003,
    moduleId: 102,
    title: "Linear Functions",
    content:
      "# Linear functions\n\nA linear function has the form y = mx + c. The gradient tells you how steep the line is.\n\n## Goals\n- Interpret m and c\n- Plot straight lines\n- Compare gradients\n\n## Tip\nTwo points define a line. Use rise over run to find m.",
    type: "text",
    order: 1,
  },
  {
    id: 1004,
    moduleId: 102,
    title: "Graph Interpretation",
    content:
      "# Graph interpretation\n\nReading graphs is about understanding trends, intercepts, and scales.\n\n## Focus\n- Intercepts\n- Slope\n- Domain and range\n\n## Practice\nDescribe what happens when the graph crosses the y-axis at 3.",
    type: "text",
    order: 2,
  },
  {
    id: 2001,
    moduleId: 201,
    title: "Vectors and Scalars",
    content:
      "# Vectors and scalars\n\nScalars have magnitude only. Vectors have magnitude and direction.\n\n## Examples\n- Speed is a scalar\n- Velocity is a vector\n\n## Tip\nUse arrows to represent vectors.",
    type: "text",
    order: 1,
  },
  {
    id: 2002,
    moduleId: 201,
    title: "Newton's Laws",
    content:
      "# Newton's laws\n\nThese laws explain how forces affect motion.\n\n## Summary\n1. Inertia\n2. F = ma\n3. Action and reaction\n\n## Practice\nIdentify the forces on a sliding book.",
    type: "video",
    videoUrl: "https://www.youtube.com/embed/kKKM8Y-u7ds",
    order: 2,
  },
  {
    id: 2003,
    moduleId: 202,
    title: "Atomic Structure",
    content:
      "# Atomic structure\n\nAtoms consist of protons, neutrons, and electrons.\n\n## Goals\n- Identify particles\n- Use atomic number and mass number\n- Understand isotopes\n\n## Tip\nAtomic number equals number of protons.",
    type: "text",
    order: 1,
  },
  {
    id: 2004,
    moduleId: 202,
    title: "Chemical Reactions",
    content:
      "# Chemical reactions\n\nReactions involve breaking and forming bonds.\n\n## Types\n- Synthesis\n- Decomposition\n- Combustion\n\n## Practice\nClassify the reaction: 2H2 + O2 -> 2H2O.",
    type: "text",
    order: 2,
  },
  {
    id: 3001,
    moduleId: 301,
    title: "Cell Structure",
    content:
      "# Cell structure\n\nCells are the basic unit of life. Eukaryotic cells contain organelles.\n\n## Organelles\n- Nucleus\n- Mitochondria\n- Ribosomes\n\n## Practice\nExplain the role of the nucleus.",
    type: "text",
    order: 1,
  },
  {
    id: 3002,
    moduleId: 301,
    title: "Mitosis Overview",
    content:
      "# Mitosis overview\n\nMitosis is cell division used for growth and repair.\n\n## Stages\n- Prophase\n- Metaphase\n- Anaphase\n- Telophase\n\n## Tip\nRemember PMAT to recall the order.",
    type: "video",
    videoUrl: "https://www.youtube.com/embed/f-ldPgEfAHI",
    order: 2,
  },
  {
    id: 3003,
    moduleId: 302,
    title: "DNA Basics",
    content:
      "# DNA basics\n\nDNA carries genetic information. It is made of nucleotides.\n\n## Components\n- Sugar\n- Phosphate\n- Base\n\n## Practice\nName the four DNA bases.",
    type: "text",
    order: 1,
  },
  {
    id: 3004,
    moduleId: 302,
    title: "Punnett Squares",
    content:
      "# Punnett squares\n\nPunnett squares help predict inheritance patterns.\n\n## Goals\n- Set up a square\n- Identify genotypes\n- Calculate ratios\n\n## Tip\nUse uppercase for dominant traits.",
    type: "text",
    order: 2,
  },
  {
    id: 4001,
    moduleId: 401,
    title: "Hardware Essentials",
    content:
      "# Hardware essentials\n\nComputer systems use hardware components that work together to process data.\n\n## Focus\n- CPU, RAM, storage\n- Input and output devices\n- Motherboard and power supply\n\n## Practice\nList three devices that are considered input devices.",
    type: "text",
    order: 1,
  },
  {
    id: 4002,
    moduleId: 401,
    title: "Inside the CPU",
    content:
      "# Inside the CPU\n\nThe CPU fetches, decodes, and executes instructions every cycle.\n\n## Concepts\n- Control unit\n- ALU\n- Registers\n\n## Tip\nClock speed affects how many cycles a CPU can complete each second.",
    type: "video",
    videoUrl: "https://www.youtube.com/embed/1I5ZMmrOfnA",
    order: 2,
  },
  {
    id: 4003,
    moduleId: 402,
    title: "Algorithms and Pseudocode",
    content:
      "# Algorithms and pseudocode\n\nAlgorithms describe the steps needed to solve a problem. Pseudocode helps plan logic before coding.\n\n## Goals\n- Break problems into steps\n- Use sequence, selection, and iteration\n- Communicate logic clearly\n\n## Practice\nWrite pseudocode to calculate an average.",
    type: "text",
    order: 1,
  },
  {
    id: 4004,
    moduleId: 402,
    title: "Control Flow Patterns",
    content:
      "# Control flow patterns\n\nPrograms use conditions and loops to control behavior.\n\n## Patterns\n- If/else decisions\n- For and while loops\n- Nested conditions\n\n## Tip\nTest with small inputs before scaling up.",
    type: "video",
    videoUrl: "https://www.youtube.com/embed/4c6dyf0b7yo",
    order: 2,
  },
  {
    id: 4005,
    moduleId: 403,
    title: "Network Models",
    content:
      "# Network models\n\nNetwork layers help describe how data moves across devices.\n\n## Key ideas\n- OSI model layers\n- TCP/IP stack\n- Encapsulation\n\n## Practice\nMatch each OSI layer to its role.",
    type: "text",
    order: 1,
  },
  {
    id: 4006,
    moduleId: 403,
    title: "IP Addressing Basics",
    content:
      "# IP addressing basics\n\nIP addresses identify devices on a network.\n\n## Focus\n- IPv4 format\n- Subnet masks\n- Public vs private IPs\n\n## Practice\nExplain why 192.168.1.10 is a private address.",
    type: "text",
    order: 2,
  },
  {
    id: 4007,
    moduleId: 404,
    title: "Data Modeling",
    content:
      "# Data modeling\n\nDatabases store data in related tables. Modeling helps plan the structure.\n\n## Goals\n- Identify entities\n- Define attributes\n- Use relationships\n\n## Practice\nCreate an entity list for a library system.",
    type: "text",
    order: 1,
  },
  {
    id: 4008,
    moduleId: 404,
    title: "SQL Queries",
    content:
      "# SQL queries\n\nSQL is used to create, read, update, and delete data.\n\n## Focus\n- SELECT statements\n- WHERE filters\n- Sorting with ORDER BY\n\n## Practice\nWrite a query to list all learners in Grade 11.",
    type: "video",
    videoUrl: "https://www.youtube.com/embed/HXV3zeQKqGY",
    order: 2,
  },
  {
    id: 4009,
    moduleId: 405,
    title: "Systems Development Life Cycle",
    content:
      "# Systems development life cycle\n\nThe SDLC guides teams from planning to maintenance.\n\n## Phases\n- Planning\n- Analysis\n- Design\n- Implementation\n- Testing\n- Maintenance\n\n## Tip\nDocument requirements early to reduce rework.",
    type: "text",
    order: 1,
  },
  {
    id: 4010,
    moduleId: 405,
    title: "Requirements and Use Cases",
    content:
      "# Requirements and use cases\n\nUse cases describe how users interact with a system.\n\n## Goals\n- Capture user goals\n- Identify actors\n- Define success scenarios\n\n## Practice\nWrite a use case for submitting an assignment.",
    type: "text",
    order: 2,
  },
  {
    id: 4011,
    moduleId: 406,
    title: "Security Principles",
    content:
      "# Security principles\n\nSecure systems protect confidentiality, integrity, and availability.\n\n## Focus\n- CIA triad\n- Access control\n- Common threats\n\n## Practice\nExplain why multi-factor authentication improves security.",
    type: "text",
    order: 1,
  },
  {
    id: 4012,
    moduleId: 406,
    title: "Digital Citizenship",
    content:
      "# Digital citizenship\n\nResponsible computing keeps people safe and informed online.\n\n## Topics\n- Online privacy\n- Respectful communication\n- Managing digital footprints\n\n## Practice\nList two ways to protect your personal information online.",
    type: "text",
    order: 2,
  },
];

const quizzes: Quiz[] = [
  {
    id: 5001,
    moduleId: 101,
    title: "Algebra Basics",
    description: "Check your understanding of algebraic expressions.",
    difficulty: "easy",
    aiGenerated: false,
  },
  {
    id: 5002,
    moduleId: 102,
    title: "Functions Sprint",
    description: "Short quiz on linear functions and graphs.",
    difficulty: "medium",
    aiGenerated: false,
  },
  {
    id: 5003,
    moduleId: 201,
    title: "Motion Check",
    description: "Test your knowledge of vectors and forces.",
    difficulty: "medium",
    aiGenerated: true,
  },
  {
    id: 5004,
    moduleId: 202,
    title: "Chemistry Essentials",
    description: "Review key ideas in chemical systems.",
    difficulty: "hard",
    aiGenerated: true,
  },
  {
    id: 5005,
    moduleId: 301,
    title: "Cell Quiz",
    description: "Assess your understanding of cell biology.",
    difficulty: "easy",
    aiGenerated: false,
  },
  {
    id: 5006,
    moduleId: 302,
    title: "Genetics Review",
    description: "Practice genetics and inheritance basics.",
    difficulty: "medium",
    aiGenerated: false,
  },
  {
    id: 6001,
    moduleId: 401,
    title: "Hardware Check",
    description: "Confirm key computer hardware concepts.",
    difficulty: "easy",
    aiGenerated: false,
  },
  {
    id: 6002,
    moduleId: 402,
    title: "Programming Foundations",
    description: "Control flow and algorithmic thinking review.",
    difficulty: "medium",
    aiGenerated: false,
  },
  {
    id: 6003,
    moduleId: 403,
    title: "Networking Basics",
    description: "Quick check on networks and IP addressing.",
    difficulty: "medium",
    aiGenerated: false,
  },
  {
    id: 6004,
    moduleId: 404,
    title: "Database Essentials",
    description: "Review data models and SQL basics.",
    difficulty: "medium",
    aiGenerated: false,
  },
  {
    id: 6005,
    moduleId: 405,
    title: "Systems Analysis Review",
    description: "Assess SDLC and requirements knowledge.",
    difficulty: "hard",
    aiGenerated: false,
  },
  {
    id: 6006,
    moduleId: 406,
    title: "Cybersecurity Awareness",
    description: "Test your digital safety knowledge.",
    difficulty: "medium",
    aiGenerated: false,
  },
];

const questions: Question[] = [
  {
    id: 9001,
    quizId: 5001,
    questionText: "Solve for x: 2x = 10",
    type: "multiple_choice",
    options: ["2", "5", "10", "12"],
    correctAnswer: "5",
    explanation: "Divide both sides by 2 to get x = 5.",
  },
  {
    id: 9002,
    quizId: 5001,
    questionText: "Simplify: 3a + 4a - a",
    type: "multiple_choice",
    options: ["6a", "7a", "8a", "a"],
    correctAnswer: "6a",
    explanation: "Combine like terms: 3a + 4a - a = 6a.",
  },
  {
    id: 9003,
    quizId: 5001,
    questionText: "What does a variable represent?",
    type: "short_answer",
    correctAnswer: "unknown value",
  },
  {
    id: 9011,
    quizId: 5002,
    questionText: "What is the gradient of y = 4x + 1?",
    type: "multiple_choice",
    options: ["1", "4", "5", "0"],
    correctAnswer: "4",
  },
  {
    id: 9012,
    quizId: 5002,
    questionText: "Which point lies on y = 2x?",
    type: "multiple_choice",
    options: ["(1, 1)", "(2, 3)", "(3, 6)", "(4, 5)"],
    correctAnswer: "(3, 6)",
  },
  {
    id: 9013,
    quizId: 5002,
    questionText: "Define the y-intercept in a sentence.",
    type: "short_answer",
    correctAnswer: "where the graph crosses the y-axis",
  },
  {
    id: 9021,
    quizId: 5003,
    questionText: "Velocity is a: ",
    type: "multiple_choice",
    options: ["scalar", "vector", "unit", "mass"],
    correctAnswer: "vector",
  },
  {
    id: 9022,
    quizId: 5003,
    questionText: "Which law is F = ma?",
    type: "multiple_choice",
    options: ["First", "Second", "Third", "Fourth"],
    correctAnswer: "Second",
  },
  {
    id: 9023,
    quizId: 5003,
    questionText: "State Newton's third law.",
    type: "short_answer",
    correctAnswer: "every action has an equal and opposite reaction",
  },
  {
    id: 9031,
    quizId: 5004,
    questionText: "What is the atomic number?",
    type: "multiple_choice",
    options: [
      "Number of protons",
      "Number of neutrons",
      "Mass number",
      "Number of shells",
    ],
    correctAnswer: "Number of protons",
  },
  {
    id: 9032,
    quizId: 5004,
    questionText: "Combustion is a reaction with:",
    type: "multiple_choice",
    options: ["oxygen", "nitrogen", "carbon", "water"],
    correctAnswer: "oxygen",
  },
  {
    id: 9033,
    quizId: 5004,
    questionText: "Give one example of a synthesis reaction.",
    type: "short_answer",
    correctAnswer: "2h2 + o2 -> 2h2o",
  },
  {
    id: 9041,
    quizId: 5005,
    questionText: "Which organelle controls cell activities?",
    type: "multiple_choice",
    options: ["Nucleus", "Ribosome", "Cell wall", "Chloroplast"],
    correctAnswer: "Nucleus",
  },
  {
    id: 9042,
    quizId: 5005,
    questionText: "Mitochondria are responsible for:",
    type: "multiple_choice",
    options: [
      "Photosynthesis",
      "Energy release",
      "Protein synthesis",
      "Storage",
    ],
    correctAnswer: "Energy release",
  },
  {
    id: 9043,
    quizId: 5005,
    questionText: "Name the process of cell division.",
    type: "short_answer",
    correctAnswer: "mitosis",
  },
  {
    id: 9051,
    quizId: 5006,
    questionText: "DNA stands for:",
    type: "multiple_choice",
    options: [
      "Deoxyribonucleic acid",
      "Dioxyribonucleic acid",
      "Deoxyribose acid",
      "DNA acid",
    ],
    correctAnswer: "Deoxyribonucleic acid",
  },
  {
    id: 9052,
    quizId: 5006,
    questionText: "Which base pairs with Adenine in DNA?",
    type: "multiple_choice",
    options: ["Cytosine", "Guanine", "Thymine", "Uracil"],
    correctAnswer: "Thymine",
  },
  {
    id: 9053,
    quizId: 5006,
    questionText: "Define genotype.",
    type: "short_answer",
    correctAnswer: "genetic makeup of an organism",
  },
  {
    id: 9101,
    quizId: 6001,
    questionText: "Which component provides short-term memory?",
    type: "multiple_choice",
    options: ["RAM", "CPU", "SSD", "Power supply"],
    correctAnswer: "RAM",
  },
  {
    id: 9102,
    quizId: 6001,
    questionText: "CPU stands for:",
    type: "short_answer",
    correctAnswer: "central processing unit",
  },
  {
    id: 9111,
    quizId: 6002,
    questionText: "Which structure repeats a block of code?",
    type: "multiple_choice",
    options: ["Loop", "Variable", "Array", "Comment"],
    correctAnswer: "Loop",
  },
  {
    id: 9112,
    quizId: 6002,
    questionText: "What is an algorithm?",
    type: "short_answer",
    correctAnswer: "step-by-step procedure",
  },
  {
    id: 9121,
    quizId: 6003,
    questionText: "Which device forwards packets between networks?",
    type: "multiple_choice",
    options: ["Router", "Switch", "Monitor", "Keyboard"],
    correctAnswer: "Router",
  },
  {
    id: 9122,
    quizId: 6003,
    questionText: "IP stands for:",
    type: "short_answer",
    correctAnswer: "internet protocol",
  },
  {
    id: 9131,
    quizId: 6004,
    questionText: "Which SQL keyword retrieves rows?",
    type: "multiple_choice",
    options: ["SELECT", "INSERT", "UPDATE", "DELETE"],
    correctAnswer: "SELECT",
  },
  {
    id: 9132,
    quizId: 6004,
    questionText: "Define primary key.",
    type: "short_answer",
    correctAnswer: "unique identifier for a record",
  },
  {
    id: 9141,
    quizId: 6005,
    questionText: "Which phase focuses on gathering requirements?",
    type: "multiple_choice",
    options: ["Analysis", "Testing", "Deployment", "Maintenance"],
    correctAnswer: "Analysis",
  },
  {
    id: 9142,
    quizId: 6005,
    questionText: "SDLC stands for:",
    type: "short_answer",
    correctAnswer: "systems development life cycle",
  },
  {
    id: 9151,
    quizId: 6006,
    questionText: "Which is a strong password?",
    type: "multiple_choice",
    options: ["P@ssw0rd!82", "password", "123456", "qwerty"],
    correctAnswer: "P@ssw0rd!82",
  },
  {
    id: 9152,
    quizId: 6006,
    questionText: "What is phishing?",
    type: "short_answer",
    correctAnswer: "tricking users into revealing sensitive information",
  },
];

const assignments: Assignment[] = [
  {
    id: 8001,
    moduleId: 401,
    title: "Hardware Spec Sheet",
    description: "Compare CPU, RAM, and storage options for a study PC build.",
    dueDate: "2026-03-12",
    type: "research",
    grade: 10,
  },
  {
    id: 8002,
    moduleId: 402,
    title: "Pseudocode Drill Set",
    description: "Write step-by-step logic for five everyday tasks.",
    dueDate: "2026-03-20",
    type: "practical",
    grade: 10,
  },
  {
    id: 8003,
    moduleId: 402,
    title: "Mini Calculator Program",
    description: "Create a simple calculator with input validation.",
    dueDate: "2026-03-28",
    type: "project",
    grade: 10,
  },
  {
    id: 8004,
    moduleId: 403,
    title: "Network Topology Map",
    description: "Diagram a small school network with switches and routers.",
    dueDate: "2026-04-05",
    type: "research",
    grade: 11,
  },
  {
    id: 8005,
    moduleId: 404,
    title: "SQL Practice Lab",
    description: "Query a sample learner database and export results.",
    dueDate: "2026-04-12",
    type: "practical",
    grade: 11,
  },
  {
    id: 8006,
    moduleId: 405,
    title: "SDLC Case Study",
    description: "Analyze a case study and outline the SDLC phases used.",
    dueDate: "2026-04-25",
    type: "project",
    grade: 12,
  },
  {
    id: 8007,
    moduleId: 405,
    title: "Requirements Document",
    description: "Draft requirements for a homework tracking system.",
    dueDate: "2026-05-03",
    type: "practical",
    grade: 12,
  },
  {
    id: 8008,
    moduleId: 406,
    title: "Cybersecurity Awareness Poster",
    description: "Design a one-page poster on safe online behavior.",
    dueDate: "2026-05-12",
    type: "research",
    grade: 12,
  },
];

const parentOverview: ParentOverview[] = [
  {
    studentId: 1,
    studentName: "Nala Mokoena",
    completedLessons: 6,
    quizAverage: 78,
  },
  {
    studentId: 2,
    studentName: "Samkelo Dube",
    completedLessons: 4,
    quizAverage: 64,
  },
];

export function getSubjects(): Subject[] {
  return subjects;
}

export function getSubjectById(id: number): Subject | undefined {
  return subjects.find((subject) => subject.id === id);
}

export function getModulesBySubjectId(subjectId: number): Module[] {
  return modules
    .filter((module) => module.subjectId === subjectId)
    .sort((a, b) => a.order - b.order);
}

export function getModuleById(id: number): Module | undefined {
  return modules.find((module) => module.id === id);
}

export function getLessonsByModuleId(moduleId: number): Lesson[] {
  return lessons
    .filter((lesson) => lesson.moduleId === moduleId)
    .sort((a, b) => a.order - b.order);
}

export function getLessonById(id: number): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function getQuizzesByModuleId(moduleId: number): Quiz[] {
  return quizzes.filter((quiz) => quiz.moduleId === moduleId);
}

export function getQuizById(id: number): Quiz | undefined {
  return quizzes.find((quiz) => quiz.id === id);
}

export function getQuestionsByQuizId(quizId: number): Question[] {
  return questions.filter((question) => question.quizId === quizId);
}

export function getAssignments(): Assignment[] {
  return assignments;
}

export function getAssignmentsByModuleId(moduleId: number): Assignment[] {
  return assignments
    .filter((assignment) => assignment.moduleId === moduleId)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
}

export function getAssignmentsByGrade(grade: number): Assignment[] {
  return assignments
    .filter((assignment) => assignment.grade === grade)
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
}

export function getAssignmentById(id: number): Assignment | undefined {
  return assignments.find((assignment) => assignment.id === id);
}

export function getParentOverview(): ParentOverview[] {
  return parentOverview;
}
