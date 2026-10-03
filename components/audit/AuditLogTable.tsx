"use client";

import React from "react";
import { Eye, ChevronLeft, ChevronRight, Inbox, Clock, Shield } from "lucide-react";
import { AuditLog } from "@/lib/api";
import { UserAvatar } from "@/components/users/UserAvatar";

interface AuditLogTableProps {
  logs: AuditLog[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onSelectLog: (log: AuditLog) => void;
}

export function AuditLogTable({
  logs,
  loading,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onSelectLog,
}: AuditLogTableProps) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case "APPROVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CREATE":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "UPDATE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCEL":
      case "DELETE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "ROLE_CHANGE":
      case "LOGIN":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getEntityBadge = (entity: string) => {
    switch (entity) {
      case "MEETING":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "ROOM":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "MATERIAL":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "STAFF":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "USER":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "DEPARTMENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Entity</th>
              <th className="py-3.5 px-4">Actor</th>
              <th className="py-3.5 px-4">Description / Summary</th>
              <th className="py-3.5 px-4 hidden lg:table-cell">Origin IP</th>
              <th className="py-3.5 px-4 text-right">Details</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-16 bg-slate-200 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-7 w-7 bg-slate-200 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <Inbox className="w-8 h-8 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-700">
                      No audit events match your filter criteria
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting the date range, keyword, or action type.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.logId}
                  className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                  onClick={() => onSelectLog(log)}
                >
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </td>

                  {/* Action Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getActionBadge(
                        log.actionType
                      )}`}
                    >
                      {log.actionType}
                    </span>
                  </td>

                  {/* Entity Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getEntityBadge(
                        log.entityType
                      )}`}
                    >
                      {log.entityType}
                      {log.entityId ? ` #${log.entityId}` : ""}
                    </span>
                  </td>

                  {/* Actor */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={log.actorName} size="xs" />
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {log.actorName}
                        </div>
                        {log.actorEmail && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {log.actorEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Description / Summary */}
                  <td className="py-3.5 px-4 max-w-xs truncate text-slate-700 font-medium">
                    <span className="font-semibold text-slate-900 mr-1.5">
                      {log.entityName || "Core"}:
                    </span>
                    <span className="text-slate-500">{log.details || "—"}</span>
                  </td>

                  {/* Origin IP */}
                  <td className="py-3.5 px-4 hidden lg:table-cell whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {log.ipAddress || "127.0.0.1"}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLog(log);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Inspect event details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing page <strong>{page + 1}</strong> of <strong>{Math.max(1, totalPages)}</strong> (
          <strong>{totalElements.toLocaleString()}</strong> total events)
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-700 bg-white rounded-lg border border-slate-200 shadow-2xs">
            {page + 1}
          </span>

          <button
            type="button"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
