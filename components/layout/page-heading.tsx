import { ReactNode } from "react";

type PageHeadingProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeading({
  title,
  description,
  actions,
}: PageHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-sm uppercase tracking-[0.45em] text-cyan-300">
          XanScope
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-slate-300">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
