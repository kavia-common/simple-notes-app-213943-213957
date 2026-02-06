import React from "react";

// PUBLIC_INTERFACE
export function StatusBanner({
  kind = "info",
  title,
  message,
  actionLabel,
  onAction,
}) {
  /** Small banner for app-level status messages. */
  if (!title && !message) return null;

  return (
    <div
      className={`banner banner-${kind}`}
      role={kind === "error" ? "alert" : "status"}
    >
      <div className="bannerBody">
        {title ? <div className="bannerTitle">{title}</div> : null}
        {message ? <div className="bannerMessage">{message}</div> : null}
      </div>
      {actionLabel && onAction ? (
        <button
          className="bannerAction"
          type="button"
          onClick={onAction}
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
