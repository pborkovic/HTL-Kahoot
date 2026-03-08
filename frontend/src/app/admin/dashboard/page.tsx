"use client";

import { LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="flex-1">
            <div className="flex flex-col gap-4 sm:gap-5 p-4 sm:p-6 lg:p-8 mx-auto max-w-[1920px]">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-foreground flex items-center justify-center">
                        <LayoutDashboard className="size-4.5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Admin Dashboard
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Systemübersicht und Verwaltung.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
