"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/dashboard-layout";

interface LeaveType {
  id: string;
  name: string;
  description: string;
  limit: number;
  used: number;
}

export default function TeacherLeaveTypesPage() {
  const { data: session } = useSession();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/teacher/leave-types")
      .then((res) => res.json())
      .then((data) => {
        setLeaveTypes(data);
        setLoading(false);
      });
  }, [session]);

  if (!session?.user) return <p className="p-4">Loading...</p>;

  return (
    <DashboardLayout title="Leave Types">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Leave Types</h1>
        {loading ? (
          <p>Loading leave types...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Limit</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveTypes.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.name}</TableCell>
                  <TableCell>{leave.description}</TableCell>
                  <TableCell>{leave.limit}</TableCell>
                  <TableCell>{leave.used}</TableCell>
                  <TableCell>{leave.limit - leave.used}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
}
