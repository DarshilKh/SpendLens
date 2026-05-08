import { NextRequest, NextResponse } from "next/server";
import { getAuditBySlug } from "@/lib/db/supabase";
import type { AuditResult } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || slug.length > 20) {
    return NextResponse.json({ success: false, error: "Invalid slug" }, { status: 400 });
  }

  const stored = await getAuditBySlug(slug);

  if (!stored) {
    return NextResponse.json({ success: false, error: "Audit not found" }, { status: 404 });
  }

  // Strip identifying info for public view
  const publicResult: AuditResult = {
    ...stored.result,
    id: stored.id,
    shareSlug: stored.share_slug,
    formData: {
      tools: stored.form_data.tools,
      teamSize: stored.form_data.teamSize,
      useCase: stored.form_data.useCase,
      // companyName stripped intentionally
    },
  };

  return NextResponse.json(
    { success: true, data: publicResult },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
