export function ModulePage({ eyebrow = 'WORKSPACE', title, description, children }: { eyebrow?: string; title: string; description: string; children?: React.ReactNode }) {
  return <><div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div><div className="page-heading-actions">{children}</div></div></>;
}

export function MetricCard({ label, value, change, tone = 'green' }: { label: string; value: string; change: string; tone?: 'green' | 'blue' | 'amber' | 'violet' }) {
  return <article className="surface metric-card"><div className="metric-label">{label}<span className={`metric-icon tone-${tone}`}>◦</span></div><div className="metric-value">{value}</div><div className="metric-change">{change}</div></article>;
}
