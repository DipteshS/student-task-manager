export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const siteName = "Student Task Manager";
export const siteDescription =
  "Organize coursework, deadlines, and priorities in one place — with courses, tags, recurring tasks, a calendar and board view, and progress analytics.";
