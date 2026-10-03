"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { api, Material, User } from "@/lib/api";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth";

import {
  MaterialHeader,
  MaterialStatsCards,
  MaterialFilterBar,
  MaterialTable,
  MaterialCardGrid,
  MaterialFormModal,
  MaterialDetailsModal,
  MaterialImportModal,
  MaterialBulkActionsBar,
  MaterialSortField,
  MaterialCategoryFilter,
  MaterialStockFilter,
  MaterialViewMode,
  MaterialFormData,
  MaterialStats,
} from "@/components/resources/materials";

import { ResourcePagination } from "@/components/resources/shared/ResourcePagination";

interface EquipmentInventoryViewProps {
  currentUser?: User | null;
}

type SortOrder = "asc" | "desc";

export function EquipmentInventoryView({
  currentUser = null,
}: EquipmentInventoryViewProps = {}) {
  const toast = useToast();
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;
  const isAdmin = effectiveUser?.role === "ADMIN";

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Global Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant?: "danger" | "warning" | "primary";
    confirmText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "danger",
    confirmText: "Delete",
    onConfirm: () => {},
  });

  // Data states
  const [materials, setMaterials] = useState<Material[]>([]);

  // Search, Filter, Sort & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [catFilter, setCatFilter] = useState<MaterialCategoryFilter>("ALL");
  const [stockFilter, setStockFilter] = useState<MaterialStockFilter>("ALL");
  const [sortBy, setSortBy] = useState<MaterialSortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [viewMode, setViewMode] = useState<MaterialViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<number>>(new Set());

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState<MaterialFormData>({
    name: "",
    type: "EQUIPMENT",
    quantityAvailable: 10,
  });
  const [selectedMaterialForDetail, setSelectedMaterialForDetail] = useState<Material | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Load Materials
  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await api.materials.getAll();
      setMaterials(data || []);
    } catch {
      toast.error("Failed to load inventory", "Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // Computed Stats
  const stats: MaterialStats = useMemo(() => {
    const totalItems = materials.length;
    const totalUnits = materials.reduce((acc, m) => acc + (m.quantityAvailable || 0), 0);
    const lowStockCount = materials.filter((m) => m.quantityAvailable > 0 && m.quantityAvailable < 5).length;
    const equipmentCount = materials.filter((m) => m.type === "EQUIPMENT").length;
    const stationeryCount = materials.filter((m) => m.type === "STATIONERY").length;
    const cateringCount = materials.filter((m) => m.type === "CATERING").length;
    return { totalItems, totalUnits, lowStockCount, equipmentCount, stationeryCount, cateringCount };
  }, [materials]);

  // Filtered & Sorted Materials
  const filteredAndSortedMaterials = useMemo(() => {
    return materials
      .filter((m) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = m.name.toLowerCase().includes(q);
          const matchType = m.type.toLowerCase().includes(q);
          if (!matchName && !matchType) return false;
        }
        if (catFilter !== "ALL" && m.type !== catFilter) {
          return false;
        }
        if (stockFilter === "IN_STOCK" && m.quantityAvailable < 5) return false;
        if (stockFilter === "LOW_STOCK" && (m.quantityAvailable === 0 || m.quantityAvailable >= 5)) return false;
        if (stockFilter === "OUT_OF_STOCK" && m.quantityAvailable > 0) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === "name") cmp = a.name.localeCompare(b.name);
        else if (sortBy === "type") cmp = a.type.localeCompare(b.type);
        else if (sortBy === "quantityAvailable") cmp = a.quantityAvailable - b.quantityAvailable;
        return sortOrder === "asc" ? cmp : -cmp;
      });
  }, [materials, searchQuery, catFilter, stockFilter, sortBy, sortOrder]);

  // Paginated Materials
  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedMaterials.slice(start, start + pageSize);
  }, [filteredAndSortedMaterials, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedMaterials.length / pageSize) || 1;

  // CRUD Handlers
  const handleOpenCreate = () => {
    setFormMode("create");
    setFormData({
      name: "",
      type: "EQUIPMENT",
      quantityAvailable: 10,
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setFormMode("edit");
    setFormData({
      materialId: material.materialId,
      name: material.name,
      type: material.type,
      quantityAvailable: material.quantityAvailable,
    });
    setFormModalOpen(true);
  };

  const handleView = (material: Material) => {
    setSelectedMaterialForDetail(material);
    setDetailModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning("Validation Error", "Please provide an item name.");
      return;
    }

    setActionLoading(true);
    try {
      if (formMode === "edit" && formData.materialId) {
        await api.materials.update(formData.materialId, {
          name: formData.name,
          type: formData.type,
          quantityAvailable: Number(formData.quantityAvailable),
        });
        toast.success("Item Updated", `${formData.name} saved.`);
      } else {
        await api.materials.create({
          name: formData.name,
          type: formData.type,
          quantityAvailable: Number(formData.quantityAvailable),
        });
        toast.success("Item Added", `${formData.name} added to inventory.`);
      }
      setFormModalOpen(false);
      await loadMaterials();
    } catch {
      toast.error("Operation Failed", "Could not save material item.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustStock = async (material: Material, delta: number) => {
    const newQty = Math.max(0, material.quantityAvailable + delta);
    setActionLoading(true);
    try {
      await api.materials.update(material.materialId, { quantityAvailable: newQty });
      toast.success("Stock Adjusted", `${material.name}: ${newQty} units`);
      if (selectedMaterialForDetail?.materialId === material.materialId) {
        setSelectedMaterialForDetail({ ...selectedMaterialForDetail, quantityAvailable: newQty });
      }
      await loadMaterials();
    } catch {
      toast.error("Failed", "Could not adjust stock level.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (materialId: number) => {
    const target = materials.find((m) => m.materialId === materialId);
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${target?.name || "Material"}`,
      message: "Are you sure you want to permanently remove this item from the equipment catalog?",
      variant: "danger",
      confirmText: "Delete Item",
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await api.materials.delete(materialId);
          toast.success("Item Removed", "Material deleted from catalog.");
          selectedMaterialIds.delete(materialId);
          setSelectedMaterialIds(new Set(selectedMaterialIds));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await loadMaterials();
        } catch {
          toast.error("Failed", "Cannot delete item assigned to active meetings.");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Multi-select & Bulk Actions
  const handleToggleSelectMaterial = (materialId: number) => {
    const next = new Set(selectedMaterialIds);
    if (next.has(materialId)) next.delete(materialId);
    else next.add(materialId);
    setSelectedMaterialIds(next);
  };

  const handleToggleSelectAll = () => {
    const curIds = paginatedMaterials.map((m) => m.materialId);
    const isAll = curIds.every((id) => selectedMaterialIds.has(id));
    const next = new Set(selectedMaterialIds);
    if (isAll) {
      curIds.forEach((id) => next.delete(id));
    } else {
      curIds.forEach((id) => next.add(id));
    }
    setSelectedMaterialIds(next);
  };

  const handleBulkAddStock = async () => {
    setActionLoading(true);
    let count = 0;
    for (const id of Array.from(selectedMaterialIds)) {
      const mat = materials.find((m) => m.materialId === id);
      if (mat) {
        try {
          await api.materials.update(id, { quantityAvailable: mat.quantityAvailable + 5 });
          count++;
        } catch {}
      }
    }
    setActionLoading(false);
    toast.success(`Replenished +5 stock for ${count} items.`);
    setSelectedMaterialIds(new Set());
    loadMaterials();
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${selectedMaterialIds.size} Materials`,
      message: "Are you sure you want to remove all selected items from inventory?",
      variant: "danger",
      confirmText: "Delete Selected",
      onConfirm: async () => {
        setActionLoading(true);
        let count = 0;
        for (const id of Array.from(selectedMaterialIds)) {
          try {
            await api.materials.delete(id);
            count++;
          } catch {}
        }
        setActionLoading(false);
        toast.success(`Deleted ${count} inventory items.`);
        setSelectedMaterialIds(new Set());
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        loadMaterials();
      },
    });
  };

  const handleBulkExport = () => {
    const selected = materials.filter((m) => selectedMaterialIds.has(m.materialId));
    if (selected.length === 0) return;
    const data = selected.map((m) => ({
      "Item ID": m.materialId,
      "Item Name": m.name,
      "Category": m.type,
      "Quantity in Stock": m.quantityAvailable,
      "Status": m.quantityAvailable === 0 ? "Out of Stock" : m.quantityAvailable < 5 ? "Low Stock" : "In Stock",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected Materials");
    XLSX.writeFile(wb, "Selected_Materials_Export.xlsx");
    toast.success("Excel Exported", `Saved ${data.length} selected items.`);
  };

  const handleExportExcel = () => {
    const listToExport = filteredAndSortedMaterials;
    if (listToExport.length === 0) {
      toast.warning("Export Warning", "No inventory items to export.");
      return;
    }
    const data = listToExport.map((m) => ({
      "Item ID": m.materialId,
      "Item Name": m.name,
      "Category": m.type,
      "Quantity in Stock": m.quantityAvailable,
      "Status": m.quantityAvailable === 0 ? "Out of Stock" : m.quantityAvailable < 5 ? "Low Stock" : "In Stock",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");
    XLSX.writeFile(wb, "Materials_Inventory_Export.xlsx");
    toast.success("Excel Exported", `Saved ${data.length} materials to spreadsheet.`);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <MaterialHeader
        isAdmin={isAdmin}
        loading={loading}
        totalMaterials={materials.length}
        onRefresh={loadMaterials}
        onAddMaterial={handleOpenCreate}
        onImportMaterials={() => setImportModalOpen(true)}
        onExportExcel={handleExportExcel}
      />

      <MaterialStatsCards stats={stats} />

      {/* Filter Bar and Data Presentation with tight spacing */}
      <div className="space-y-1.5">
        <MaterialFilterBar
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          categoryFilter={catFilter}
          onCategoryFilterChange={(c) => {
            setCatFilter(c);
            setCurrentPage(1);
          }}
          stockFilter={stockFilter}
          onStockFilterChange={(s) => {
            setStockFilter(s);
            setCurrentPage(1);
          }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onToggleSortOrder={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={() => {
            setSearchQuery("");
            setCatFilter("ALL");
            setStockFilter("ALL");
            setSortBy("name");
            setSortOrder("asc");
            setCurrentPage(1);
          }}
          isFiltered={searchQuery.trim().length > 0 || catFilter !== "ALL" || stockFilter !== "ALL" || sortBy !== "name" || sortOrder !== "asc"}
          totalResults={filteredAndSortedMaterials.length}
          onExportExcel={handleExportExcel}
        />

        {viewMode === "table" ? (
          <MaterialTable
            materials={paginatedMaterials}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            selectedMaterialIds={selectedMaterialIds}
            onToggleSelectMaterial={handleToggleSelectMaterial}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={paginatedMaterials.length > 0 && paginatedMaterials.every((m) => selectedMaterialIds.has(m.materialId))}
            onViewMaterial={handleView}
            onEditMaterial={handleOpenEdit}
            onAdjustStock={handleAdjustStock}
            onDeleteMaterial={handleDelete}
          />
        ) : (
          <MaterialCardGrid
            materials={paginatedMaterials}
            loading={loading}
            isAdmin={isAdmin}
            actionLoading={actionLoading}
            selectedMaterialIds={selectedMaterialIds}
            onToggleSelectMaterial={handleToggleSelectMaterial}
            onViewMaterial={handleView}
            onEditMaterial={handleOpenEdit}
            onAdjustStock={handleAdjustStock}
            onDeleteMaterial={handleDelete}
          />
        )}

        <ResourcePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAndSortedMaterials.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="materials"
        />
      </div>

      {/* Floating Bulk Actions Bar */}
      {isAdmin && (
        <MaterialBulkActionsBar
          selectedCount={selectedMaterialIds.size}
          onClearSelection={() => setSelectedMaterialIds(new Set())}
          onBulkAddStock={handleBulkAddStock}
          onBulkExport={handleBulkExport}
          onBulkDelete={handleBulkDelete}
          actionLoading={actionLoading}
        />
      )}

      {/* Modals */}
      <MaterialFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        formMode={formMode}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleSave}
        loading={actionLoading}
      />
      <MaterialDetailsModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        material={selectedMaterialForDetail}
        isAdmin={isAdmin}
        onEdit={handleOpenEdit}
        onAdjustStock={handleAdjustStock}
        actionLoading={actionLoading}
      />
      <MaterialImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={loadMaterials}
      />

      {/* Global Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => !actionLoading && setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        isLoading={actionLoading}
      />
    </div>
  );
}
