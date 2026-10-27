import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { SESSION_COOKIE } from "@/lib/auth/requireUser";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  if (!session) redirect("/login");

  let uid: string;
  try {
    const decoded = await adminAuth().verifySessionCookie(session, true);
    uid = decoded.uid;
  } catch {
    redirect("/login");
  }

  const userSnap = await adminDb().doc(`users/${uid}`).get();
  const username = userSnap.data()?.username;
  if (!username) redirect("/setup");

  return <AppShell>{children}</AppShell>;
}
