import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  UserPlus,
  Trash2,
  Users,
  Search,
  UserCircle,
} from "lucide-react";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import {
  findStoreEmployeesApi,
  assignStoreEmployeeApi,
  removeStoreEmployeeApi,
} from "@/services/admin/storeAdminApi";
import { findAllUsers } from "@/services/admin/userAdminApi";
import type { StoreResponse } from "@/types/store/StoreResponse";
import type { StoreEmployeeResponse } from "@/types/store/StoreEmployeeResponse";
import type { UserSummaryResponse } from "@/types/user/UserSummaryResponse";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  store: StoreResponse | null;
  onEmployeeChanged: () => void;
}

export default function StoreEmployeeModal({
  isOpen,
  onClose,
  store,
  onEmployeeChanged,
}: Props) {
  const [employees, setEmployees] = useState<StoreEmployeeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  // User search state
  const [searchQuery, setSearchQuery] = useState("");
  const [userResults, setUserResults] = useState<UserSummaryResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSummaryResponse | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Remove confirm state
  const [removeTarget, setRemoveTarget] = useState<StoreEmployeeResponse | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  // Fetch employees map to usernames
  const [employeeUserMap, setEmployeeUserMap] = useState<Record<string, UserSummaryResponse>>({});

  const fetchEmployees = useCallback(async () => {
    if (!store) return;
    setLoading(true);
    try {
      const res = await findStoreEmployeesApi(store.id);
      const emps = res.data.data || [];
      setEmployees(emps);

      // Resolve display names — fetch all users once and cross-reference
      if (emps.length > 0) {
        try {
          const userRes = await findAllUsers({ page: 1, size: 100 });
          const allUsers = userRes.data.data?.content || [];
          const map: Record<string, UserSummaryResponse> = {};
          for (const emp of emps) {
            const found = allUsers.find((u) => u.keycloakId === emp.keycloakId);
            if (found) map[emp.keycloakId] = found;
          }
          setEmployeeUserMap(map);
        } catch {
          // Silently skip — we'll just show keycloakId
        }
      }
    } catch (error) {
      handleError(error, "Không thể tải danh sách nhân viên.");
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    if (isOpen && store) {
      fetchEmployees();
      setSearchQuery("");
      setSelectedUser(null);
      setUserResults([]);
      setShowDropdown(false);
    }
  }, [isOpen, store, fetchEmployees]);

  // Debounced user search
  useEffect(() => {
    if (!searchQuery.trim() || selectedUser) {
      setUserResults([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await findAllUsers({
          page: 1,
          size: 10,
          filter: searchQuery.trim(),
        });
        const results = res.data.data?.content || [];
        // Filter out already assigned employees
        const assignedIds = new Set(employees.map((e) => e.keycloakId));
        setUserResults(results.filter((u) => !assignedIds.has(u.keycloakId)));
        setShowDropdown(true);
      } catch {
        setUserResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, selectedUser, employees]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelectUser = (user: UserSummaryResponse) => {
    setSelectedUser(user);
    setSearchQuery(user.fullName || user.email);
    setShowDropdown(false);
  };

  const handleAssign = async () => {
    if (!store) return;

    const keycloakId = selectedUser?.keycloakId || searchQuery.trim();
    if (!keycloakId) {
      toast.error("Vui lòng chọn người dùng hoặc nhập Keycloak ID.");
      return;
    }

    setAssignLoading(true);
    try {
      await assignStoreEmployeeApi(store.id, { keycloakId });
      toast.success("Đã gán nhân viên vào cửa hàng.");
      setSearchQuery("");
      setSelectedUser(null);
      setUserResults([]);
      await fetchEmployees();
      onEmployeeChanged();
    } catch (error) {
      handleError(error, "Không thể gán nhân viên.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleOpenRemove = (emp: StoreEmployeeResponse) => {
    setRemoveTarget(emp);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = async () => {
    if (!store || !removeTarget) return;
    setRemoveLoading(true);
    try {
      await removeStoreEmployeeApi(store.id, removeTarget.keycloakId);
      toast.success("Đã gỡ nhân viên khỏi cửa hàng.");
      setRemoveDialogOpen(false);
      setRemoveTarget(null);
      await fetchEmployees();
      onEmployeeChanged();
    } catch (error) {
      handleError(error, "Không thể gỡ nhân viên.");
    } finally {
      setRemoveLoading(false);
    }
  };

  const getDisplayName = (keycloakId: string) => {
    const user = employeeUserMap[keycloakId];
    if (user) return user.fullName || user.email;
    return null;
  };

  if (!store) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-[90vw] bg-white border-emerald-100/50 shadow-2xl p-0 overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b border-emerald-50 bg-emerald-50/10 shrink-0">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-emerald-900">
              <Users className="h-5 w-5 text-emerald-600" />
              Quản lý nhân viên
            </DialogTitle>
            <p className="text-sm text-slate-500 mt-1">
              {store.name} — {store.address}
            </p>
          </DialogHeader>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Assign section */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-600" />
                Gán nhân viên mới
              </p>
              <div className="flex gap-2 relative" ref={dropdownRef}>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm theo tên, email hoặc nhập Keycloak ID..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedUser(null);
                    }}
                    onFocus={() => {
                      if (userResults.length > 0 && !selectedUser) setShowDropdown(true);
                    }}
                    className="pl-10 border-emerald-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-400"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-emerald-500" />
                  )}

                  {/* Search dropdown */}
                  {showDropdown && userResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                      {userResults.map((user) => (
                        <button
                          key={user.keycloakId}
                          type="button"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors text-sm"
                          onClick={() => handleSelectUser(user)}
                        >
                          <UserCircle className="h-5 w-5 text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-800 truncate">
                              {user.fullName || "Chưa có tên"}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {showDropdown && !searching && userResults.length === 0 && searchQuery.trim() && !selectedUser && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 px-4 py-3 text-sm text-slate-400">
                      Không tìm thấy người dùng nào. Bạn có thể nhập trực tiếp Keycloak ID.
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleAssign}
                  disabled={assignLoading || (!selectedUser && !searchQuery.trim())}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shrink-0"
                >
                  {assignLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Gán
                </Button>
              </div>
              {selectedUser && (
                <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2 text-sm">
                  <UserCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-800 font-medium">
                    {selectedUser.fullName || selectedUser.email}
                  </span>
                  <span className="text-emerald-600/60 text-xs truncate">
                    ({selectedUser.keycloakId})
                  </span>
                </div>
              )}
            </div>

            {/* Employee list */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                Nhân viên hiện tại ({employees.length})
              </p>

              {loading ? (
                <div className="py-8 text-center text-emerald-600/60 font-medium flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang tải...
                </div>
              ) : employees.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1">
                  <Users className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">
                    Chưa có nhân viên nào được gán vào cửa hàng này.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Nhân viên</TableHead>
                        <TableHead>Keycloak ID</TableHead>
                        <TableHead className="text-right w-20">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((emp, idx) => {
                        const displayName = getDisplayName(emp.keycloakId);
                        return (
                          <TableRow key={emp.id}>
                            <TableCell className="text-slate-400 text-sm">
                              {idx + 1}
                            </TableCell>
                            <TableCell>
                              {displayName ? (
                                <span className="font-medium text-slate-800">
                                  {displayName}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-slate-50 px-2 py-0.5 rounded text-slate-600 font-mono">
                                {emp.keycloakId}
                              </code>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenRemove(emp)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Gỡ nhân viên khỏi cửa hàng"
        description={`Bạn có chắc muốn gỡ nhân viên "${getDisplayName(removeTarget?.keycloakId || "") || removeTarget?.keycloakId}" khỏi cửa hàng "${store.name}"?`}
        confirmLabel="Gỡ"
        cancelLabel="Hủy"
        onConfirm={confirmRemove}
        isLoading={removeLoading}
      />
    </>
  );
}
