/**
 * React Trix Components
 * 
 * A comprehensive React wrapper for the Trix rich text editor.
 * Compatible with React 19.2 and Next.js 15.5.6.
 * 
 * @example
 * ```tsx
 * import { TrixEditor, TrixToolbar, TrixContent, useTrixEditor } from '@/react-trix';
 * import '@/react-trix/styles/trix.css';
 * ```
 */

// Components
export { default as TrixEditor } from "./components/TrixEditor";
export { default as TrixToolbar } from "./components/TrixToolbar";
export { default as TrixToolbarButton } from "./components/TrixToolbarButton";
export { default as TrixContent } from "./components/TrixContent";

// Hooks
export { useTrixEditor } from "./hooks/useTrixEditor";
export { useTrixEvents } from "./hooks/useTrixEvents";
export { useTrixAttachment } from "./hooks/useTrixAttachment";

// Types
export type {
  // Core types
  TrixTextAttribute,
  TrixBlockAttribute,
  TrixAttribute,
  TrixAction,
  TrixDirection,
  
  // Attachment types
  TrixAttachmentAttributes,
  TrixAttachment,
  TrixAttachmentUploadHandlers,
  TrixAttachmentUploadFn,
  
  // Document types
  TrixDocument,
  TrixSnapshot,
  
  // Editor types
  TrixEditor as TrixEditorType,
  TrixEditorElement,
  
  // Event types
  TrixBaseEvent,
  TrixChangeEvent,
  TrixSelectionChangeEvent,
  TrixInitializeEvent,
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
  TrixEvent,
  
  // Component prop types
  TrixEditorRef,
  TrixEditorProps,
  TrixToolbarProps,
  TrixToolbarButtonProps,
  TrixContentProps,
  
  // Hook types
  TrixEventHandlers,
  UseTrixEditorReturn,
} from "./types";
