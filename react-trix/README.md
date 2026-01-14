# React Trix Components

A comprehensive set of React 19.2 components wrapping the [Trix](https://trix-editor.org/) rich text editor for Next.js 15.5.6 applications.

## Features

- 🎨 **Full Trix Editor** - All Trix features: formatting, lists, attachments, undo/redo
- 🔧 **Uncontrolled by Default** - Avoids cursor position issues, with optional value callbacks
- 🛠️ **Custom Toolbar Support** - Use default toolbar or build your own with React components
- 📎 **Attachment Handling** - Hook-based file upload with progress tracking
- 🔒 **XSS Protection** - Content sanitized with DOMPurify
- 🌙 **Dark Mode** - Built-in dark mode support via CSS custom properties
- 📱 **Responsive** - Mobile-friendly toolbar and editor
- 🔷 **TypeScript** - Full type definitions included

## Installation

```bash
# Install peer dependencies
npm install trix dompurify

# For TypeScript support
npm install -D @types/dompurify
```

Then copy the `react-trix` folder to your Next.js project (e.g., `src/components/react-trix` or `lib/react-trix`).

## Quick Start

```tsx
"use client";

import TrixEditor from '@/react-trix/components/TrixEditor';
import '@/react-trix/styles/trix.css';

export default function MyPage() {
  return (
    <TrixEditor
      placeholder="Write something..."
      initialValue="<p>Hello <strong>World</strong>!</p>"
      onValueChange={(html) => console.log('Content:', html)}
    />
  );
}
```

## Components

### `<TrixEditor>`

The main editor component.

```tsx
import { useRef } from 'react';
import TrixEditor from '@/react-trix/components/TrixEditor';
import type { TrixEditorRef } from '@/react-trix/types';

function MyEditor() {
  const editorRef = useRef<TrixEditorRef>(null);

  return (
    <TrixEditor
      ref={editorRef}
      initialValue="<p>Initial content</p>"
      placeholder="Write here..."
      onValueChange={(html) => console.log(html)}
      onInitialize={(e) => console.log('Editor ready!')}
      onAttachmentAdd={(e) => console.log('File added:', e.attachment)}
      disabled={false}
      autofocus={false}
      name="content" // For form submission
    />
  );
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `initialValue` | `string` | Initial HTML content (applied once on mount) |
| `onValueChange` | `(html: string) => void` | Callback when content changes |
| `onInitialize` | `(event) => void` | Callback when editor is ready |
| `onSelectionChange` | `(event) => void` | Callback when selection changes |
| `onFocus` / `onBlur` | `(event) => void` | Focus/blur callbacks |
| `onAttachmentAdd` | `(event) => void` | Callback when file is added |
| `onFileAccept` | `(event) => void` | Validate files before adding |
| `toolbar` | `string \| false` | Toolbar ID or `false` to disable |
| `placeholder` | `string` | Placeholder text |
| `disabled` | `boolean` | Disable editing |
| `autofocus` | `boolean` | Auto-focus on mount |
| `name` | `string` | Name for form submission |
| `className` | `string` | Additional CSS classes |

#### Ref Methods

```tsx
const editorRef = useRef<TrixEditorRef>(null);

// Available methods:
editorRef.current?.editor       // The Trix editor instance
editorRef.current?.element      // The trix-editor DOM element
editorRef.current?.value        // Current HTML content
editorRef.current?.focus()      // Focus the editor
editorRef.current?.blur()       // Blur the editor
editorRef.current?.insertHTML(html)    // Insert HTML at cursor
editorRef.current?.insertFile(file)    // Insert a file
editorRef.current?.loadHTML(html)      // Replace all content
editorRef.current?.getSnapshot()       // Get document snapshot
```

### `<TrixToolbar>`

Toolbar component supporting default and custom modes.

```tsx
// Default toolbar (auto-populated by Trix)
<TrixToolbar id="my-toolbar" />
<TrixEditor toolbar="my-toolbar" />

// Custom toolbar with React components
<TrixToolbar id="custom-toolbar">
  <TrixToolbarButton attribute="bold" editorRef={editorRef}>
    <strong>B</strong>
  </TrixToolbarButton>
  <TrixToolbarButton attribute="italic" editorRef={editorRef}>
    <em>I</em>
  </TrixToolbarButton>
  <TrixToolbarButton action="undo" editorRef={editorRef}>
    ↩ Undo
  </TrixToolbarButton>
</TrixToolbar>
<TrixEditor ref={editorRef} toolbar="custom-toolbar" />
```

### `<TrixToolbarButton>`

Individual toolbar button for custom toolbars.

```tsx
<TrixToolbarButton
  attribute="bold"           // Text/block attribute to toggle
  // OR
  action="undo"              // Action to invoke
  editorRef={editorRef}      // Reference to the editor
  activeClassName="active"   // Class when attribute is active
  title="Bold (Ctrl+B)"      // Tooltip
>
  <strong>B</strong>
</TrixToolbarButton>
```

**Available Attributes:** `bold`, `italic`, `strike`, `href`, `heading1`, `quote`, `code`, `bullet`, `number`

**Available Actions:** `undo`, `redo`, `link`, `increaseNestingLevel`, `decreaseNestingLevel`, `attachFiles`

### `<TrixContent>`

Read-only display of HTML content with Trix styling.

```tsx
<TrixContent html={savedHtml} className="my-content" />
```

## Hooks

### `useTrixEditor`

Convenient access to the editor instance and state.

```tsx
import { useTrixEditor } from '@/react-trix/hooks/useTrixEditor';

function MyEditor() {
  const editorRef = useRef<TrixEditorRef>(null);
  const { 
    editor,           // Trix editor instance
    isReady,          // Whether editor is initialized
    value,            // Current HTML value
    insertHTML,       // Insert HTML at cursor
    activateAttribute,
    deactivateAttribute,
    attributeIsActive,
  } = useTrixEditor(editorRef);

  return <TrixEditor ref={editorRef} />;
}
```

### `useTrixEvents`

Subscribe to multiple Trix events.

```tsx
import { useTrixEvents } from '@/react-trix/hooks/useTrixEvents';

function MyEditor() {
  const editorRef = useRef<TrixEditorRef>(null);

  useTrixEvents(editorRef, {
    onChange: (e) => console.log('Changed:', e.target.value),
    onFocus: () => console.log('Focused'),
    onBlur: () => console.log('Blurred'),
    onAttachmentAdd: (e) => uploadFile(e.attachment),
  });

  return <TrixEditor ref={editorRef} />;
}
```

### `useTrixAttachment`

Handle file attachments with upload progress.

```tsx
import { useTrixAttachment } from '@/react-trix/hooks/useTrixAttachment';

function MyEditor() {
  const editorRef = useRef<TrixEditorRef>(null);

  useTrixAttachment(editorRef, {
    onUpload: async (file, { setProgress, setAttributes }) => {
      // Upload to your server
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const { url } = await response.json();
      setAttributes({ url, href: url });
    },
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'application/pdf'],
    onFileAccept: (file) => {
      // Return false to reject
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large!');
        return false;
      }
    },
  });

  return <TrixEditor ref={editorRef} />;
}
```

## Styling

Import the included CSS:

```tsx
import '@/react-trix/styles/trix.css';
```

### CSS Custom Properties

Customize the editor appearance with CSS variables:

```css
:root {
  --trix-border-color: #bbb;
  --trix-active-bg: #cbeefa;
  --trix-button-text: rgba(0, 0, 0, 0.6);
  --trix-editor-min-height: 5em;
  --trix-border-radius: 3px;
  /* See trix.css for all variables */
}
```

### Dark Mode

Dark mode is automatically applied via `prefers-color-scheme: dark`. Override with custom CSS if needed.

## Form Integration

The editor automatically creates a hidden input for form submission:

```tsx
<form onSubmit={handleSubmit}>
  <TrixEditor name="content" />
  <button type="submit">Submit</button>
</form>

// Access value via ref
const handleSubmit = (e) => {
  e.preventDefault();
  const html = editorRef.current?.value;
  // or use FormData
};
```

## Server-Side Rendering

The components are client-side only (`"use client"` directive). Trix requires `window` and `document`.

For pages that need SSR, use dynamic imports:

```tsx
import dynamic from 'next/dynamic';

const TrixEditor = dynamic(
  () => import('@/react-trix/components/TrixEditor'),
  { ssr: false }
);
```

## TypeScript

All types are exported from the types module:

```tsx
import type {
  TrixEditorRef,
  TrixEditorProps,
  TrixAttachment,
  TrixChangeEvent,
  // ... see types/index.ts for all types
} from '@/react-trix/types';
```

## Example Page

See [page.tsx](./page.tsx) for a complete example demonstrating all features.

## License

MIT - Based on [Trix](https://github.com/basecamp/trix) by Basecamp.
