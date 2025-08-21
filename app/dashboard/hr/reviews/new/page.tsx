"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

// ShadCN combobox imports
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Teacher = { id: string; name: string | null; email: string };

export default function NewReviewPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/hr/users/teachers")
      .then(r => r.json())
.then(data => setTeachers(Array.isArray(data) ? data : []))
  }, []);

  const selectedTeacher = teachers.find(t => t.id === teacherId);

  async function submit() {
    setError("");
    if (!teacherId) return setError("Select a teacher");
    if (rating < 1 || rating > 5) return setError("Rating 1–5");

    const res = await fetch("/api/hr/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, rating, comment }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.push("/dashboard/hr/reviews");
  }

  return (
    <DashboardLayout title="New Review">
      <div className="max-w-xl space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Searchable Teacher Select */}
        <div className="space-y-2">
          <Label>Teacher</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedTeacher
                  ? `${selectedTeacher.name || selectedTeacher.email} (${selectedTeacher.email})`
                  : "Select teacher..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search teacher..." />
                <CommandList>
                  <CommandEmpty>No teachers found.</CommandEmpty>
                  <CommandGroup>
                    {teachers.map(t => (
                      <CommandItem
                        key={t.id}
                        value={t.id}
                        onSelect={() => {
                          setTeacherId(t.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            teacherId === t.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {t.name || t.email} ({t.email})({t.role})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <Label>Rating (1–5)</Label>
          <Input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
          />
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <Label>Comment</Label>
          <Textarea value={comment} onChange={e => setComment(e.target.value)} />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button onClick={submit}>Save Review</Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
