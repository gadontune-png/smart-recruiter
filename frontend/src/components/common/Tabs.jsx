import { useState } from "react";
import "./common.css";

function Tabs({ tabs, defaultIndex = 0, onChange, className = "" }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const active = tabs[activeIndex];

  function handleSelect(index) {
    setActiveIndex(index);
    onChange?.(index);
  }

  return (
    <div className={className}>
      <div className="tabs" role="tablist" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id ?? tab.label}
            type="button"
            role="tab"
            id={`tab-${tab.id ?? index}`}
            aria-selected={index === activeIndex}
            aria-controls={`panel-${tab.id ?? index}`}
            tabIndex={index === activeIndex ? 0 : -1}
            className="tab"
            onClick={() => {
              handleSelect(index);
              document.getElementById(`panel-${tab.id ?? index}`)?.focus?.();
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                handleSelect((index + 1) % tabs.length);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                handleSelect((index - 1 + tabs.length) % tabs.length);
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${active.id ?? activeIndex}`}
        aria-labelledby={`tab-${active.id ?? activeIndex}`}
        tabIndex={0}
      >
        {active.content}
      </div>
    </div>
  );
}

export default Tabs;