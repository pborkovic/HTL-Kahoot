import { Loader2, FileText, Users, Play, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Quiz } from "@/types/quiz";

interface QuizTableProps {
    readonly quizzes: Quiz[];
    readonly loading: boolean;
    readonly error: string | null;
    readonly onViewDetail: (quiz: Quiz) => void;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function statusLabel(status: string): string {
    switch (status) {
        case "lobby": return "Lobby";
        case "active": return "Aktiv";
        case "finished": return "Beendet";
        default: return status;
    }
}

function statusColor(status: string): string {
    switch (status) {
        case "finished": return "border-emerald-300/60 text-emerald-600 bg-emerald-500/5";
        case "active": return "border-amber-300/60 text-amber-600 bg-amber-500/5";
        case "lobby": return "border-blue-300/60 text-blue-600 bg-blue-500/5";
        default: return "text-muted-foreground border-border/40";
    }
}

export function QuizTable({ quizzes, loading, error, onViewDetail }: QuizTableProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="size-4 animate-spin mr-2" />
                <span className="text-xs">Quizze werden geladen...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-xs text-destructive rounded-xl backdrop-blur-sm bg-destructive/5 border border-destructive/15 px-3 py-2">
                {error}
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <FileText className="size-8 text-muted-foreground/30" />
                <p className="text-xs">Noch keine Quizze vorhanden</p>
            </div>
        );
    }

    return (
        <div className="backdrop-blur-xl bg-card/60 dark:bg-card/40 border border-primary/15 rounded-2xl shadow-xl shadow-primary/5 overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 z-10">
                    <TableRow className="bg-muted/60 backdrop-blur-md hover:bg-muted/60 border-b border-border/30">
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground h-8">
                            Quiz
                        </TableHead>
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground h-8 text-center w-20">
                            Fragen
                        </TableHead>
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground h-8 text-center w-20">
                            Schüler
                        </TableHead>
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground h-8 text-center w-24">
                            Gespielt
                        </TableHead>
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground h-8 w-28">
                            Letzte Session
                        </TableHead>
                        <TableHead className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground h-8 w-24">
                            Erstellt
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quizzes.map((quiz) => (
                        <TableRow
                            key={quiz.id}
                            className="cursor-pointer hover:bg-primary/[0.03] transition-colors duration-150 border-b border-border/20"
                            onClick={() => onViewDetail(quiz)}
                        >
                            <TableCell className="py-3">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-medium text-foreground truncate max-w-[300px]">
                                        {quiz.title}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {quiz.is_published ? (
                                            <Badge variant="outline" className="text-[9px] border-emerald-300/60 text-emerald-600 bg-emerald-500/5">
                                                Veröffentlicht
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[9px] text-muted-foreground border-border/40">
                                                Entwurf
                                            </Badge>
                                        )}
                                        {quiz.randomize_questions && (
                                            <Badge variant="outline" className="text-[9px] text-muted-foreground border-border/40">
                                                Zufällig
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <span className="text-xs tabular-nums text-muted-foreground">
                                    {quiz.quiz_questions_count ?? 0}
                                </span>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Users className="size-2.5 text-muted-foreground/50" />
                                    <span className="text-xs tabular-nums text-muted-foreground">
                                        {quiz.participants_count ?? 0}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Play className="size-2.5 text-muted-foreground/50" />
                                    <span className="text-xs tabular-nums text-muted-foreground">
                                        {quiz.sessions_count ?? 0}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {quiz.latest_session ? (
                                    <Badge variant="outline" className={`text-[9px] ${statusColor(quiz.latest_session.status)}`}>
                                        {statusLabel(quiz.latest_session.status)}
                                    </Badge>
                                ) : (
                                    <span className="text-[10px] text-muted-foreground/50">—</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="size-2.5" />
                                    <span className="text-[10px] tabular-nums">
                                        {formatDate(quiz.created_at)}
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
