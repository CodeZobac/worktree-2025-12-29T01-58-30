"use client";

import React from "react";
import type { TrixToolbarProps } from "../types";

/**
 * TrixToolbar - A toolbar component for the Trix editor
 *
 * Can be used in two modes:
 * 1. Default mode: Renders the default Trix toolbar (no children)
 * 2. Custom mode: Renders custom toolbar buttons (with children)
 *
 * @example Default mode
 * ```tsx
 * <TrixToolbar id="my-toolbar" />
 * <TrixEditor toolbar="my-toolbar" />
 * ```
 *
 * @example Custom mode
 * ```tsx
 * <TrixToolbar id="my-toolbar">
 *   <TrixToolbarButton attribute="bold" editorRef={editorRef}>Bold</TrixToolbarButton>
 *   <TrixToolbarButton attribute="italic" editorRef={editorRef}>Italic</TrixToolbarButton>
 * </TrixToolbar>
 * <TrixEditor ref={editorRef} toolbar="my-toolbar" />
 * ```
 */
function TrixToolbar({ id, children, className, style }: TrixToolbarProps) {
  // If children are provided, render a custom toolbar
  if (children) {
    return React.createElement(
      "trix-toolbar",
      {
        id,
        className: `trix-toolbar-custom ${className || ""}`.trim(),
        style,
      },
      React.createElement("div", { className: "trix-button-row" }, children)
    );
  }

  // Default mode: Let Trix populate the toolbar
  return React.createElement("trix-toolbar", {
    id,
    className,
    style,
  });
}

export default TrixToolbar;
