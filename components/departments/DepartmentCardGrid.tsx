import React from "react";
import { Building, Users, Eye, Pencil, Trash2 } from "lucide-react";
import { Department, User } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/users/UserAvatar";

interface DepartmentCardGridProps {
  departments: Department[];
  users: User[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  selectedDeptIds?: Set<number>;
  onToggleSelectDept?: (deptId: number) => void;
  onViewDepartment: (dept: Department) => void;
  onEditDepartment: (dept: Department) => void;
  onDeleteDepartment: (deptId: number, deptName: string) => void;
}

export function DepartmentCardGrid({
  departments,
  users,
  loading,
  isAdmin,
  actionLoading,
  selectedDeptIds = new Set(),
  onToggleSelectDept,
  onViewDepartment,
  onEditDepartment,
  onDeleteDepartment,
}: DepartmentCardGridProps) {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs">Loading departments directory...</span>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
        <Building className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
        <h3 className="text-sm font-semibold text-slate-800">No departments found</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Try adjusting your search criteria or create a new department.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {departments.map((d) => {
        const deptUsers = users.filter((u) => u.departmentId === d.departmentId);
        const isSelected = selectedDeptIds.has(d.departmentId);

        return (
          <div
            key={d.departmentId}
            className={`p-4 rounded-xl border transition-all bg-white relative flex flex-col justify-between ${
              isSelected
                ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
            }`}
          >
            {/* Top row: Checkbox, ID & Icon */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {isAdmin && onToggleSelectDept && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectDept(d.departmentId)}
                      className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                  )}
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    #{d.departmentId}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  <Users className="w-3 h-3 text-indigo-600" />
                  {deptUsers.length} {deptUsers.length === 1 ? "Member" : "Members"}
                </span>
              </div>

              {/* Department Name & Description */}
              <div className="flex items-start gap-3">
                <div
                  onClick={() => onViewDepartment(d)}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Building className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4
                    onClick={() => onViewDepartment(d)}
                    className="font-bold text-slate-900 text-sm truncate cursor-pointer hover:text-indigo-600 transition-colors"
                  >
                    {d.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {d.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom: Members Avatar Stack & Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              {/* Avatar Stack */}
              <div className="flex items-center">
                {deptUsers.length > 0 ? (
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {deptUsers.slice(0, 4).map((u) => (
                      <UserAvatar
                        key={u.userId}
                        name={u.name}
                        avatarUrl={u.avatarUrl}
                        size="xs"
                        className="ring-1.5 ring-white"
                      />
                    ))}
                    {deptUsers.length > 4 && (
                      <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center ring-1.5 ring-white">
                        +{deptUsers.length - 4}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No assigned staff</span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onViewDepartment(d)}
                  title="View Details & Members"
                  className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>

                {isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEditDepartment(d)}
                    disabled={actionLoading}
                    title="Edit Department"
                    className="text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}

                {isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDeleteDepartment(d.departmentId, d.name)}
                    disabled={actionLoading}
                    title="Delete Department"
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
