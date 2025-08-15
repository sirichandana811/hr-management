"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Data = {
  reviews: {
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
    reviewer: { name: string | null; email: string };
  }[];
  stats: { avgRating: number | null; count: number };
};

export default function TeacherReviews() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetch("/api/teacher/reviews").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <DashboardLayout title="My Reviews"><p>Loading...</p></DashboardLayout>;

  return (
    <DashboardLayout title="My Reviews">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Average Rating: <b>{data.stats.avgRating?.toFixed(2) ?? "-"}</b></p>
            <p>Total Reviews: <b>{data.stats.count}</b></p>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-3">
          {data.reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            data.reviews.map(r => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle>{r.rating} ★</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    From: {r.reviewer.name || r.reviewer.email} — {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2">{r.comment || "-"}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
