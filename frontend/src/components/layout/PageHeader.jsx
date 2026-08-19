function PageHeader({ title, description, actions }) {
  return (
    <header className="page-title">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && (
          <div
            className="page-title-actions"
            style={{ display: "flex", gap: "var(--space-2)" }}
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export default PageHeader;