import { NextRequest, NextResponse } from "next/server";
import { getJobStatus } from "@/lib/jobs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const status = await getJobStatus(params.jobId);
  if (!status) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }
  return NextResponse.json(status);
}
