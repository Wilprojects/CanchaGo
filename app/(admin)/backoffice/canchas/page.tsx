import {
  AdminCourtManager,
} from "@/features/courts/components/admin-court-manager";

export const metadata = {
  title:
    "Gestión de canchas",
};

export default function AdminCourtsPage() {
  return (
    <AdminCourtManager />
  );
}