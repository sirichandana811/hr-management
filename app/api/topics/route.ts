import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// Helper to parse Date + Time safely
function parseDateTime(date: string, time?: string | null) {
  if (!time) return null;
  const dt = new Date(`${date}T${time}`);
  return isNaN(dt.getTime()) ? null : dt;
}


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt( "50", 10);
    const q = searchParams.get("q")?.toLowerCase() || "";
    const date = searchParams.get("date");

    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) {
      where.OR = [
        { topic: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
        { className: { contains: q, mode: "insensitive" } },
        { college: { contains: q, mode: "insensitive" } },
        { branch: { contains: q, mode: "insensitive" } },
        { year: { contains: q, mode: "insensitive" } },
        { teacher: { name: { contains: q, mode: "insensitive" } } },
        { teacher: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (date) {
      where.date = {
        gte: new Date(date + "T00:00:00Z"),
        lte: new Date(date + "T23:59:59Z"),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.teachingLog.findMany({
        where,
        skip,
        take: limit,
        include: { teacher: true },
        orderBy: { date: "desc" },
      }),
      prisma.teachingLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}




export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();

    const newLog = await prisma.teachingLog.create({
      data: {
        teacherId: body.teacherId, // must be provided
        className: body.className,
        subject: body.subject,
        topic: body.topic,
        description: body.description || "",
        date: new Date(body.date),
        startTime: parseDateTime(body.date, body.startTime),
        endTime: parseDateTime(body.date, body.endTime),
        year: body.year || null,
        college: body.college || null,
        branch: body.branch || null,
      },
    });

    return Response.json(newLog);
  } catch (err) {
    console.error("POST /api/topics error:", err);
    return new Response("Failed to create log", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();

    const updatedLog = await prisma.teachingLog.update({
      where: { id: body.id },
      data: {
        className: body.className,
        subject: body.subject,
        topic: body.topic,
        description: body.description || "",
        date: new Date(body.date),
        startTime: parseDateTime(body.date, body.startTime),
        endTime: parseDateTime(body.date, body.endTime),
        year: body.year || null,
        college: body.college || null,
        branch: body.branch || null,
      },
    });

    return Response.json(updatedLog);
  } catch (err) {
    console.error("PUT /api/topics error:", err);
    return new Response("Failed to update log", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new Response("Missing id", { status: 400 });

    await prisma.teachingLog.delete({ where: { id } });
    return new Response("Deleted successfully");
  } catch (err) {
    console.error("DELETE /api/topics error:", err);
    return new Response("Failed to delete log", { status: 500 });
  }
}
