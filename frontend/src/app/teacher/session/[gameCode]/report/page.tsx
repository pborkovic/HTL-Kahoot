"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    FileBarChart,
    ArrowLeft,
    Target,
    Clock,
    Trophy,
    Users,
    Check,
    X,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StudentDetailDialog } from "@/components/teacher/report/student-detail-dialog";
import type { SessionReport, ReportParticipant } from "@/types/report";

type SortField = "rank" | "nickname" | "accuracy" | "avg_time";
type SortDir = "asc" | "desc";

function formatTime(ms: number | null): string {
    if (ms === null) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ReportPage() {
    const { gameCode } = useParams<{ gameCode: string }>();
    const router = useRouter();

    const [report, setReport] = useState<SessionReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedParticipant, setSelectedParticipant] = useState<ReportParticipant | null>(null);
    const [sortField, setSortField] = useState<SortField>("rank");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    useEffect(() => {
        apiFetch<{ data: SessionReport }>(`/v1/sessions/${gameCode}/report`)
            .then((res) => setReport(res.data))
            .catch((err) => console.error("Failed to load report:", err))
            .finally(() => setIsLoading(false));
    }, [gameCode]);

    function handleSort(field: SortField) {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir(field === "rank" ? "asc" : "desc");
        }
    }

    const sortedParticipants = useMemo(() => {
        if (!report) return [];
        const list = [...report.participants];
        const dir = sortDir === "asc" ? 1 : -1;
        list.sort((a, b) => {
            switch (sortField) {
                case "rank":
                    return (a.rank - b.rank) * dir;
                case "nickname":
                    return a.nickname.localeCompare(b.nickname) * dir;
                case "accuracy":
                    return (a.accuracy - b.accuracy) * dir;
                case "avg_time":
                    return ((a.avg_time_ms ?? Infinity) - (b.avg_time_ms ?? Infinity)) * dir;
                default:
                    return 0;
            }
        });
        return list;
    }, [report, sortField, sortDir]);

    const avgTime = useMemo(() => {
        if (!report) return null;
        const withTime = report.participants.filter((p) => p.avg_time_ms !== null);
        if (withTime.length === 0) return null;
        return Math.round(withTime.reduce((s, p) => s + (p.avg_time_ms ?? 0), 0) / withTime.length);
    }, [report]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="size-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Report konnte nicht geladen werden.</p>
            </div>
        );
    }

    const highScore = report.participants.length > 0 ? report.participants[0].total_score : 0;

    return (
        <div className="flex-1">
            <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1200px]">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                        <FileBarChart className="size-4.5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Report
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {report.quiz_title} — {formatDate(report.started_at)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-border hover:bg-muted transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="size-3.5" />
                        Zurück
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold tabular-nums text-foreground">{report.total_questions}</p>
                        <p className="text-xs text-muted-foreground mt-1">Fragen</p>
                    </div>
                    <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold tabular-nums text-foreground">{report.total_participants}</p>
                        <p className="text-xs text-muted-foreground mt-1">Teilnehmer</p>
                    </div>
                    <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold tabular-nums text-foreground">{highScore.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">Highscore</p>
                    </div>
                    <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold tabular-nums text-foreground">{formatTime(avgTime)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Ø Antwortzeit</p>
                    </div>
                </div>

                {/* Participants table */}
                <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
                    <div className="px-4 sm:px-5 py-3 border-b border-border/40 flex items-center gap-2">
                        <Users className="size-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-foreground">Teilnehmer</h3>
                        <span className="text-xs text-muted-foreground ml-auto">
                            Klicke auf einen Schüler für Details
                        </span>
                    </div>

                    {report.participants.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">Keine Teilnehmer vorhanden.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/40">
                                        <SortHeader field="rank" current={sortField} dir={sortDir} onSort={handleSort} className="w-14 pl-4 sm:pl-5">
                                            #
                                        </SortHeader>
                                        <SortHeader field="nickname" current={sortField} dir={sortDir} onSort={handleSort} className="text-left">
                                            Name
                                        </SortHeader>
                                        <th className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground h-9 px-3 text-center">
                                            Punkte
                                        </th>
                                        <SortHeader field="accuracy" current={sortField} dir={sortDir} onSort={handleSort} className="text-center">
                                            %
                                        </SortHeader>
                                        <th className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground h-9 px-3 text-center">
                                            Richtig
                                        </th>
                                        <SortHeader field="avg_time" current={sortField} dir={sortDir} onSort={handleSort} className="text-center pr-4 sm:pr-5">
                                            Ø Zeit
                                        </SortHeader>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedParticipants.map((p) => (
                                        <tr
                                            key={p.participant_id}
                                            className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => setSelectedParticipant(p)}
                                        >
                                            <td className="py-2.5 pl-4 sm:pl-5 text-center">
                                                <span className={`text-xs font-bold tabular-nums ${
                                                    p.rank === 1 ? "text-amber-500" :
                                                    p.rank === 2 ? "text-gray-400" :
                                                    p.rank === 3 ? "text-amber-700" :
                                                    "text-muted-foreground"
                                                }`}>
                                                    {p.rank}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className="text-sm font-medium text-foreground">{p.nickname}</span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className="text-sm font-bold tabular-nums text-foreground">
                                                    {p.total_score.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                p.accuracy >= 80 ? "bg-emerald-500" :
                                                                p.accuracy >= 50 ? "bg-amber-500" :
                                                                "bg-red-500"
                                                            }`}
                                                            style={{ width: `${p.accuracy}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs tabular-nums font-medium ${
                                                        p.accuracy >= 80 ? "text-emerald-600" :
                                                        p.accuracy >= 50 ? "text-amber-600" :
                                                        "text-red-600"
                                                    }`}>
                                                        {p.accuracy}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Check className="size-3 text-emerald-500" />
                                                    <span className="text-xs tabular-nums text-foreground">
                                                        {p.correct_count}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">/</span>
                                                    <span className="text-xs tabular-nums text-muted-foreground">
                                                        {report.total_questions}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 pr-4 sm:pr-5 text-center">
                                                <span className="text-xs tabular-nums text-muted-foreground flex items-center justify-center gap-1">
                                                    <Clock className="size-2.5" />
                                                    {formatTime(p.avg_time_ms)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Question overview */}
                <QuestionOverview report={report} />
            </div>

            <StudentDetailDialog
                participant={selectedParticipant}
                totalQuestions={report.total_questions}
                onClose={() => setSelectedParticipant(null)}
            />
        </div>
    );
}

function SortHeader({
    field,
    current,
    dir,
    onSort,
    className = "",
    children,
}: {
    field: SortField;
    current: SortField;
    dir: SortDir;
    onSort: (f: SortField) => void;
    className?: string;
    children: React.ReactNode;
}) {
    const isActive = current === field;
    return (
        <th
            className={`text-[10px] font-medium uppercase tracking-widest text-muted-foreground h-9 px-3 cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
            onClick={() => onSort(field)}
        >
            <span className="inline-flex items-center gap-0.5">
                {children}
                {isActive && (
                    dir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                )}
            </span>
        </th>
    );
}

function QuestionOverview({ report }: { report: SessionReport }) {
    if (report.total_questions === 0 || report.participants.length === 0) return null;

    const questionStats = Array.from({ length: report.total_questions }, (_, qi) => {
        let correctCount = 0;
        let answeredCount = 0;
        let questionText = "";

        for (const p of report.participants) {
            const q = p.questions.find((q) => q.question_index === qi);
            if (q) {
                questionText = q.question_text;
                if (q.is_correct !== null) {
                    answeredCount++;
                    if (q.is_correct) correctCount++;
                }
            }
        }

        const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

        return { index: qi, text: questionText, correctCount, answeredCount, accuracy };
    });

    return (
        <div className="bg-card border border-border/60 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
                <Target className="size-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Fragen-Übersicht</h3>
            </div>

            <div className="space-y-2">
                {questionStats.map((qs) => (
                    <div key={qs.index} className="flex items-center gap-3">
                        <span className="text-[10px] tabular-nums text-muted-foreground/60 w-5 text-right shrink-0">
                            {qs.index + 1}
                        </span>
                        <span className="text-xs text-foreground truncate flex-1 min-w-0">
                            {qs.text}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${
                                        qs.accuracy >= 80 ? "bg-emerald-500" :
                                        qs.accuracy >= 50 ? "bg-amber-500" :
                                        "bg-red-500"
                                    }`}
                                    style={{ width: `${qs.accuracy}%` }}
                                />
                            </div>
                            <span className="text-[10px] tabular-nums text-muted-foreground w-10 text-right">
                                {qs.accuracy}%
                            </span>
                            <span className="text-[10px] tabular-nums text-muted-foreground/60 w-10">
                                ({qs.correctCount}/{qs.answeredCount})
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
