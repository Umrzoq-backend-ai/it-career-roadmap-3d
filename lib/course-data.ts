export type TechBadge =
  | 'python'
  | 'oop'
  | 'sql'
  | 'telegram'
  | 'django'
  | 'drf'
  | 'fastapi'
  | 'docker'
  | 'ai';

export interface LessonItem {
  id: string;
  number: string;
  title: string;
  tech: TechBadge;
  techLabel?: string;
  url?: string;
  tag?: 'practicum' | 'project' | 'core';
  explanation?: string;
  whyLearn?: string;
  exampleCode?: string;
}

export interface CourseProjectItem {
  id: string;
  code: string;
  number: string;
  title: string;
  category: string;
  company: string;
  subtitle: string;
  description: string;
  features: string[];
  techStack: TechBadge[];
  techLabels?: string[];
  brandText: string;
  brandBg: string;
  brandColor: string;
  position: [number, number, number];
  color: string;
  hexColor: number;
  buildingType: 'cn_finance' | 'asaxiy_bot' | 'murad_crm' | 'artel_ai' | 'uzum_agents' | 'beeline_ai' | 'korzinka_mobile';
}

export type CourseDistrict = string;

export interface CourseModule {
  id: string;
  index: string;
  district: string;
  shortTitle: string;
  title: string;
  parkZone: string;
  subtitle: string;
  color: string;
  hexColor: number;
  position: [number, number, number];
  buildingType: 'workshop' | 'oop_tower' | 'database' | 'bot_store' | 'crm_highrise' | 'devops_dome' | 'launchpad';
  signTitle: string;
  signSubtitle: string;
  outcome: string;
  lessons: LessonItem[];
}

