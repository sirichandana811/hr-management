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
    year: "",
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
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openTeacher, setOpenTeacher] = useState(false);
  const [openCollege, setOpenCollege] = useState(false);
  const [step, setStep] = useState<"email" | "feedback">("email");

  // fetch teachers
  useEffect(() => {
    if (step === "feedback") {
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

      const fetchColleges = async () => {
        try {
          const res = await fetch("/api/feedback/colleges");
          const data = await res.json();
          setColleges(data || []);
        } catch (error) {
          console.error("Error fetching colleges:", error);
        }
      };
      fetchColleges();
    }
  }, [step]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Check if student email exists
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId || !formData.year) {
      alert("❌ Please enter both email and year.");
      return;
    }

    try {
      const res = await fetch("/api/feedback/check-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: formData.studentId,
          year: formData.year,
        }),
      });

      const data = await res.json();

      if (res.ok && data.exists) {
        setStep("feedback");
      } else {
        alert("❌ Student email not found for this year");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error checking student email.");
    }
  };

  // Step 2: Submit feedback
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
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
          year: "",
          empName: "",
          empId: "",
          college: "",
          dept: "",
          rating: "",
          remarks: "",
        });
        setStep("email");
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Failed to submit feedback.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-lg shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            {step === "email" ? "Enter College Email & Year" : "Student Feedback Form"}
          </CardTitle>
        </CardHeader>
        <CardContent>
        {step === "email" ? (
  <form onSubmit={handleEmailSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label>College Email ID</Label>
      <Input
        type="email"
        name="studentId"
        value={formData.studentId}
        onChange={handleChange}
        required
      />
    </div>

    {/* Year Dropdown */}
    <div className="space-y-2">
      <Label>Year of Study</Label>
      <Popover open={openCollege} onOpenChange={setOpenCollege}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {formData.year ? `Year ${formData.year}` : "Select Year"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No year found.</CommandEmpty>
              <CommandGroup>
                {[1, 2, 3, 4].map((yr) => (
                  <CommandItem
                    key={yr}
                    value={yr.toString()}
                    onSelect={() => {
                      setFormData({ ...formData, year: yr.toString() });
                      setOpenCollege(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        formData.year === yr.toString()
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    Year {yr}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>

    <Button type="submit" className="w-full">
      Next
    </Button>
  </form>
) : 
  // feedback form...
(
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Teacher Dropdown */}
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Popover open={openTeacher} onOpenChange={setOpenTeacher}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
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
                                setOpenTeacher(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.empId === user.employeeId ? "opacity-100" : "opacity-0"
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

              {/* College Dropdown */}
              <div className="space-y-2">
                <Label>College</Label>
                <Popover open={openCollege} onOpenChange={setOpenCollege}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {formData.college ? formData.college : "Select College"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search colleges..." />
                      <CommandList>
                        <CommandEmpty>No college found.</CommandEmpty>
                        <CommandGroup>
                          {colleges.map((college) => (
                            <CommandItem
                              key={college.id}
                              value={college.name}
                              onSelect={() => {
                                setFormData({ ...formData, college: college.name });
                                setOpenCollege(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.college === college.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {college.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
