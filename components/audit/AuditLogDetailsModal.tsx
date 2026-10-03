"use client";

import React from "react";
import {
  X,
  ShieldAlert,
  User,
  Clock,
  Globe,
  Tag,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { AuditLog } from "@/lib/api";
import { useState } from "react";

interface AuditLogDetailsModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

export function AuditLogDetailsModal({
  log,
  onClose,
}: AuditLogDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopyDetails = () => {
    if (log.details) {
      navigator.clipboard.writeText(log.details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getActionColor = (action: string) => {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Audit Record #{log.logId}
              </h3>
              <p className="text-[11px] text-slate-400">
                Immutable system compliance event
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Action & Entity Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getActionColor(
                log.actionType
              )}`}
            >
              {log.actionType}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {log.entityType}
              {log.entityId ? ` #${log.entityId}` : ""}
            </span>
          </div>

          {/* Key Value Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Actor Name
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {log.actorName}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Actor Email
              </span>
              <span className="font-medium text-slate-600 block truncate">
                {log.actorEmail || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Target Entity
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {log.entityName || "System Core"}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                Origin IP
              </span>
              <span className="font-mono text-slate-600 block truncate">
                {log.ipAddress || "127.0.0.1"}
              </span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Recorded at:{" "}
              <strong>{new Date(log.createdAt).toLocaleString()}</strong>
            </span>
          </div>

          {/* Detailed Narrative */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Action Summary & Details
              </span>
              <button
                type="button"
                onClick={handleCopyDetails}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap break-words">
              {log.details || "No extended details provided for this event."}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
