/**
 * Trix React Components - TypeScript Type Definitions
 * Compatible with React 19.2 and Next.js 15.5.6
 */

import type { CSSProperties, ReactNode, RefObject, DetailedHTMLProps, HTMLAttributes } from "react";

// ============================================================================
// Core Trix Types
// ============================================================================

/**
 * Text formatting attributes available in Trix
 */
export type TrixTextAttribute = "bold" | "italic" | "strike" | "href" | "frozen";

/**
 * Block-level formatting attributes available in Trix
 */
export type TrixBlockAttribute = "heading1" | "quote" | "code" | "bullet" | "number";

/**
 * All formatting attributes combined
 */
export type TrixAttribute = TrixTextAttribute | TrixBlockAttribute;

/**
 * Actions that can be invoked on the editor
 */
export type TrixAction =
  | "undo"
  | "redo"
  | "link"
  | "increaseNestingLevel"
  | "decreaseNestingLevel"
  | "attachFiles";

/**
 * Direction for delete operations
 */
export type TrixDirection = "forward" | "backward";

// ============================================================================
// Attachment Types
// ============================================================================

/**
 * Attributes that can be set on a Trix attachment
 */
export interface TrixAttachmentAttributes {
  url?: string;
  href?: string;
  filename?: string;
  filesize?: number;
  contentType?: string;
  width?: number;
  height?: number;
  previewable?: boolean;
  content?: string;
  caption?: string;
  [key: string]: unknown;
}

/**
 * Trix Attachment object - represents embedded files/media
 */
export interface TrixAttachment {
  id: string;
  file?: File;
  attributes: TrixAttachmentAttributes;
  
  // Getters
  getURL(): string | undefined;
  getHref(): string | undefined;
  getFilename(): string | undefined;
  getFilesize(): number | undefined;
  getContentType(): string | undefined;
  getWidth(): number | undefined;
  getHeight(): number | undefined;
  getContent(): string | undefined;
  getPreviewURL(): string | undefined;
  
  // Setters
  setAttributes(attributes: Partial<TrixAttachmentAttributes>): void;
  setUploadProgress(progress: number): void;
  
  // Checks
  isPreviewable(): boolean;
  isPending(): boolean;
}

/**
 * Upload progress handler for attachments
 */
export interface TrixAttachmentUploadHandlers {
  setProgress: (progress: number) => void;
  setAttributes: (attributes: Partial<TrixAttachmentAttributes>) => void;
}

/**
 * Upload function signature for attachment handling
 */
export type TrixAttachmentUploadFn = (
  file: File,
  handlers: TrixAttachmentUploadHandlers
) => void | Promise<void>;

// ============================================================================
// Document Types
// ============================================================================

/**
 * Trix Document - the core document model
 */
export interface TrixDocument {
  toString(): string;
  toJSON(): object;
  getLength(): number;
  isEmpty(): boolean;
  copy(): TrixDocument;
  isEqualTo(document: TrixDocument): boolean;
}

/**
 * Editor snapshot for undo/redo and persistence
 */
export interface TrixSnapshot {
  document: TrixDocument;
  selectedRange: [number, number];
}

// ============================================================================
// Editor Types
// ============================================================================

/**
 * The Trix Editor instance - programmatic API
 */
export interface TrixEditor {
  // Document
  getDocument(): TrixDocument;
  getSelectedDocument(): TrixDocument;
  loadDocument(document: TrixDocument): void;
  loadHTML(html: string): void;
  loadJSON(snapshot: TrixSnapshot): void;
  getSnapshot(): TrixSnapshot;

  // Selection
  getSelectedRange(): [number, number];
  setSelectedRange(range: [number, number]): void;
  getPosition(): number;
  expandSelectionInDirection(direction: TrixDirection): void;
  moveCursorInDirection(direction: TrixDirection): void;

  // Content Insertion
  insertString(string: string): void;
  insertHTML(html: string): void;
  insertDocument(document: TrixDocument): void;
  insertLineBreak(): void;
  insertAttachment(attachment: TrixAttachment): void;
  insertFile(file: File): void;
  insertFiles(files: FileList | File[]): void;
  deleteInDirection(direction: TrixDirection): void;

  // Attributes
  activateAttribute(name: TrixAttribute, value?: unknown): void;
  deactivateAttribute(name: TrixAttribute): void;
  attributeIsActive(name: TrixAttribute): boolean;
  canActivateAttribute(name: TrixAttribute): boolean;

  // Nesting (for lists)
  canIncreaseNestingLevel(): boolean;
  canDecreaseNestingLevel(): boolean;
  increaseNestingLevel(): void;
  decreaseNestingLevel(): void;

  // Undo/Redo
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): void;
  redo(): void;
  recordUndoEntry(description: string, options?: { context?: unknown; consolidatable?: boolean }): void;

  // Composition (internal)
  composition: unknown;
}

/**
 * The trix-editor custom element
 */
