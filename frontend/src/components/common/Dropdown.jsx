import { useEffect, useRef, useState } from "react";
import "./common.css";

function Dropdown({ trigger, children, align = "right", className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`dropdown ${className}`.trim()} ref={rootRef}>
      <span
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {trigger}
      </span>
      {isOpen && (
        <ul className="dropdown-menu" role="menu" style={align === "left" ? { right: "auto", left: 0 } : undefined}>
          {children}
        </ul>
      )}
    </div>
  );
}

Dropdown.Item = function DropdownItem({ children, onClick, ...rest }) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        className="dropdown-item"
        onClick={(event) => {
          onClick?.(event);
          // Parent closes via click-outside; kept simple.
        }}
        {...rest}
      >
        {children}
      </button>
    </li>
  );
};

Dropdown.Divider = function DropdownDivider() {
  return <li role="separator" className="dropdown-divider" />;
};

export default Dropdown;