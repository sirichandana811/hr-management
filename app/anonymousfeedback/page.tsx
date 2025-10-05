"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function FeedbackPage() {
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchFeedbacks = async () => {
    const res = await fetch("/api/anonymousfeedback");
    const data = await res.json();
    setFeedbacks(data.feedbacks);
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/anonymousfeedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department, message }),
    });

    if (res.ok) {
      setMessage("");
      setDepartment("");
      fetchFeedbacks();
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-4 text-center">Anonymous Feedback</h1>
      <p className="text-xs text-gray-500  mt-2">
  Note:🔒 Your feedback is completely anonymous. No one will see who submitted it.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Department (optional)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <Textarea
          placeholder="Write your feedback..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">
          Submit Feedback
        </Button>
      </form>

      
    </div>
  );
}
