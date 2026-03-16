import { Check, X } from "lucide-react";
import type { LeaderboardEntry } from "@/types/session";

// Fake-Typen für die Simulation der Frage-Details
type MockAnswer = {
    id: string;
    text: string;
    isCorrect: boolean;
};

type MockQuestionResult = {
    id: string;
    question: string;
    answers: MockAnswer[];
    selectedAnswerId: string; // Die ID der Antwort, die der Schüler gewählt hat
};

// Generiert Fake-Daten basierend auf dem Schüler (damit es etwas dynamisch wirkt)
const getMockData = (studentId: string): MockQuestionResult[] => [
    {
        id: "q1",
        question: "Welcher Planet ist der Sonne am nächsten?",
        selectedAnswerId: "a1", // Richtig gewählt
        answers: [
            { id: "a1", text: "Merkur", isCorrect: true },
            { id: "a2", text: "Venus", isCorrect: false },
            { id: "a3", text: "Mars", isCorrect: false },
            { id: "a4", text: "Erde", isCorrect: false },
        ],
    },
    {
        id: "q2",
        question: "Ist die Erde ein Planet?",
        selectedAnswerId: "b2", // Falsch gewählt (b2 wäre richtig)
        answers: [
            { id: "b1", text: "Ja", isCorrect: true },
            { id: "b2", text: "Nein", isCorrect: false },
        ],
    },
    {
        id: "q3",
        question: "In welchem Jahr fiel die Berliner Mauer?",
        selectedAnswerId: "c2", // Richtig gewählt
        answers: [
            { id: "c1", text: "1987", isCorrect: false },
            { id: "c2", text: "1989", isCorrect: true },
            { id: "c3", text: "1990", isCorrect: false },
        ],
    },
];

export default function StudentQuestionReview({ entry }: { entry: LeaderboardEntry }) {
    const reviewData = getMockData(entry.participant_id);

    return (
        <div className="space-y-6 p-4 border-t ">
            <div className="grid gap-4">
                {reviewData.map((item, index) => {
                    const isCorrectlyAnswered = item.answers.find(a => a.id === item.selectedAnswerId)?.isCorrect;

                    return (
                        <div key={item.id} className="relative pl-4 border-l-2 border-border/50">
                            {/* Indikator am Rand */}
                            <div className={`absolute -left-2.25 top-0 size-4 rounded-full border-2 border-background flex items-center justify-center ${
                                isCorrectlyAnswered ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                            }`}>
                                {isCorrectlyAnswered ? <Check className="size-2.5" /> : <X className="size-2.5" />}
                            </div>

                            {/* Frage Header */}
                            <div className="mb-2">
                                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded mr-2">
                                    Frage {index + 1}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {item.question}
                                </span>
                            </div>

                            {/* Antworten Liste */}
                            <div className="grid gap-2 sm:grid-cols-2">
                                {item.answers.map((answer) => {
                                    const isSelected = answer.id === item.selectedAnswerId;
                                    const isCorrect = answer.isCorrect;

                                    let styleClass = "border-transparent bg-muted/30 text-muted-foreground opacity-70";
                                    let icon = null;

                                    if (isSelected && isCorrect) {
                                        // Schüler hat richtig gewählt
                                        styleClass = "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 font-medium opacity-100 ring-1 ring-emerald-500/20";
                                        icon = <Check className="size-3.5 text-emerald-600" />;
                                    } else if (isSelected && !isCorrect) {
                                        // Schüler hat falsch gewählt
                                        styleClass = "border-red-500/50 bg-red-500/10 text-red-700 font-medium opacity-100 ring-1 ring-red-500/20";
                                        icon = <X className="size-3.5 text-red-600" />;
                                    } else if (!isSelected && isCorrect) {
                                        // Das wäre die richtige Antwort gewesen
                                        styleClass = "border-emerald-500/30 bg-transparent text-emerald-600/80 border-dashed opacity-100";
                                        icon = <Check className="size-3.5 text-emerald-600/50" />;
                                    }

                                    return (
                                        <div
                                            key={answer.id}
                                            className={`relative flex items-center justify-between p-2.5 rounded-lg border text-sm transition-all ${styleClass}`}
                                        >
                                            <span>{answer.text}</span>
                                            {icon}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
