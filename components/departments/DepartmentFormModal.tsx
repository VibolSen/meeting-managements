import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Building } from "lucide-react";

export interface DepartmentFormData {
  name: string;
  description?: string;
}

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  deptForm: DepartmentFormData;
  setDeptForm: React.Dispatch<React.SetStateAction<DepartmentFormData>>;
  actionLoading: boolean;
  mode?: "create" | "edit";
}

export function DepartmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  deptForm,
  setDeptForm,
  actionLoading,
  mode = "create",
}: DepartmentFormModalProps) {
  const isEdit = mode === "edit";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Department" : "Create New Department"}
    >
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Department Name <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            required
            placeholder="e.g. Engineering, Marketing, Finance"
            value={deptForm.name}
            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Description (optional)
          </label>
          <textarea
            rows={3}
            placeholder="Brief purpose, scope, or responsibility of this department..."
            value={deptForm.description || ""}
            onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={actionLoading}
            leftIcon={isEdit ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          >
            {isEdit ? "Save Changes" : "Create Department"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