export interface TrixEditorElement extends HTMLElement {
  editor: TrixEditor;
  value: string;
  inputElement: HTMLInputElement | null;
  toolbarElement: HTMLElement | null;
  disabled: boolean;
  
  // Form-related
  form: HTMLFormElement | null;
  name: string;
  
  // Methods
  focus(): void;
  blur(): void;
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Base Trix event with editor reference
 */
export interface TrixBaseEvent extends CustomEvent {
  target: TrixEditorElement;
}

/**
 * trix-change event - content changed
 */
export interface TrixChangeEvent extends TrixBaseEvent {
  type: "trix-change";
}

/**
 * trix-selection-change event
 */
export interface TrixSelectionChangeEvent extends TrixBaseEvent {
  type: "trix-selection-change";
}

/**
 * trix-initialize event
 */
export interface TrixInitializeEvent extends TrixBaseEvent {
  type: "trix-initialize";
}

/**
 * trix-focus event
 */
export interface TrixFocusEvent extends TrixBaseEvent {
  type: "trix-focus";
}

/**
 * trix-blur event
 */
export interface TrixBlurEvent extends TrixBaseEvent {
  type: "trix-blur";
}

/**
 * trix-file-accept event - cancelable
 */
export interface TrixFileAcceptEvent extends TrixBaseEvent {
  type: "trix-file-accept";
  file: File;
}

/**
 * trix-attachment-add event
 */
export interface TrixAttachmentAddEvent extends TrixBaseEvent {
  type: "trix-attachment-add";
  attachment: TrixAttachment;
}

/**
 * trix-attachment-edit event
 */
export interface TrixAttachmentEditEvent extends TrixBaseEvent {
  type: "trix-attachment-edit";
  attachment: TrixAttachment;
}

/**
 * trix-attachment-remove event
 */
export interface TrixAttachmentRemoveEvent extends TrixBaseEvent {
  type: "trix-attachment-remove";
  attachment: TrixAttachment;
}

/**
 * trix-before-paste event - cancelable
 */
export interface TrixBeforePasteEvent extends TrixBaseEvent {
  type: "trix-before-paste";
  paste: {
    type: string;
    html?: string;
    string?: string;
    range: [number, number];
  };
}

/**
 * trix-paste event
 */
export interface TrixPasteEvent extends TrixBaseEvent {
  type: "trix-paste";
  paste: {
    type: string;
    html?: string;
    string?: string;
    range: [number, number];
  };
}

/**
 * trix-attributes-change event
 */
export interface TrixAttributesChangeEvent extends TrixBaseEvent {
  type: "trix-attributes-change";
  attributes: Record<TrixAttribute, boolean | string>;
}

/**
 * trix-actions-change event
 */
export interface TrixActionsChangeEvent extends TrixBaseEvent {
  type: "trix-actions-change";
  actions: Record<TrixAction, boolean>;
}

/**
 * All Trix event types
 */
export type TrixEvent =
  | TrixChangeEvent
  | TrixSelectionChangeEvent
  | TrixInitializeEvent
  | TrixFocusEvent
  | TrixBlurEvent
  | TrixFileAcceptEvent
  | TrixAttachmentAddEvent
  | TrixAttachmentEditEvent
  | TrixAttachmentRemoveEvent
  | TrixBeforePasteEvent
  | TrixPasteEvent
  | TrixAttributesChangeEvent
  | TrixActionsChangeEvent;

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Ref handle exposed by TrixEditor component
 */
export interface TrixEditorRef {
  /** The underlying Trix editor instance */
  editor: TrixEditor | null;
  /** The trix-editor DOM element */
  element: TrixEditorElement | null;
  /** Current HTML value */
  value: string;
  /** Focus the editor */
  focus: () => void;
  /** Blur the editor */
  blur: () => void;
  /** Insert HTML at cursor */
  insertHTML: (html: string) => void;
  /** Insert an attachment */
  insertAttachment: (attachment: TrixAttachment) => void;
  /** Insert a file */
  insertFile: (file: File) => void;
  /** Load HTML content (replaces all content) */
  loadHTML: (html: string) => void;
  /** Get current document snapshot */
  getSnapshot: () => TrixSnapshot | null;
}

/**
 * Props for TrixEditor component
 */
export interface TrixEditorProps {
  /** Initial HTML content (only applied once on mount) */
  initialValue?: string;
  
  /** Callback when content changes */
  onValueChange?: (html: string) => void;
  
  /** Callback when editor is initialized */
  onInitialize?: (event: TrixInitializeEvent) => void;
  
  /** Callback when selection changes */
  onSelectionChange?: (event: TrixSelectionChangeEvent) => void;
  
  /** Callback when editor gains focus */
  onFocus?: (event: TrixFocusEvent) => void;
  
  /** Callback when editor loses focus */
  onBlur?: (event: TrixBlurEvent) => void;
  
  /** Callback when a file is about to be added (can be prevented) */
  onFileAccept?: (event: TrixFileAcceptEvent) => void;
  
