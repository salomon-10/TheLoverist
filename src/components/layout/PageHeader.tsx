export default function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-stack-sm">
      <div>
        <h1 className="font-display text-headline text-ink">{title}</h1>
        {description && <p className="mt-1.5 font-sans text-body-md text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
