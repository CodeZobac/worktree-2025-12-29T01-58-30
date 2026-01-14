"use client";

import { useEffect, useRef } from "react";
import type { TrixEditorRef, TrixEventHandlers } from "../types";

/**
 * useTrixEvents - Hook for subscribing to Trix events
 *
 * Provides a convenient way to subscribe to multiple Trix events with automatic cleanup.
 *
 * @example
 * ```tsx
 * const editorRef = useRef<TrixEditorRef>(null);
 *
 * useTrixEvents(editorRef, {
 *   onChange: (e) => console.log('Changed:', e.target.value),
 *   onFocus: () => console.log('Focused'),
 *   onBlur: () => console.log('Blurred'),
 *   onAttachmentAdd: (e) => handleUpload(e.attachment),
 * });
 * ```
 */
export function useTrixEvents(
  ref: React.RefObject<TrixEditorRef | null>,
  handlers: TrixEventHandlers
): void {
  // Store handlers in ref to avoid re-subscribing on every render
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const element = ref.current?.element;
    if (!element) return;

    // Create wrapper functions that call current handlers
    const eventMap: Array<[string, (e: Event) => void]> = [
      ["trix-change", (e) => handlersRef.current.onChange?.(e as any)],
      ["trix-selection-change", (e) => handlersRef.current.onSelectionChange?.(e as any)],
      ["trix-initialize", (e) => handlersRef.current.onInitialize?.(e as any)],
      ["trix-focus", (e) => handlersRef.current.onFocus?.(e as any)],
      ["trix-blur", (e) => handlersRef.current.onBlur?.(e as any)],
      ["trix-file-accept", (e) => handlersRef.current.onFileAccept?.(e as any)],
      ["trix-attachment-add", (e) => handlersRef.current.onAttachmentAdd?.(e as any)],
      ["trix-attachment-edit", (e) => handlersRef.current.onAttachmentEdit?.(e as any)],
      ["trix-attachment-remove", (e) => handlersRef.current.onAttachmentRemove?.(e as any)],
      ["trix-before-paste", (e) => handlersRef.current.onBeforePaste?.(e as any)],
      ["trix-paste", (e) => handlersRef.current.onPaste?.(e as any)],
      ["trix-attributes-change", (e) => handlersRef.current.onAttributesChange?.(e as any)],
      ["trix-actions-change", (e) => handlersRef.current.onActionsChange?.(e as any)],
    ];

    // Add listeners
    eventMap.forEach(([eventName, handler]) => {
      element.addEventListener(eventName, handler);
    });

    // Cleanup
    return () => {
      eventMap.forEach(([eventName, handler]) => {
        element.removeEventListener(eventName, handler);
      });
    };
  }, [ref]);
}

export default useTrixEvents;
