"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";

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

  // 🔍 search + date
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");

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
        fetchReviews(); // Refresh reviews
      } else {
        alert("Failed to update visibility");
      }
    } catch (err) {
      console.error("Error updating visibility:", err);
    }
  };

  // ✅ Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const query = searchQuery.toLowerCase();
      const matchesName =
        r.reviewer?.name?.toLowerCase().includes(query) ||
        r.reviewer?.email?.toLowerCase().includes(query) ||
        r.teacher?.name?.toLowerCase().includes(query) ||
        r.teacher?.email?.toLowerCase().includes(query);

      const matchesDate = searchDate
        ? r.createdAt.slice(0, 10) === searchDate
        : true;

      return matchesName && matchesDate;
    });
  }, [reviews, searchQuery, searchDate]);

  return (
    <DashboardLayout title="Manage Reviews">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-xl font-bold">Teacher Reviews</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Visible to Teachers</span>
            <Switch checked={globalVisible} onCheckedChange={handleToggleVisibility} />
          </div>
        </div>

        {/* Search + Date */}
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search by reviewer/teacher name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="max-w-[200px]"
          />
        </div>

        {/* Review Table */}
        {loading ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : filteredReviews.length === 0 ? (
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
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    {format(new Date(review.createdAt), "yyyy-MM-dd")}
                  </TableCell>
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
