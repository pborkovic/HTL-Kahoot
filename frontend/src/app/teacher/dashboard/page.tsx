"use client"
import {Search, X, Filter, ArrowUpDown, HelpCircle, Building2, Tag, CheckCircle, ChevronUp, ChevronDown, ClipboardList, UserCheck, GraduationCap, FileText, School, PlayCircle} from "lucide-react";
import {useState, useRef, useEffect} from "react";
import {useRouter} from "next/navigation";
import React from "react";

type Question = {
    id: number;
    thema: string;
    frage: string;
    antwort: string;
};

type Student = {
    id: number;
    name: string;
    klasse: string;
    abteilung: string;
};

const mockQuestions: Question[] = [
    { id: 1, thema: "Mathematik", frage: "Was ist 2+2?", antwort: "4" },
    { id: 2, thema: "Geschichte", frage: "Wann fiel die Berliner Mauer?", antwort: "1989" },
    { id: 3, thema: "Biologie", frage: "Was ist die Zellmembran?", antwort: "Schutzhülle der Zelle" },
    { id: 4, thema: "Physik", frage: "Was ist die Lichtgeschwindigkeit?", antwort: "299.792.458 m/s" },
    { id: 5, thema: "Chemie", frage: "Was ist H2O?", antwort: "Wasser" },
    { id: 6, thema: "Geographie", frage: "Hauptstadt von Deutschland?", antwort: "Berlin" },
    { id: 7, thema: "Informatik", frage: "Was ist HTML?", antwort: "HyperText Markup Language" },
    { id: 8, thema: "Kunst", frage: "Wer malte die Mona Lisa?", antwort: "Leonardo da Vinci" },
    { id: 9, thema: "Musik", frage: "Wie viele Tasten hat ein Klavier?", antwort: "88" },
    { id: 10, thema: "Sport", frage: "Wie viele Spieler hat eine Fußballmannschaft?", antwort: "11" },
    { id: 11, thema: "Englisch", frage: "Was bedeutet 'Hello'?", antwort: "Hallo" },
    { id: 12, thema: "Mathematik", frage: "Was ist 10x10?", antwort: "100" },
];

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
    const [questions] = useState<Question[]>(mockQuestions);
    const [displayQuestions, setDisplayQuestions] = useState<Question[]>(mockQuestions);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<number>>(new Set());
    const [detailQuestion, setDetailQuestion] = useState<Question | null>(null);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");

    const [students] = useState<Student[]>(mockStudents);
    const [displayStudents, setDisplayStudents] = useState<Student[]>(mockStudents);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());
    const [showStudentFilterMenu, setShowStudentFilterMenu] = useState(false);
    const [showStudentSortMenu, setShowStudentSortMenu] = useState(false);
    const [showClassQuickSelect, setShowClassQuickSelect] = useState(false);
    const [activeDepartmentFilters, setActiveDepartmentFilters] = useState<Set<string>>(new Set());
    const [studentSearchTerm, setStudentSearchTerm] = useState("");

    const filterRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);
    const studentFilterRef = useRef<HTMLDivElement>(null);
    const studentSortRef = useRef<HTMLDivElement>(null);
    const classQuickSelectRef = useRef<HTMLDivElement>(null);

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
        applyFiltersAndSearch();
    }, [activeFilters, searchTerm]);

    useEffect(() => {
        applyStudentFiltersAndSearch();
    }, [activeDepartmentFilters, studentSearchTerm]);

    function applyFiltersAndSearch() {
        let filtered = questions;

        if (activeFilters.size > 0) {
            filtered = filtered.filter(q => activeFilters.has(q.thema));
        }

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(q =>
                q.thema.toLowerCase().includes(lowerSearch) ||
                q.frage.toLowerCase().includes(lowerSearch) ||
                q.antwort.toLowerCase().includes(lowerSearch)
            );
        }

        setDisplayQuestions(filtered);
    }

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

    function toggleFilter(thema: string) {
        const newFilters = new Set(activeFilters);
        if (newFilters.has(thema)) {
            newFilters.delete(thema);
        } else {
            newFilters.add(thema);
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

    function sortQuestions(type: 'id-asc' | 'id-desc' | 'thema-asc' | 'thema-desc') {
        const sorted = [...displayQuestions];

        switch (type) {
            case 'id-asc':
                sorted.sort((a, b) => a.id - b.id);
                break;
            case 'id-desc':
                sorted.sort((a, b) => b.id - a.id);
                break;
            case 'thema-asc':
                sorted.sort((a, b) => a.thema.localeCompare(b.thema));
                break;
            case 'thema-desc':
                sorted.sort((a, b) => b.thema.localeCompare(a.thema));
                break;
        }

        setDisplayQuestions(sorted);
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

    function toggleSelectQuestion(id: number) {
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
        setShowClassQuickSelect(false);
    }

    function openFilterMenu() {
        setShowSortMenu(false);
        setShowFilterMenu(!showFilterMenu);
    }

    function openSortMenu() {
        setShowFilterMenu(false);
        setShowSortMenu(!showSortMenu);
    }

    function openStudentFilterMenu() {
        setShowStudentSortMenu(false);
        setShowClassQuickSelect(false);
        setShowStudentFilterMenu(!showStudentFilterMenu);
    }

    function openStudentSortMenu() {
        setShowStudentFilterMenu(false);
        setShowClassQuickSelect(false);
        setShowStudentSortMenu(!showStudentSortMenu);
    }

    function openClassQuickSelect() {
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
    const uniqueThemen = Array.from(new Set(questions.map(q => q.thema)));
    const uniqueClasses = Array.from(new Set(students.map(s => s.klasse))).sort();
    const uniqueDepartments = Array.from(new Set(students.map(s => s.abteilung))).sort();

    const canCreateLobby = selectedQuestionIds.size > 0 && selectedStudentIds.size > 0;

    return (
        <div className="flex flex-col p-8 max-w-450 mx-auto min-h-screen bg-background">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-text mb-2 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
                        <FileText className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                    Quiz Editor
                </h1>
                <p className="text-text/60 text-lg ml-15">Erstelle und verwalte deine Quiz-Fragen und wähle Teilnehmer aus</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-secondary to-secondary-muted p-6 rounded-2xl shadow-2xl border border-primary/10 hover:shadow-primary/10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-background/10">
                        <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center ring-2 ring-primary/30">
                            <HelpCircle className="w-6 h-6 text-primary" strokeWidth={2} />
                        </div>
                        <h2 className="text-2xl font-bold text-background">Fragen</h2>
                    </div>
                    <div className="flex flex-row w-full gap-3">
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={openFilterMenu}
                                className={`py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 w-28.75 justify-center ${
                                    activeFilters.size > 0
                                        ? 'bg-primary hover:bg-primary-hover text-white ring-2 ring-primary/40'
                                        : 'bg-background hover:bg-text/5 text-text border border-text/10'
                                }`}
                            >
                                <Filter className="w-4 h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0">Filtern</span>
                                {activeFilters.size > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs absolute -top-2 -right-2">{activeFilters.size}</span>}
                            </button>
                            {showFilterMenu && (
                                <div className="absolute top-full mt-2 bg-background rounded-xl shadow-2xl p-4 min-w-60 z-50 border border-text/5">
                                    <p className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-primary" strokeWidth={2} />
                                        Filter nach Thema
                                    </p>
                                    <div className="space-y-1 max-h-70 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                        {uniqueThemen.map(thema => (
                                            <label
                                                key={thema}
                                                className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 p-2.5 rounded-lg transition-all duration-150 group"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={activeFilters.has(thema)}
                                                    onChange={() => toggleFilter(thema)}
                                                    className="w-4.5 h-4.5 accent-primary cursor-pointer rounded"
                                                />
                                                <span className="text-sm text-text group-hover:text-primary font-medium transition-colors">{thema}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={sortRef}>
                            <button
                                onClick={openSortMenu}
                                className="py-2.5 px-4 text-sm font-semibold bg-accent hover:bg-accent-hover text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 w-32.5 justify-center"
                            >
                                <ArrowUpDown className="w-4 h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0">Sortieren</span>
                            </button>
                            {showSortMenu && (
                                <div className="absolute top-full mt-2 bg-background rounded-xl shadow-2xl p-2 min-w-50 max-h-70 overflow-y-auto z-50 border border-text/5">
                                    <button
                                        onClick={() => sortQuestions('id-asc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronUp className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        ID aufsteigend
                                    </button>
                                    <button
                                        onClick={() => sortQuestions('id-desc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronDown className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        ID absteigend
                                    </button>
                                    <button
                                        onClick={() => sortQuestions('thema-asc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronUp className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Thema A-Z
                                    </button>
                                    <button
                                        onClick={() => sortQuestions('thema-desc')}
                                        className="w-full text-left px-3 py-2.5 hover:bg-primary/10 rounded-lg text-text text-sm font-medium transition-all duration-150 flex items-center gap-2 group"
                                    >
                                        <ChevronDown className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                                        Thema Z-A
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-text/10 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/30">
                            <Search className="w-4 h-4 text-text/40" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleChange}
                                name="search-question"
                                placeholder="Fragen durchsuchen..."
                                className="flex-1 bg-transparent text-text text-sm outline-none placeholder:text-text/40"
                            />
                        </div>
                    </div>

                    <div className="mt-5 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-inner">
                        <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent">
                            <table className="w-full text-left text-background">
                                <thead className="sticky top-0 bg-secondary-muted/95 backdrop-blur-sm z-10 border-b border-white/10">
                                <tr>
                                    <th className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={allQuestionsSelected}
                                            onChange={toggleSelectAllQuestions}
                                            className="w-4.5 h-4.5 accent-primary cursor-pointer rounded"
                                        />
                                    </th>
                                    <th className="p-3 text-sm font-semibold text-background/80">ID</th>
                                    <th className="p-3 text-sm font-semibold text-background/80">Thema</th>
                                    <th className="p-3 text-sm font-semibold text-background/80">Frage</th>
                                    <th className="p-3 text-sm font-semibold text-background/80">Antwort</th>
                                </tr>
                                </thead>
                                <tbody>
                                {displayQuestions.map((q) => (
                                    <tr
                                        key={q.id}
                                        className="border-b border-white/5 hover:bg-white/10 transition-colors duration-150 cursor-pointer group"
                                    >
                                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedQuestionIds.has(q.id)}
                                                onChange={() => toggleSelectQuestion(q.id)}
                                                className="w-4.5 h-4.5 accent-primary cursor-pointer rounded"
                                            />
                                        </td>
                                        <td className="p-3 text-sm text-background/60 group-hover:text-background transition-colors" onClick={() => setDetailQuestion(q)}>{q.id}</td>
                                        <td className="p-3 text-sm font-medium text-background group-hover:text-primary transition-colors" onClick={() => setDetailQuestion(q)}>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 text-primary rounded-lg text-xs font-semibold">
                                                {q.thema}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-background group-hover:text-background transition-colors" onClick={() => setDetailQuestion(q)}>{q.frage}</td>
                                        <td className="p-3 text-sm text-background/80 group-hover:text-background transition-colors" onClick={() => setDetailQuestion(q)}>{q.antwort}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between px-2">
                        <p className="text-background/70 text-sm font-medium flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-primary" strokeWidth={2} />
                            <span>{selectedQuestionIds.size} von {displayQuestions.length} ausgewählt</span>
                            {displayQuestions.length !== questions.length && <span className="text-background/50">({questions.length} gesamt)</span>}
                        </p>
                    </div>
                </div>

                <div className="bg-linear-to-br from-secondary to-secondary-muted p-6 rounded-2xl shadow-2xl border border-primary/10 hover:shadow-primary/10 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-background/10">
                        <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center ring-2 ring-accent/30">
                            <GraduationCap className="w-6 h-6 text-accent" strokeWidth={2} />
                        </div>
                        <h2 className="text-2xl font-bold text-background">Schüler</h2>
                    </div>
                    <div className="flex flex-row gap-3 max-w-full">
                        <div className="relative" ref={classQuickSelectRef}>
                            <button
                                onClick={openClassQuickSelect}
                                className="py-2.5 px-4 text-sm font-semibold bg-linear-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 w-37.5 justify-center"
                            >
                                <School className="w-4 h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0">Klasse wählen</span>
                            </button>
                            {showClassQuickSelect && (
                                <div className="absolute top-full mt-2 bg-background rounded-xl shadow-2xl p-2 min-w-50 max-h-70 overflow-y-auto z-50 border border-text/5">
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
                                className={`py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 w-33.75 justify-center ${
                                    activeDepartmentFilters.size > 0
                                        ? 'bg-primary hover:bg-primary-hover text-white ring-2 ring-primary/40'
                                        : 'bg-background hover:bg-text/5 text-text border border-text/10'
                                }`}
                            >
                                <Building2 className="w-4 h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0">Abteilung</span>
                                {activeDepartmentFilters.size > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs absolute -top-2 -right-2">{activeDepartmentFilters.size}</span>}
                            </button>
                            {showStudentFilterMenu && (
                                <div className="absolute top-full mt-2 bg-background rounded-xl shadow-2xl p-4 min-w-60 z-50 border border-text/5">
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
                                className="py-2.5 px-4 text-sm font-semibold bg-accent hover:bg-accent-hover text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 w-32.5 justify-center"
                            >
                                <ArrowUpDown className="w-4 h-4 shrink-0" strokeWidth={2} />
                                <span className="shrink-0">Sortieren</span>
                            </button>
                            {showStudentSortMenu && (
                                <div className="absolute top-full mt-2 bg-background rounded-xl shadow-2xl p-2 min-w-50 max-h-70 overflow-y-auto z-50 border border-text/5">
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

                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-text/10 shadow-sm hover:shadow-md transition-all duration-200 focus-within:ring-2 focus-within:ring-accent/30 flex-1 min-w-0">
                            <Search className="w-4 h-4 text-text/40 shrink-0" />
                            <input
                                type="text"
                                value={studentSearchTerm}
                                onChange={handleStudentSearchChange}
                                name="search-student"
                                placeholder="Schüler durchsuchen..."
                                className="flex-1 bg-transparent text-text text-sm outline-none placeholder:text-text/40 min-w-0"
                            />
                        </div>
                    </div>

                    <div className="mt-5 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-inner">
                        <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent">
                            <table className="w-full text-left text-background">
                                <thead className="sticky top-0 bg-secondary-muted/95 backdrop-blur-sm z-10 border-b border-white/10">
                                <tr>
                                    <th className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={allStudentsSelected}
                                            onChange={toggleSelectAllStudents}
                                            className="w-4.5 h-4.5 accent-accent cursor-pointer rounded"
                                        />
                                    </th>
                                    <th className="p-3 text-sm font-semibold text-background/80">ID</th>
                                    <th className="p-3 text-sm font-semibold text-background/80">Name</th>
                                    <th className="p-3 text-sm font-semibold text-background/80">Klasse</th>
                                    <th className="p-3 text-sm font-semibold text-background/80">Abteilung</th>
                                </tr>
                                </thead>
                                <tbody>
                                {displayStudents.map((s) => (
                                    <tr
                                        key={s.id}
                                        className="border-b border-white/5 hover:bg-white/10 transition-colors duration-150 group"
                                    >
                                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStudentIds.has(s.id)}
                                                onChange={() => toggleSelectStudent(s.id)}
                                                className="w-4.5 h-4.5 accent-accent cursor-pointer rounded"
                                            />
                                        </td>
                                        <td className="p-3 text-sm text-background/60 group-hover:text-background transition-colors">{s.id}</td>
                                        <td className="p-3 text-sm font-medium text-background transition-colors">{s.name}</td>
                                        <td className="p-3 text-sm text-background group-hover:text-background transition-colors">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 text-primary rounded-lg text-xs font-semibold">
                                                {s.klasse}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-background/80 group-hover:text-background transition-colors">{s.abteilung}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between px-2">
                        <p className="text-background/70 text-sm font-medium flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-accent" strokeWidth={2} />
                            <span>{selectedStudentIds.size} von {displayStudents.length} ausgewählt</span>
                            {displayStudents.length !== students.length && <span className="text-background/50">({students.length} gesamt)</span>}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lobby eröffnen Button */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={createLobby}
                    disabled={!canCreateLobby}
                    className={`py-4 px-8 text-lg font-bold rounded-2xl transition-all duration-300 shadow-2xl flex items-center gap-3 ${
                        canCreateLobby
                            ? 'bg-linear-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white hover:shadow-primary/50 hover:scale-105 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                    }`}
                >
                    <PlayCircle className="w-7 h-7" strokeWidth={2.5} />
                    <span>Lobby eröffnen</span>
                    {canCreateLobby && (
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium">
                            {selectedQuestionIds.size} Fragen • {selectedStudentIds.size} Schüler
                        </span>
                    )}
                </button>
            </div>

            {detailQuestion && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
                    onClick={() => setDetailQuestion(null)}
                >
                    <div
                        className="bg-background rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl border border-primary/10 animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <HelpCircle className="w-6 h-6 text-primary" strokeWidth={2} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-text">Frage #{detailQuestion.id}</h2>
                                    <p className="text-text/50 text-sm">Detailansicht</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDetailQuestion(null)}
                                className="p-2 hover:bg-text/5 rounded-xl transition-all duration-200 group"
                            >
                                <X className="w-6 h-6 text-text/40 group-hover:text-text transition-colors" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <p className="text-xs font-semibold text-primary/60 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <Tag className="w-3.5 h-3.5" strokeWidth={2} />
                                    Thema
                                </p>
                                <p className="font-semibold text-text text-lg">{detailQuestion.thema}</p>
                            </div>
                            <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                                <p className="text-xs font-semibold text-accent/60 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
                                    Frage
                                </p>
                                <p className="font-semibold text-text text-lg">{detailQuestion.frage}</p>
                            </div>
                            <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                                <p className="text-xs font-semibold text-secondary/60 mb-2 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                                    Antwort
                                </p>
                                <p className="font-semibold text-text text-lg">{detailQuestion.antwort}</p>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={() => setDetailQuestion(null)}
                                className="flex-1 py-3 bg-linear-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" strokeWidth={2} />
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
