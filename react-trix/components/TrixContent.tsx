"use client";

import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import type { TrixContentProps } from "../types";

/**
 * TrixContent - Display sanitized HTML content from Trix editor
 *
 * Renders HTML content with the `trix-content` class for proper styling.
 * Content is sanitized using DOMPurify for security.
 *
 * @example
 * ```tsx
 * <TrixContent html={savedHtml} />
 * ```
 */
function TrixContent({ html, className, style }: TrixContentProps) {
  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = useMemo(() => {
    if (typeof window === "undefined") {
      // SSR: return as-is, will be sanitized on client
      return html;
    }
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ["figure", "figcaption"],
      ADD_ATTR: ["contenteditable", "data-trix-attachment", "data-trix-content-type"],
    });
  }, [html]);

  return (
    <div
      className={`trix-content ${className || ""}`.trim()}
      style={style}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default TrixContent;
