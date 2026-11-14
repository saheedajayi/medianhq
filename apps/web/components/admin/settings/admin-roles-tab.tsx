"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AddAdminModal } from "./add-admin-modal";
import { ADMIN_ROLES } from "./admin-roles";

const headClass = "px-6 py-3 text-left text-sm font-semibold text-[#101828]";
const cellClass = "px-6 py-6 align-top text-sm text-[#101828]";
const boxButtonClass = "rounded border px-2 py-1.5 text-sm transition-colors hover:bg-[#F9FAFB]";

// Roles are fixed descriptions until they are enforced, so there is nothing to open or edit
const notifyNotConnected = () => toast.info("Role management isn't connected yet.");

export function AdminRolesTab() {
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

  return (
    <div className="flex flex-col gap-7">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {ADMIN_ROLES.map((role) => (
          <li key={role.name} className="rounded-2xl border border-[#EAECF0] bg-[#FCFCFD] px-4 py-5">
            <p className="text-xs" style={{ color: role.color }}>
              {role.accessLevel}
            </p>
            <p className="mt-5 text-xl font-semibold text-[#101828]">{role.name}</p>
            <p className="mt-4 text-[11px] leading-relaxed text-[#667085]">{role.summary}</p>
          </li>
        ))}
      </ul>

      <section className="overflow-hidden rounded-2xl border border-[#EAECF0] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-6">
          <h2 className="text-3xl font-semibold tracking-tight text-[#475467]">Roles Details &amp; Permissions</h2>
          <button type="button" onClick={notifyNotConnected} className={`${boxButtonClass} border-[#D0D5DD] text-[#475467]`}>
            Manage Roles
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="bg-[#F2F4F7]">
              <tr>
                {["Role", "Access Level", "Key Permissions", "Status", "Actions"].map((column) => (
                  <th key={column} scope="col" className={headClass}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ADMIN_ROLES.map((role) => (
                <tr key={role.name}>
                  <td className={cellClass}>{role.groupName}</td>
                  <td className={cellClass} style={{ color: role.color }}>
                    {role.accessLevel}
                  </td>
                  <td className={cellClass}>
                    <ul className="list-inside list-disc">
                      {role.permissions.map((permission) => (
                        <li key={permission}>{permission}</li>
                      ))}
                    </ul>
                  </td>
                  <td className={cellClass}>
                    <span className="inline-flex items-center gap-2 rounded bg-[#E7F4EE] px-2 py-1 text-[#067647]">
                      <span className="size-1.5 rounded-full bg-[#067647]" />
                      Active
                    </span>
                  </td>
                  <td className={cellClass}>
                    <button type="button" onClick={notifyNotConnected} className={`${boxButtonClass} border-[#101828]`}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center px-6 py-5">
          <button
            type="button"
            onClick={() => setIsAddAdminOpen(true)}
            className="w-full max-w-3xl rounded-full bg-[#FF5514] py-2.5 text-3xl text-white transition-colors hover:bg-[#E84D12]"
          >
            Add Admin
          </button>
        </div>
      </section>

      {isAddAdminOpen && <AddAdminModal onClose={() => setIsAddAdminOpen(false)} />}
    </div>
  );
}
