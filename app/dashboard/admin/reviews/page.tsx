"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Switch } from "@/components/ui/switch";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  visibleToTeacher: boolean;
  reviewer: User;
  teacher: User;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalVisible, setGlobalVisible] = useState(false);

  // ✅ Fetch reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        setGlobalVisible(data.visible);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ✅ Toggle global visibility
  const handleToggleVisibility = async () => {
    try {
      const res = await fetch("/api/admin/reviews-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !globalVisible }),
      });
      if (res.ok) {
        setGlobalVisible(!globalVisible);
        fetchReviews(); // Refresh reviews to reflect changes
      } else {
        alert("Failed to update visibility");
      }
    } catch (err) {
      console.error("Error updating visibility:", err);
    }
  };

  return (
    <DashboardLayout title="Manage Reviews">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Teacher Reviews</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Visible to Teachers</span>
            <Switch checked={globalVisible} onCheckedChange={handleToggleVisibility} />
          </div>
        </div>

        {/* Review Table */}
        {loading ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">No reviews found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Visible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{format(new Date(review.createdAt), "yyyy-MM-dd")}</TableCell>
                  <TableCell>
                    {review.reviewer?.name} ({review.reviewer?.email})
                  </TableCell>
                  <TableCell>
                    {review.teacher?.name} ({review.teacher?.email})
                  </TableCell>
                  <TableCell>{review.rating}</TableCell>
                  <TableCell>{review.comment || "-"}</TableCell>
                  <TableCell>
                    {review.visibleToTeacher ? "✅" : "❌"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
}
