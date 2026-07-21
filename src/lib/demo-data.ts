export type Book = {
  id: string;
  title: string;
  titleBn?: string;
  author: string;
  category: string;
  cover: string;
  progress: number; // 0-100
  pages: number;
  rating: number;
  description: string;
};

export type Article = {
  id: string;
  title: string;
  author: string;
  category: string;
  readTime: string;
  date: string;
  status: "Read" | "In Progress" | "Saved";
  cover: string;
  excerpt: string;
  content: string[];
};

export const books: Book[] = [
  {
    id: "brief-history-time",
    title: "A Brief History of Time",
    titleBn: "সময়ের সংক্ষিপ্ত ইতিহাস",
    author: "Stephen Hawking",
    category: "Science",
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop",
    progress: 62,
    pages: 256,
    rating: 4.7,
    description:
      "A landmark exploration of black holes, the Big Bang, and the nature of time — written for curious minds.",
  },
  {
    id: "sapiens",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    category: "History",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop",
    progress: 100,
    pages: 464,
    rating: 4.6,
    description:
      "How Homo sapiens rose from an insignificant ape to become the dominant species on Earth.",
  },
  {
    id: "gitanjali",
    title: "Gitanjali",
    titleBn: "গীতাঞ্জলি",
    author: "Rabindranath Tagore",
    category: "Poetry",
    cover: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop",
    progress: 34,
    pages: 112,
    rating: 4.9,
    description:
      "A collection of devotional poems that won Tagore the 1913 Nobel Prize in Literature.",
  },
  {
    id: "meditations",
    title: "Meditations",
    author: "Marcus Aurelius",
    category: "Philosophy",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop",
    progress: 78,
    pages: 208,
    rating: 4.8,
    description:
      "Personal writings of a Roman Emperor on Stoic philosophy, self-discipline, and living well.",
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Development",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&auto=format&fit=crop",
    progress: 12,
    pages: 320,
    rating: 4.8,
    description:
      "Tiny changes, remarkable results — a practical framework for improving one percent every day.",
  },
  {
    id: "pather-panchali",
    title: "Pather Panchali",
    titleBn: "পথের পাঁচালী",
    author: "Bibhutibhushan Bandyopadhyay",
    category: "Fiction",
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop",
    progress: 0,
    pages: 384,
    rating: 4.7,
    description:
      "A lyrical Bengali classic following young Apu's journey through the beauty and hardship of village life.",
  },
];

