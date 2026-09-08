import { AdminProvider } from "@/app/_lib/admin-context";
import { HomeShell } from "@/app/_components/home-shell";

export default function HomePage() {
  return (
    <AdminProvider>
      <HomeShell />
    </AdminProvider>
  );
}
