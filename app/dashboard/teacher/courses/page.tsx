"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Course = {
  id: string;
  title: string;
  description?: string;
  subject: string;
};

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Fetch courses
  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data));
  }, []);

  // Delete course
  const handleDeleteCourse = async (id: string) => {
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    setCourses(courses.filter((c) => c.id !== id));
  };

  // Save edited course
  const handleSaveCourse = async () => {
    if (!editingCourse) return;

    const res = await fetch(`/api/courses/${editingCourse.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCourse),
    });

    if (res.ok) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editingCourse.id ? editingCourse : c))
      );
      setEditingCourse(null); // close dialog
    } else {
      alert("❌ Failed to update course");
    }
  };

  // Filter courses by search
  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="My Courses">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">📚 My Courses</h1>
          <Link href="/dashboard/teacher/courses/new">
            <Button>➕ Add Course</Button>
          </Link>
        </div>

        {/* Search */}
        <Input
          placeholder="🔍 Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        {/* Course List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="shadow-md">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Subject: {course.subject}</p>
                <p className="text-gray-600">Description: {course.description}</p>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingCourse(course)}
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    🗑 Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Course Modal */}
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>✏️ Edit Course</DialogTitle>
            </DialogHeader>

            {editingCourse && (
              <div className="space-y-4">
                <Input
                  placeholder="Course Title"
                  value={editingCourse.title}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Subject"
                  value={editingCourse.subject}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, subject: e.target.value })
                  }
                />
                <Input
                  placeholder="Description"
                  value={editingCourse.description ?? ""}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="secondary" onClick={() => setEditingCourse(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCourse}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
