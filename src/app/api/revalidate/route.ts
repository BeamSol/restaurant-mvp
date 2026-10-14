import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { SITE_TAG } from "@/lib/data";

/**
 * Clears the public website cache. Needed after changing data OUTSIDE the
 * admin (seed script, Supabase Studio). The admin itself refreshes automatically.
 *   curl -X POST https://site/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET"
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidateTag(SITE_TAG, { expire: 0 });
  return NextResponse.json({ ok: true });
}
