import { requirePageAdmin } from "@/lib/admin/auth";
import { userClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/admin/ui";

export default async function ActivityPage() {
  await requirePageAdmin("OWNER");
  const db = await userClient();
  const { data } = await db.from("activity_log").select("*").order("created_at", { ascending: false }).limit(200);
  return (
    <>
      <PageTitle title="Activity log" lead="Who changed what, newest first (last 200 changes)." />
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-border text-[12px] text-muted uppercase">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Who</th>
              <th className="p-3">What</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(data ?? []).map((a) => (
              <tr key={a.id}>
                <td className="p-3 whitespace-nowrap text-muted">{new Date(a.created_at).toLocaleString("en-GB", { timeZone: "Africa/Addis_Ababa", dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="p-3">{a.email}</td>
                <td className="p-3">{a.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
