"use client";

import { useState } from "react";

/**
 * Checkbox selection for a paged table. Rows are kept by ID, so a selection
 * survives paging and filtering and can still be exported.
 */
export function useRowSelection<T extends { id: string }>() {
  const [selected, setSelected] = useState<Map<string, T>>(new Map());

  const toggle = (row: T) =>
    setSelected((current) => {
      const next = new Map(current);
      if (!next.delete(row.id)) next.set(row.id, row);
      return next;
    });

  /** Selects every row on the page, or clears them when all are already selected */
  const togglePage = (rows: T[]) =>
    setSelected((current) => {
      const next = new Map(current);
      const areAllSelected = rows.every((row) => next.has(row.id));
      for (const row of rows) {
        if (areAllSelected) next.delete(row.id);
        else next.set(row.id, row);
      }
      return next;
    });

  return {
    selected,
    rows: [...selected.values()],
    count: selected.size,
    isSelected: (id: string) => selected.has(id),
    isPageSelected: (rows: T[]) => rows.length > 0 && rows.every((row) => selected.has(row.id)),
    toggle,
    togglePage,
    clear: () => setSelected(new Map()),
  };
}
