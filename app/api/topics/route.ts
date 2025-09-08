import { prisma } from "@/lib/prisma";

// Helper to parse Date + Time safely
function parseDateTime(date: string, time?: string | null) {
  if (!time) return null;
  const dt = new Date(`${date}T${time}`);
  return isNaN(dt.getTime()) ? null : dt;
}

export async function GET() {
  try {
    const logs = await prisma.teachingLog.findMany({
      orderBy: { date: "desc" },
      include: { teacher: true },
    });
    return Response.json(logs);
  } catch (err) {
    console.error("GET /api/topics error:", err);
    return new Response("Failed to fetch logs", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
