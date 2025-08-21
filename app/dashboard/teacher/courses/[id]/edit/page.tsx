"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", subject: "", description: "" });

  // Fetch existing course
  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((res) => res.json())
      .then((data) => setForm(data));
  }, [id]);

  const handleUpdate = async () => {
    const res = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/dashboard/teacher/courses");
    } else {
      alert("❌ Failed to update course");
    }
  };

  return (
    <DashboardLayout title="Edit Course">
      <div className="p-6 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>✏️ Edit Course</CardTitle>
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
            <div className="flex gap-2">
              <Button onClick={handleUpdate}>Save Changes</Button>
              <Button variant="secondary" onClick={() => router.back()}>
                ⬅ Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
