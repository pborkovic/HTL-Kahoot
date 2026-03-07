"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/teacher/app-sidebar";

interface SidebarLayoutProps {
    children: React.ReactNode;
    defaultOpen: boolean;
}

export function SidebarLayout({ children, defaultOpen }: SidebarLayoutProps) {
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
