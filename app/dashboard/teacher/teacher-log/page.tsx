"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TeacherTopicsPage() {
  const [form, setForm] = useState({
    className: "",
    subject: "",
    topic: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    year: "",
    college: "",
    branch: "",
  });
  const [message, setMessage] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const teacherId = session?.user?.id || null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, teacherId }),
    });

    if (res.ok) {
      setMessage("✅ Topic saved successfully!");
      setForm({
        className: "",
        subject: "",
        topic: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        year: "",
        college: "",
        branch: "",
      });
    } else {
      setMessage("❌ Failed to save topic");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/teacher");
    }
  };

  return (
    <DashboardLayout title="Teacher Dashboard">
      <button
        onClick={handleBack}
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-md"
      >
        Back
      </button>

      <Card className="max-w-lg mx-auto mt-6">
        <CardHeader>
          <CardTitle>Enter Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ✅ College, Branch, Year at top */}
            <Input
              type="text"
              name="college"
              placeholder="College Name"
              value={form.college}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="branch"
              placeholder="Branch (e.g., CSE, ECE)"
              value={form.branch}
              onChange={handleChange}
              required
            />
            <select
              name="year"
              value={form.year}
              onChange={handleChange}
              required
              className="w-full border rounded-md p-2"
            >
              <option value="">Select Year</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>

            {/* ✅ Class, Subject, Topic */}
            <Input
              type="text"
              name="className"
              placeholder="Class (e.g., 10A)"
              value={form.className}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="subject"
              placeholder="Subject (e.g., Math)"
              value={form.subject}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="topic"
              placeholder="Topic Title"
              value={form.topic}
              onChange={handleChange}
              required
            />
            <Textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            {/* ✅ Date & Time */}
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <div className="flex gap-4">
              <Input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />
              <Input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Save Topic
            </Button>
          </form>
          {message && <p className="mt-3 text-center">{message}</p>}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
