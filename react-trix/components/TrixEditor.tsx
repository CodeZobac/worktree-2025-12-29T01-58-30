"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useId,
  useCallback,
} from "react";
import type {
  TrixEditorProps,
  TrixEditorRef,
  TrixEditorElement,
  TrixEditor as TrixEditorType,
  TrixChangeEvent,
  TrixInitializeEvent,
  TrixSelectionChangeEvent,
  TrixFocusEvent,
  TrixBlurEvent,
  TrixFileAcceptEvent,
  TrixAttachmentAddEvent,
  TrixAttachmentEditEvent,
  TrixAttachmentRemoveEvent,
  TrixBeforePasteEvent,
  TrixPasteEvent,
  TrixAttributesChangeEvent,
  TrixActionsChangeEvent,
} from "../types";

/**
 * TrixEditor - A React wrapper for the Trix rich text editor
 *
 * @example
 * ```tsx
 * const editorRef = useRef<TrixEditorRef>(null);
 *
 * <TrixEditor
 *   ref={editorRef}
 *   initialValue="<p>Hello world</p>"
 *   onValueChange={(html) => console.log(html)}
 *   placeholder="Write something..."
 * />
 * ```
 */
const TrixEditor = forwardRef<TrixEditorRef, TrixEditorProps>(function TrixEditor(
  {
    initialValue,
    onValueChange,
    onInitialize,
    onSelectionChange,
    onFocus,
    onBlur,
    onFileAccept,
    onAttachmentAdd,
    onAttachmentEdit,
    onAttachmentRemove,
    onBeforePaste,
    onPaste,
    onAttributesChange,
    onActionsChange,
    toolbar,
    placeholder,
    disabled = false,
    autofocus = false,
    name,
    id,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-describedby": ariaDescribedBy,
  },
  ref
) {
  const editorRef = useRef<TrixEditorElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const initializedRef = useRef(false);

  // Generate unique IDs
  const generatedId = useId();
  const editorId = id || `trix-editor-${generatedId}`;
  const inputId = `trix-input-${generatedId}`;
  const toolbarId = `trix-toolbar-${generatedId}`;

  // Store callbacks in refs to avoid re-adding event listeners
  const callbackRefs = useRef({
    onValueChange,
    onInitialize,
    onSelectionChange,
    onFocus,
    onBlur,
    onFileAccept,
    onAttachmentAdd,
    onAttachmentEdit,
    onAttachmentRemove,
    onBeforePaste,
    onPaste,
    onAttributesChange,
    onActionsChange,
  });

  // Update callback refs when props change
  useEffect(() => {
    callbackRefs.current = {
      onValueChange,
      onInitialize,
      onSelectionChange,
      onFocus,
      onBlur,
      onFileAccept,
      onAttachmentAdd,
      onAttachmentEdit,
      onAttachmentRemove,
      onBeforePaste,
      onPaste,
      onAttributesChange,
      onActionsChange,
    };
  });

  // Expose imperative handle
  useImperativeHandle(
    ref,
    () => ({
      get editor(): TrixEditorType | null {
        return editorRef.current?.editor ?? null;
      },
      get element(): TrixEditorElement | null {
        return editorRef.current;
      },
      get value(): string {
        return editorRef.current?.value ?? "";
      },
      focus: () => {
        editorRef.current?.focus();
      },
      blur: () => {
        editorRef.current?.blur();
      },
      insertHTML: (html: string) => {
        editorRef.current?.editor?.insertHTML(html);
      },
      insertAttachment: (attachment) => {
        editorRef.current?.editor?.insertAttachment(attachment);
      },
      insertFile: (file: File) => {
        editorRef.current?.editor?.insertFile(file);
      },
      loadHTML: (html: string) => {
        editorRef.current?.editor?.loadHTML(html);
      },
      getSnapshot: () => {
        return editorRef.current?.editor?.getSnapshot() ?? null;
      },
    }),
    []
  );

  // Event handlers
  const handleTrixChange = useCallback((event: Event) => {
    const e = event as unknown as TrixChangeEvent;
    callbackRefs.current.onValueChange?.(e.target.value);
  }, []);

  const handleTrixInitialize = useCallback(
    (event: Event) => {
      const e = event as unknown as TrixInitializeEvent;

      // Set initial value only once
      if (!initializedRef.current && initialValue) {
        e.target.editor?.loadHTML(initialValue);
        initializedRef.current = true;
      }

      callbackRefs.current.onInitialize?.(e);
    },
    [initialValue]
  );

  const handleTrixSelectionChange = useCallback((event: Event) => {
    callbackRefs.current.onSelectionChange?.(
      event as unknown as TrixSelectionChangeEvent
    );
  }, []);

  const handleTrixFocus = useCallback((event: Event) => {
    callbackRefs.current.onFocus?.(event as unknown as TrixFocusEvent);
  }, []);

  const handleTrixBlur = useCallback((event: Event) => {
    callbackRefs.current.onBlur?.(event as unknown as TrixBlurEvent);
  }, []);

  const handleTrixFileAccept = useCallback((event: Event) => {
    callbackRefs.current.onFileAccept?.(event as unknown as TrixFileAcceptEvent);
  }, []);

  const handleTrixAttachmentAdd = useCallback((event: Event) => {
    callbackRefs.current.onAttachmentAdd?.(
      event as unknown as TrixAttachmentAddEvent
    );
  }, []);

  const handleTrixAttachmentEdit = useCallback((event: Event) => {
    callbackRefs.current.onAttachmentEdit?.(
      event as unknown as TrixAttachmentEditEvent
    );
  }, []);

  const handleTrixAttachmentRemove = useCallback((event: Event) => {
    callbackRefs.current.onAttachmentRemove?.(
      event as unknown as TrixAttachmentRemoveEvent
    );
  }, []);

  const handleTrixBeforePaste = useCallback((event: Event) => {
    callbackRefs.current.onBeforePaste?.(event as unknown as TrixBeforePasteEvent);
  }, []);

  const handleTrixPaste = useCallback((event: Event) => {
    callbackRefs.current.onPaste?.(event as unknown as TrixPasteEvent);
  }, []);

  const handleTrixAttributesChange = useCallback((event: Event) => {
    callbackRefs.current.onAttributesChange?.(
      event as unknown as TrixAttributesChangeEvent
    );
  }, []);

  const handleTrixActionsChange = useCallback((event: Event) => {
    callbackRefs.current.onActionsChange?.(
      event as unknown as TrixActionsChangeEvent
    );
  }, []);

  // Import Trix and set up event listeners
  useEffect(() => {
    // Dynamically import Trix (client-side only)
    import("trix").catch((err) => {
      console.error("Failed to load Trix:", err);
    });

    const editor = editorRef.current;
    if (!editor) return;

    // Add event listeners
    editor.addEventListener("trix-change", handleTrixChange);
    editor.addEventListener("trix-initialize", handleTrixInitialize);
    editor.addEventListener("trix-selection-change", handleTrixSelectionChange);
    editor.addEventListener("trix-focus", handleTrixFocus);
    editor.addEventListener("trix-blur", handleTrixBlur);
    editor.addEventListener("trix-file-accept", handleTrixFileAccept);
    editor.addEventListener("trix-attachment-add", handleTrixAttachmentAdd);
    editor.addEventListener("trix-attachment-edit", handleTrixAttachmentEdit);
    editor.addEventListener("trix-attachment-remove", handleTrixAttachmentRemove);
    editor.addEventListener("trix-before-paste", handleTrixBeforePaste);
    editor.addEventListener("trix-paste", handleTrixPaste);
    editor.addEventListener("trix-attributes-change", handleTrixAttributesChange);
    editor.addEventListener("trix-actions-change", handleTrixActionsChange);

    // Cleanup
    return () => {
      editor.removeEventListener("trix-change", handleTrixChange);
      editor.removeEventListener("trix-initialize", handleTrixInitialize);
      editor.removeEventListener("trix-selection-change", handleTrixSelectionChange);
      editor.removeEventListener("trix-focus", handleTrixFocus);
      editor.removeEventListener("trix-blur", handleTrixBlur);
      editor.removeEventListener("trix-file-accept", handleTrixFileAccept);
      editor.removeEventListener("trix-attachment-add", handleTrixAttachmentAdd);
      editor.removeEventListener("trix-attachment-edit", handleTrixAttachmentEdit);
      editor.removeEventListener("trix-attachment-remove", handleTrixAttachmentRemove);
      editor.removeEventListener("trix-before-paste", handleTrixBeforePaste);
      editor.removeEventListener("trix-paste", handleTrixPaste);
      editor.removeEventListener("trix-attributes-change", handleTrixAttributesChange);
      editor.removeEventListener("trix-actions-change", handleTrixActionsChange);
    };
  }, [
    handleTrixChange,
    handleTrixInitialize,
    handleTrixSelectionChange,
    handleTrixFocus,
    handleTrixBlur,
    handleTrixFileAccept,
    handleTrixAttachmentAdd,
    handleTrixAttachmentEdit,
    handleTrixAttachmentRemove,
    handleTrixBeforePaste,
    handleTrixPaste,
    handleTrixAttributesChange,
    handleTrixActionsChange,
  ]);

  // Handle disabled state changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.disabled = disabled;
    }
  }, [disabled]);

  // Determine toolbar attribute
  const toolbarAttribute =
    toolbar === false ? undefined : toolbar || toolbarId;

  return (
    <>
      {/* Auto-generate toolbar if not explicitly disabled or provided */}
      {toolbar !== false && !toolbar &&
        React.createElement("trix-toolbar", { id: toolbarId })
      }

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={inputId}
        name={name}
        ref={inputRef}
      />

      {/* The Trix editor element */}
      {React.createElement("trix-editor", {
        ref: editorRef,
        id: editorId,
        input: inputId,
        toolbar: toolbarAttribute,
        placeholder,
        autofocus: autofocus || undefined,
        disabled: disabled || undefined,
        className: `trix-content ${className || ""}`.trim(),
        style,
        "aria-label": ariaLabel,
        "aria-describedby": ariaDescribedBy,
      })}
    </>
  );
});

export default TrixEditor;
