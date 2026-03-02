import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import TeacherNav from "@/components/teacherNav";

interface LayoutProps {
    children: ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    let userName = "Mensch";

    if (userCookie?.value) {
        try {
            const parsed = JSON.parse(userCookie.value);
            userName = parsed.name ?? "Mensch";
        } catch {
            userName = userCookie.value;
        }
    }

    return (
        <div className="min-h-screen">
            <TeacherNav userName={userName} />
            {children}
        </div>
    );
}
