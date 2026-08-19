import { ChevronLeft, ChevronRight } from "lucide-react";
import "./common.css";

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  maxVisible = 5,
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages, maxVisible);

  return (
    <nav className={`pagination ${className}`.trim()} aria-label="Pagination">
      <button
        type="button"
        className="page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      {pages.map((page, index) =>
        page === "…" ? (
          <span key={`ellipsis-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            className="page-btn"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        className="page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}

function buildPageList(currentPage, totalPages, maxVisible) {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) pages.push("…");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("…");
  pages.push(totalPages);
  return pages;
}

export default Pagination;