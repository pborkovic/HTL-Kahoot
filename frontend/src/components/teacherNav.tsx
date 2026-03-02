"use client";

import { User } from "lucide-react";

interface TeacherNavProps {
    userName?: string;
}

export default function TeacherNav({ userName = "Mensch" }: TeacherNavProps) {

    return (
        <nav className="w-full bg-secondary py-10">
            <div className="mx-8 flex items-center justify-between">
                {/* Logo/Icon + Titel - links */}
                <div className="flex items-center gap-12">
                    <div className="bg-primary p-2 rounded-lg">
                        <User className="w-7 h-7 text-background" />
                    </div>
                    <h1 className="text-xl text-background">
                        Lehrer-Ansicht
                    </h1>
                </div>

                {/* Begrüßung - rechts */}
                <div className="flex items-center gap-2">
                    <span className="text-background font-normal text-lg">Hallo,</span>
                    <span className="text-background font-bold text-lg">{userName}!</span>
                </div>
            </div>
        </nav>
    );
}
