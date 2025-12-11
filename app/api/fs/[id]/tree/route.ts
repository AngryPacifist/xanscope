import { NextResponse } from "next/server";
import { fetchFsTree } from "@/lib/data-service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const tree = await fetchFsTree(id);
  return NextResponse.json({ tree });
}
