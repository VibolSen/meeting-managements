import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api, Department } from "@/lib/api";
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

interface ParsedDepartmentRow {
  rowNum: number;
  name: string;
  description?: string;
  isValid: boolean;
  errors: string[];
}

interface DepartmentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDepartments: Department[];
  onSuccess: () => void;
}

export function DepartmentImportModal({
  isOpen,
  onClose,
  existingDepartments,
  onSuccess,
}: DepartmentImportModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pasteContent, setPasteContent] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [parsedRows, setParsedRows] = useState<ParsedDepartmentRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);

  // Download sample CSV template
  const handleDownloadTemplate = () => {
    const headers = "Name,Description\n";
    const sampleRows = [
      "Engineering,Software development and core infrastructure systems",
      "Human Resources,Talent acquisition, employee engagement, and culture",
      "Finance & Operations,Financial planning, budgeting, accounting, and logistics",
      "Product & Design,User experience, product management, and research",
    ].join("\n");

    const blob = new Blob([headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "department_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Process rows matrix (from CSV, XLSX, or TSV paste)
  const processRawData = (rows: any[][]) => {
    if (rows.length < 2) {
      toast.error("File is empty or contains only header.");
      return;
    }

    const header = rows[0].map((h: any) => String(h || "").trim().toLowerCase());

    const nameIdx = header.findIndex(
      (h) => h === "name" || h === "department" || h === "department name" || h === "dept"
    );
    const descIdx = header.findIndex(
      (h) => h === "description" || h === "desc" || h === "details" || h === "notes"
    );

    if (nameIdx === -1) {
      toast.error("Required column 'Name' is missing from the header.");
      return;
    }

    const seenNames = new Set<string>();
    const results: ParsedDepartmentRow[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((c) => c === undefined || c === null || String(c).trim() === "")) {
        continue; // Skip empty row
      }

      const name = String(row[nameIdx] || "").trim();
      const rawDesc = descIdx !== -1 ? String(row[descIdx] || "").trim() : "";
      const lowerName = name.toLowerCase();

      const errors: string[] = [];

      if (!name) {
        errors.push("Missing department name");
      } else if (seenNames.has(lowerName)) {
        errors.push("Duplicate name in this import file");
      } else if (existingDepartments.some((d) => d.name.toLowerCase() === lowerName)) {
        errors.push("Department name already exists in system");
      }

      if (name && !seenNames.has(lowerName)) {
        seenNames.add(lowerName);
      }

      results.push({
        rowNum: i + 1,
        name,
        description: rawDesc || undefined,
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
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      processRawData(data);
    } catch {
      toast.error("Failed to parse dropped file.");
    }
  };

  // Handle Paste from Google Sheets or Excel
  const handleParsePaste = () => {
    if (!pasteContent.trim()) {
      toast.error("Please paste tabular data first.");
      return;
    }

    const lines = pasteContent
      .trim()
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      toast.error("Pasted content must include a header and at least one data row.");
      return;
    }

    const rows: string[][] = lines.map((line) => {
      if (line.includes("\t")) {
        return line.split("\t");
      }
      return line.split(",");
    });

    processRawData(rows);
  };

  // Reset state
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
        await api.departments.create({
          name: item.name,
          description: item.description,
        });
        successCount++;
      } catch {
        failCount++;
      }
      setImportProgress({ current: i + 1, total: validRows.length });
    }

    setImporting(false);

    if (successCount > 0) {
      toast.success(`Successfully imported ${successCount} department${successCount > 1 ? "s" : ""}!`);
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
      title="Import Departments from Excel / Google Sheets"
    >
      <div className="space-y-4">
        {/* Template Download Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-700 font-medium">
              Need the spreadsheet format? Download our pre-formatted template.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            leftIcon={<Download className="w-3.5 h-3.5 text-indigo-600" />}
            className="text-[11px] font-semibold shrink-0"
          >
            Template
          </Button>
        </div>

        {/* Tab Switcher: File Upload vs Google Sheets Paste */}
        <div className="flex border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-1.5 pb-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "file"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File (.xlsx, .csv)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`flex items-center gap-1.5 pb-2 px-3 font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "paste"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            Paste from Google Sheets / Excel
          </button>
        </div>

        {/* Tab 1: File Upload / Drag & Drop */}
        {activeTab === "file" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileSpreadsheet className="w-10 h-10 text-indigo-500 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-xs font-bold text-slate-800">
              Drag & drop your Excel or CSV file here
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports .xlsx, .xls, and .csv formats</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-xs"
            >
              Browse Files
            </Button>
          </div>
        )}

        {/* Tab 2: Clipboard Paste */}
        {activeTab === "paste" && (
          <div className="space-y-2">
            <textarea
              rows={5}
              placeholder={`Paste directly from Google Sheets or Excel...\nName\tDescription\nDesign\tUI/UX team\nEngineering\tSoftware development`}
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleParsePaste}
                leftIcon={<FileText className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Parse Pasted Rows
              </Button>
            </div>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Preview ({parsedRows.length} Rows)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {validCount} Ready
                </span>
                {invalidCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    {invalidCount} Errors
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="p-2 w-8">#</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {parsedRows.map((r, idx) => (
                    <tr
                      key={idx}
                      className={r.isValid ? "hover:bg-slate-50/50" : "bg-rose-50/40"}
                    >
                      <td className="p-2 text-slate-400 font-mono">{r.rowNum}</td>
                      <td className="p-2 font-bold text-slate-800">{r.name}</td>
                      <td className="p-2 text-slate-600 truncate max-w-[200px]">
                        {r.description || <span className="text-slate-300 italic">None</span>}
                      </td>
                      <td className="p-2">
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Ready
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-rose-600 font-semibold"
                            title={r.errors.join(", ")}
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[120px]">{r.errors[0]}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Progress Bar during Batch Import */}
        {importProgress && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Importing departments...</span>
              <span>
                {importProgress.current} / {importProgress.total}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-200"
                style={{
                  width: `${(importProgress.current / importProgress.total) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleExecuteImport}
            disabled={importing || validCount === 0}
            isLoading={importing}
            leftIcon={importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          >
            Import {validCount} Departments
          </Button>
        </div>
      </div>
    </Modal>
  );
}
