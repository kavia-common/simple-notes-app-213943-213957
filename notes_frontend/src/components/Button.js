import React from "react";

/**
 * A small retro-styled button wrapper.
 */
// PUBLIC_INTERFACE
export function Button({ variant = "primary", size = "md", type = "button", disabled, onClick, children, ariaLabel }) {
  /** Reusable button component with variants/sizes. */
  const className = `btn btn-${variant} btn-${size}`;
  return (
    <button className={className} type={type} disabled={disabled} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
