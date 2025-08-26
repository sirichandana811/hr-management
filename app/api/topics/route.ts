import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all teaching logs
export async function GET() {
  try {
    const logs = await prisma.teachingLog.findMany({
      orderBy: { date: "desc" },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // convert Date objects to ISO strings
    const data = logs.map((log) => ({
      ...log,
      topic: log.topic, 
      taughtDate: log.date.toISOString(),
      startTime: log.startTime ? log.startTime.toISOString() : null,
      endTime: log.endTime ? log.endTime.toISOString() : null,
      updatedAt: log.updatedAt ? log.updatedAt.toISOString() : null,
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

// POST create new teaching log
// app/api/topics/route.ts

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const teacherId = body.teacherId;

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    // Base data
    const data: any = {
      teacher: { connect: { id: teacherId } },
      className: body.className,
      subject: body.subject,
      topic: body.topic,
      description: body.description,
      date: new Date(body.date),
    };

    // Only include valid startTime
    if (body.startTime) {
      const startDate = new Date(`${body.date}T${body.startTime}`);
      if (!isNaN(startDate.getTime())) data.startTime = startDate;
    }

    // Only include valid endTime
    if (body.endTime) {
      const endDate = new Date(`${body.date}T${body.endTime}`);
      if (!isNaN(endDate.getTime())) data.endTime = endDate;
    }

    const newLog = await prisma.teachingLog.create({
      data,
      include: { teacher: true },
    });

    return NextResponse.json(newLog);
  } catch (err) {
    console.error("Error saving topic:", err);
    return NextResponse.json({ error: "Failed to save topic" }, { status: 500 });
  }
}


// PUT update teaching log
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updatedLog = await prisma.teachingLog.update({
      where: { id: body.id },
      data: {
        className: body.className,
        subject: body.subject,
        topic: body.topic,
        description: body.description || "",
        date: new Date(body.date),
        startTime: body.startTime ? new Date(body.startTime) : null,
        endTime: body.endTime ? new Date(body.endTime) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedLog);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.teachingLog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete log" }, { status: 500 });
  }
}