export const articles: Article[] = [
  {
    id: "ancient-mesopotamia",
    title: "The Cradle of Civilization: Ancient Mesopotamia",
    author: "Dr. Amara Okonkwo",
    category: "History",
    readTime: "12 min read",
    date: "Nov 12, 2024",
    status: "Read",
    cover: "https://images.unsplash.com/photo-1608425234255-d3ecbbe2b7ad?w=1200&auto=format&fit=crop",
    excerpt:
      "Between the Tigris and Euphrates, humanity's first cities rose from clay and cuneiform.",
    content: [
      "Mesopotamia — the land between two rivers — is often called the cradle of civilization. It was here, in the fertile crescent of modern-day Iraq, that humans first organized into cities, invented writing, and codified law.",
      "The Sumerians developed cuneiform around 3200 BCE, a writing system pressed into wet clay tablets with a reed stylus. These tablets recorded grain, taxes, prayers, and the earliest known works of literature, including the Epic of Gilgamesh.",
      "Ziggurats — stepped temple pyramids — dominated the skyline of cities like Ur and Uruk. Each was dedicated to a patron deity, and priests climbed their terraces to bring humanity closer to the heavens.",
      "The legacy of Mesopotamia lives on in the 60-minute hour, the 360-degree circle, and the very notion that shared laws can hold a society together.",
    ],
  },
  {
    id: "pre-columbian-art",
    title: "Pre-Columbian Art: Symbols of a Lost World",
    author: "Isabella Ramírez",
    category: "Art & Culture",
    readTime: "8 min read",
    date: "Nov 16, 2024",
    status: "Read",
    cover: "https://images.unsplash.com/photo-1518979310281-a8f7bc10baaf?w=1200&auto=format&fit=crop",
    excerpt:
      "Before contact with Europe, the Americas produced art of astonishing sophistication.",
    content: [
      "The term 'Pre-Columbian' spans thousands of years and dozens of distinct civilizations — Olmec, Maya, Aztec, Inca, Moche, and many more.",
      "Jade masks from Palenque, gold pectorals from the Muisca, and monumental Olmec heads carved from single basalt blocks all reveal cultures deeply attuned to cosmology, agriculture, and the sacred geometry of place.",
      "Textiles from the Andes, woven with pigments that have survived a millennium, demonstrate mathematical patterning long before it was formalized in the Old World.",
      "Studying this art is less about recovering a 'lost' world and more about listening to what has always been here — carried forward by living Indigenous communities.",
    ],
  },
  {
    id: "quantum-computing-primer",
    title: "A Gentle Primer on Quantum Computing",
    author: "Dr. Kenji Watanabe",
    category: "Technology",
    readTime: "15 min read",
    date: "Nov 20, 2024",
    status: "In Progress",
    cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop",
    excerpt:
      "Superposition, entanglement, and why a quantum bit is nothing like a light switch.",
    content: [
      "Classical computers store information as bits — each one either 0 or 1. Quantum computers use qubits, which can exist in a superposition of both states at once.",
      "This is not a metaphor. A qubit is described by a probability amplitude, and its behavior is genuinely different from any classical system.",
      "Entangled qubits share a state instantaneously across distance, allowing certain algorithms to solve problems exponentially faster than classical approaches.",
      "In practice, today's quantum machines are noisy and small. But the trajectory is real, and the algorithms — Shor's, Grover's, and variational methods — are already reshaping cryptography and chemistry.",
    ],
  },
  {
    id: "monsoon-poetry",
    title: "The Language of the Monsoon in Bengali Poetry",
    author: "Sharmila Sen",
    category: "Literature",
    readTime: "6 min read",
    date: "Oct 28, 2024",
    status: "Saved",
    cover: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1200&auto=format&fit=crop",
    excerpt:
      "From Tagore to Jibanananda, rain has always carried the weight of longing.",
    content: [
      "In Bengali poetry, the monsoon is never just weather. It is memory, separation, renewal, and the ache of distance.",
      "Tagore's 'Borsha Mongal' cycles link rainfall to devotion. Jibanananda Das saw in the monsoon a quieter grief — the earth remembering itself.",
      "The very sound of 'brishti' (বৃষ্টি) carries the patter of drops on a tin roof.",
    ],
  },
];

export const topAuthors = [
  { name: "Rabindranath Tagore", nameBn: "রবীন্দ্রনাথ", img: "https://i.pravatar.cc/120?img=12" },
  { name: "Yuval Noah Harari", nameBn: "ইউভাল হারারি", img: "https://i.pravatar.cc/120?img=47" },
  { name: "Jane Austen", nameBn: "জ্যামিন অস্টার", img: "https://i.pravatar.cc/120?img=45" },
  { name: "Marcus Aurelius", nameBn: "মার্কাস", img: "https://i.pravatar.cc/120?img=52" },
  { name: "James Clear", nameBn: "জেমস ক্লিয়ার", img: "https://i.pravatar.cc/120?img=33" },
  { name: "Sharmila Sen", nameBn: "শর্মিলা সেন", img: "https://i.pravatar.cc/120?img=48" },
];

export type NewsItem = {
  id: string;
  title: string;
  category: string;
  source: string;
  date: string;
  cover: string;
  excerpt: string;
  content: string[];
};