// 7 Flagship Real-World Company Projects (Outer Landmark Boulevard)
export const COURSE_PROJECTS: CourseProjectItem[] = [
  {
    id: 'proj-cn',
    code: '01',
    number: '01',
    title: 'Cho‘ntak nazoratchisi',
    category: 'SHAXSIY MOLIYA & ALGORITMLAR',
    company: 'Cho‘ntak Nazoratchisi',
    subtitle: 'Shaxsiy byudjet tahlili, xarajatlar statistikasi va konsol o‘yinlari',
    description: 'Python algoritmlari asosida qurilgan moliyaviy hisob-kitoblar, kirim-chiqim nazorati, konsol test tizimi va Hangman / X-0 o‘yinlari majmuasi.',
    features: ['Kirim va chiqimlar balansi', 'Oylik xarajatlar diagrammasi', 'While siklli Hangman va X/0 o‘yinlari', 'Konsol ma’lumotlar bazasi'],
    techStack: ['python', 'oop'],
    brandText: 'CN',
    brandBg: '#a3e635',
    brandColor: '#090d16',
    position: [-28, 0, 18],
    color: '#a3e635',
    hexColor: 0xa3e635,
    buildingType: 'cn_finance',
  },
  {
    id: 'proj-asaxiy',
    code: '02',
    number: '02',
    title: 'Asaxiy onlayn savdo boti',
    category: 'SAVDO BOTI & SQL ANALITIKA',
    company: 'Asaxiy Books & Electronics',
    subtitle: 'Katalog, qidiruv, savatcha va buyurtmalarni SQL bazasida boshqarish',
    description: 'Asaxiy onlayn do‘koni uchun Telegram orqali kitoblar va texnikalarni xarid qilish, SQL Joins orqali buyurtmalarni tahlil qilish va to‘lov cheklarini shakllantirish boti.',
    features: ['Katalog va kategoriyalar bo‘yicha qidiruv', 'Savatcha (Cart) va buyurtma tasdiqlash', 'SQLite3 / PostgreSQL Joins va Tranzaksiyalar', 'Admin panelga bildirishnoma yuborish'],
    techStack: ['telegram', 'sql', 'python'],
    brandText: 'asaxiy',
    brandBg: '#ffffff',
    brandColor: '#0284c7',
    position: [-20, 0, -26],
    color: '#38bdf8',
    hexColor: 0x38bdf8,
    buildingType: 'asaxiy_bot',
  },
  {
    id: 'proj-murad',
    code: '03',
    number: '03',
    title: 'Murad Buildings sotuv CRM tizimi',
    category: 'SOTUV VA CRM',
    company: 'Murad Buildings Development',
    subtitle: 'Mijozlar bazasi, kvartiralar bronlash va shartnomalar CRM platformasi',
    description: 'Murad Buildings turar joy majmualari uchun xonadonlar sotuvi, mijozlar bilan muloqotlar tarixi, xodimlar KPI statistikasi va maxsus Django Admin CRM boshqaruv paneli.',
    features: ['Kvartiralar holati (Bo‘sh / Band / Sotilgan)', 'Mijozlar bilan qo‘ng‘iroqlar tarixi', 'Custom Django Admin CRM & Analytics', 'Shartnoma va PDF hujjatlar avtogeneratsiyasi'],
    techStack: ['django', 'sql', 'python'],
    brandText: 'M',
    brandBg: '#1e1b4b',
    brandColor: '#f8fafc',
    position: [26, 0, -22],
    color: '#a855f7',
    hexColor: 0xa855f7,
    buildingType: 'murad_crm',
  },
  {
    id: 'proj-artel',
    code: '04',
    number: '04',
    title: 'Artel AI servisi',
    category: 'AI SERVIS & ENTERPRISE',
    company: 'Artel Electronics',
    subtitle: 'Maishiy texnikalarga texnik xizmat ko‘rsatish va servis so‘rovlarini qayta ishlash',
    description: 'Artel maishiy texnikalari kafolat talonlarini tekshirish, ehtiyot qismlar mavjudligini kuzatish va servis markazlariga murojaatlarni avtomatik taqsimlovchi REST API backend.',
    features: ['Serial raqam bo‘yicha kafolatni tekshirish', 'DRF orqali servis arizalari API', 'Celery orqali SMS xabarnomalar', 'Hududiy ustaxonalar integratsiyasi'],
    techStack: ['drf', 'docker', 'python'],
    brandText: 'artel',
    brandBg: '#ecfdf5',
    brandColor: '#059669',
    position: [28, 0, 16],
    color: '#10b981',
    hexColor: 0x10b981,
    buildingType: 'artel_ai',
  },
  {
    id: 'proj-uzum',
    code: '05',
    number: '05',
    title: 'Uzum market AI agentlari',
    category: 'AI AGENTLAR & HIGH-LOAD',
    company: 'Uzum Market Ecosystem',
    subtitle: 'Sotuvchilar narx monitoringi, avtomatik tavsiyalar va buyurtmalar marshrutlash',
    description: 'FastAPI asosidagi asinxron mikroservis bo‘lib, Uzum Market sotuvchilari uchun narx dinamikasini tahlil qiladi, inventar yetishmovchiligini oldindan bashorat qiladi va buyurtmalarni qayta ishlaydi.',
    features: ['Asinxron FastAPI va SQLAlchemy', 'Yuqori yuklamali buyurtmalar oqimi', 'JWT tokenli avtorizatsiya va rollar', 'Narxlarni dinamik monitoring qilish'],
    techStack: ['fastapi', 'sql', 'python'],
    brandText: 'U',
    brandBg: '#6b21a8',
    brandColor: '#f3e8ff',
    position: [-28, 0, -10],
    color: '#c084fc',
    hexColor: 0xc084fc,
    buildingType: 'uzum_agents',
  },
  {
    id: 'proj-beeline',
    code: '06',
    number: '06',
    title: 'Beeline Operator AI',
    category: 'AI OPERATOR & TELEKOM',
    company: 'Beeline Uzbekistan',
    subtitle: 'Tariflar bo‘yicha maslahat beruvchi va billing bilan integratsiyalashgan aqlli tizim',
    description: 'Beeline abonentlari uchun balans, paketlar, tarif rejalarini avtomatik tahlil qiluvchi, SMS shlyuz va to‘lov tizimlari bilan bog‘langan yirik telekom backend servisi.',
    features: ['Billing to‘lov tizimlari integratsiyasi (Click, Payme)', 'SMS gateway orqali OTP tasdiqlash', 'Celery, Redis va RabbitMQ asinxron navbatlar', 'Docker konteynerlarida xavfsiz deploy'],
    techStack: ['drf', 'docker', 'python'],
    brandText: 'Beeline',
    brandBg: '#fef08a',
    brandColor: '#0f172a',
    position: [-10, 0, 28],
    color: '#eab308',
    hexColor: 0xeab308,
    buildingType: 'beeline_ai',
  },
  {
    id: 'proj-korzinka',
    code: '07',
    number: '07',
    title: 'Smart Korzinka mobile',
    category: 'MOBIL MAHSULOT & FAST DELIVERY',
    company: 'Korzinka Supermarket',
    subtitle: 'Tezkor yetkazib berish (Express Delivery), shtrix-kod va qarzlar monitoringi',
    description: 'Korzinka supermarketlari tarmog‘i uchun ekspress yetkazib berish API arxitekturasi: mahsulotlar qoldig‘i, savatcha, kuryerlar harakati va mijozlar hisob-kitob monitoringi.',
    features: ['Delivery routerlar va buyurtma holatlari (Pending/Shipped/Done)', 'Pydantic orqali qat’iy ma’lumotlar validatsiyasi', 'Foydalanuvchi qarzlarini hisoblash va monitoring qilish API', 'JWT token yaroqlilik muddatini yangilash (Refresh token)'],
    techStack: ['fastapi', 'sql', 'python'],
    brandText: 'korzinka',
    brandBg: '#fee2e2',
    brandColor: '#dc2626',
    position: [14, 0, 28],
    color: '#ef4444',
    hexColor: 0xef4444,
    buildingType: 'korzinka_mobile',
  },
];

