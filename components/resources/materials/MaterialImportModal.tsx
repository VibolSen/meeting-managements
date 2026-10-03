"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Link as LinkIcon,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
} from "lucide-react";
import { RiFileExcel2Line } from "react-icons/ri";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/Toast";
import { api, MaterialType } from "@/lib/api";

interface MaterialImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedMaterialRow {
  name: string;
  type: MaterialType;
  quantityAvailable: number;
  isValid: boolean;
  error?: string;
}

export function MaterialImportModal({
  isOpen,
  onClose,
  onSuccess,
}: MaterialImportModalProps) {
  const toast = useToast();
  const [importTab, setImportTab] = useState<"file" | "sheet">("file");
  const [googleSheetUrl, setGoogleSheetUrl] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedMaterialRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleReset = () => {
    setParsedRows([]);
    setFileName("");
    setGoogleSheetUrl("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        "Item Name": "4K Ultra-HD Laser Projector",
        "Category": "EQUIPMENT",
        "Quantity": 8,
      },
      {
        "Item Name": "Wireless Clip-on Lavalier Mics",
        "Category": "EQUIPMENT",
        "Quantity": 15,
      },
      {
        "Item Name": "Magnetic Whiteboard Markers (Pack of 12)",
        "Category": "STATIONERY",
        "Quantity": 25,
      },
      {
        "Item Name": "Artisan Coffee & Tea Service Set",
        "Category": "CATERING",
        "Quantity": 4,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Materials");
    XLSX.writeFile(workbook, "Materials_Import_Template.xlsx");
    toast.info("Template Downloaded", "Fill in your inventory items and upload.");
  };

  // Process raw rows
  const processRawData = (data: any[]) => {
    const rows: ParsedMaterialRow[] = data.map((item) => {
      const name = String(item["Item Name"] || item["Name"] || item["item_name"] || item["name"] || "").trim();
      const rawType = String(item["Category"] || item["Type"] || item["category"] || item["type"] || "EQUIPMENT").toUpperCase().trim();

      let type: MaterialType = "EQUIPMENT";
      if (rawType.includes("STAT") || rawType.includes("BOARD") || rawType.includes("PAPER")) {
        type = "STATIONERY";
      } else if (rawType.includes("CAT") || rawType.includes("FOOD") || rawType.includes("COFFEE")) {
        type = "CATERING";
      }

      const qtyRaw = Number(item["Quantity"] || item["quantity"] || item["Stock"] || item["stock"] || 10);
      const quantityAvailable = isNaN(qtyRaw) || qtyRaw < 0 ? 0 : qtyRaw;

      const isValid = Boolean(name && quantityAvailable >= 0);
      let error = "";
      if (!name) error = "Missing item name";

      return {
        name,
        type,
        quantityAvailable,
        isValid,
        error,
      };
    });

    setParsedRows(rows.filter((r) => r.name));
  };

  // Upload Excel File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          toast.warning("Empty File", "Uploaded file contains no data rows.");
          return;
        }

        processRawData(data);
        toast.success("File Parsed", `Found ${data.length} records ready to import.`);
      } catch {
        toast.error("File Parse Error", "Could not parse Excel/CSV document.");
      }
    };

    reader.readAsBinaryString(file);
  };

  // Google Sheets Fetch
  const handleFetchGoogleSheet = async () => {
    if (!googleSheetUrl.trim()) {
      toast.warning("Missing URL", "Please enter a valid Google Sheets URL.");
      return;
    }

    try {
      let fetchUrl = googleSheetUrl.trim();
      if (fetchUrl.includes("/edit")) {
        fetchUrl = fetchUrl.replace(/\/edit.*$/, "/export?format=csv");
      } else if (!fetchUrl.includes("format=csv")) {
        fetchUrl += (fetchUrl.includes("?") ? "&" : "?") + "format=csv";
      }

      toast.info("Fetching Sheet", "Downloading CSV from Google Sheets...");
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error("Could not access Google Sheet. Set link sharing to 'Anyone with link can view'.");
      }

      const csvText = await response.text();
      const wb = XLSX.read(csvText, { type: "string" });
      const wsName = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

      if (!data || data.length === 0) {
        toast.warning("Empty Sheet", "Google Sheet contains no readable rows.");
        return;
      }

      setFileName("Google Sheets Document");
      processRawData(data);
      toast.success("Sheet Loaded", `Parsed ${data.length} rows from Google Sheets.`);
    } catch (err: any) {
      toast.error("Import Failed", err.message || "Could not read Google Sheet.");
    }
  };

  // Batch create
  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.warning("No Valid Rows", "All rows have validation errors.");
      return;
    }

    setImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const row of validRows) {
      try {
        await api.materials.create({
          name: row.name,
          type: row.type,
          quantityAvailable: row.quantityAvailable,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setImporting(false);

    if (successCount > 0) {
      toast.success(
        "Import Completed",
        `Successfully imported ${successCount} inventory items.${failCount > 0 ? ` (${failCount} failed)` : ""}`
      );
      handleClose();
      onSuccess();
    } else {
      toast.error("Import Failed", "Could not create items. Please check backend connection.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Inventory Items"
      description="Upload an Excel spreadsheet or link a public Google Sheet to batch-populate materials & equipment."
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Source Tabs & Template Download */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => {
                setImportTab("file");
                handleReset();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                importTab === "file"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <RiFileExcel2Line className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel / CSV File</span>
            </button>

            <button
              onClick={() => {
                setImportTab("sheet");
                handleReset();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                importTab === "sheet"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Sheet URL</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleDownloadTemplate}
            leftIcon={<Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
            className="text-xs h-8 text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            Download Sample (.xlsx)
          </Button>
        </div>

        {/* Tab 1: File Upload */}
        {importTab === "file" && (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-cyan-400 bg-slate-50/60 hover:bg-cyan-50/20 transition-all cursor-pointer group text-center">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-cyan-600 shadow-xs group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-2.5">
                Click to browse or drag & drop Excel / CSV file
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supported formats: .xlsx, .xls, .csv (Max 5MB)
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {fileName && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-800 font-medium">
                <span className="flex items-center gap-2 truncate">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-600 shrink-0" />
                  {fileName}
                </span>
                <button
                  onClick={handleReset}
                  className="p-1 hover:bg-cyan-200/50 rounded-lg text-cyan-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Google Sheets URL */}
        {importTab === "sheet" && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <span className="font-bold">Instructions:</span> Open your Google Sheet, click{" "}
              <span className="font-semibold">Share</span> &rarr; Set to{" "}
              <span className="font-semibold">&quot;Anyone with the link can view&quot;</span>,
              then copy and paste the link below.
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit?usp=sharing"
                  value={googleSheetUrl}
                  onChange={(e) => setGoogleSheetUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-xs"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleFetchGoogleSheet}
                className="text-xs bg-cyan-600 hover:bg-cyan-700 px-3.5"
              >
                Fetch Sheet
              </Button>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Preview Data ({parsedRows.length} items)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {parsedRows.filter((r) => r.isValid).length} Valid &bull;{" "}
                {parsedRows.filter((r) => !r.isValid).length} Errors
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase sticky top-0">
                  <tr>
                    <th className="p-2.5 pl-3">Status</th>
                    <th className="p-2.5">Item Name</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 pr-3">Units in Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={row.isValid ? "hover:bg-slate-50" : "bg-rose-50/50"}
                    >
                      <td className="p-2.5 pl-3">
                        {row.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <div className="flex items-center gap-1 text-rose-600" title={row.error}>
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[10px] font-semibold">{row.error}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 font-bold text-slate-800">{row.name || "—"}</td>
                      <td className="p-2.5">
                        <Badge variant="neutral" size="sm">
                          {row.type}
                        </Badge>
                      </td>
                      <td className="p-2.5 pr-3 font-mono">{row.quantityAvailable} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleClose}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            type="button"
            disabled={parsedRows.filter((r) => r.isValid).length === 0 || importing}
            isLoading={importing}
            onClick={handleConfirmImport}
            leftIcon={!importing ? <Upload className="w-3.5 h-3.5 shrink-0" /> : undefined}
            className="text-xs bg-cyan-600 hover:bg-cyan-700"
          >
            Import {parsedRows.filter((r) => r.isValid).length} Items
          </Button>
        </div>
      </div>
    </Modal>
  );
}
