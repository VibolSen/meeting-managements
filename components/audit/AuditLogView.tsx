"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { api, AuditLog, AuditLogSummary } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";
import { AuditLogStats } from "./AuditLogStats";
import { AuditLogFilterBar } from "./AuditLogFilterBar";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogDetailsModal } from "./AuditLogDetailsModal";

interface AuditLogViewProps {
  embedded?: boolean;
}

export function AuditLogView({ embedded = false }: AuditLogViewProps = {}) {
  const toast = useToast();
  const { ensureSession } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<AuditLogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [actionType, setActionType] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateRange, setDateRange] = useState("all");

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch summary stats
  const fetchSummary = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await api.auditLogs.getSummary();
      setSummary(res);
    } catch {
      // Fallback silently if offline or initial setup
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch paginated logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate: string | undefined;
      if (dateRange === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (dateRange === "7days") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (dateRange === "30days") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const res = await api.auditLogs.getAll({
        keyword: keyword.trim() || undefined,
        actionType: actionType || undefined,
        entityType: entityType || undefined,
        startDate,
        page,
        size: pageSize,
      });

      setLogs(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  }, [keyword, actionType, entityType, dateRange, page, pageSize]);

  useEffect(() => {
    let isMounted = true;
    ensureSession("ADMIN")
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          fetchSummary();
          fetchLogs();
        }
      });
    return () => {
      isMounted = false;
    };
  }, [ensureSession, fetchSummary, fetchLogs]);

  const handleResetFilters = () => {
    setKeyword("");
    setActionType("");
    setEntityType("");
    setDateRange("all");
    setPage(0);
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const now = new Date();
      let startDate: string | undefined;
      if (dateRange === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      } else if (dateRange === "7days") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (dateRange === "30days") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const url = api.auditLogs.exportCsvUrl({
        keyword: keyword.trim() || undefined,
        actionType: actionType || undefined,
        entityType: entityType || undefined,
        startDate,
      });

      // Direct download trigger
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mms-audit-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Audit Log Exported", "CSV file download initiated successfully.");
    } catch (err: any) {
      toast.error("Export Failed", err.message || "Failed to generate CSV export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Page Header */}
      {!embedded ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Audit Trail & Governance Logs
              </h1>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Admin Compliance
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Immutable system activity log tracking meeting reservations, approvals, cancellations, and role changes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchSummary();
                fetchLogs();
              }}
              disabled={loading}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Audit Trail & Governance Logs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable system audit events, booking approvals, room updates, and security logs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              fetchSummary();
              fetchLogs();
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <AuditLogStats summary={summary} loading={statsLoading} />

      {/* Filter and Search Bar */}
      <AuditLogFilterBar
        keyword={keyword}
        onKeywordChange={(val) => {
          setKeyword(val);
          setPage(0);
        }}
        actionType={actionType}
        onActionTypeChange={(val) => {
          setActionType(val);
          setPage(0);
        }}
        entityType={entityType}
        onEntityTypeChange={(val) => {
          setEntityType(val);
          setPage(0);
        }}
        dateRange={dateRange}
        onDateRangeChange={(val) => {
          setDateRange(val);
          setPage(0);
        }}
        onReset={handleResetFilters}
        onExport={handleExportCsv}
        isExporting={isExporting}
      />

      {/* Paginated Audit Events Table */}
      <AuditLogTable
        logs={logs}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        onSelectLog={setSelectedLog}
      />

      {/* Audit Event Details Modal */}
      <AuditLogDetailsModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}
