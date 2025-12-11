import { NextResponse } from "next/server";
import { fetchFsOperations } from "@/lib/data-service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const operations = await fetchFsOperations(id);
  return NextResponse.json({ operations });
}
