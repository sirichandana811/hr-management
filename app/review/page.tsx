"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewPage() {
  const [formData, setFormData] = useState({
    studentId: "",
    empName: "",
    empId: "",
    college: "",
    dept: "",
    rating: "",
    remarks: "",
  });

  const [users, setUsers] = useState<
    { id: string; name: string; employeeId: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  // fetch teachers
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/reviewusers");
        const data = await res.json();
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Feedback submitted successfully!");
      setFormData({
        studentId: "",
        empName: "",
        empId: "",
        college: "",
        dept: "",
        rating: "",
        remarks: "",
      });
    } else {
      alert("❌ Error: " + data.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-lg shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Student Feedback Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student email ID */}
            <div className="space-y-2">
              <Label>Student emailID</Label>
              <Input
                type="email"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
              />
            </div>

            {/* Teacher Dropdown */}
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {formData.empName
                      ? `${formData.empName} (${formData.empId})`
                      : "Select Teacher"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search teachers..." />
                    <CommandList>
                      <CommandEmpty>No teacher found.</CommandEmpty>
                      <CommandGroup>
                        {users.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.employeeId}
                            onSelect={() => {
                              setFormData({
                                ...formData,
                                empId: user.employeeId,
                                empName: user.name,
                              });
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.empId === user.employeeId
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {user.name} ({user.employeeId})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* College */}
            <div className="space-y-2">
              <Label>College</Label>
              <Input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                required
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                type="text"
                name="dept"
                value={formData.dept}
                onChange={handleChange}
                required
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating (1-10)</Label>
              <Input
                type="number"
                name="rating"
                min="1"
                max="10"
                value={formData.rating}
                onChange={handleChange}
                required
              />
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Feedback
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
