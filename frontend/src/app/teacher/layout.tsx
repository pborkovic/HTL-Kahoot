import { ReactNode } from 'react';
import TeacherNav from "@/components/teacherNav";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen">
            <TeacherNav />
            {children}
        </div>
    );
}
