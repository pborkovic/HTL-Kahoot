import { cookies } from "next/headers";
import { SidebarLayout } from "@/components/sidebar-layout";

export default async function SessionLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const sidebarCookie = cookieStore.get("sidebar_state");
    const sidebarOpen = sidebarCookie ? sidebarCookie.value === "true" : true;

    return (
        <SidebarLayout defaultOpen={sidebarOpen}>
            {children}
        </SidebarLayout>
    );
}
