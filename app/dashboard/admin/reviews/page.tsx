"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Loader2, ChevronsUpDown, Check, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/dashboard-layout";
import * as XLSX from "xlsx";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<
    { id: string; name: string; employeeId: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<{
    name: string;
    employeeId: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch reviews & users
  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      setReviews(data.reviews || []); // updated for paginated API
      setLoading(false);
    };
    const fetchUsers = async () => {
      const res = await fetch("/api/reviewusers");
      const data = await res.json();
      setUsers(data || []);
    };
    fetchReviews();
    fetchUsers();
  }, []);

  // Toggle all reviews
  const handleToggleAll = async (visible: boolean) => {
    setReviews((prev) => prev.map((r) => ({ ...r, visibleToTeacher: visible })));

    await fetch("/api/admin/feedback/visibility", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible }),
    });
  };

  // Delete review
  const handleDeleteReview = async (id: string) => {
    await fetch(`/api/admin/feedback/${id}`, {
      method: "DELETE",
    });

    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  // Export reviews as Excel
  const handleDownloadExcel = () => {
    if (!selectedTeacher) return;

    const filtered = reviews.filter(
      (r) => r.empId === selectedTeacher.employeeId
    );

    if (filtered.length === 0) return;

    const worksheetData = filtered.map((r) => ({
      StudentID: r.studentId,
      Teacher: `${r.empName} (${r.empId})`,
      College: r.college,
      Department: r.dept,
      Rating: r.rating,
      Remarks: r.remarks,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `${selectedTeacher.name}_Reviews`
    );

    XLSX.writeFile(
      workbook,
      `Reviews_${selectedTeacher.name}_${selectedTeacher.employeeId}.xlsx`
    );
  };

  // Filter reviews by teacher if selected
  const filteredReviews = selectedTeacher
    ? reviews.filter((r) => r.empId === selectedTeacher.employeeId)
    : [];

  // Calculate average rating
  const avgRating =
    filteredReviews.length > 0
      ? (
          filteredReviews.reduce((sum, r) => sum + Number(r.rating), 0) /
          filteredReviews.length
        ).toFixed(2)
      : null;

  if (loading)
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );

  return (
    <DashboardLayout title="Admin Reviews">
      <div className="min-h-screen p-6 bg-gray-50 space-y-6">
        {/* Teacher Select & Global Toggle */}
        <div className="flex items-center space-x-4">
          <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-64 justify-between"
              >
                {selectedTeacher
                  ? `${selectedTeacher.name} (${selectedTeacher.employeeId})`
                  : "Select Teacher"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
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
                          setSelectedTeacher({
                            name: user.name,
                            employeeId: user.employeeId,
                          });
                          setDropdownOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTeacher?.employeeId === user.employeeId
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

          {/* Global toggle button */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={reviews.every((r) => r.visibleToTeacher)}
              onCheckedChange={(checked) => handleToggleAll(checked)}
            />
            <Label>
              {reviews.every((r) => r.visibleToTeacher)
                ? "Visible to Teachers"
                : "Hidden from Teachers"}
            </Label>
          </div>
        </div>

        {/* If no teacher selected */}
        {!selectedTeacher && (
          <div className="text-gray-600 font-medium">
            No teacher selected. Please choose a teacher to view reviews.
          </div>
        )}

        {/* Average Rating + Download Excel */}
        {selectedTeacher && (
          <div className="flex items-center justify-between">
            {avgRating && (
              <div className="text-lg font-semibold">
                Average Rating:{" "}
                <span className="text-blue-600">{avgRating}</span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleDownloadExcel}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Excel</span>
            </Button>
          </div>
        )}

        {/* Show reviews only if teacher selected */}
        {selectedTeacher && (
          <Card className="w-full shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Reviews for {selectedTeacher.name} ({selectedTeacher.employeeId})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>College</TableHead>
                    <TableHead>Dept</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>{review.studentId}</TableCell>
                      <TableCell>
                        {review.empName} ({review.empId})
                      </TableCell>
                      <TableCell>{review.college}</TableCell>
                      <TableCell>{review.dept}</TableCell>
                      <TableCell>{review.rating}</TableCell>
                      <TableCell>{review.remarks}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredReviews.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500"
                      >
                        No reviews found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
