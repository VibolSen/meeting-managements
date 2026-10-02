import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api, User, Department, UserRole, UserStatus } from "@/lib/api";
import { useToast } from "@/components/Toast";
import {
  Upload,
  ClipboardPaste,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  RotateCcw,
} from "lucide-react";

interface ParsedImportRow {
  rowNum: number;
  name: string;
  email: string;
  role: UserRole;
  departmentName?: string;
  departmentId?: number;
  password?: string;
  status?: UserStatus;
  avatarUrl?: string;
  isValid: boolean;
  errors: string[];
}

interface UserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  existingUsers: User[];
  onSuccess: () => void;
}

export function UserImportModal({
  isOpen,
  onClose,
  departments,
  existingUsers,
  onSuccess,
}: UserImportModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pasteContent, setPasteContent] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);

  // Generate strong random password
  const generateTempPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `Mms@${pwd}`;
  };

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const headers = "Name,Email,Role,Department,Password,Status,AvatarUrl\n";
    const sampleRows = [
      "John Doe,john.doe@company.com,EMPLOYEE,Information Technology,Pass12345!,ACTIVE,",
      "Alice Smith,alice.smith@company.com,ORGANIZER,Human Resources,Pass12345!,ACTIVE,",
      "Robert Brown,robert.brown@company.com,ADMIN,Finance & Operations,Pass12345!,ACTIVE,",
    ].join("\n");

    const blob = new Blob([headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Process rows matrix (from CSV or XLSX)
  const processRawData = (rows: any[][]) => {
    if (rows.length < 2) {
      toast.error("File is empty or contains only header.");
      return;
    }

    const header = rows[0].map((h: any) => String(h || "").trim().toLowerCase());

    const nameIdx = header.findIndex((h) => h === "name" || h === "full name" || h === "fullname" || h === "username");
    const emailIdx = header.findIndex((h) => h === "email" || h === "e-mail" || h === "email address");
    const roleIdx = header.findIndex((h) => h === "role" || h === "user role" || h === "access");
    const deptIdx = header.findIndex((h) => h === "department" || h === "dept" || h === "department name");
    const passIdx = header.findIndex((h) => h === "password" || h === "pass");
    const statusIdx = header.findIndex((h) => h === "status" || h === "account status" || h === "user status");
    const avatarIdx = header.findIndex((h) => h === "avatar" || h === "avatarurl" || h === "avatar url" || h === "image");

    if (nameIdx === -1 || emailIdx === -1) {
      toast.error("Required columns missing. Please ensure 'Name' and 'Email' are present.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const seenEmails = new Set<string>();
    const results: ParsedImportRow[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((c) => c === undefined || c === null || String(c).trim() === "")) {
        continue; // Skip empty row
      }

      const name = String(row[nameIdx] || "").trim();
      const rawEmail = String(row[emailIdx] || "").trim().toLowerCase();
      const rawRole = (roleIdx !== -1 ? String(row[roleIdx] || "") : "").trim().toUpperCase();
      const rawDept = deptIdx !== -1 ? String(row[deptIdx] || "").trim() : "";
      const rawPass = passIdx !== -1 ? String(row[passIdx] || "").trim() : "";
      const rawStatus = (statusIdx !== -1 ? String(row[statusIdx] || "") : "").trim().toUpperCase();
      const rawAvatar = avatarIdx !== -1 ? String(row[avatarIdx] || "").trim() : "";

      const errors: string[] = [];

      if (!name) errors.push("Missing name");
      if (!rawEmail) {
        errors.push("Missing email");
      } else if (!emailRegex.test(rawEmail)) {
        errors.push("Invalid email format");
      } else if (seenEmails.has(rawEmail)) {
        errors.push("Duplicate email in this file");
      } else if (existingUsers.some((u) => u.email.toLowerCase() === rawEmail)) {
        errors.push("Email already registered in system");
      }

      let role: UserRole = "EMPLOYEE";
      if (rawRole === "ADMIN" || rawRole === "ORGANIZER" || rawRole === "EMPLOYEE") {
        role = rawRole as UserRole;
      } else if (rawRole !== "") {
        errors.push(`Invalid role '${rawRole}' (must be EMPLOYEE, ORGANIZER, or ADMIN)`);
      }

      let status: UserStatus = "ACTIVE";
      if (rawStatus === "ACTIVE" || rawStatus === "SUSPENDED") {
        status = rawStatus as UserStatus;
      } else if (rawStatus !== "") {
        errors.push(`Invalid status '${rawStatus}' (must be ACTIVE or SUSPENDED)`);
      }

      let matchedDeptId: number | undefined;
      if (rawDept) {
        const found = departments.find(
          (d) => d.name.toLowerCase() === rawDept.toLowerCase()
        );
        if (found) {
          matchedDeptId = found.departmentId;
        } else {
          errors.push(`Department '${rawDept}' not found`);
        }
      }

      if (rawEmail && !seenEmails.has(rawEmail)) {
        seenEmails.add(rawEmail);
      }

      results.push({
        rowNum: i + 1,
        name,
        email: rawEmail,
        role,
        departmentName: rawDept || "Unassigned",
        departmentId: matchedDeptId,
        password: rawPass || generateTempPassword(),
        status,
        avatarUrl: rawAvatar || undefined,
        isValid: errors.length === 0,
        errors,
      });
    }

    if (results.length === 0) {
      toast.error("No valid data rows found.");
      return;
    }

    setParsedRows(results);
    const validCount = results.filter((r) => r.isValid).length;
    toast.success(`Processed ${results.length} rows (${validCount} valid).`);
  };

  // Handle File Upload (.xlsx, .xls, .csv)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      processRawData(data);
    } catch {
      toast.error("Failed to parse the file. Please ensure it is a valid Excel or CSV file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Drag & Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      processRawData(data);
    } catch {
      toast.error("Failed to read dropped file.");
    }
  };

  // Handle Paste from Google Sheets or Excel
  const handleParsePaste = () => {
    if (!pasteContent.trim()) {
      toast.error("Please paste data from Google Sheets or Excel first.");
      return;
    }

    const lines = pasteContent
      .trim()
      .split(/\r?\n/)
      .map((line) => {
        // Detect tab-separated (standard Google Sheets / Excel copy) or comma-separated
        return line.includes("\t") ? line.split("\t") : line.split(",");
      });

    processRawData(lines);
  };

  // Reset form
  const handleReset = () => {
    setParsedRows([]);
    setPasteContent("");
    setImportProgress(null);
  };

  // Execute Batch Import
  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("There are no valid rows to import.");
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: validRows.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const item = validRows[i];
      try {
        await api.users.create({
          name: item.name,
          email: item.email,
          role: item.role,
          departmentId: item.departmentId,
          password: item.password,
          status: item.status,
          avatarUrl: item.avatarUrl,
        });
        successCount++;
      } catch {
        failCount++;
      }
      setImportProgress({ current: i + 1, total: validRows.length });
    }

    setImporting(false);

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} user${successCount > 1 ? "s" : ""}!`);
      onSuccess();
      onClose();
      handleReset();
    } else {
      toast.error(`Import failed for all ${failCount} items.`);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !importing && onClose()}
      title="Import Users from Excel / Google Sheets"
    >
      <div className="space-y-4">
        {/* Template Download Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-600">
              Need the spreadsheet format? Download our sample CSV template.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
            className="text-xs h-7.5 px-2.5 shrink-0"
          >
            Template
          </Button>
        </div>

        {/* Tab Controls (Only when no parsed rows yet) */}
        {parsedRows.length === 0 && (
          <div>
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold mb-3">
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "file"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload File (.xlsx, .csv)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "paste"
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Paste from Google Sheets / Excel
              </button>
            </div>

            {/* Tab 1: File Upload */}
            {activeTab === "file" && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .xlsx, .xls, .tsv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="excel-file-upload"
                />
                <label
                  htmlFor="excel-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag and drop your file
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports Microsoft Excel (.xlsx, .xls), CSV (.csv), or TSV
                  </p>
                </label>
              </div>
            )}

            {/* Tab 2: Direct Paste */}
            {activeTab === "paste" && (
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder={`Name\tEmail\tRole\tDepartment\nJohn Doe\tjohn@example.com\tEMPLOYEE\tInformation Technology\nAlice Wong\talice@example.com\tORGANIZER\tHuman Resources`}
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white resize-y"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Copy rows directly from Google Sheets or Excel and paste here.</span>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleParsePaste}
                    className="h-7 text-xs"
                  >
                    Parse Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation & Live Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-800">Preview & Validation</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {validCount} Valid
                </span>
                {invalidCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {invalidCount} Invalid
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                leftIcon={<RotateCcw className="w-3 h-3" />}
                className="h-7 text-xs px-2"
                disabled={importing}
              >
                Choose Another File
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-2.5">Name</th>
                    <th className="py-2 px-2.5">Email</th>
                    <th className="py-2 px-2.5">Role</th>
                    <th className="py-2 px-2.5">Department</th>
                    <th className="py-2 px-2.5">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {parsedRows.map((r, idx) => (
                    <tr
                      key={idx}
                      className={r.isValid ? "hover:bg-slate-50/70" : "bg-rose-50/30"}
                    >
                      <td className="py-2 px-2.5">
                        {r.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-slate-900 font-semibold">{r.name || "—"}</td>
                      <td className="py-2 px-2.5 text-slate-600 font-mono text-[11px]">
                        {r.email || "—"}
                      </td>
                      <td className="py-2 px-2.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {r.role}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 text-slate-600">{r.departmentName || "—"}</td>
                      <td className="py-2 px-2.5">
                        {r.errors.length > 0 ? (
                          <span className="text-rose-600 text-[11px] leading-tight block">
                            {r.errors.join("; ")}
                          </span>
                        ) : (
                          <span className="text-emerald-600 text-[11px]">Ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Progress indicator during import */}
            {importProgress && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    Importing accounts...
                  </span>
                  <span>
                    {importProgress.current} / {importProgress.total}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-200"
                    style={{
                      width: `${(importProgress.current / importProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={importing}
          >
            Cancel
          </Button>

          {parsedRows.length > 0 && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleExecuteImport}
              isLoading={importing}
              disabled={validCount === 0}
              leftIcon={<Upload className="w-3.5 h-3.5" />}
            >
              Import {validCount} User{validCount !== 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
