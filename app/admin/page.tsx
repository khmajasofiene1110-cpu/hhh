import { AdminGuard } from "@/components/admin/AdminGuard";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
