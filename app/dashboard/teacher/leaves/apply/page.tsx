"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";

type LeaveType = {
  id: string;
  name: string;
  limit: number;
  usedLeaves: number;
  description?: string;
};

export default function ApplyLeavePage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🚫 prevent multiple submits
  const router = useRouter();
  const { data: session } = useSession();

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await fetch("/api/teacher/leaves");
      const data = await res.json();
      if (Array.isArray(data)) setLeaveTypes(data);
      else setLeaveTypes([]);
    } catch (err) {
      console.error(err);
      setLeaveTypes([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // 🚫 stop duplicate click
    setIsSubmitting(true);

    if (!selectedLeaveType || !startDate || !endDate) {
      setMessage("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/leaves/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user.id,
          leaveTypeId: selectedLeaveType,
          startDate,
          endDate,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
      } else {
        setMessage("Leave applied successfully!");
        setSelectedLeaveType("");
        setStartDate("");
        setEndDate("");
        setReason("");
        fetchLeaveTypes();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setIsSubmitting(false); // ✅ reset after request
    }
  };

  return (
    <DashboardLayout title="Apply for Leave">
      <div className="max-w-2xl mx-auto mt-10">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Apply for Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Leave Type</Label>
                <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((lt) => (
                      <SelectItem key={lt.id} value={lt.id}>
                        {lt.name} (Remaining: {(lt.limit ?? 0) - (lt.usedLeaves ?? 0)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  min={startDate || today} // End date cannot be before start date
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Reason</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Apply"}
              </Button>

              {message && <p className="mt-2 text-center text-red-600">{message}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
