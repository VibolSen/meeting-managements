"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { ActionItem, ActionItemStatus, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";

interface MyActionItemsWidgetProps {
  onSelectMeetingId?: (meetingId: number) => void;
  className?: string;
}

export function MyActionItemsWidget({
  onSelectMeetingId,
  className = "",
}: MyActionItemsWidgetProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | ActionItemStatus>("ALL");

  const loadItems = useCallback(async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const data = await api.actionItems.getUserItems(user.userId);
      setItems(data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleToggleStatus = async (item: ActionItem) => {
    const nextStatus: ActionItemStatus =
      item.status === "PENDING"
        ? "IN_PROGRESS"
        : item.status === "IN_PROGRESS"
        ? "COMPLETED"
        : "PENDING";

    try {
      const updated = await api.actionItems.updateStatus(item.itemId, nextStatus);
      setItems((prev) =>
        prev.map((i) => (i.itemId === item.itemId ? updated : i))
      );
      toast.success("Action Item Updated", `Status changed to ${nextStatus}`);
    } catch {
      toast.error("Update Failed", "Could not update task status.");
    }
  };

  const filteredItems = items.filter((i) => {
    if (filter === "ALL") return true;
    return i.status === filter;
  });

  const pendingCount = items.filter((i) => i.status === "PENDING").length;
  const inProgressCount = items.filter((i) => i.status === "IN_PROGRESS").length;
  const completedCount = items.filter((i) => i.status === "COMPLETED").length;

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">My Meeting Action Items</h3>
            <p className="text-[11px] text-slate-400">
              Tasks assigned to you across scheduled sessions
            </p>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === "ALL" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("PENDING")}
            className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === "PENDING" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("IN_PROGRESS")}
            className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === "IN_PROGRESS" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("COMPLETED")}
            className={`px-2 py-0.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === "COMPLETED" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"
            }`}
          >
            Done ({completedCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Loading assigned action items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 space-y-1">
          <CheckSquare className="w-6 h-6 mx-auto text-slate-300" />
          <p className="font-semibold text-xs text-slate-600">No Action Items Found</p>
          <p className="text-[11px]">You have no tasks matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.itemId}
              className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs ${
                item.status === "COMPLETED"
                  ? "bg-slate-50/60 border-slate-200/80"
                  : "bg-white border-slate-200 hover:border-indigo-200 shadow-2xs"
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(item)}
                  className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    item.status === "COMPLETED"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : item.status === "IN_PROGRESS"
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                  title="Click to cycle task status"
                >
                  {item.status === "COMPLETED" && (
                    <span className="text-[10px] font-bold">✓</span>
                  )}
                  {item.status === "IN_PROGRESS" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>

                <div className="min-w-0">
                  <p
                    className={`font-semibold text-slate-800 ${
                      item.status === "COMPLETED" ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {item.taskDescription}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                    {item.meetingTitle && (
                      <span className="text-slate-600 font-medium truncate max-w-[200px]">
                        Ref: {item.meetingTitle}
                      </span>
                    )}
                    {item.dueDate && (
                      <span className="flex items-center gap-1 font-mono text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Due: {item.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  onClick={() => handleToggleStatus(item)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer select-none ${
                    item.status === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : item.status === "IN_PROGRESS"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {item.status}
                </span>

                {onSelectMeetingId && item.meetingId && (
                  <button
                    type="button"
                    onClick={() => onSelectMeetingId(item.meetingId)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    title="View Linked Meeting"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyActionItemsWidget;
