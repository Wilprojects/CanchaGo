interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="section-head">
      <div>
        {eyebrow && (
          <div className="eyebrow">
            {eyebrow}
          </div>
        )}

        <h1 className="section-title">
          {title}
        </h1>

        <p className="section-subtitle">
          {description}
        </p>
      </div>
    </div>
  );
}