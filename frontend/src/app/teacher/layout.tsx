"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/teacher/app-sidebar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-12 items-center border-b border-border/60 px-4 bg-card">
                    <SidebarTrigger className="-ml-1" />
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
