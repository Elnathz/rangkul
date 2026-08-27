export type ServiceCategoryRow = {
  id: string;
  nama: string;
  tingkat: "ringan" | "sedang" | "berat";
  parent_id: string | null;
  is_active: boolean;
  parentName?: string | null;
};

export type SelectableServiceCategory = ServiceCategoryRow & {
  parentName: string | null;
};

export type ServiceCategoryGroup = {
  key: string;
  parentName: string | null;
  items: SelectableServiceCategory[];
};

export function getSelectableServiceCategories(rows: ServiceCategoryRow[]): SelectableServiceCategory[] {
  const categoryById = new Map(rows.map((row) => [row.id, row]));
  const parentIds = new Set(rows.flatMap((row) => (row.parent_id ? [row.parent_id] : [])));

  return rows
    .filter((row) => row.is_active && !parentIds.has(row.id))
    .map((row) => ({
      ...row,
      parentName: row.parentName ?? (row.parent_id ? categoryById.get(row.parent_id)?.nama ?? null : null),
    }));
}

export function groupSelectableServiceCategories(rows: ServiceCategoryRow[]): ServiceCategoryGroup[] {
  const selectable = getSelectableServiceCategories(rows);
  const groups = new Map<string, ServiceCategoryGroup>();

  for (const item of selectable) {
    const key = item.parent_id ?? `standalone:${item.id}`;
    const current = groups.get(key);
    if (current) {
      current.items.push(item);
      continue;
    }

    groups.set(key, { key, parentName: item.parentName, items: [item] });
  }

  return [...groups.values()];
}

export function sortServiceCategoriesHierarchy<T extends ServiceCategoryRow>(rows: T[]): T[] {
  const childrenByParent = new Map<string, T[]>();
  const roots: T[] = [];

  for (const row of rows) {
    if (!row.parent_id) {
      roots.push(row);
      continue;
    }

    const children = childrenByParent.get(row.parent_id) ?? [];
    children.push(row);
    childrenByParent.set(row.parent_id, children);
  }

  const ordered: T[] = [];
  const visit = (row: T) => {
    ordered.push(row);
    for (const child of childrenByParent.get(row.id) ?? []) visit(child);
  };

  for (const root of roots) visit(root);
  for (const row of rows) if (!ordered.some((item) => item.id === row.id)) ordered.push(row);
  return ordered;
}