export const news: NewsItem[] = [
  {
    id: "ai-open-models-2026",
    title: "Open-Source AI Models Surpass Proprietary Rivals in New Benchmark",
    category: "Artificial Intelligence",
    source: "Freedom Plus Newsroom",
    date: "Jul 18, 2026",
    cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop",
    excerpt: "Community-trained models now match closed labs on reasoning benchmarks, reshaping who owns the future of AI.",
    content: [
      "For the first time, an openly licensed model has topped a widely-cited reasoning benchmark, edging out closed offerings from major labs.",
      "The result is significant because open weights let researchers audit, fine-tune, and deploy models without vendor lock-in — a core pillar of accessible learning.",
      "Educators are already integrating these models into free tutoring tools available to any student with an internet connection.",
    ],
  },
  {
    id: "cybersecurity-passkey-adoption",
    title: "Passkeys Cross One Billion Users as Passwords Begin to Fade",
    category: "Cybersecurity",
    source: "Freedom Plus Newsroom",
    date: "Jul 12, 2026",
    cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop",
    excerpt: "Phishing-resistant sign-in is going mainstream, and browsers are quietly retiring the password prompt.",
    content: [
      "Passkeys — cryptographic credentials tied to your device — have crossed a billion active users worldwide.",
      "Unlike passwords, they cannot be reused, guessed, or phished, cutting account takeover attempts by an order of magnitude.",
      "Expect password fields to gradually disappear from major services over the next two years.",
    ],
  },
  {
    id: "free-education-un-report",
    title: "UN Report: Free Digital Libraries Now Reach 400 Million Learners",
    category: "Education",
    source: "Freedom Plus Newsroom",
    date: "Jul 05, 2026",
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&auto=format&fit=crop",
    excerpt: "A landmark study finds free reading platforms are closing the education gap faster than traditional aid.",
    content: [
      "A new UNESCO report shows that free online libraries and learning platforms now serve over 400 million learners in low- and middle-income regions.",
      "Access to ad-free reading experiences correlates strongly with improved literacy and time-on-task among students.",
      "The report calls on governments to treat open knowledge infrastructure as public utility.",
    ],
  },
  {
    id: "programming-python-4",
    title: "Python 4 Preview: Faster, Typed by Default, Backward Compatible",
    category: "Programming",
    source: "Freedom Plus Newsroom",
    date: "Jun 28, 2026",
    cover: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&auto=format&fit=crop",
    excerpt: "The next major Python release promises speed and safety without breaking the ecosystem developers love.",
    content: [
      "Python 4's first public preview lands with a JIT compiler, gradual mandatory typing, and — crucially — full backward compatibility with Python 3 code.",
      "Early benchmarks show a 2–4x speedup on typical web workloads, closing the historic gap with compiled languages.",
      "The core team credits years of community RFCs for the smooth transition path.",
    ],
  },
  {
    id: "space-solar-orbit",
    title: "First Commercial Solar-Powered Satellite Beams Energy to Earth",
    category: "Science",
    source: "Freedom Plus Newsroom",
    date: "Jun 20, 2026",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop",
    excerpt: "A milestone test transmits kilowatts of clean energy from orbit to a remote ground station.",
    content: [
      "In a first-of-its-kind demonstration, a private satellite beamed kilowatts of solar power to a receiving array in the Australian outback.",
      "Space-based solar avoids clouds and night, potentially delivering 24/7 clean baseload energy anywhere on Earth.",
      "Commercial-scale deployments remain a decade out, but the physics — and now the economics — are lining up.",
    ],
  },
  {
    id: "business-remote-work",
    title: "Remote Work Rebounds: 62% of Knowledge Jobs Now Fully Distributed",
    category: "Business",
    source: "Freedom Plus Newsroom",
    date: "Jun 14, 2026",
    cover: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop",
    excerpt: "After a brief pullback, the flexible-work era is back — and this time it's structural.",
    content: [
      "A new global survey finds 62% of knowledge-work roles are now fully remote or remote-first, up from 48% a year ago.",
      "Companies cite talent access and lower real-estate costs; workers cite time savings and better focus.",
      "Analysts say the shift is now culturally locked in across most industries.",
    ],
  },
];

