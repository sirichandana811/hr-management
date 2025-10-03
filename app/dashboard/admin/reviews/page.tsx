"use client";

import { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2, ChevronsUpDown, Check, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/dashboard-layout";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; employeeId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<{ name: string; employeeId: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/admin/feedback");
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        toast.error("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/reviewusers");
        const data = await res.json();
        setUsers(data || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchReviews();
    fetchUsers();
  }, []);

  const handleToggleAll = async (visible: boolean) => {
    try {
      setReviews((prev) => prev.map((r) => ({ ...r, visibleToTeacher: visible })));
      const res = await fetch("/api/admin/feedback/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      });
      if (!res.ok) throw new Error("Failed to toggle visibility");
      toast.success(`Reviews are now ${visible ? "visible" : "hidden"} to teachers.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update visibility.");
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      if (!confirm("Are you sure you want to delete this review?")) return;
      const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review.");
    }
  };

  const handleDownloadExcel = () => {
    if (!selectedTeacher) return;
    const filtered = reviews.filter((r) => r.empId === selectedTeacher.employeeId);
    if (filtered.length === 0) {
      toast.error("No reviews to download for this teacher.");
      return;
    }
    const worksheetData = filtered.map((r) => ({
      StudentID: r.studentId,
      Teacher: `${r.empName} (${r.empId})`,
      College: r.college,
      Year: r.year,
      Rating: r.rating,
      Remarks: r.remarks,
      "Visible to Teacher": r.visibleToTeacher ? "Yes" : "No",
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${selectedTeacher.name}_Reviews`);
    XLSX.writeFile(workbook, `Reviews_${selectedTeacher.name}_${selectedTeacher.employeeId}.xlsx`);
    toast.success("Reviews downloaded successfully.");
  };

  const filteredReviews = selectedTeacher
    ? reviews.filter((r) => r.empId === selectedTeacher.employeeId)
    : [];

  const avgRating =
    filteredReviews.length > 0
      ? (filteredReviews.reduce((sum, r) => sum + Number(r.rating), 0) / filteredReviews.length).toFixed(2)
      : null;

  if (loading)
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );

  return (
    <DashboardLayout title="Admin Reviews">
      {/* Top Bar: Add Students button + Teacher select + Toggle */}
      <div className="flex items-center justify-between mb-4">
        {/* Teacher Select */}
        <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={dropdownOpen} className="w-64 justify-between">
              {selectedTeacher ? selectedTeacher.name : "Select Teacher"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0">
            <Command>
              <CommandInput placeholder="Search teacher..." />
              <CommandList>
                <CommandEmpty>No teachers found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => {
                        setSelectedTeacher({ name: user.name, employeeId: user.employeeId });
                        setDropdownOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTeacher?.employeeId === user.employeeId ? "opacity-100" : "opacity-0"
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

        {/* Toggle + Add Students */}
        <div className="flex items-center space-x-2">
          <Label>Show to Teachers</Label>
          <Switch onCheckedChange={(val) => handleToggleAll(val)} />
          <Button onClick={() => router.push("/dashboard/admin/reviews/student")}>
           add students
          </Button>
        </div>
      </div>

      {avgRating && (
        <p className="mt-2 text-sm text-gray-600">
          Average Rating: <span className="font-semibold">{avgRating}</span>
        </p>
      )}

      {selectedTeacher && (
        <div className="mt-2 mb-4">
          <Button onClick={handleDownloadExcel} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download Reviews</span>
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>College</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No reviews available for this teacher.
              </TableCell>
            </TableRow>
          ) : (
            filteredReviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>{review.studentId}</TableCell>
                <TableCell>{review.college}</TableCell>
                <TableCell>{review.year}</TableCell>
                <TableCell>{review.rating}</TableCell>
                <TableCell>{review.remarks}</TableCell>
                <TableCell>{review.visibleToTeacher ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteReview(review.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DashboardLayout>
  );
}
