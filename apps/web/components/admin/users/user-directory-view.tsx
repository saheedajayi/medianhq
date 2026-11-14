"use client";

import { useState } from "react";
import { ExportSquare } from "iconsax-react";
import { toast } from "sonner";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { SegmentedTabs } from "@/components/ui/custom/segmented-tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { adminUsersService, type AdminUserRow, type AdminUsersFilters } from "@/services/admin/users";
import { useAdminUsers } from "@/services/admin/users/queries/users.queries";
import { AdminPageHeader } from "../shared/admin-page-header";
import { formatCount } from "../shared/format";
import { pickedFilter } from "../shared/list-controls";
import { SelectionBar } from "../shared/selection-bar";
import { outlineButtonClass } from "../shared/shared";
import { TableFooter } from "../shared/table-footer";
import { useRowSelection } from "../shared/use-row-selection";
import {
  EMPTY_USER_FILTERS,
  UserDirectoryFilters,
  type UserDirectoryFilterValues,
} from "./user-directory-filters";
import { exportUsers } from "./user-utils";
import { UsersTable } from "./users-table";

const ROLE_TABS = [
  { value: "ALL", label: "All users" },
  { value: "MENTOR", label: "Mentors" },
  { value: "MENTEE", label: "Mentees" },
] as const;

type RoleTab = (typeof ROLE_TABS)[number]["value"];

const ACTIVE_NOUN: Record<RoleTab, string> = { ALL: "users", MENTOR: "mentors", MENTEE: "mentees" };

export function UserDirectoryView() {
  const [tab, setTab] = useState<RoleTab>("ALL");
  const [filterValues, setFilterValues] = useState(EMPTY_USER_FILTERS);
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const selection = useRowSelection<AdminUserRow>();
  const search = useDebouncedValue(filterValues.search.trim());

  const filters: AdminUsersFilters = {
    role: pickedFilter(tab),
    search: search || undefined,
    status: pickedFilter(filterValues.status),
    joined: pickedFilter(filterValues.joined),
    country: pickedFilter(filterValues.country),
    // Mentees have no Trust Score to filter on
    trust: tab === "MENTEE" ? undefined : pickedFilter(filterValues.trust),
  };

  const { data, isError, isFetching, refetch } = useAdminUsers(filters, page);
  const lastPage = data ? Math.max(Math.ceil(data.total / data.pageSize), 1) : 1;
  const firstShown = data?.total ? (data.page - 1) * data.pageSize + 1 : 0;
  const lastShown = firstShown ? firstShown + data!.items.length - 1 : 0;

  // Any filter change starts again from the first page
  const handleFilterChange = (values: Partial<UserDirectoryFilterValues>) => {
    setFilterValues((current) => ({ ...current, ...values }));
    setPage(1);
  };

  const handleTabChange = (nextTab: RoleTab) => {
    setTab(nextTab);
    setPage(1);
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const response = await adminUsersService.exportUsers(filters);
      exportUsers("median-users.csv", response.data);
    } catch {
      toast.error("We couldn't export the users. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="User directory" description="Find, review and manage mentor and mentee accounts.">
        <button type="button" onClick={handleExportAll} disabled={isExporting || !data} className={outlineButtonClass}>
          <ExportSquare size="18" variant="Outline" color="#101828" />
          {isExporting ? "Exporting..." : "Export all CSV"}
        </button>
      </AdminPageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs tabs={ROLE_TABS} activeTab={tab} onChange={handleTabChange} size="lg" />
        {data && (
          <span className="text-xs text-[#475467]">
            {formatCount(data.activeCount)} active {ACTIVE_NOUN[tab]}
          </span>
        )}
      </div>

      <UserDirectoryFilters
        values={filterValues}
        onChange={handleFilterChange}
        countries={data?.countries ?? []}
        showTrustFilter={tab !== "MENTEE"}
        showTrustNote={tab !== "ALL"}
      />

      {selection.count > 0 && (
        <SelectionBar
          label={`${selection.count} ${selection.count === 1 ? "user" : "users"} selected`}
          onClear={selection.clear}
          className="border border-[#FFCAB6] bg-[#FFF6F2]"
        >
          <button
            type="button"
            onClick={() => exportUsers("median-users-selected.csv", selection.rows)}
            className={outlineButtonClass}
          >
            <ExportSquare size="18" variant="Outline" color="#101828" />
            Export selected CSV
          </button>
        </SelectionBar>
      )}

      {isError && !data ? (
        <DashboardErrorState onRetry={() => refetch()} isRetrying={isFetching} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#EAECF0]">
          <UsersTable
            users={data?.items}
            isRefreshing={isFetching && !!data}
            isSelected={selection.isSelected}
            isPageSelected={selection.isPageSelected(data?.items ?? [])}
            onToggle={selection.toggle}
            onTogglePage={() => selection.togglePage(data?.items ?? [])}
          />
          {data && (
            <TableFooter
              summary={`Showing ${formatCount(firstShown)}–${formatCount(lastShown)} of ${formatCount(data.total)} users`}
              page={page}
              lastPage={lastPage}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
