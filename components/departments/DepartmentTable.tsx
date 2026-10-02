import React from "react";
import { Building, Users, Eye, Pencil, Trash2 } from "lucide-react";
import { Department, User } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/users/UserAvatar";

interface DepartmentTableProps {
  departments: Department[];
  users: User[];
  loading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  selectedDeptIds?: Set<number>;
  onToggleSelectDept?: (deptId: number) => void;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
  onViewDepartment: (dept: Department) => void;
  onEditDepartment: (dept: Department) => void;
  onDeleteDepartment: (deptId: number, deptName: string) => void;
}

export function DepartmentTable({
  departments,
  users,
  loading,
  isAdmin,
  actionLoading,
  selectedDeptIds = new Set(),
  onToggleSelectDept,
  onToggleSelectAll,
  isAllSelected = false,
  onViewDepartment,
  onEditDepartment,
  onDeleteDepartment,
}: DepartmentTableProps) {
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {isAdmin && onToggleSelectAll && (
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={isAllSelected && departments.length > 0}
                    onChange={onToggleSelectAll}
                    className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    title="Select All on page"
                  />
                </th>
              )}
              <th className="py-2.5 px-3.5">Department</th>
              <th className="py-2.5 px-3.5">Description</th>
              <th className="py-2.5 px-3.5">Assigned Members</th>
              <th className="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.map((d) => {
              const deptUsers = users.filter((u) => u.departmentId === d.departmentId);
              const isSelected = selectedDeptIds.has(d.departmentId);

              return (
                <tr
                  key={d.departmentId}
                  className={`transition-colors ${
                    isSelected ? "bg-indigo-50/40" : "hover:bg-slate-50/70"
                  }`}
                >
                  {isAdmin && onToggleSelectDept && (
                    <td className="py-2.5 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectDept(d.departmentId)}
                        className="w-3.5 h-3.5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="py-2.5 px-3.5">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer group"
                      onClick={() => onViewDepartment(d)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-xs group-hover:text-indigo-600 transition-colors">
                          {d.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: #{d.departmentId}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 max-w-[260px]">
                    <p className="text-slate-600 text-xs truncate">
                      {d.description || (
                        <span className="text-slate-400 italic">No description provided</span>
                      )}
                    </p>
                  </td>
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                        <Users className="w-3 h-3 text-slate-500" />
                        {deptUsers.length}
                      </span>

                      {deptUsers.length > 0 && (
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {deptUsers.slice(0, 3).map((u) => (
                            <UserAvatar
                              key={u.userId}
                              name={u.name}
                              avatarUrl={u.avatarUrl}
                              size="xs"
                              className="ring-1.5 ring-white"
                            />
                          ))}
                          {deptUsers.length > 3 && (
                            <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center ring-1.5 ring-white">
                              +{deptUsers.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {/* View Details Button */}
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

                      {/* Edit Department Button */}
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

                      {/* Delete Department Button */}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
