'use client';

import React, { useState, useMemo } from 'react';
import {
  IT_CAREER_TRACKS,
  PLATFORM_TZ_SECTIONS,
  TrackCategory,
} from '@/lib/it-tracks-data';
import {
  Search,
  X,
  Compass,
  ArrowRight,
  BookOpen,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Clock,
  GraduationCap,
  ChevronRight,
  FileText,
} from 'lucide-react';

interface CareerRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrackId?: string;
  onSelectTrackForMap?: (trackId: string) => void;
}

export default function CareerRoadmapModal({
  isOpen,
  onClose,
  currentTrackId = 'data-science',
  onSelectTrackForMap,
}: CareerRoadmapModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TrackCategory>('all');
  const [activeTrackId, setActiveTrackId] = useState<string>(currentTrackId);
  const [activeTab, setActiveTab] = useState<'modules' | 'projects' | 'tz'>('modules');
  const [completedTopicIds, setCompletedTopicIds] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('it_career_completed_topics');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);

  const toggleTopicCompleted = (topicKey: string) => {
    setCompletedTopicIds((prev) => {
      const next = { ...prev, [topicKey]: !prev[topicKey] };
      try {
        localStorage.setItem('it_career_completed_topics', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredTracks = useMemo(() => {
    return IT_CAREER_TRACKS.filter((track) => {
      const matchesCategory =
        selectedCategory === 'all' || track.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        track.title.toLowerCase().includes(q) ||
        track.uzbekTitle.toLowerCase().includes(q) ||
        track.description.toLowerCase().includes(q) ||
        track.tagline.toLowerCase().includes(q) ||
        track.modules.some(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.keySkills.some((s) => s.toLowerCase().includes(q)) ||
            m.topics.some((t) => t.toLowerCase().includes(q))
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeTrack = useMemo(() => {
    return (
      IT_CAREER_TRACKS.find((t) => t.id === activeTrackId) ||
      filteredTracks[0] ||
      IT_CAREER_TRACKS[0]
    );
  }, [activeTrackId, filteredTracks]);

  const quizQuestions = [
    {
      q: 'Sizga ko‘proq qaysi yo‘nalish qiziqroq tuyuladi?',
      options: [
        { text: 'Ma’lumotlar tahlili, grafiklar va kelajakni bashorat qilish (Data Science)', trackId: 'data-science' },
        { text: 'Xakerlardan himoyalanish, tarmoq xavfsizligi va Pentesting', trackId: 'cybersecurity' },
        { text: 'Neyrotarmoqlar, ChatGPT/LLM va sun’iy intellekt yaratish', trackId: 'ai-engineer' },
        { text: 'Chiroyli veb-saytlar, animatsiyalar va foydalanuvchi interfeysi (Frontend)', trackId: 'frontend-eng' },
        { text: 'Serverlar, ma’lumotlar bazasi, Telegram botlar va API arxitekturasi (Backend)', trackId: 'python-backend' },
        { text: 'iPhone va Android smartfonlar uchun mobil ilovalar yaratish', trackId: 'mobile-flutter' },
      ],
    },
    {
      q: 'Ikkinchi qiziqqan yo‘nalishingiz yoki kuchli tomoningiz qaysi?',
      options: [
        { text: 'Raqamlar, statistika va biznes hisobotlar (Data Science)', trackId: 'data-science' },
        { text: 'Tizim zaifliklarini topish va Linux xavfsizligi (Cybersecurity)', trackId: 'cybersecurity' },
        { text: 'Yuqori yuklamali bank va mikroservis tizimlar (Go / Python Backend)', trackId: 'golang-microservices' },
        { text: 'Bulutli serverlar, Docker va Kubernetes avtomatizatsiyasi (DevOps)', trackId: 'devops-cloud' },
        { text: '3D o‘yinlar (Unity) yoki Figma da UI/UX Mahsulot dizayni', trackId: 'gamedev-unity' },
        { text: 'Dasturlar sifatini avtomatik tekshirish (QA Automation)', trackId: 'qa-automation' },
      ],
    },
  ];

  const handleQuizOption = (trackId: string) => {
    if (quizStep + 1 < quizQuestions.length) {
      setActiveTrackId(trackId);
      setQuizStep(quizStep + 1);
    } else {
      setActiveTrackId(trackId);
      setShowQuiz(false);
      setQuizStep(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[93vh] rounded-3xl bg-[#0b1120] border border-slate-800 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Header HUD */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-[#090e1a]/95 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#a3e635] to-emerald-500 flex items-center justify-center text-[#090d16] shadow-[0_0_20px_rgba(163,230,53,0.4)] font-black">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-white tracking-tight">
                  15 IT Kasbiy Yo‘l Xaritasi & Mukammal TZ Arxitekturasi
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#a3e635]/15 border border-[#a3e635]/40 text-[#a3e635] font-mono text-[10px] font-bold">
                  15 Soha • 105 Modul • 105 Loyiha
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Istalgan dasturlash yo‘nalishini qidiring va &ldquo;3D Shahar Xaritasiga Yuklash&rdquo; tugmasi orqali 3D xaritada jonli o‘rganing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'tz' ? 'modules' : 'tz')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'tz'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Mukammal TZ Hujjati</span>
            </button>

            <button
              onClick={() => setShowQuiz(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/40 text-purple-300 font-bold text-xs hover:bg-purple-500/25 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Qaysi soha menga mos?</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800/60 bg-[#0b1325]/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a3e635]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Soha yoki mavzuni qidiring (Data Science, Kiberxavfsizlik, AI, Flutter, Go)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#a3e635] focus:ring-1 focus:ring-[#a3e635] transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Barchasi (15)' },
              { id: 'ai_data', label: 'AI & Data Science (3)' },
              { id: 'backend', label: 'Backend (3)' },
              { id: 'frontend_mobile', label: 'Frontend & Mobile (4)' },
              { id: 'security_devops', label: 'CyberSec & DevOps (2)' },
              { id: 'product_qa_game', label: 'QA, GameDev & UX (3)' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as TrackCategory)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#a3e635] text-slate-950 font-black shadow-[0_0_15px_rgba(163,230,53,0.35)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Split Layout: Left Track Sidebar + Right Track Deep Dive */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: 15 Tracks List */}
          <div className="w-72 sm:w-96 border-r border-slate-800/80 bg-[#090e1b]/80 flex flex-col shrink-0 overflow-y-auto p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              <span>Dasturlash Yo‘nalishlari ({filteredTracks.length})</span>
              <span>7 MODUL + 7 LOYIHA</span>
            </div>

            {filteredTracks.map((track, idx) => {
              const isSelected = track.id === activeTrack.id;
              const isCurrentlyOn3DMap = track.id === currentTrackId;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    setActiveTrackId(track.id);
                    if (activeTab === 'tz') setActiveTab('modules');
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all duration-150 flex items-start gap-3 cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-[#a3e635] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                      : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Logo Icon Box */}
                  <div
                    style={{ backgroundColor: track.logoBg, color: track.logoColor }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-black font-mono text-xs shrink-0 border border-white/15 shadow-md group-hover:scale-105 transition-transform"
                  >
                    {track.logoText}
                  </div>

                  {/* Title & Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        style={{ color: track.color }}
                        className="text-[10px] font-mono font-extrabold tracking-wider uppercase truncate"
                      >
                        #{String(idx + 1).padStart(2, '0')} • {track.categoryName}
                      </span>
                      {isCurrentlyOn3DMap && (
                        <span className="px-1.5 py-0.5 rounded bg-[#a3e635]/20 text-[#a3e635] border border-[#a3e635]/40 text-[9px] font-mono font-bold shrink-0">
                          3D XARITADA FAOL
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-black truncate mt-0.5 transition-colors ${
                        isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                      }`}
                    >
                      {track.uzbekTitle}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {track.tagline}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          {track.salaryUz}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {track.timeToMaster}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrackForMap?.(track.id);
                          onClose();
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#a3e635]/15 hover:bg-[#a3e635] text-[#a3e635] hover:text-[#090d16] border border-[#a3e635]/40 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                      >
                        3D Xarita →
                      </button>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 mt-3 transition-transform ${
                      isSelected ? 'text-[#a3e635] translate-x-1' : 'text-slate-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Right: Active Track Detail View OR TZ View */}
          <div className="flex-1 flex flex-col bg-[#0b1120] overflow-y-auto">
            {/* Track Hero Banner */}
            <div className="p-6 sm:p-7 border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a] to-[#0b1120] relative">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2.5">
                    <div
                      style={{ backgroundColor: activeTrack.logoBg, color: activeTrack.logoColor }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black font-mono text-base border border-white/20 shadow-lg"
                    >
                      {activeTrack.logoText}
                    </div>
                    <div>
                      <span
                        style={{ color: activeTrack.color }}
                        className="text-xs font-mono font-black tracking-widest uppercase"
                      >
                        {activeTrack.categoryName} • 7 MODUL & 7 REAL LOYIHA
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {activeTrack.uzbekTitle}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-3xl mt-2">
                    {activeTrack.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                        O‘zbekiston maoshi
                      </div>
                      <div className="text-xs font-black text-emerald-400 font-mono mt-0.5">
                        {activeTrack.salaryUz}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                        Global Maosh
                      </div>
                      <div className="text-xs font-black text-sky-400 font-mono mt-0.5">
                        {activeTrack.salaryGlobal}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        O‘rganish vaqti
                      </div>
                      <div className="text-xs font-black text-amber-400 font-mono mt-0.5">
                        {activeTrack.timeToMaster}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                        <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                        Kasb Maqsadi
                      </div>
                      <div className="text-xs font-black text-purple-300 font-mono mt-0.5 truncate">
                        {activeTrack.targetRole}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Action: Load ANY of the 15 tracks onto the 3D City Map! */}
                <div className="flex flex-col gap-2.5 shrink-0 min-w-[240px]">
                  <button
                    onClick={() => {
                      onSelectTrackForMap?.(activeTrack.id);
                      onClose();
                    }}
                    className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-[#a3e635] text-[#090d16] font-black text-xs tracking-wide hover:bg-[#bef264] transition-all cursor-pointer shadow-[0_0_25px_rgba(163,230,53,0.45)]"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Ushbu Sohani 3D Xaritada Ochish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left">
                    <span className="text-[10px] font-mono text-[#a3e635] font-bold uppercase block">
                      BOSHLASH UCHUN TALAB:
                    </span>
                    <span className="text-[11px] text-slate-300 block mt-0.5">
                      {activeTrack.prerequisites}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inner Tabs (Modullar, Loyihalar, Mukammal TZ) */}
            <div className="px-6 border-b border-slate-800 bg-[#090d16]/70 flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('modules')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'modules'
                    ? 'border-[#a3e635] text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-[#a3e635]" />
                <span>O‘quv Modullari (01–07)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
                  {activeTrack.modules.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'projects'
                    ? 'border-yellow-400 text-yellow-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-yellow-400" />
                <span>Portfolio Loyihalari (01–07)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-mono font-bold">
                  {activeTrack.projects.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tz')}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'tz'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Mukammal Loyiha TZ va Arxitektura (15 Soha)</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-7 space-y-6">
              {activeTab === 'modules' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-base font-black text-white">
                        {activeTrack.uzbekTitle} — 7 Bosqichli Qadamma-Qadam O‘quv Xaritasi
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Har bir modul 3D shahardagi alohida bino hisoblanadi. Mavzularni belgilab boring yoki 3D xaritada oching.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {activeTrack.modules.map((mod, mIdx) => (
                      <div
                        key={mod.id}
                        className="rounded-2xl bg-slate-900/60 border border-slate-800/90 p-5 hover:border-slate-700 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                          <div className="flex items-center gap-3">
                            <div
                              style={{
                                borderColor: activeTrack.color,
                                color: activeTrack.color,
                              }}
                              className="w-10 h-10 rounded-xl bg-slate-950 border-2 font-mono font-black text-base flex items-center justify-center shrink-0"
                            >
                              {mod.index}
                            </div>
                            <div>
                              <div className="text-[10px] font-mono font-bold text-[#a3e635] tracking-wider uppercase">
                                3D BINO {mod.index} • {mod.topics.length} TA ASOSIY MAVZU
                              </div>
                              <h5 className="text-sm font-black text-white">
                                {mod.title}
                              </h5>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {mod.keySkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-mono font-semibold"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 mt-3 mb-3">
                          {mod.subtitle}
                        </p>

                        {/* Numbered Step-by-Step Topics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {mod.topics.map((t, idx) => {
                            const topicKey = `${activeTrack.id}-${mod.id}-${idx}`;
                            const isDone = !!completedTopicIds[topicKey];
                            const stepNumber = `${mIdx + 1}.${idx + 1}`;
                            return (
                              <button
                                key={topicKey}
                                onClick={() => toggleTopicCompleted(topicKey)}
                                className={`text-left p-2.5 rounded-xl border flex items-start gap-2.5 transition-all cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                    : 'bg-slate-950/50 border-slate-800/70 text-slate-200 hover:border-slate-700'
                                }`}
                              >
                                <div
                                  className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                    isDone
                                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                      : 'border-slate-600'
                                  }`}
                                >
                                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-mono font-bold text-[#a3e635] mr-1.5">
                                    #{stepNumber}
                                  </span>
                                  <span className="text-xs leading-snug">{t}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-white">
                        {activeTrack.uzbekTitle} — 7 ta Real Portfolio Loyihasi (3D Shahar Tashqi Halqasi)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Har bir loyiha 3D xaritada alohida korporativ bino sifatida joylashgan
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeTrack.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 hover:border-yellow-500/50 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                style={{
                                  backgroundColor: proj.brandBg || activeTrack.logoBg,
                                  color: proj.brandColor || activeTrack.logoColor,
                                }}
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-xs border border-white/15"
                              >
                                {proj.brandText || activeTrack.logoText}
                              </div>
                              <span className="px-2 py-0.5 rounded-lg bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-mono font-black">
                                LOYIHA {proj.code}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              {proj.companyTarget}
                            </span>
                          </div>

                          <h5 className="text-sm font-black text-white leading-snug">
                            {proj.title}
                          </h5>

                          <p className="text-xs text-slate-300 leading-relaxed mt-2">
                            {proj.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <div className="text-[10px] font-mono text-emerald-400 font-bold mb-2">
                            Natija: {proj.outcome}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {proj.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tz' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 border border-amber-500/30">
                    <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                      TEXNIK TOPSHIRIQ (TZ) VA ARXITEKTURA KONSEPSIYASI
                    </div>
                    <h4 className="text-xl font-black text-white mt-1">
                      Global IT Career Roadmaps 3D — 15 Dasturlash Yo‘nalishi Interaktiv Platformasi
                    </h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Ushbu Texnik Topshiriq (TZ) dasturlash sohasiga endi kirib kelayotgan yoshlar va o‘rganuvchilar o‘z yo‘lini adashmasdan topishi, qidiruv orqali istalgan sohani (Data Science, Kiberxavfsizlik, AI, Frontend, Backend, Mobile va h.k.) tanlab, zerikmasdan 3D shahar xaritasida qadamma-qadam o‘rganishi uchun ishlab chiqilgan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PLATFORM_TZ_SECTIONS.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono font-black text-xs flex items-center justify-center">
                            {sec.number}
                          </span>
                          <div>
                            <h5 className="text-sm font-black text-white">{sec.title}</h5>
                            <p className="text-[11px] text-slate-400">{sec.subtitle}</p>
                          </div>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {sec.points.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2 leading-relaxed">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#a3e635] shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Summary Matrix of All 15 IT Directions */}
                  <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-black text-white uppercase font-mono">
                        Platformaga Kiritilgan 15 ta Dasturlash Yo‘nalishi Arxitektura Jadvali
                      </span>
                      <span className="text-[11px] font-mono text-[#a3e635]">
                        Har birida 7 Modul + 7 Loyiha = 14 ta 3D Bino
                      </span>
                    </div>
                    <div className="divide-y divide-slate-800/70">
                      {IT_CAREER_TRACKS.map((tr, idx) => (
                        <div
                          key={tr.id}
                          className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-[240px]">
                            <span className="text-xs font-mono text-slate-500 w-5">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div
                              style={{ backgroundColor: tr.logoBg, color: tr.logoColor }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-[11px]"
                            >
                              {tr.logoText}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{tr.uzbekTitle}</div>
                              <div className="text-[11px] text-slate-400">{tr.tagline}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-emerald-400">
                              {tr.salaryUz}
                            </span>
                            <button
                              onClick={() => {
                                onSelectTrackForMap?.(tr.id);
                                onClose();
                              }}
                              className="px-3 py-1 rounded-lg bg-[#a3e635] text-[#090d16] font-bold text-[11px] hover:bg-[#bef264] cursor-pointer"
                            >
                              3D Xaritada Ochish
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Quiz Overlay */}
        {showQuiz && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex items-center justify-center p-4">
            <div className="max-w-lg w-full rounded-3xl bg-[#0b1325] border border-purple-500/40 p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  Qadamma-qadam Yo‘nalish Tanlash ({quizStep + 1}/{quizQuestions.length})
                </span>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-black text-white mb-5 leading-snug">
                {quizQuestions[quizStep].q}
              </h3>

              <div className="space-y-2.5">
                {quizQuestions[quizStep].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizOption(opt.trackId)}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-400 hover:bg-slate-850 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{opt.text}</span>
                    <ArrowRight className="w-4 h-4 text-purple-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
