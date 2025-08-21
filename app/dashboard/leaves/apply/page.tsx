import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import ApplyLeaveForm from "./ApplyLeaveForm";

export default async function ApplyLeavePage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return <p className="text-red-500">You must be logged in to apply for leave.</p>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      maxCL: true,
      usedCL: true,
      maxSL: true,
      usedSL: true,
      maxPL: true,
      usedPL: true,
    },
  });

  if (!user) {
    return <p className="text-red-500">User not found.</p>;
  }

  const balance = {
    CL: user.maxCL - user.usedCL,
    SL: user.maxSL - user.usedSL,
    PL: user.maxPL - user.usedPL,
  };

  return <ApplyLeaveForm balance={balance} userId={session.user.id} />;
}
