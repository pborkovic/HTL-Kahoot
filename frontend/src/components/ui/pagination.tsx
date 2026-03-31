"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { PaginationMeta } from "@/types/question";

interface PaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
    const { current_page, last_page, total, per_page } = meta;

    if (last_page <= 1) return null;

    const from = (current_page - 1) * per_page + 1;
    const to = Math.min(current_page * per_page, total);

    const pages = buildPageList(current_page, last_page);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">
                {from}&ndash;{to} von {total}
            </p>

            <div className="flex items-center gap-1">
                <PageButton
                    onClick={() => onPageChange(1)}
                    disabled={current_page === 1}
                    aria-label="Erste Seite"
                >
                    <ChevronsLeft className="size-3.5" />
                </PageButton>
                <PageButton
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    aria-label="Vorherige Seite"
                >
                    <ChevronLeft className="size-3.5" />
                </PageButton>

                {pages.map((p, i) =>
                    p === "..." ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="w-8 text-center text-xs text-muted-foreground select-none"
                        >
                            &hellip;
                        </span>
                    ) : (
                        <PageButton
                            key={p}
                            onClick={() => onPageChange(p)}
                            active={p === current_page}
                        >
                            {p}
                        </PageButton>
                    ),
                )}

                <PageButton
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    aria-label="Nächste Seite"
                >
                    <ChevronRight className="size-3.5" />
                </PageButton>
                <PageButton
                    onClick={() => onPageChange(last_page)}
                    disabled={current_page === last_page}
                    aria-label="Letzte Seite"
                >
                    <ChevronsRight className="size-3.5" />
                </PageButton>
            </div>
        </div>
    );
}

function PageButton({
    children,
    onClick,
    disabled = false,
    active = false,
    ...rest
}: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
                inline-flex items-center justify-center size-8 rounded-lg text-xs font-medium transition-colors
                ${active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }
                disabled:opacity-40 disabled:pointer-events-none cursor-pointer
            `}
            {...rest}
        >
            {children}
        </button>
    );
}

function buildPageList(current: number, last: number): (number | "...")[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(last - 1, current + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (current < last - 2) pages.push("...");

    pages.push(last);

    return pages;
}
