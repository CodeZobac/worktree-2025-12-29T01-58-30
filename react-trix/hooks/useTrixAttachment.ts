"use client";

import { useEffect, useRef, useCallback } from "react";
import type {
  TrixEditorRef,
  TrixAttachment,
  TrixAttachmentUploadFn,
  TrixAttachmentAddEvent,
  TrixFileAcceptEvent,
} from "../types";

/**
 * Options for the useTrixAttachment hook
 */
export interface UseTrixAttachmentOptions {
  /**
   * Upload function called when a file is added
   * Receives the file and handlers for progress/completion
   */
  onUpload?: TrixAttachmentUploadFn;

  /**
   * Validate files before they are added
   * Return false or call event.preventDefault() to reject
   */
  onFileAccept?: (file: File) => boolean | void;

  /**
   * Maximum file size in bytes (optional)
   * Files larger than this will be rejected
   */
  maxFileSize?: number;

  /**
   * Allowed MIME types (optional)
   * Files not matching these types will be rejected
   */
  allowedTypes?: string[];
}

/**
 * useTrixAttachment - Hook for handling file attachments in Trix
 *
 * Provides a convenient way to handle file uploads with progress tracking.
 *
 * @example
 * ```tsx
 * const editorRef = useRef<TrixEditorRef>(null);
 *
 * useTrixAttachment(editorRef, {
 *   onUpload: async (file, { setProgress, setAttributes }) => {
 *     // Upload file to your server
 *     const formData = new FormData();
 *     formData.append('file', file);
 *
 *     const response = await fetch('/api/upload', {
 *       method: 'POST',
 *       body: formData,
 *     });
 *
 *     const { url } = await response.json();
 *     setAttributes({ url, href: url });
 *   },
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 *   allowedTypes: ['image/*', 'application/pdf'],
 * });
 * ```
 */
export function useTrixAttachment(
  ref: React.RefObject<TrixEditorRef | null>,
  options: UseTrixAttachmentOptions = {}
): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Handle file acceptance validation
  const handleFileAccept = useCallback((event: Event) => {
    const e = event as unknown as TrixFileAcceptEvent;
    const file = (e as CustomEvent).detail?.file || (e as any).file;
    if (!file) return;

    const { maxFileSize, allowedTypes, onFileAccept } = optionsRef.current;

    // Check file size
    if (maxFileSize && file.size > maxFileSize) {
      event.preventDefault();
      console.warn(`File ${file.name} exceeds maximum size of ${maxFileSize} bytes`);
      return;
    }

    // Check file type
    if (allowedTypes && allowedTypes.length > 0) {
      const isAllowed = allowedTypes.some((pattern) => {
        if (pattern.endsWith("/*")) {
          // Handle wildcard patterns like 'image/*'
          const prefix = pattern.slice(0, -2);
          return file.type.startsWith(prefix);
        }
        return file.type === pattern;
      });

      if (!isAllowed) {
        event.preventDefault();
        console.warn(`File type ${file.type} is not allowed`);
        return;
      }
    }

    // Custom validation
    if (onFileAccept) {
      const result = onFileAccept(file);
      if (result === false) {
        event.preventDefault();
      }
    }
  }, []);

  // Handle attachment upload
  const handleAttachmentAdd = useCallback((event: Event) => {
    const e = event as unknown as TrixAttachmentAddEvent;
    const attachment = (e as CustomEvent).detail?.attachment || (e as any).attachment;
    if (!attachment) return;

    const { onUpload } = optionsRef.current;

    // Only handle attachments with files (not pre-existing attachments)
    const file = attachment.file;
    if (!file || !onUpload) return;

    // Create handlers for the upload function
    const handlers = {
      setProgress: (progress: number) => {
        attachment.setUploadProgress(progress);
      },
      setAttributes: (attributes: Record<string, unknown>) => {
        attachment.setAttributes(attributes);
      },
    };

    // Call the upload function
    try {
      const result = onUpload(file, handlers);
      // Handle async upload functions
      if (result instanceof Promise) {
        result.catch((error) => {
          console.error("Attachment upload failed:", error);
        });
      }
    } catch (error) {
      console.error("Attachment upload failed:", error);
    }
  }, []);

  // Subscribe to events
  useEffect(() => {
    const element = ref.current?.element;
    if (!element) return;

    element.addEventListener("trix-file-accept", handleFileAccept);
    element.addEventListener("trix-attachment-add", handleAttachmentAdd);

    return () => {
      element.removeEventListener("trix-file-accept", handleFileAccept);
      element.removeEventListener("trix-attachment-add", handleAttachmentAdd);
    };
  }, [ref, handleFileAccept, handleAttachmentAdd]);
}

export default useTrixAttachment;
