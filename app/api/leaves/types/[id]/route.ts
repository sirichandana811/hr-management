// app/api/leaves/types/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// app/api/leaves/types/[id]/route.ts


interface Params {
  params: { id: string };
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name, limit, description } = await req.json();
    const { id } = await params;

    if (!name || !limit) {
      return NextResponse.json({ error: "Name and limit are required" }, { status: 400 });
    }

    const updated = await prisma.leaveType.update({
      where: { id },
      data: { name, limit, description },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// app/api/leaves/types/[id]/route.ts


interface Params {
  params: { id: string };
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } =  await params;

    // Delete leave balances first to avoid FK constraint
    await prisma.leaveBalance.deleteMany({
      where: { leaveTypeId: id },
    });

    // Delete leave requests for this type
    await prisma.leaveRequest.deleteMany({
      where: { leaveTypeId: id },
    });

    const deleted = await prisma.leaveType.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted successfully", deleted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
