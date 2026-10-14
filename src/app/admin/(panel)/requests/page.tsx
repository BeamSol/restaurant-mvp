import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import RequestsAdmin from "@/components/admin/RequestsAdmin";
import { PageTitle } from "@/components/admin/ui";

export default async function RequestsPage() {
  const admin = await requirePageAdmin();
  const db = await userClient();
  const [requests, branches] = await Promise.all([
    db.from("requests").select("*").order("created_at", { ascending: false }).limit(300),
    db.from("branches").select("id, name").order("sort"),
  ]);
  return (
    <>
      <PageTitle title="Bookings & enquiries" lead="Table bookings and catering enquiries sent from the website. Call or WhatsApp the guest, then confirm." />
      <RequestsAdmin requests={requests.data ?? []} branches={branches.data ?? []} role={admin.role} />
    </>
  );
}
