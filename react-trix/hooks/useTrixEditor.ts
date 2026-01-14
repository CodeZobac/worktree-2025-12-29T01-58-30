"use client";

import { useState, useCallback, useEffect } from "react";
import type { RefObject } from "react";
import type {
  TrixEditorRef,
  TrixEditor,
  TrixAttribute,
  TrixAttachment,
  TrixSnapshot,
  UseTrixEditorReturn,
} from "../types";

/**
 * useTrixEditor - Hook for programmatic access to the Trix editor
 *
 * Provides a convenient API for interacting with the Trix editor instance.
 *
 * @example
 * ```tsx
 * const editorRef = useRef<TrixEditorRef>(null);
 * const { editor, isReady, value, insertHTML, attributeIsActive } = useTrixEditor(editorRef);
 *
 * const handleInsertCode = () => {
 *   insertHTML('<pre><code>const x = 1;</code></pre>');
 * };
 * ```
 */
export function useTrixEditor(
  ref: RefObject<TrixEditorRef | null>
): UseTrixEditorReturn {
  const [isReady, setIsReady] = useState(false);
  const [value, setValue] = useState("");

  // Track editor initialization
  useEffect(() => {
    const element = ref.current?.element;
    if (!element) return;

    const handleInitialize = () => {
      setIsReady(true);
      setValue(ref.current?.value || "");
    };

    const handleChange = () => {
      setValue(ref.current?.value || "");
    };

    element.addEventListener("trix-initialize", handleInitialize);
    element.addEventListener("trix-change", handleChange);

    // Check if already initialized
    if (ref.current?.editor) {
      setIsReady(true);
      setValue(ref.current.value);
    }

    return () => {
      element.removeEventListener("trix-initialize", handleInitialize);
      element.removeEventListener("trix-change", handleChange);
    };
  }, [ref]);

  const insertHTML = useCallback(
    (html: string) => {
      ref.current?.insertHTML(html);
    },
    [ref]
  );

  const insertAttachment = useCallback(
    (attachment: TrixAttachment) => {
      ref.current?.insertAttachment(attachment);
    },
    [ref]
  );

  const activateAttribute = useCallback(
    (name: TrixAttribute, attrValue?: unknown) => {
      ref.current?.editor?.activateAttribute(name, attrValue);
    },
    [ref]
  );

  const deactivateAttribute = useCallback(
    (name: TrixAttribute) => {
      ref.current?.editor?.deactivateAttribute(name);
    },
    [ref]
  );

  const attributeIsActive = useCallback(
    (name: TrixAttribute): boolean => {
      return ref.current?.editor?.attributeIsActive(name) ?? false;
    },
    [ref]
  );

  const canActivateAttribute = useCallback(
    (name: TrixAttribute): boolean => {
      return ref.current?.editor?.canActivateAttribute(name) ?? false;
    },
    [ref]
  );

  return {
    editor: ref.current?.editor ?? null,
    isReady,
    value,
    insertHTML,
    insertAttachment,
    activateAttribute,
    deactivateAttribute,
    attributeIsActive,
    canActivateAttribute,
  };
}

export default useTrixEditor;
