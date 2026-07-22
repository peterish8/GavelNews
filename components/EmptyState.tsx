interface EmptyStateProps {
  title: string;
  body: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="surface-muted border-dashed px-6 py-12 text-center">
      <h3 className="mb-2 font-ui text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto max-w-sm text-sm text-ink-2">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}