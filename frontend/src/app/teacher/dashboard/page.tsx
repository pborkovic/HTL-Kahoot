"use client"
import {Search, X, Filter, ArrowUpDown, HelpCircle, Building2, Tag, CheckCircle, ChevronUp, ChevronDown, ClipboardList, UserCheck, GraduationCap, FileText, School, PlayCircle, Settings, Clock, Weight, Loader2} from "lucide-react";
import {useState, useRef, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";
import React from "react";
import {apiFetch} from "@/lib/api";
import type {Question, QuestionsResponse, PaginationMeta} from "@/types/question";

type Student = {
    id: number;
    name: string;
    klasse: string;
    abteilung: string;
};


const mockStudents: Student[] = [
    { id: 1, name: "Max Mustermann", klasse: "5A", abteilung: "Informatik" },
    { id: 2, name: "Anna Schmidt", klasse: "5A", abteilung: "Informatik" },
    { id: 3, name: "Tim Weber", klasse: "5B", abteilung: "Medientechnik" },
    { id: 4, name: "Lisa Müller", klasse: "5B", abteilung: "Medientechnik" },
    { id: 5, name: "Paul Fischer", klasse: "6A", abteilung: "Cyber Security" },
    { id: 6, name: "Marie Klein", klasse: "6A", abteilung: "Cyber Security" },
    { id: 7, name: "Leon Hoffmann", klasse: "6B", abteilung: "Bautechnik" },
    { id: 8, name: "Emma Wagner", klasse: "6B", abteilung: "Bautechnik" },
    { id: 9, name: "Noah Becker", klasse: "7A", abteilung: "Innenarchitektur" },
    { id: 10, name: "Mia Schulz", klasse: "7A", abteilung: "Innenarchitektur" },
    { id: 11, name: "Felix Koch", klasse: "7B", abteilung: "Informatik" },
    { id: 12, name: "Sophie Richter", klasse: "7B", abteilung: "Informatik" },
    { id: 13, name: "Lucas Meyer", klasse: "8A", abteilung: "Medientechnik" },
    { id: 14, name: "Hannah Wolf", klasse: "8A", abteilung: "Medientechnik" },
    { id: 15, name: "David Schröder", klasse: "8B", abteilung: "Cyber Security" },
    { id: 16, name: "Laura Neumann", klasse: "8B", abteilung: "Cyber Security" },
    { id: 17, name: "Jan Schwarz", klasse: "9A", abteilung: "Bautechnik" },
    { id: 18, name: "Julia Zimmermann", klasse: "9A", abteilung: "Bautechnik" },
    { id: 19, name: "Finn Braun", klasse: "9B", abteilung: "Innenarchitektur" },
    { id: 20, name: "Lena Hofmann", klasse: "9B", abteilung: "Innenarchitektur" },
];

export default function Dashboard () {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [displayQuestions, setDisplayQuestions] = useState<Question[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
    const [detailQuestion, setDetailQuestion] = useState<Question | null>(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [questionsLoading, setQuestionsLoading] = useState(true);
    const [questionsError, setQuestionsError] = useState<string | null>(null);
    const [questionsMeta, setQuestionsMeta] = useState<PaginationMeta | null>(null);
    const [sortField, setSortField] = useState<string>("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const [students] = useState<Student[]>(mockStudents);
    const [displayStudents, setDisplayStudents] = useState<Student[]>(mockStudents);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
    const [showStudentFilterMenu, setShowStudentFilterMenu] = useState(false);
    const [showStudentSortMenu, setShowStudentSortMenu] = useState(false);
    const [showClassQuickSelect, setShowClassQuickSelect] = useState(false);
    const [activeDepartmentFilters, setActiveDepartmentFilters] = useState<Set<string>>(new Set());
    const [studentSearchTerm, setStudentSearchTerm] = useState("");

    // Quiz-Einstellungen
    const [questionWeight, setQuestionWeight] = useState<number>(5);
    const [maxTimePerQuestion, setMaxTimePerQuestion] = useState<number>(30);

    const filterRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);
    const studentFilterRef = useRef<HTMLDivElement>(null);
    const studentSortRef = useRef<HTMLDivElement>(null);
    const classQuickSelectRef = useRef<HTMLDivElement>(null);

    // Fragen von der API laden
    const fetchQuestions = useCallback(async () => {
        setQuestionsLoading(true);
        setQuestionsError(null);
        try {
            const params = new URLSearchParams();
            params.set("per_page", "100");
            params.set("sort", sortField);
            params.set("direction", sortDirection);
            if (searchTerm) params.set("search", searchTerm);
            if (activeFilters.size > 0) {
                const filterType = Array.from(activeFilters)[0];
                if (filterType) params.set("type", filterType);
            }

            const response = await apiFetch<QuestionsResponse>(`/v1/questions?${params.toString()}`);
            setQuestions(response.data);
            setDisplayQuestions(response.data);
            setQuestionsMeta(response.meta);
        } catch (err) {
            setQuestionsError(err instanceof Error ? err.message : "Fehler beim Laden der Fragen");
        } finally {
            setQuestionsLoading(false);
        }
    }, [searchTerm, sortField, sortDirection, activeFilters]);

    useEffect(() => {
        void fetchQuestions();
    }, [fetchQuestions]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilterMenu(false);
            }
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setShowSortMenu(false);
            }
            if (studentFilterRef.current && !studentFilterRef.current.contains(event.target as Node)) {
                setShowStudentFilterMenu(false);
            }
            if (studentSortRef.current && !studentSortRef.current.contains(event.target as Node)) {
                setShowStudentSortMenu(false);
            }
            if (classQuickSelectRef.current && !classQuickSelectRef.current.contains(event.target as Node)) {
                setShowClassQuickSelect(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    useEffect(() => {
        applyStudentFiltersAndSearch();
    }, [activeDepartmentFilters, studentSearchTerm]);


    function applyStudentFiltersAndSearch() {
        let filtered = students;

        if (activeDepartmentFilters.size > 0) {
            filtered = filtered.filter(s => activeDepartmentFilters.has(s.abteilung));
        }

        if (studentSearchTerm) {
            const lowerSearch = studentSearchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(lowerSearch) ||
                s.klasse.toLowerCase().includes(lowerSearch) ||
                s.abteilung.toLowerCase().includes(lowerSearch)
            );
        }

        setDisplayStudents(filtered);
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(event.target.value);
    }

    function handleStudentSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
        setStudentSearchTerm(event.target.value);
    }

    function toggleFilter(type: string) {
        const newFilters = new Set(activeFilters);
        if (newFilters.has(type)) {
            newFilters.delete(type);
        } else {
            newFilters.add(type);
        }
        setActiveFilters(newFilters);
    }

    function toggleDepartmentFilter(abteilung: string) {
        const newFilters = new Set(activeDepartmentFilters);
        if (newFilters.has(abteilung)) {
            newFilters.delete(abteilung);
        } else {
            newFilters.add(abteilung);
        }
        setActiveDepartmentFilters(newFilters);
    }

    function sortQuestions(field: string, direction: "asc" | "desc") {
        setSortField(field);
        setSortDirection(direction);
        setShowSortMenu(false);
    }

    function sortStudents(type: 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc' | 'klasse-asc' | 'klasse-desc' | 'abteilung-asc' | 'abteilung-desc') {
        const sorted = [...displayStudents];

        switch (type) {
            case 'id-asc':
                sorted.sort((a, b) => a.id - b.id);
                break;
            case 'id-desc':
                sorted.sort((a, b) => b.id - a.id);
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'klasse-asc':
                sorted.sort((a, b) => a.klasse.localeCompare(b.klasse));
                break;
            case 'klasse-desc':
                sorted.sort((a, b) => b.klasse.localeCompare(a.klasse));
                break;
            case 'abteilung-asc':
                sorted.sort((a, b) => a.abteilung.localeCompare(b.abteilung));
                break;
            case 'abteilung-desc':
                sorted.sort((a, b) => b.abteilung.localeCompare(a.abteilung));
                break;
        }

        setDisplayStudents(sorted);
        setShowStudentSortMenu(false);
    }

    function toggleSelectAllQuestions() {
        if (selectedQuestionIds.size === displayQuestions.length) {
            setSelectedQuestionIds(new Set());
        } else {
            setSelectedQuestionIds(new Set(displayQuestions.map(q => q.id)));
        }
    }

    function toggleSelectAllStudents() {
        if (selectedStudentIds.size === displayStudents.length) {
            setSelectedStudentIds(new Set());
        } else {
            setSelectedStudentIds(new Set(displayStudents.map(s => s.id)));
        }
    }

    function toggleSelectQuestion(id: string) {
        const newSelected = new Set(selectedQuestionIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedQuestionIds(newSelected);
    }

    function toggleSelectStudent(id: number) {
        const newSelected = new Set(selectedStudentIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStudentIds(newSelected);
    }

    function selectWholeClass(klasse: string) {
        const classStudents = students.filter(s => s.klasse === klasse);
        const newSelected = new Set(selectedStudentIds);

        const allClassStudentsSelected = classStudents.every(s => newSelected.has(s.id));

        if (allClassStudentsSelected) {
            classStudents.forEach(s => newSelected.delete(s.id));
        } else {
            classStudents.forEach(s => newSelected.add(s.id));
        }

        setSelectedStudentIds(newSelected);
    }

    function openFilterMenu() {
        setShowSortMenu(false);
        setShowStudentFilterMenu(false);
        setShowStudentSortMenu(false);
        setShowClassQuickSelect(false);
        setShowFilterMenu(!showFilterMenu);
    }

    function openSortMenu() {
        setShowFilterMenu(false);
        setShowStudentFilterMenu(false);
        setShowStudentSortMenu(false);
        setShowClassQuickSelect(false);
        setShowSortMenu(!showSortMenu);
    }

    function openStudentFilterMenu() {
        setShowFilterMenu(false);
        setShowSortMenu(false);
        setShowStudentSortMenu(false);
        setShowClassQuickSelect(false);
        setShowStudentFilterMenu(!showStudentFilterMenu);
    }

    function openStudentSortMenu() {
        setShowFilterMenu(false);
        setShowSortMenu(false);
        setShowStudentFilterMenu(false);
        setShowClassQuickSelect(false);
        setShowStudentSortMenu(!showStudentSortMenu);
    }

    function openClassQuickSelect() {
        setShowFilterMenu(false);
        setShowSortMenu(false);
        setShowStudentFilterMenu(false);
        setShowStudentSortMenu(false);
        setShowClassQuickSelect(!showClassQuickSelect);
    }

    function createLobby() {
        // Generiere einen Game Code (z.B. 6-stelliger Code)
        const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Hier später: API Call um Session zu erstellen mit selectedQuestionIds und selectedStudentIds
        // const selectedQuestions = questions.filter(q => selectedQuestionIds.has(q.id));
        // const selectedStudents = students.filter(s => selectedStudentIds.has(s.id));

        // Navigiere zur Lobby
        router.push(`/teacher/session/${gameCode}/lobby`);
    }

    const allQuestionsSelected = displayQuestions.length > 0 && selectedQuestionIds.size === displayQuestions.length;
    const allStudentsSelected = displayStudents.length > 0 && selectedStudentIds.size === displayStudents.length;
    const uniqueTypes = Array.from(new Set(questions.map(q => q.type)));
    const uniqueClasses = Array.from(new Set(students.map(s => s.klasse))).sort();
    const uniqueDepartments = Array.from(new Set(students.map(s => s.abteilung))).sort();

    const canCreateLobby = selectedQuestionIds.size > 0 && selectedStudentIds.size > 0;


    return (
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 max-w-450 mx-auto min-h-screen bg-background">
            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2 flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-linear-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg shrink-0">
                        <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                    </div>
                    Quiz Editor
                </h1>
                <p className="text-text/60 text-sm sm:text-base lg:text-lg ml-12 sm:ml-15">Erstelle und verwalte deine Quiz-Fragen und wähle Teilnehmer aus</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-linear-to-br from-secondary to-secondary-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-primary/10 hover:shadow-primary/10 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-background/10">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                            <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-background">Fragen</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={openFilterMenu}
                                className={`py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 justify-center ${
                                    activeFilters.size > 0
                                        ? 'bg-primary hover:bg-primary-hover text-white ring-2 ring-primary/40'
                                        : 'bg-white/95 hover:bg-white text-secondary border border-white/30'
                                }`}
                            >
                                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0 hidden xs:inline">Filtern</span>
                                {activeFilters.size > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs absolute -top-2 -right-2">{activeFilters.size}</span>}
                            </button>
                            {showFilterMenu && (
                                <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl p-4 min-w-60 z-50 border border-text/5">
                                    <p className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-primary" strokeWidth={2} />
                                        Filter nach Typ
                                    </p>
                                    <div className="space-y-1 max-h-70 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                        {uniqueTypes.map(type => (
                                            <label
                                                key={type}
                                                className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 p-2.5 rounded-lg transition-all duration-150 group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={activeFilters.has(type)}
                                                    onChange={() => toggleFilter(type)}
                                                    className="w-4.5 h-4.5 accent-primary cursor-pointer rounded"
                                                />
                                                <span className="text-sm text-text group-hover:text-primary font-medium transition-colors">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={sortRef}>
                            <button
                                onClick={openSortMenu}
                                className="py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold bg-accent hover:bg-accent-hover text-white rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 justify-center"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0 hidden xs:inline">Sortieren</span>
                            </button>
                            {showSortMenu && (
                                <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl p-2 min-w-50 max-h-70 overflow-y-auto z-50 border border-text/5">
                                    <button
                                        onClick={() => sortQuestions('created_at', 'desc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronDown className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Neueste zuerst
                                    </button>
                                    <button
                                        onClick={() => sortQuestions('created_at', 'asc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronUp className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Älteste zuerst
                                    </button>
                                    <button
                                        onClick={() => sortQuestions('type', 'asc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronUp className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Typ A-Z
                                    </button>
                                    <button
                                        onClick={() => sortQuestions('type', 'desc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronDown className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Typ Z-A
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 sm:min-w-48 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/95 border border-white/30 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/30">
                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text/40 shrink-0" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleChange}
                                name="search-question"
                                placeholder="Suchen..."
                                className="flex-1 bg-transparent text-text text-xs sm:text-sm outline-none placeholder:text-text/40 min-w-0"
                            />
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-5 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden border border-white/10 shadow-inner">
                        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                            <table className="w-full text-left text-background text-xs sm:text-sm table-fixed">
                                <thead className="sticky top-0 bg-secondary-muted/95 backdrop-blur-sm z-10 border-b border-white/10">
                                <tr>
                                    <th className="p-2 sm:p-3 w-10 sm:w-12">
                                        <input
                                            type="checkbox"
                                            checked={allQuestionsSelected}
                                            onChange={toggleSelectAllQuestions}
                                            className="w-4 h-4 sm:w-4.5 sm:h-4.5 accent-primary cursor-pointer rounded"
                                        />
                                    </th>
                                    <th className="p-2 sm:p-3 w-20 sm:w-28 text-xs sm:text-sm font-semibold text-background/80">Typ</th>
                                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-background/80">Frage</th>
                                    <th className="p-2 sm:p-3 w-16 sm:w-20 text-xs sm:text-sm font-semibold text-background/80">Diff.</th>
                                    <th className="p-2 sm:p-3 w-16 sm:w-20 text-xs sm:text-sm font-semibold text-background/80">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {questionsLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center">
                                            <div className="flex items-center justify-center gap-2 text-background/60">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Fragen werden geladen...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : questionsError ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-red-400">
                                            {questionsError}
                                        </td>
                                    </tr>
                                ) : displayQuestions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-background/50">
                                            Keine Fragen gefunden
                                        </td>
                                    </tr>
                                ) : displayQuestions.map((q) => (
                                    <tr
                                        key={q.id}
                                        className="border-b border-white/5 hover:bg-white/10 transition-colors duration-150 cursor-pointer group"
                                    >
                                        <td className="p-2 sm:p-3" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestionIds.has(q.id)}
                                                onChange={() => toggleSelectQuestion(q.id)}
                                                className="w-4 h-4 sm:w-4.5 sm:h-4.5 accent-primary cursor-pointer rounded"
                                            />
                                        </td>
                                        <td className="p-2 sm:p-3" onClick={() => setDetailQuestion(q)}>
                                            <span className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 bg-primary/20 text-primary rounded-md sm:rounded-lg text-xs font-semibold truncate max-w-full">
                                                {q.type}
                                            </span>
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-background group-hover:text-background transition-colors truncate" onClick={() => setDetailQuestion(q)}>
                                            {q.current_version?.title ?? "—"}
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-background/80 text-center" onClick={() => setDetailQuestion(q)}>
                                            {q.current_version?.difficulty != null ? (
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-bold ${
                                                    q.current_version.difficulty <= 2 ? 'bg-green-500/20 text-green-300' :
                                                    q.current_version.difficulty <= 3 ? 'bg-yellow-500/20 text-yellow-300' :
                                                    'bg-red-500/20 text-red-300'
                                                }`}>
                                                    {q.current_version.difficulty}/5
                                                </span>
                                            ) : "—"}
                                        </td>
                                        <td className="p-2 sm:p-3 text-center" onClick={() => setDetailQuestion(q)}>
                                            {q.is_published ? (
                                                <span className="inline-flex items-center px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded-md text-xs font-semibold">✓</span>
                                            ) : (
                                                <span className="inline-flex items-center px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-md text-xs font-semibold">Entwurf</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-3 sm:mt-4 flex items-center justify-between px-1 sm:px-2">
                        <p className="text-background/70 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" strokeWidth={2} />
                            <span>{selectedQuestionIds.size} von {displayQuestions.length} ausgewählt</span>
                            {questionsMeta && questionsMeta.total !== displayQuestions.length && <span className="text-background/50 hidden sm:inline">({questionsMeta.total} gesamt)</span>}
                        </p>
                    </div>
                </div>

                <div className="bg-linear-to-br from-secondary to-secondary-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-primary/10 hover:shadow-primary/10 transition-all duration-300">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-background/10">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-accent/20 flex items-center justify-center ring-2 ring-accent/30">
                            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" strokeWidth={2} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-background">Schüler</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <div className="relative" ref={classQuickSelectRef}>
                            <button
                                onClick={openClassQuickSelect}
                                className="py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold bg-linear-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 justify-center"
                            >
                                <School className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0 hidden xs:inline">Klasse wählen</span>
                            </button>
                            {showClassQuickSelect && (
                                <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl p-2 min-w-50 max-h-70 overflow-y-auto z-50 border border-text/5">
                                    {uniqueClasses.map(klasse => {
                                        const classStudents = students.filter(s => s.klasse === klasse);
                                        const allSelected = classStudents.every(s => selectedStudentIds.has(s.id));

                                        return (
                                            <button
                                                key={klasse}
                                                onClick={() => selectWholeClass(klasse)}
                                                className={`w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex justify-between items-center group ${
                                                    allSelected ? 'bg-primary/10 text-primary' : ''
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {allSelected && (
                                                        <CheckCircle className="w-4 h-4 text-primary" strokeWidth={2} />
                                                    )}
                                                    {klasse}
                                                </span>
                                                <span className="text-xs text-text/40 bg-text/5 px-2 py-0.5 rounded-md">{classStudents.length}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={studentFilterRef}>
                            <button
                                onClick={openStudentFilterMenu}
                                className={`py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 justify-center ${
                                    activeDepartmentFilters.size > 0
                                        ? 'bg-primary hover:bg-primary-hover text-white ring-2 ring-primary/40'
                                        : 'bg-white/95 hover:bg-white text-secondary border border-white/30'
                                }`}
                            >
                                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0 hidden xs:inline">Abteilung</span>
                                {activeDepartmentFilters.size > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs absolute -top-2 -right-2">{activeDepartmentFilters.size}</span>}
                            </button>
                            {showStudentFilterMenu && (
                                <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl p-4 min-w-60 z-50 border border-text/5">
                                    <p className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-accent" strokeWidth={2} />
                                        Filter nach Abteilung
                                    </p>
                                    <div className="space-y-1 max-h-70 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
                                        {uniqueDepartments.map(abteilung => (
                                            <label
                                                key={abteilung}
                                                className="flex items-center gap-3 cursor-pointer hover:bg-accent/5 p-2.5 rounded-lg transition-all duration-150 group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={activeDepartmentFilters.has(abteilung)}
                                                    onChange={() => toggleDepartmentFilter(abteilung)}
                                                    className="w-4.5 h-4.5 accent-accent cursor-pointer rounded"
                                                />
                                                <span className="text-sm text-text group-hover:text-accent font-medium transition-colors">{abteilung}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={studentSortRef}>
                            <button
                                onClick={openStudentSortMenu}
                                className="py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold bg-accent hover:bg-accent-hover text-white rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2 justify-center"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0 hidden xs:inline">Sortieren</span>
                            </button>
                            {showStudentSortMenu && (
                                <div className="absolute top-full mt-2 bg-white rounded-xl shadow-2xl p-2 min-w-50 max-h-70 overflow-y-auto z-50 border border-text/5">
                                    <button
                                        onClick={() => sortStudents('name-asc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-accent/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronUp className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Name A-Z
                                    </button>
                                    <button
                                        onClick={() => sortStudents('name-desc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-accent/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronDown className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Name Z-A
                                    </button>
                                    <button
                                        onClick={() => sortStudents('klasse-asc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-accent/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronUp className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Klasse A-Z
                                    </button>
                                    <button
                                        onClick={() => sortStudents('klasse-desc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-accent/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronDown className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Klasse Z-A
                                    </button>
                                    <button
                                        onClick={() => sortStudents('abteilung-asc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-accent/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronUp className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Abteilung A-Z
                                    </button>
                                    <button
                                        onClick={() => sortStudents('abteilung-desc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-accent/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronDown className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Abteilung Z-A
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/95 border border-white/30 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-accent/30">
                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text/40 shrink-0" />
                            <input
                                type="text"
                                value={studentSearchTerm}
                                onChange={handleStudentSearchChange}
                                name="search-student"
                                placeholder="Schüler suchen..."
                                className="w-full bg-transparent text-text text-xs sm:text-sm outline-none placeholder:text-text/40"
                            />
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-5 bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden border border-white/10 shadow-inner">
                        <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
                            <table className="w-full text-left text-background text-xs sm:text-sm">
                                <thead className="sticky top-0 bg-secondary-muted/95 backdrop-blur-sm z-10 border-b border-white/10">
                                <tr>
                                    <th className="p-2 sm:p-3">
                                        <input
                                            type="checkbox"
                                            checked={allStudentsSelected}
                                            onChange={toggleSelectAllStudents}
                                            className="w-4 h-4 sm:w-4.5 sm:h-4.5 accent-accent cursor-pointer rounded"
                                        />
                                    </th>
                                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-background/80">ID</th>
                                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-background/80">Name</th>
                                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-background/80 hidden sm:table-cell">Klasse</th>
                                    <th className="p-2 sm:p-3 text-xs sm:text-sm font-semibold text-background/80 hidden md:table-cell">Abteilung</th>
                                </tr>
                                </thead>
                                <tbody>
                                {displayStudents.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-b border-white/5 hover:bg-white/10 transition-colors duration-150 group"
                                    >
                                        <td className="p-2 sm:p-3" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStudentIds.has(s.id)}
                                                onChange={() => toggleSelectStudent(s.id)}
                                                className="w-4 h-4 sm:w-4.5 sm:h-4.5 accent-accent cursor-pointer rounded"
                                            />
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-background/60 group-hover:text-background transition-colors">{s.id}</td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-background transition-colors">{s.name}</td>
                                        <td className="p-2 sm:p-3 hidden sm:table-cell">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-primary/20 text-primary rounded-lg text-xs font-semibold">
                                                {s.klasse}
                                            </span>
                                        </td>
                                        <td className="p-2 sm:p-3 text-xs sm:text-sm text-background/80 group-hover:text-background transition-colors hidden md:table-cell">{s.abteilung}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-3 sm:mt-4 flex items-center justify-between px-1 sm:px-2">
                        <p className="text-background/70 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" strokeWidth={2} />
                            <span>{selectedStudentIds.size} von {displayStudents.length} ausgewählt</span>
                            {displayStudents.length !== students.length && <span className="text-background/50 hidden sm:inline">({students.length} gesamt)</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quiz-Einstellungen */}
            <div className="mt-4 sm:mt-6 bg-linear-to-br from-secondary to-secondary-muted p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-2xl border border-primary/10">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-background/10">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-background">Quiz-Einstellungen</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Gewichtung der Fragen */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/10">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Weight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" strokeWidth={2} />
                            <label className="text-sm sm:text-base font-semibold text-background">
                                Gewichtung der Fragen
                            </label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={questionWeight}
                                    onChange={(e) => setQuestionWeight(Number(e.target.value))}
                                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={questionWeight}
                                        onChange={(e) => {
                                            const val = Math.min(10, Math.max(1, Number(e.target.value)));
                                            setQuestionWeight(val);
                                        }}
                                        className="w-14 sm:w-16 px-2 sm:px-3 py-1.5 sm:py-2 text-center text-sm sm:text-base font-semibold bg-white/95 text-secondary rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-background/50">
                                <span>Niedrig (1)</span>
                                <span>Hoch (10)</span>
                            </div>
                            <p className="text-xs sm:text-sm text-background/60">
                                Bestimmt, wie stark die Punkte für richtige Antworten gewichtet werden.
                            </p>
                        </div>
                    </div>

                    {/* Maximale Zeit pro Frage */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/10">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" strokeWidth={2} />
                            <label className="text-sm sm:text-base font-semibold text-background">
                                Maximale Zeit pro Frage
                            </label>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <input
                                    type="range"
                                    min="5"
                                    max="120"
                                    step="5"
                                    value={maxTimePerQuestion}
                                    onChange={(e) => setMaxTimePerQuestion(Number(e.target.value))}
                                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                    <input
                                        type="number"
                                        min="5"
                                        max="120"
                                        step="5"
                                        value={maxTimePerQuestion}
                                        onChange={(e) => {
                                            const val = Math.min(120, Math.max(5, Number(e.target.value)));
                                            setMaxTimePerQuestion(val);
                                        }}
                                        className="w-16 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 text-center text-sm sm:text-base font-semibold bg-white/95 text-secondary rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50"
                                    />
                                    <span className="text-xs sm:text-sm text-background/70 font-medium">Sek.</span>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-background/50">
                                <span>5 Sekunden</span>
                                <span>2 Minuten</span>
                            </div>
                            <p className="text-xs sm:text-sm text-background/60">
                                Die Zeit, die Schüler haben, um jede Frage zu beantworten.
                            </p>
                        </div>
                    </div>
                </div>
                {/* Lobby eröffnen Button */}
                <div className="mt-6 sm:mt-8 flex justify-center px-2">
                    <button
                        onClick={createLobby}
                        disabled={!canCreateLobby}
                        className={`py-3 sm:py-4 px-5 sm:px-8 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl transition-all duration-300 shadow-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto max-w-md ${
                            canCreateLobby
                                ? 'bg-linear-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white hover:shadow-primary/50 hover:scale-105 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                    >
                        <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.5} />
                        <span>Lobby eröffnen</span>
                        {canCreateLobby && (
                            <span className="bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium">
                            {selectedQuestionIds.size} Fragen • {selectedStudentIds.size} Schüler
                        </span>
                        )}
                    </button>
                </div>
            </div>

            {detailQuestion && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200"
                    onClick={() => setDetailQuestion(null)}
                >
                    <div
                        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full mx-2 sm:mx-4 shadow-2xl border border-primary/10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" strokeWidth={2} />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text">{detailQuestion.current_version?.title ?? "Frage"}</h2>
                                    <p className="text-text/50 text-xs sm:text-sm">{detailQuestion.type} • Version {detailQuestion.current_version?.version ?? "?"}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDetailQuestion(null)}
                                className="p-1.5 sm:p-2 hover:bg-text/5 rounded-lg sm:rounded-xl transition-all duration-200 group"
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6 text-text/40 group-hover:text-text transition-colors" />
                            </button>
                        </div>

                        <div className="space-y-3 sm:space-y-5">
                            <div className="p-3 sm:p-4 bg-primary/5 rounded-lg sm:rounded-xl border border-primary/10">
                                <p className="text-xs font-semibold text-primary/60 mb-1.5 sm:mb-2 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                                    <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                                    Typ & Schwierigkeit
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center px-2 py-1 bg-primary/20 text-primary rounded-lg text-sm font-semibold">{detailQuestion.type}</span>
                                    {detailQuestion.current_version?.difficulty != null && (
                                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-semibold ${
                                            detailQuestion.current_version.difficulty <= 2 ? 'bg-green-100 text-green-700' :
                                            detailQuestion.current_version.difficulty <= 3 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            Schwierigkeit: {detailQuestion.current_version.difficulty}/5
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-semibold ${detailQuestion.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {detailQuestion.is_published ? "Veröffentlicht" : "Entwurf"}
                                    </span>
                                </div>
                            </div>

                            {detailQuestion.current_version?.explanation && (
                                <div className="p-3 sm:p-4 bg-accent/5 rounded-lg sm:rounded-xl border border-accent/10">
                                    <p className="text-xs font-semibold text-accent/60 mb-1.5 sm:mb-2 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                                        <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                                        Erklärung
                                    </p>
                                    <p className="font-medium text-text text-sm sm:text-base">{detailQuestion.current_version.explanation}</p>
                                </div>
                            )}

                            {detailQuestion.current_version?.answer_options && detailQuestion.current_version.answer_options.length > 0 && (
                                <div className="p-3 sm:p-4 bg-secondary/5 rounded-lg sm:rounded-xl border border-secondary/10">
                                    <p className="text-xs font-semibold text-secondary/60 mb-1.5 sm:mb-2 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                                        <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={2} />
                                        Antwortoptionen
                                    </p>
                                    <div className="space-y-2">
                                        {detailQuestion.current_version.answer_options
                                            .sort((a, b) => a.sort_order - b.sort_order)
                                            .map((option) => (
                                                <div
                                                    key={option.id}
                                                    className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                                                        option.is_correct
                                                            ? 'bg-green-50 border-green-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                    }`}
                                                >
                                                    {option.is_correct ? (
                                                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" strokeWidth={2} />
                                                    ) : (
                                                        <X className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
                                                    )}
                                                    <span className={`text-sm font-medium ${option.is_correct ? 'text-green-800' : 'text-gray-700'}`}>
                                                        {option.text}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 text-xs text-text/50">
                                {detailQuestion.current_version?.default_points != null && (
                                    <span>Punkte: {detailQuestion.current_version.default_points}</span>
                                )}
                                {detailQuestion.current_version?.default_time_limit != null && (
                                    <span>Zeitlimit: {detailQuestion.current_version.default_time_limit}s</span>
                                )}
                                <span>Versionen: {detailQuestion.versions?.length ?? 1}</span>
                            </div>
                        </div>

                        <div className="mt-5 sm:mt-8 flex gap-2 sm:gap-3">
                            <button
                                onClick={() => setDetailQuestion(null)}
                                className="flex-1 py-2.5 sm:py-3 bg-linear-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-lg sm:rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
