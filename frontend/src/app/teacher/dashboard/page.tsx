"use client"
import {Search, X} from "lucide-react";
import {useState} from "react";

type Question = {
    id: number;
    thema: string;
    frage: string;
    antwort: string;
};

const mockQuestions: Question[] = [
    { id: 1, thema: "Mathematik", frage: "Was ist 2+2?", antwort: "4" },
    { id: 2, thema: "Geschichte", frage: "Wann fiel die Berliner Mauer?", antwort: "1989" },
    { id: 3, thema: "Biologie", frage: "Was ist die Zellmembran?", antwort: "Schutzhülle der Zelle" },
];

export default function Dashboard () {
    const [questions] = useState<Question[]>(mockQuestions);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [detailQuestion, setDetailQuestion] = useState<Question | null>(null);

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {}

    function toggleSelectAll() {
        if (selectedIds.size === questions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(questions.map(q => q.id)));
        }
    }

    function toggleSelect(id: number) {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    }


    const allSelected = questions.length > 0 && selectedIds.size === questions.length;

    return (
        <div className="flex flex-col p-15">
            <p className="font-semibold text-2xl">Quiz Editor</p>

            <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="bg-secondary p-4 rounded-xl">
                    <h1 className="text-xl text-background">Fragen</h1>
                    <div className="flex flex-row mt-4 w-full gap-4">
                        <button className="py-1 px-3 text-lg font-light bg-accent hover:bg-accent-hover text-background rounded-lg">Filtern</button>
                        <button className="py-1 px-3 text-lg font-light bg-accent hover:bg-accent-hover text-background rounded-lg">Sortieren</button>
                        <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-lg bg-background">
                            <Search className="w-4 h-4 text-text/50" />
                            <input
                                type="text"
                                onChange={handleChange}
                                name="search-question"
                                placeholder="Suchen"
                                className="flex-1 bg-transparent text-text outline-none placeholder:text-text/50"
                            />
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto ">
                        <table className="w-full text-left text-background">
                            <thead>
                            <tr className="border-b border-background/20">
                                <th className="p-2">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 accent-primary cursor-pointer"
                                    />
                                </th>
                                <th className="p-2">ID</th>
                                <th className="p-2">Thema</th>
                                <th className="p-2">Frage</th>
                                <th className="p-2">Antwort</th>
                            </tr>
                            </thead>
                            <tbody>
                            {questions.map((q) => (
                                <tr
                                    key={q.id}
                                    className="border-b border-background/10 hover:bg-background/5 cursor-pointer"
                                    onClick={() => setDetailQuestion(q)}
                                >
                                    <td className="p-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(q.id)}
                                            onChange={() => toggleSelect(q.id)}
                                            className="w-4 h-4 accent-primary cursor-pointer"
                                        />
                                    </td>
                                    <td className="p-2">{q.id}</td>
                                    <td className="p-2">{q.thema}</td>
                                    <td className="p-2">{q.frage}</td>
                                    <td className="p-2">{q.antwort}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-background/70 text-sm mt-2">
                        {selectedIds.size} von {questions.length} ausgewählt
                    </p>
                </div>

                <div className="bg-secondary p-4 rounded-xl">
                    <h1 className="text-xl text-background">Schüler</h1>
                </div>
            </div>

            {/* Popup Modal */}
            {detailQuestion && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setDetailQuestion(null)}
                >
                    <div
                        className="bg-secondary rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-background">Frage #{detailQuestion.id}</h2>
                            <button
                                onClick={() => setDetailQuestion(null)}
                                className="p-1 hover:bg-background/10 rounded-lg"
                            >
                                <X className="w-5 h-5 text-background" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-background/60 mb-1">Thema</p>
                                <p className="font-medium text-background">{detailQuestion.thema}</p>
                            </div>
                            <div>
                                <p className="text-sm text-background/60 mb-1">Frage</p>
                                <p className="font-medium text-background">{detailQuestion.frage}</p>
                            </div>
                            <div>
                                <p className="text-sm text-background/60 mb-1">Antwort</p>
                                <p className="font-medium text-background">{detailQuestion.antwort}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setDetailQuestion(null)}
                            className="mt-6 w-full py-2 bg-primary hover:bg-primary-hover text-background rounded-lg"
                        >
                            Schließen
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
