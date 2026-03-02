import { User } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";

export default function TeacherNav() {
    return (
        <nav className="w-full bg-secondary py-10">
            <div className="mx-8 flex items-center justify-between">
                {/* Logo/Icon + Titel - links */}
                <div className="flex items-center gap-12">
                    <div className="bg-primary p-2 rounded-lg">
                        <User className="w-7 h-7 text-text-inverse" />
                    </div>
                    <h1 className="text-xl text-text-inverse">
                        Lehrer-Ansicht
                    </h1>
                </div>

                {/* Begrüßung + Theme Switcher - rechts */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-text-inverse font-normal text-lg">Hallo,</span>
                        <span className="text-text-inverse font-bold text-lg">Benjamin!</span>
                    </div>
                    <ThemeSelector />
                </div>
            </div>
        </nav>
    );
}
