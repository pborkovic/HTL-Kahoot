import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarLayout } from "@/components/sidebar-layout";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
});

export const metadata: Metadata = {
    title: "GamQuiz",
    description: "Kahoot Clone für den Unterricht",
};

export default async function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const sidebarCookie = cookieStore.get("sidebar_state");
    const sidebarOpen = sidebarCookie ? sidebarCookie.value === "true" : true;

    return (
        <html lang="de">
        <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
            <TooltipProvider>
                <SidebarLayout defaultOpen={sidebarOpen}>
                    {children}
                </SidebarLayout>
            </TooltipProvider>
        </AuthProvider>
        </body>
        </html>
    );
}
