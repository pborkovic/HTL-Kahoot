"use client";

import type { ChangeEvent, DragEvent, ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import {
  Download,
  FileUp,
  FileJson,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiUpload, ApiError } from "@/lib/api";
import type { Question } from "@/types/question";

interface MassManagementDialogProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  selectedIds: Set<string>;
  onImportComplete: () => void;
}

interface ImportAnswerOption {
  text: string;
  is_correct?: boolean;
  sort_order?: number;
}

interface ExportQuestion {
  type: string;
  title: string;
  explanation?: string | null;
  difficulty?: number | null;
  default_points?: number | null;
  default_time_limit?: number | null;
  answer_options?: ImportAnswerOption[];
}

interface ImportResponse {
  imported: number;
  failed: number;
  errors: string[];
  questions: unknown[];
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

type ImportStatus = "idle" | "importing" | "done" | "error";

type ImportFormat = "json" | "gift";

const ACCEPTED_EXTENSIONS: Record<ImportFormat, string[]> = {
  json: [".json"],
  gift: [".gift", ".txt"],
};

const ACCEPT_STRING: string = ".json,.gift,.txt";

function detectFormat(file: File): ImportFormat {
  const name: string = file.name.toLowerCase();
  if (name.endsWith(".gift")) return "gift";
  if (name.endsWith(".txt")) return "gift";
  return "json";
}

export function MassManagementDialog({
  open,
  onClose,
  questions,
  selectedIds,
  onImportComplete,
}: MassManagementDialogProps): ReactNode {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback((): void => {
    setImportStatus("idle");
    setImportResult(null);
    setImportError(null);
  }, []);

  const handleClose = useCallback((): void => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const uploadAndImport = useCallback(
    async (file: File): Promise<void> => {
      setImportStatus("importing");
      setImportError(null);
      setImportResult(null);

      const format: ImportFormat = detectFormat(file);

      try {
        const formData: FormData = new FormData();
        formData.append("file", file);
        formData.append("format", format);

        const response: ImportResponse = await apiUpload<ImportResponse>(
          "/v1/questions/import",
          formData,
        );

        const result: ImportResult = {
          total: response.imported + response.failed,
          success: response.imported,
          failed: response.failed,
          errors: response.errors,
        };

        setImportResult(result);
        setImportStatus("done");

        if (result.success > 0) {
          onImportComplete();
        }
      } catch (err: unknown) {
        const msg: string =
          err instanceof ApiError ? err.message : "Fehler beim Import.";
        setImportError(msg);
        setImportStatus("error");
      }
    },
    [onImportComplete],
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const file: File | undefined = e.target.files?.[0];
      if (file) {
        void uploadAndImport(file);
      }
      e.target.value = "";
    },
    [uploadAndImport],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      setIsDragging(false);
      const file: File | undefined = e.dataTransfer.files[0];
      if (file) {
        void uploadAndImport(file);
      }
    },
    [uploadAndImport],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleExport = useCallback((): void => {
    const questionsToExport: Question[] =
      selectedIds.size > 0
        ? questions.filter((q: Question): boolean => selectedIds.has(q.id))
        : questions;

    const exportData: ExportQuestion[] = questionsToExport.map(
      (q: Question): ExportQuestion => {
        const v = q.current_version;
        return {
          type: q.type,
          title: v?.title ?? "",
          explanation: v?.explanation ?? null,
          difficulty: v?.difficulty ?? null,
          default_points: v?.default_points ?? 1000,
          default_time_limit: v?.default_time_limit ?? null,
          answer_options:
            v?.answer_options?.map(
              (opt): ImportAnswerOption => ({
                text: opt.text,
                is_correct: opt.is_correct,
                sort_order: opt.sort_order,
              }),
            ) ?? [],
        };
      },
    );

    const blob: Blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url: string = URL.createObjectURL(blob);
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = url;
    link.download = `fragen-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [questions, selectedIds]);

  return (
    <Dialog open={open} onOpenChange={(o: boolean): void => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Fragen Import / Export
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Import section */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2.5">
              Importieren
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              className="hidden"
              onChange={handleFileSelect}
            />

            {importStatus === "idle" && (
              <div
                role="button"
                tabIndex={0}
                onClick={(): void => fileInputRef.current?.click()}
                onKeyDown={(e): void => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  flex flex-col items-center justify-center gap-3 p-8
                  rounded-xl border-2 border-dashed cursor-pointer
                  transition-all duration-200
                  ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                  }
                `}
              >
                <div
                  className={`size-10 rounded-lg flex items-center justify-center transition-colors ${
                    isDragging ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <FileUp
                    className={`size-5 ${isDragging ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Datei hierher ziehen
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    oder klicken zum Auswählen
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <FileJson className="size-3" />
                      JSON
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <FileText className="size-3" />
                      Moodle GIFT
                    </span>
                  </div>
                </div>
              </div>
            )}

            {importStatus === "importing" && (
              <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border border-border/60 bg-muted/20">
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Fragen werden importiert...
                </p>
              </div>
            )}

            {importStatus === "done" && importResult && (
              <div className="rounded-xl border border-border/60 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <p className="text-sm font-medium text-foreground">
                    Import abgeschlossen
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-muted-foreground">
                    Gesamt:{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {importResult.total}
                    </span>
                  </span>
                  <span className="text-emerald-600">
                    Erfolgreich:{" "}
                    <span className="font-medium tabular-nums">
                      {importResult.success}
                    </span>
                  </span>
                  {importResult.failed > 0 && (
                    <span className="text-red-500">
                      Fehlgeschlagen:{" "}
                      <span className="font-medium tabular-nums">
                        {importResult.failed}
                      </span>
                    </span>
                  )}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1 text-xs text-red-500">
                    {importResult.errors.map(
                      (err: string, i: number): ReactNode => (
                        <p key={i}>{err}</p>
                      ),
                    )}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={resetState}
                >
                  Weitere importieren
                </Button>
              </div>
            )}

            {importStatus === "error" && importError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 text-red-500" />
                  <p className="text-sm font-medium text-red-600">
                    Import fehlgeschlagen
                  </p>
                </div>
                <p className="text-xs text-red-500">{importError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={resetState}
                >
                  Erneut versuchen
                </Button>
              </div>
            )}
          </div>

          {/* Export section */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2.5">
              Exportieren
            </p>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/60">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-muted flex items-center justify-center">
                  <FileJson className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedIds.size > 0
                      ? `${selectedIds.size} ausgewählte Fragen`
                      : `Alle ${questions.length} Fragen`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Als JSON-Datei herunterladen
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={handleExport}
                disabled={questions.length === 0}
              >
                <Download className="size-3" />
                Export
              </Button>
            </div>
          </div>

          {/* Format hints */}
          <details className="group">
            <summary className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors">
              Formatbeispiele anzeigen
            </summary>
            <div className="mt-2 space-y-3">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1">JSON</p>
                <pre className="p-3 rounded-lg bg-muted text-[11px] font-mono text-foreground/70 overflow-x-auto leading-relaxed">
{`[
  {
    "type": "multiple_choice",
    "title": "Was ist 2 + 2?",
    "answer_options": [
      { "text": "3", "is_correct": false },
      { "text": "4", "is_correct": true }
    ]
  }
]`}
                </pre>
              </div>
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1">Moodle GIFT</p>
                <pre className="p-3 rounded-lg bg-muted text-[11px] font-mono text-foreground/70 overflow-x-auto leading-relaxed">
{`::Hauptstadt::Was ist die Hauptstadt
von Frankreich?{
  =Paris
  ~London
  ~Berlin
  ~Madrid
}

::Wahr/Falsch::Die Erde ist rund.{TRUE}`}
                </pre>
              </div>
            </div>
          </details>

          <Button
            variant="outline"
            className="w-full h-9 text-xs"
            onClick={handleClose}
          >
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