export const COURSE_MODULES: CourseModule[] = [
  {
    id: 'python-basics',
    index: '01',
    district: 'Python',
    shortTitle: 'Dasturlash',
    title: 'Python Dasturlash Asoslari',
    parkZone: 'PYTHON WORKSHOP ZONE',
    subtitle: 'Dasturlash olamiga ilk qadam: algoritmik fikrlash, ma’lumot turlari va xotira arxitekturasi.',
    color: '#a3e635',
    hexColor: 0xa3e635,
    position: [-15, 0, 14],
    buildingType: 'workshop',
    signTitle: 'PYTHON WORKSHOP',
    signSubtitle: '>_ hello, world',
    outcome: 'Python sintaksisi, ma’lumot tuzilmalari (String, List, Set), shart operatorlari, sikllar hamda funksiyalar orqali mustaqil dasturlar va konsol o‘yinlar yoza olasiz.',
    lessons: [
      { id: 'py-1', number: '01', title: "1-dars: Python va Pycharm o'rnatish", tech: 'python', url: 'https://t.me/c/1936344123/2' },
      { id: 'py-2', number: '02', title: "2-dars: Data types - Ma'lumot turlari", tech: 'python', url: 'https://t.me/c/1936344123/3' },
      { id: 'py-3', number: '03', title: '3-dars: Dasturlash tillari tasnifi', tech: 'python', url: 'https://t.me/c/1936344123/6' },
      { id: 'py-4', number: '04', title: '4-dars: String metodlar', tech: 'python', url: 'https://t.me/c/1936344123/7' },
      { id: 'py-5', number: '05', title: '5-dars: List metodlar', tech: 'python', url: 'https://t.me/c/1936344123/13' },
      { id: 'py-6', number: '06', title: '6-dars: String va List ni kesish', tech: 'python', url: 'https://t.me/c/1936344123/16' },
      { id: 'py-7', number: '07', title: '7-dars: Shart operatorlarini takrorlash', tech: 'python', url: 'https://t.me/c/1936344123/21' },
      { id: 'py-8', number: '08', title: "8-dars: While sikli; X va 0 o'yini ; Hangman o'yini", tech: 'python', url: 'https://t.me/c/1936344123/24', tag: 'project' },
      { id: 'py-9', number: '09', title: '9-dars: Funksiyalar', tech: 'python', url: 'https://t.me/c/1936344123/34' },
      { id: 'py-10a', number: '10.1', title: '10-dars: 1-qism (Funksiyalar davomi)', tech: 'python', url: 'https://t.me/c/1936344123/39' },
      { id: 'py-10b', number: '10.2', title: '10-dars: 2-qism Pythonda xotira boshqaruvi', tech: 'python', url: 'https://t.me/c/1936344123/40' },
      { id: 'py-11a', number: '11.1', title: "11-dars: 1-qism (Lug'atlar va To'plamlar)", tech: 'python', url: 'https://t.me/c/1936344123/42' },
      { id: 'py-11b', number: '11.2', title: '11-dars: 2-qism Set va set metodlar', tech: 'python', url: 'https://t.me/c/1936344123/43' },
      { id: 'py-12', number: '12', title: '12-dars: List Comprehension', tech: 'python', url: 'https://t.me/c/1936344123/46' },
    ],
  },
  {
    id: 'python-oop',
    index: '02',
    district: 'Python',
    shortTitle: 'OOP & Core',
    title: 'Ilg‘or Python va OOP Arxitekturasi',
    parkZone: 'CORE ENGINEERING LAB',
    subtitle: 'Obyektga yo‘naltirilgan dasturlash, dekoratorlar, generatorlar va ko‘p oqimli dasturlash.',
    color: '#22d3ee',
    hexColor: 0x22d3ee,
    position: [-18, 0, -2],
    buildingType: 'oop_tower',
    signTitle: 'OOP & ADVANCED',
    signSubtitle: 'CLASS ARCHITECTURE',
    outcome: 'Dekoratorlar, generatorlar, OOP tamoyillari (Vorisdorlik, Polimorfizm, Inkapsulyatsiya) va Multitasking yordamida murakkab tizimlar qura olasiz.',
    lessons: [
      { id: 'oop-13', number: '13', title: '13-dars: Rekursiv funksiya', tech: 'oop', url: 'https://t.me/c/1936344123/50' },
      { id: 'oop-14', number: '14', title: '14-dars: Iterator va Generator', tech: 'oop', url: 'https://t.me/c/1936344123/52' },
      { id: 'oop-15', number: '15', title: '15-dars: Closures', tech: 'oop', url: 'https://t.me/c/1936344123/54' },
      { id: 'oop-16', number: '16', title: '16-dars: Dekoratorlar', tech: 'oop', url: 'https://t.me/c/1936344123/59' },
      { id: 'oop-p2', number: 'P-2', title: 'Practicum-2: Mehmonxona dasturi', tech: 'oop', url: 'https://t.me/c/1936344123/63', tag: 'practicum' },
      { id: 'oop-17', number: '17', title: '17-dars: Dekorator amaliy misollar', tech: 'oop', url: 'https://t.me/c/1936344123/64' },
      { id: 'oop-18', number: '18', title: '18-dars: OOP - 1', tech: 'oop', url: 'https://t.me/c/1936344123/67' },
      { id: 'oop-19', number: '19', title: '19-dars: konstruktor. destruktor. Vorisdorlik, Polimorfizm', tech: 'oop', url: 'https://t.me/c/1936344123/73' },
      { id: 'oop-20', number: '20', title: '20-dars: Instance Metodlar', tech: 'oop', url: 'https://t.me/c/1936344123/77' },
      { id: 'oop-p3', number: 'P-3', title: 'Practicum-3: #practicum_3 "Who wants to be billionere?!" pythonda test o\'yini', tech: 'oop', url: 'https://t.me/c/1936344123/82', tag: 'practicum' },
      { id: 'oop-21', number: '21', title: '21-dars: Pythonda modul va paket', tech: 'oop', url: 'https://t.me/c/1936344123/85' },
      { id: 'oop-22', number: '22', title: '22-dars: Multitasking, Paralellism', tech: 'oop', url: 'https://t.me/c/1936344123/88' },
    ],
  },
  {
    id: 'sql-database',
    index: '03',
    district: 'SQL',
    shortTitle: "Ma'lumotlar",
    title: "Ma'lumotlar Bazasi va SQL",
    parkZone: 'DATABASE & SQL DATA CENTER',
    subtitle: 'Relyatsion ma’lumotlar bazalarini loyihalash, murakkab SQL so‘rovlar va ACID tranzaksiyalari.',
    color: '#38bdf8',
    hexColor: 0x38bdf8,
    position: [-10, 0, -16],
    buildingType: 'database',
    signTitle: 'DATABASE / SQL',
    signSubtitle: 'asaxiy',
    outcome: 'Ma’lumotlar bazasi sxemalarini tuzish, murakkab JOIN, GROUP BY, UNION so‘rovlarini yozish hamda Python bilan SQLite3 integratsiyasini mukammal o‘zlashtirasiz.',
    lessons: [
      { id: 'db-23', number: '23', title: '23-dars: Database', tech: 'sql', url: 'https://t.me/c/1936344123/100' },
      { id: 'db-24', number: '24', title: '24-dars: ORDER BY', tech: 'sql', url: 'https://t.me/c/1936344123/111' },
      { id: 'db-25', number: '25', title: '25-dars: Group by', tech: 'sql', url: 'https://t.me/c/1936344123/118' },
      { id: 'db-26a', number: '26.1', title: '26-dars: Joins 1-qism', tech: 'sql', url: 'https://t.me/c/1936344123/125' },
      { id: 'db-26b', number: '26.2', title: '26-dars: Joins 2-qism', tech: 'sql', url: 'https://t.me/c/1936344123/126' },
      { id: 'db-26c', number: '26.3', title: '26-dars: Joins 3-qism', tech: 'sql', url: 'https://t.me/c/1936344123/127' },
      { id: 'db-27', number: '27', title: '27-dars: Union', tech: 'sql', url: 'https://t.me/c/1936344123/132' },
      { id: 'db-28', number: '28', title: '28-dars: Python Sqlite', tech: 'sql', url: 'https://t.me/c/1936344123/138' },
      { id: 'db-29', number: '29', title: '29-dars: ACID', tech: 'sql', url: 'https://t.me/c/1936344123/143' },
      { id: 'db-30', number: '30', title: '30-dars: Database takrorlash', tech: 'sql', url: 'https://t.me/c/1936344123/151' },
    ],
  },
  {
    id: 'telegram-bot',
    index: '04',
    district: 'Python',
    shortTitle: 'Telegram Bot',
    title: 'Telegram Bot va Savdo Avtomatizatsiyasi',
    parkZone: 'SMART COMMERCE & BOT PLAZA',
    subtitle: 'Python-Telegram-Bot (PTB), ConversationHandler va to‘liq E-Commerce Fast Food bot yaratish.',
    color: '#ec4899',
    hexColor: 0xec4899,
    position: [4, 0, -18],
    buildingType: 'bot_store',
    signTitle: 'FAST FOOD BOT',
    signSubtitle: 'SMART KORZINKA',
    outcome: 'Virtual muhitda Telegram botlarni noldan arxitektura qilish, murakkab suhbat oqimlari (ConversationHandler) va Ma’lumotlar bazasiga ulangan Fast Food yetkazib berish botini yaratasiz.',
    lessons: [
      { id: 'bot-31a', number: '31.1', title: '31-dars: python-telegram-bot', tech: 'telegram', url: 'https://t.me/c/1936344123/158' },
      { id: 'bot-31b', number: '31.2', title: '31-dars: Virtual muhit bilan ishlash', tech: 'telegram', url: 'https://t.me/c/1936344123/159' },
      { id: 'bot-32', number: '32', title: '32-dars: ConversationHandler', tech: 'telegram', url: 'https://t.me/c/1936344123/165' },
      { id: 'bot-33', number: '33', title: '33-dars: PTB orqali yasalgan botlar', tech: 'telegram', url: 'https://t.me/c/1936344123/169' },
      { id: 'bot-34', number: '34', title: '34-dars: Bot arxitekturasi va amaliyot', tech: 'telegram', url: 'https://t.me/c/1936344123/172' },
      { id: 'bot-35', number: '35', title: '35-dars: Soft skills', tech: 'telegram', url: 'https://t.me/c/1936344123/175' },
      { id: 'bot-36', number: '36', title: '36-dars: Fast food bot 2-qism', tech: 'telegram', url: 'https://t.me/c/1936344123/178', tag: 'project' },
      { id: 'bot-37', number: '37', title: '37-dars: Fast food bot 3-qism', tech: 'telegram', url: 'https://t.me/c/1936344123/184', tag: 'project' },
      { id: 'bot-38', number: '38', title: '38-dars: Fast food bot yakuni', tech: 'telegram', url: 'https://t.me/c/1936344123/187', tag: 'project' },
    ],
  },
  {
    id: 'django-web',
    index: '05',
    district: 'Django',
    shortTitle: 'Django & Web',
    title: 'Django Full-Stack va Web Arxitektura',
    parkZone: 'BACKEND BUSINESS PARK',
    subtitle: 'Django ORM, PostgreSQL optimizatsiyasi, Custom Admin CRM, Blog platforma va Maxway loyihasi.',
    color: '#a855f7',
    hexColor: 0xa855f7,
    position: [16, 0, -6],
    buildingType: 'crm_highrise',
    signTitle: 'DJANGO / CRM',
    signSubtitle: 'M',
    outcome: 'Django freymvorkida MVT arxitekturasi, ORM Querysetlar, PostgreSQL indeksatsiya va optimizatsiya, Custom CRM tizimi hamda Maxway e-commerce saytini to‘liq ishlab chiqasiz.',
    lessons: [
      { id: 'dj-39', number: '39', title: '39-dars: Web dasturlar qanday ishlaydi', tech: 'django', url: 'https://t.me/c/1936344123/189' },
      { id: 'dj-40', number: '40', title: '40-dars: REST API', tech: 'django', url: 'https://t.me/c/1936344123/197' },
      { id: 'dj-41', number: '41', title: '41-dars: Frontend asoslari', tech: 'django', url: 'https://t.me/c/1936344123/202' },
      { id: 'dj-42', number: '42', title: '42-dars: Djangoda proyekt yaratish va admin panel', tech: 'django', url: 'https://t.me/c/1936344123/209' },
      { id: 'dj-43', number: '43', title: '43-dars: urls va views', tech: 'django', url: 'https://t.me/c/1936344123/219' },
      { id: 'dj-44', number: '44', title: '44-dars: Models', tech: 'django', url: 'https://t.me/c/1936344123/230' },
      { id: 'dj-45', number: '45', title: '45-dars: Querysetlar', tech: 'django', url: 'https://t.me/c/1936344123/234' },
      { id: 'dj-46', number: '46', title: '46-dars: Django ORM querysetlar 2-qism', tech: 'django', url: 'https://t.me/c/1936344123/240' },
      { id: 'dj-47', number: '47', title: '47-dars: Django Templates va Static faylllar bilan ishlash', tech: 'django', url: 'https://t.me/c/1936344123/243' },
      { id: 'dj-48', number: '48', title: '48-dars: Formalar va Jinja template bilan tanishuv', tech: 'django', url: 'https://t.me/c/1936344123/246' },
      { id: 'dj-49a', number: '49.1', title: '49-dars: Django ModelForm 1-qism', tech: 'django', url: 'https://t.me/c/1936344123/250' },
      { id: 'dj-49b', number: '49.2', title: '49-dars: Git va GitHub 2-qism', tech: 'django', url: 'https://t.me/c/1936344123/251' },
      { id: 'dj-50', number: '50', title: '50-dars: Blog sayt', tech: 'django', url: 'https://t.me/c/1936344123/253', tag: 'project' },
      { id: 'dj-51', number: '51', title: '51-dars: Comments, Email sending, Templates (advanced)', tech: 'django', url: 'https://t.me/c/1936344123/258' },
      { id: 'dj-52', number: '52', title: '52-dars: django password encryption', tech: 'django', url: 'https://t.me/c/1936344123/263' },
      { id: 'dj-53a', number: '53.1', title: '53-dars: custom admin CRM', tech: 'django', url: 'https://t.me/c/1936344123/265', tag: 'project' },
      { id: 'dj-53b', number: '53.2', title: '53-dars davomi: Django dokumentatsiyasidan foydalanish', tech: 'django', url: 'https://t.me/c/1936344123/269' },
      { id: 'dj-54', number: '54', title: '54-dars: PostgreSQL', tech: 'django', url: 'https://t.me/c/1936344123/277' },
      { id: 'dj-55', number: '55', title: "55-dars: Posgtesql da ma'lumotlar bazasi optimizatsiyasi", tech: 'django', url: 'https://t.me/c/1936344123/281' },
      { id: 'dj-56', number: '56', title: '56-dars: Media fayllar bilan ishlash, Django Sessions', tech: 'django', url: 'https://t.me/c/1936344123/285' },
      { id: 'dj-57', number: '57', title: '57-dars: Maxway loyiha ishi', tech: 'django', url: 'https://t.me/c/1936344123/292', tag: 'project' },
      { id: 'dj-58', number: '58', title: '58-dars: Maxway 2-qism', tech: 'django', url: 'https://t.me/c/1936344123/317', tag: 'project' },
      { id: 'dj-59', number: '59', title: '59-dars: Maxway 3-qism', tech: 'django', url: 'https://t.me/c/1936344123/316', tag: 'project' },
    ],
  },
  {
    id: 'drf-devops',
    index: '06',
    district: 'Django',
    shortTitle: 'DRF & Arxitektura',
    title: 'Django REST Framework va DevOps',
    parkZone: 'CLOUD API & DEVOPS HUB',
    subtitle: 'DRF API, Docker, Celery, Redis, RabbitMQ, Billing to‘lov tizimlari, SMS gateway va Serverga Deployment.',
    color: '#10b981',
    hexColor: 0x10b981,
    position: [18, 0, 10],
    buildingType: 'devops_dome',
    signTitle: 'DRF & DEVOPS',
    signSubtitle: 'DOCKER · CELERY',
    outcome: 'Production darajasidagi REST API yozish, fon vazifalari (Celery/Redis/RabbitMQ), to‘lov tizimlari (Billing) va SMS shlyuzlarni ulash hamda Docker orqali serverga deploy qilishni o‘rganasiz.',
    lessons: [
      { id: 'drf-60', number: '60', title: '60-dars: API', tech: 'drf', url: 'https://t.me/c/1936344123/325' },
      { id: 'drf-61', number: '61', title: '61-dars: DRF', tech: 'drf', url: 'https://t.me/c/1936344123/326' },
      { id: 'drf-62', number: '62', title: '62-dars: Viewset Customization', tech: 'drf', url: 'https://t.me/c/1936344123/328' },
      { id: 'drf-63', number: '63', title: '63-dars: DRF Views turlari', tech: 'drf', url: 'https://t.me/c/1936344123/331' },
      { id: 'drf-64', number: '64', title: '64-dars: Pagination, Filter, Search', tech: 'drf', url: 'https://t.me/c/1936344123/337' },
      { id: 'drf-65', number: '65', title: '65-dars: Autentifikatsiya', tech: 'drf', url: 'https://t.me/c/1936344123/340' },
      { id: 'drf-66', number: '66', title: '66-dars: Django signals, integration to telegram bot', tech: 'drf', url: 'https://t.me/c/1936344123/341' },
      { id: 'drf-67', number: '67', title: '67-dars: Docker, Celery, Redis, RabbitMQ', tech: 'docker', url: 'https://t.me/c/1936344123/343' },
      { id: 'drf-68', number: '68', title: "68-dars: Billing, To'lov tizimlariga integratsiya", tech: 'drf', tag: 'project' },
      { id: 'drf-69', number: '69', title: '69-dars: SMS gateway', tech: 'drf', url: 'https://t.me/c/1936344123/345' },
      { id: 'drf-70', number: '70', title: '70-dars: Django tests', tech: 'django', url: 'https://t.me/c/1936344123/346' },
      { id: 'drf-71', number: '71', title: '71-dars: Deployment', tech: 'docker', url: 'https://t.me/c/1936344123/348' },
      { id: 'drf-72', number: '72', title: '72-dars: Resume, Portfolio, ish topish', tech: 'python', url: 'https://t.me/c/1936344123/353' },
    ],
  },
  {
    id: 'fastapi-startup',
    index: '07',
    district: 'FastAPI',
    shortTitle: 'FastAPI & Startap',
    title: 'FastAPI, Delivery va Qarzlar Monitoringi',
    parkZone: 'FASTAPI STARTUP LAUNCHPAD',
    subtitle: 'Zamonaviy asinxron FastAPI, SQLAlchemy ORM, JWT Auth, Delivery tizimi va Qarzlar monitoringi API.',
    color: '#eab308',
    hexColor: 0xeab308,
    position: [2, 0, 16],
    buildingType: 'launchpad',
    signTitle: 'FASTAPI LAUNCH',
    signSubtitle: 'BUILD. LAUNCH. GROW.',
    outcome: 'Asinxron FastAPI arxitekturasi, Pydantic validatsiya, JWT Access/Refresh tokenlar, Delivery buyurtmalar tizimi hamda Qarzlarni hisoblash va monitoring qilish Backend API-ni noldan qurasiz.',
    lessons: [
      { id: 'fa-1', number: '13.1', title: '13.1 FastAPI nima?', tech: 'fastapi' },
      { id: 'fa-2', number: '13.2', title: '13.2 ASGI va WSGI', tech: 'fastapi' },
      { id: 'fa-3', number: '13.3', title: '13.3 FastAPI loyihani ishga tushirish', tech: 'fastapi' },
      { id: 'fa-4', number: '13.4', title: '13.4 Delivery loyihasini yaratish va routerlarni ulash', tech: 'fastapi', tag: 'project' },
      { id: 'fa-5', number: '13.5', title: '13.5 Loyihaning database dizayni', tech: 'sql' },
      { id: 'fa-6', number: '13.6', title: '13.6 Database connection', tech: 'sql' },
      { id: 'fa-7', number: '13.7', title: '13.7 Database models using SqlAlchemy', tech: 'sql' },
      { id: 'fa-8', number: '13.8', title: '13.8 8-dars. Pydantic kutubxonasi bilan ishlash. User Creation', tech: 'fastapi' },
      { id: 'fa-9', number: '13.9', title: '13.9 Foydalanuvchini roʻyxatdan oʻtkazish', tech: 'fastapi' },
      { id: 'fa-10', number: '13.10', title: '13.10 Jwt token bilan ishlash. User login', tech: 'fastapi' },
      { id: 'fa-11', number: '13.11', title: '13.11 User login with email and username', tech: 'fastapi' },
      { id: 'fa-12', number: '13.12', title: '13.12 Refresh tokenni yangilash', tech: 'fastapi' },
      { id: 'fa-13', number: '13.13', title: '13.13 Token yaroqlilik muddatini oʻzgartirish', tech: 'fastapi' },
      { id: 'fa-14', number: '13.14', title: '13.14 Ordermodel va Order Routeʼni sozlash', tech: 'fastapi' },
      { id: 'fa-15', number: '13.15', title: '13.15 Post methodi yordamida Order yaratish', tech: 'fastapi' },
      { id: 'fa-16', number: '13.16', title: '13.16 Barcha buyurtmalar roʻyxati', tech: 'fastapi' },
      { id: 'fa-17', number: '13.17', title: '13.17 Buyurtmalarni ID raqami boʻyicha qaytarish', tech: 'fastapi' },
      { id: 'fa-18', number: '13.18', title: '13.18 Product app yaratish va mahsulot qoʻshish', tech: 'fastapi' },
      { id: 'fa-19', number: '13.19', title: '13.19 Product list va product id', tech: 'fastapi' },
      { id: 'fa-20', number: '13.20', title: '13.20 Mahsulotni yangilash va oʻchirish', tech: 'fastapi' },
      { id: 'fa-21', number: '13.21', title: '13.21 Buyurtma yuborishda mahsulotni ham qoʻshish', tech: 'fastapi' },
      { id: 'fa-22', number: '13.22', title: '13.22 Foydalanuvchiga tegishli boʻlgan barcha buyurtmalar roʻyxati', tech: 'fastapi' },
      { id: 'fa-23', number: '13.23', title: '13.23 Foydalanuvchi buyurtmasini ID orqali qaytarish', tech: 'fastapi' },
      { id: 'fa-24', number: '13.24', title: '13.24 Update user order', tech: 'fastapi' },
      { id: 'fa-25', number: '13.25', title: '13.25 Update user order status', tech: 'fastapi' },
      { id: 'fa-26', number: '13.26', title: '13.26 Buyurtmani oʻchirish', tech: 'fastapi' },
      { id: 'fa-27', number: '13.27', title: '13.27 Qarzlarni hisoblash va monitoring qilish tizimi uchun bekend API yaratish', tech: 'fastapi', tag: 'project' },
    ],
  },
];
