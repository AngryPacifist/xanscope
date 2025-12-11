import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Column<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => ReactNode;
  className?: string;
};

type SimpleTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
};

export function SimpleTable<T>({
  data,
  columns,
  keyExtractor,
}: SimpleTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={cn("px-4 py-3 font-semibold", column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="transition hover:bg-white/5">
              {columns.map((column) => (
                <td key={column.header} className="px-4 py-4 text-slate-100">
                  {column.render
                    ? column.render(row[column.accessor], row)
                    : (row[column.accessor] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
