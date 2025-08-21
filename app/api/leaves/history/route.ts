// app/api/leaves/history/route.ts
import { getServerSession } from "next-auth";
import  {authOptions} from "@/lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }

    const userId = session.user.id;

    const leaves = await prisma.leave.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    return new Response(JSON.stringify(leaves), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch leave history" }), { status: 500 });
  }
}