"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  teacher: { id: string; name: string | null; email: string };
  reviewer: { id: string; name: string | null; email: string };
};

export default function HrReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/hr/reviews").then(r => r.json()).then(setReviews);
  }, []);

  async function del(id: string) {
    if (!confirm("Delete review?")) return;
    const r = await fetch(`/api/hr/reviews/${id}`, { method: "DELETE" });
    if (r.ok) setReviews(prev => prev.filter(x => x.id !== id));
  }

  const filtered = reviews.filter(r =>
    (r.teacher.name || "").toLowerCase().includes(q.toLowerCase()) ||
    r.teacher.email.toLowerCase().includes(q.toLowerCase()) ||
    (r.comment || "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <DashboardLayout title="Teacher Reviews">
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search by teacher or comment"
          className="max-w-md"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button asChild><Link href="/dashboard/hr/reviews/new">New Review</Link></Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.teacher.name || r.teacher.email}</TableCell>
              <TableCell>{r.rating}</TableCell>
              <TableCell className="max-w-[400px] truncate">{r.comment || "-"}</TableCell>
              <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
              <TableCell className="space-x-2">
                {/* Optional: link to an edit page if you want */}
                <Button variant="destructive" size="sm" onClick={() => del(r.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardLayout>
  );
}
