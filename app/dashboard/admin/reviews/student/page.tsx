"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export default function AdminStudents() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Upload dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("");
  const [studentsData, setStudentsData] = useState<
    { name?: string; email: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  // Fetch all colleges and students
  const fetchColleges = async () => {
    try {
      const res = await fetch("/api/admin/feedback/student");
      const data = await res.json();
      setColleges(data || []);
    } catch (err) {
      console.error("Error fetching colleges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );

  // Unique college names
  const collegeNames = [...new Set(colleges.map((c) => c.name))];

  // Years available for selected college
  const availableYears = colleges
    .filter((c) => c.name === selectedCollege)
    .map((c) => c.year);

  // Selected college + year data
  const selectedCollegeData = colleges.find(
    (c) => c.name === selectedCollege && c.year === selectedYear
  );

  // Handle Excel upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("Please select a file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData =
        XLSX.utils.sheet_to_json<{ name?: string; email: string }>(worksheet);
      setStudentsData(jsonData);
      toast.success(`${jsonData.length} students loaded from Excel.`);
    };
    reader.readAsBinaryString(file);
  };

  // Submit students (BULK)
  const handleSubmitStudents = async () => {
    if (!college || !year || studentsData.length === 0) {
      toast.error("Please fill all fields and upload a file.");
      return;
    }

    setUploading(true);

    try {
      const res = await fetch("/api/admin/feedback/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college,
          year,
          students: studentsData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`${data.count} students uploaded successfully.`);
        toast.success(`${data.count} students uploaded successfully.`);
      } else {
        alert(data.error || "Upload failed.");
        toast.error(data.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Error uploading students:", err);
      toast.error("Something went wrong while uploading.");
    }

    setUploading(false);
    setOpenDialog(false);
    setStudentsData([]);
    setCollege("");
    setYear("");

    // Refresh colleges after upload
    const refreshed = await fetch("/api/admin/feedback/student");
    setColleges(await refreshed.json());
  };

  // Delete all students of selected college & year
  const handleDeleteStudents = async () => {
    const confirmDelete = confirm(
      `Are you sure you want to delete all students of ${selectedCollege} - Year ${selectedYear}?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/admin/feedback/student", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          college: selectedCollege,
          year: selectedYear,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        //refresh colleges
        setColleges(await fetch("/api/admin/feedback/student").then((res) => res.json()));
        setSelectedCollege("");
        setSelectedYear("");
      } else {
        alert(data.error || "Failed to delete.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while deleting.");
    }
  };

  return (
    <DashboardLayout title="Uploaded Excel Sheets">
      <div className="min-h-screen p-6 bg-gray-50 space-y-6">
        {/* Upload Students Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setOpenDialog(true)}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Students (Excel)</span>
          </Button>
        </div>

        {/* Upload Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Upload Students</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="College Name"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
              <Select onValueChange={setYear} value={year}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
              />
              {studentsData.length > 0 && (
                <p className="text-sm text-gray-600">
                  {studentsData.length} students ready to upload.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitStudents} disabled={uploading}>
                {uploading ? "Uploading..." : "Save Students"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* College & Year Filters */}
        <div className="flex gap-4 items-center">
          <Select
            onValueChange={(val) => {
              setSelectedCollege(val);
              setSelectedYear("");
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select College" />
            </SelectTrigger>
            <SelectContent>
              {collegeNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCollege && (
            <Select onValueChange={(val) => setSelectedYear(val)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((yr) => (
                  <SelectItem key={yr} value={yr}>
                    {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Delete Button */}
          {selectedCollege && selectedYear && (
            <Button
              variant="destructive"
              onClick={handleDeleteStudents}
            >
              Delete All Students
            </Button>
          )}
        </div>

        {/* Students Table */}
        {selectedCollege && selectedYear && (
          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                {selectedCollege} - Year {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCollegeData?.students?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCollegeData.students.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name || "—"}</TableCell>
                        <TableCell>{student.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-gray-500">
                  No students uploaded yet.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
