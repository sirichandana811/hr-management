"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useEffect, useState } from "react";

export default function AdminAnonymousFeedback() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/anonymousfeedback");
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout title="Anonymous Feedback">
    <div className="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center text-black-600">
        Anonymous Feedback (Admin View)
      </h1>

      {feedbacks.length > 0 ? (
        <div className="space-y-4">
          {feedbacks.map((f) => (
            <div
              key={f.id}
              className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <p className="text-gray-800 dark:text-gray-200">{f.message}</p>
              <p className="text-sm text-gray-500 mt-1">{f.department}</p>
              <p className="text-xs text-gray-400">
                {new Date(f.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No feedback available.</p>
      )}
    </div>
    </DashboardLayout>
  );
}
