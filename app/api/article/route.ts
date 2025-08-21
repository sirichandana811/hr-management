import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;
    const session = await getServerSession(authOptions);
    const createdBy = session?.user.id;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: { title, content, createdBy },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching articles" }, { status: 500 });
  }
}
