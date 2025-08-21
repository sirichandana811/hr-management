"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function NewCoursePage() {
  const [form, setForm] = useState({ title: "", subject: "", description: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!form.title || !form.subject || !form.description) return;
    setLoading(true);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
       alert("✅ Course created successfully");
      router.push("/dashboard/teacher/courses/new"); // redirect back
    } else {
      alert("❌ Failed to create course");
    }

    setLoading(false);
  };

  return (
    <DashboardLayout title="Add New Course">
      <div className="p-6 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>➕ Add New Course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Course Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Create Course"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
