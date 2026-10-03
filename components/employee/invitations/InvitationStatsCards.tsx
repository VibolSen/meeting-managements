"use client";

import React from "react";
import { Clock, Check, X, Mail } from "lucide-react";

interface InvitationStatsCardsProps {
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  totalCount: number;
}

export function InvitationStatsCards({
  pendingCount,
  acceptedCount,
  declinedCount,
  totalCount,
}: InvitationStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Pending */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-amber-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Action
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {pendingCount}
          </span>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              RSVP Needed
            </span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Awaiting your response</p>
      </div>

      {/* 2. Accepted */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-emerald-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Accepted
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Check className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight font-mono">
          {acceptedCount}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Confirmed attendances</p>
      </div>

      {/* 3. Declined */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-rose-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Declined
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <X className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight font-mono">
          {declinedCount}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">Declined invitations</p>
      </div>

      {/* 4. Total */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Received
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Mail className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight font-mono">
          {totalCount}
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">All meeting invitations</p>
      </div>
    </div>
  );
}

export default InvitationStatsCards;
