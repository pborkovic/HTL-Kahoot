"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/teacher/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";

/**
 * Properties for the SidebarLayout component.
 */
interface SidebarLayoutProps {
    /** The content to be rendered within the layout. */
    children: React.ReactNode;
    /** Whether the sidebar should be open by default. */
    defaultOpen: boolean;
}

/**
 * A layout component that provides a sidebar on desktop and a mobile navigation bar.
 * It uses the SidebarProvider to manage the state of the sidebar and wraps the
 * main content in a SidebarInset.
 *
 * @param {SidebarLayoutProps} props - The properties for the component.
 * @param {React.ReactNode} props.children - The content to be rendered within the layout.
 * @param {boolean} props.defaultOpen - Whether the sidebar should be open by default.
 * @returns {JSX.Element} The rendered sidebar layout.
 */
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