  /** Callback when an attachment is added */
  onAttachmentAdd?: (event: TrixAttachmentAddEvent) => void;
  
  /** Callback when an attachment is edited */
  onAttachmentEdit?: (event: TrixAttachmentEditEvent) => void;
  
  /** Callback when an attachment is removed */
  onAttachmentRemove?: (event: TrixAttachmentRemoveEvent) => void;
  
  /** Callback before paste (can be prevented) */
  onBeforePaste?: (event: TrixBeforePasteEvent) => void;
  
  /** Callback after paste */
  onPaste?: (event: TrixPasteEvent) => void;
  
  /** Callback when formatting attributes change */
  onAttributesChange?: (event: TrixAttributesChangeEvent) => void;
  
  /** Callback when action availability changes */
  onActionsChange?: (event: TrixActionsChangeEvent) => void;
  
  /** ID of a trix-toolbar element to use (pass false to disable default toolbar) */
  toolbar?: string | false;
  
  /** Placeholder text when editor is empty */
  placeholder?: string;
  
  /** Disable the editor */
  disabled?: boolean;
  
  /** Auto-focus on mount */
  autofocus?: boolean;
  
  /** Name attribute for form submission */
  name?: string;
  
  /** ID for the editor element */
  id?: string;
  
  /** Additional CSS class names */
  className?: string;
  
  /** Inline styles */
  style?: CSSProperties;
  
  /** aria-label for accessibility */
  "aria-label"?: string;
  
  /** aria-describedby for accessibility */
  "aria-describedby"?: string;
}

/**
 * Props for TrixToolbar component
 */
export interface TrixToolbarProps {
  /** ID for the toolbar (required to link with editor) */
  id: string;
  
  /** Custom toolbar content (replaces default) */
  children?: ReactNode;
  
  /** Additional CSS class names */
  className?: string;
  
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for TrixToolbarButton component
 */
export interface TrixToolbarButtonProps {
  /** The attribute to toggle (e.g., "bold", "italic") */
  attribute?: TrixAttribute;
  
  /** The action to invoke (e.g., "undo", "redo") */
  action?: TrixAction;
  
  /** Reference to the TrixEditor */
  editorRef: RefObject<TrixEditorRef | null>;
  
  /** Button content */
  children: ReactNode;
  
  /** CSS class when button is active */
  activeClassName?: string;
  
  /** Additional CSS class names */
  className?: string;
  
  /** Button title/tooltip */
  title?: string;
  
  /** Disable the button */
  disabled?: boolean;
  
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for TrixContent component (read-only display)
 */
export interface TrixContentProps {
  /** HTML content to display */
  html: string;
  
  /** Additional CSS class names */
  className?: string;
  
  /** Inline styles */
  style?: CSSProperties;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Event handlers for useTrixEvents hook
 */
export interface TrixEventHandlers {
  onChange?: (event: TrixChangeEvent) => void;
  onSelectionChange?: (event: TrixSelectionChangeEvent) => void;
  onInitialize?: (event: TrixInitializeEvent) => void;
  onFocus?: (event: TrixFocusEvent) => void;
  onBlur?: (event: TrixBlurEvent) => void;
  onFileAccept?: (event: TrixFileAcceptEvent) => void;
  onAttachmentAdd?: (event: TrixAttachmentAddEvent) => void;
  onAttachmentEdit?: (event: TrixAttachmentEditEvent) => void;
  onAttachmentRemove?: (event: TrixAttachmentRemoveEvent) => void;
  onBeforePaste?: (event: TrixBeforePasteEvent) => void;
  onPaste?: (event: TrixPasteEvent) => void;
  onAttributesChange?: (event: TrixAttributesChangeEvent) => void;
  onActionsChange?: (event: TrixActionsChangeEvent) => void;
}

/**
 * Return type for useTrixEditor hook
 */
export interface UseTrixEditorReturn {
  /** The Trix editor instance */
  editor: TrixEditor | null;
  /** Whether the editor is ready */
  isReady: boolean;
  /** Current HTML value */
  value: string;
  /** Insert HTML at cursor */
  insertHTML: (html: string) => void;
  /** Insert an attachment */
  insertAttachment: (attachment: TrixAttachment) => void;
  /** Activate a formatting attribute */
  activateAttribute: (name: TrixAttribute, value?: unknown) => void;
  /** Deactivate a formatting attribute */
  deactivateAttribute: (name: TrixAttribute) => void;
  /** Check if an attribute is active */
  attributeIsActive: (name: TrixAttribute) => boolean;
  /** Check if an attribute can be activated */
  canActivateAttribute: (name: TrixAttribute) => boolean;
}

// ============================================================================
// Global Trix Declaration (for window.Trix)
// ============================================================================

declare global {
  interface Window {
    Trix?: {
      VERSION: string;
      config: unknown;
    };
  }
}

// Note: JSX.IntrinsicElements for trix-editor and trix-toolbar are declared
// in react-trix/trix-jsx.d.ts to avoid declaration conflicts.

export {};
