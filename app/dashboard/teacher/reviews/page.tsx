"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function TeacherReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/teacher/feedback"); // teacher-specific endpoint
        const data = await res.json();
        setReviews(data || []);
      } catch (error) {
        console.error("Error fetching teacher reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  // ✅ Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating), 0) /
          reviews.length
        ).toFixed(2)
      : null;

  return (
    <DashboardLayout title="My Reviews">
    <div className="min-h-screen p-6 bg-gray-50 space-y-6">
      {/* Average Rating */}
      {avgRating && (
        <div className="text-lg font-semibold">
          Average Rating: <span className="text-blue-600">{avgRating}</span>
        </div>
      )}

      {/* Remarks */}
      <Card className="w-full shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Student Remarks</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.dept}</TableCell>
                    <TableCell>{review.rating} ★</TableCell>
                    <TableCell>{review.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-gray-500 py-6">
              No feedback available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
}
