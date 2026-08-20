import "./common.css";

function Skeleton({ variant = "text", className = "", width, height, ...rest }) {
  const variantClass =
    variant === "text"
      ? "skeleton-text"
      : variant === "title"
        ? "skeleton-title"
        : variant === "block"
          ? "skeleton-block"
          : variant === "circle"
            ? "skeleton-circle"
            : "skeleton-text";

  return (
    <div
      className={`skeleton ${variantClass} ${className}`.trim()}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
      {...rest}
    />
  );
}

function SkeletonCard({ lines = 4, hasTitle = true, className = "" }) {
  return (
    <div className={`card card-padded ${className}`.trim()}>
      {hasTitle && <Skeleton variant="title" />}
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} variant="text" style={undefined} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard };
export default Skeleton;