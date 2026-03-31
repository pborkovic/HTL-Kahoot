"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/teacher/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";

interface SidebarLayoutProps {
    children: React.ReactNode;
    defaultOpen: boolean;
}

export function SidebarLayout({ children, defaultOpen }: SidebarLayoutProps) {
    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset>
                <div className="pb-16 md:pb-0">
                    {children}
                </div>
            </SidebarInset>
            <MobileNav />
        </SidebarProvider>
    );
}
