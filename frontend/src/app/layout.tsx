import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import React from "react";

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
    return (
        <html lang="de">
        <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
            <AuthProvider>
                <TooltipProvider>
                    {children}
                </TooltipProvider>
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
