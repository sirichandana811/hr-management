import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, url } = body;
    const session = await getServerSession(authOptions);
    const createdBy = session?.user.id;

    if (!title || !url) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: { title, url, createdBy },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching videos" }, { status: 500 });
  }
}
