export async function GetDashboardData() {
    const questions = await fetch('api url');
    const students = await fetch('api url');

    return { questions, students };
}
