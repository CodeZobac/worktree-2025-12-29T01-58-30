"use client";

/**
 * Example Page - Trix Editor React Components Demo
 * 
 * This page demonstrates all features of the React Trix components:
 * - Basic uncontrolled editor with onValueChange
 * - Form submission with ref access
 * - Custom toolbar with TrixToolbarButton
 * - Attachment upload handling with progress
 * - TrixContent for read-only display
 * 
 * Usage in Next.js 15.5.6:
 * 1. Copy the react-trix folder to your project
 * 2. Install dependencies: npm install trix dompurify
 * 3. Import and use the components
 */

import React, { useRef, useState, useCallback } from "react";

// Import components
import TrixEditor from "./components/TrixEditor";
import TrixToolbar from "./components/TrixToolbar";
import TrixToolbarButton from "./components/TrixToolbarButton";
import TrixContent from "./components/TrixContent";

// Import hooks
import { useTrixEditor } from "./hooks/useTrixEditor";
import { useTrixAttachment } from "./hooks/useTrixAttachment";

// Import styles
import "./styles/trix.css";

// Import types
import type { TrixEditorRef, TrixAttachmentAddEvent } from "./types";

// =============================================================================
// Example 1: Basic Editor with Default Toolbar
// =============================================================================

function BasicEditorExample() {
  const [content, setContent] = useState("");
  const [charCount, setCharCount] = useState(0);

  const handleChange = useCallback((html: string) => {
    setContent(html);
    // Strip HTML for character count
    const text = html.replace(/<[^>]*>/g, "");
    setCharCount(text.length);
  }, []);

  return (
    <section className="example-section">
      <h2>1. Basic Editor with Default Toolbar</h2>
      <p className="description">
        A simple editor with the default Trix toolbar. Content changes are tracked via onValueChange.
      </p>

      <TrixEditor
        placeholder="Write something amazing..."
        initialValue="<p>Hello! This is the <strong>Trix editor</strong> in React.</p>"
        onValueChange={handleChange}
      />

      <div className="meta">
        <span>Characters: {charCount}</span>
      </div>

      <details>
        <summary>View HTML Output</summary>
        <pre className="html-output">{content}</pre>
      </details>
    </section>
  );
}

// =============================================================================
// Example 2: Form Integration with Ref
// =============================================================================

function FormIntegrationExample() {
  const editorRef = useRef<TrixEditorRef>(null);
  const [submittedContent, setSubmittedContent] = useState<string | null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const html = editorRef.current?.value || "";
    setSubmittedContent(html);
    alert("Form submitted! Check the preview below.");
  }, []);

  const handleInsertDate = useCallback(() => {
    const date = new Date().toLocaleDateString();
    editorRef.current?.insertHTML(`<em>${date}</em>`);
    editorRef.current?.focus();
  }, []);

  const handleClear = useCallback(() => {
    editorRef.current?.loadHTML("");
    editorRef.current?.focus();
  }, []);

  return (
    <section className="example-section">
      <h2>2. Form Integration with Ref</h2>
      <p className="description">
        Access the editor via ref for form submission and programmatic control.
      </p>

      <form onSubmit={handleSubmit}>
        <TrixEditor
          ref={editorRef}
          name="content"
          placeholder="Enter your message..."
          initialValue="<p>Use the buttons below to insert content programmatically.</p>"
        />

        <div className="button-row">
          <button type="button" onClick={handleInsertDate}>
            Insert Date
          </button>
          <button type="button" onClick={handleClear}>
            Clear
          </button>
          <button type="submit">Submit</button>
        </div>
      </form>

      {submittedContent && (
        <div className="preview-box">
          <h4>Submitted Content Preview:</h4>
          <TrixContent html={submittedContent} />
        </div>
      )}
    </section>
  );
}

// =============================================================================
// Example 3: Custom Toolbar
// =============================================================================

function CustomToolbarExample() {
  const editorRef = useRef<TrixEditorRef>(null);
  const { isReady } = useTrixEditor(editorRef);

  return (
    <section className="example-section">
      <h2>3. Custom Toolbar with React Buttons</h2>
      <p className="description">
        Build your own toolbar using TrixToolbarButton components for full control over the UI.
      </p>

      <TrixToolbar id="custom-toolbar">
        <div className="custom-toolbar-group">
          <TrixToolbarButton
            attribute="bold"
            editorRef={editorRef}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </TrixToolbarButton>
          <TrixToolbarButton
            attribute="italic"
            editorRef={editorRef}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </TrixToolbarButton>
          <TrixToolbarButton
            attribute="strike"
            editorRef={editorRef}
            title="Strikethrough"
          >
            <s>S</s>
          </TrixToolbarButton>
        </div>

        <span className="toolbar-divider" />

        <div className="custom-toolbar-group">
          <TrixToolbarButton
            attribute="heading1"
            editorRef={editorRef}
            title="Heading"
          >
            H1
          </TrixToolbarButton>
          <TrixToolbarButton
            attribute="quote"
            editorRef={editorRef}
            title="Quote"
          >
            &ldquo;&rdquo;
          </TrixToolbarButton>
          <TrixToolbarButton
            attribute="code"
            editorRef={editorRef}
            title="Code Block"
          >
            {"</>"}
          </TrixToolbarButton>
        </div>

        <span className="toolbar-divider" />

        <div className="custom-toolbar-group">
          <TrixToolbarButton
            attribute="bullet"
            editorRef={editorRef}
            title="Bullet List"
          >
            •
          </TrixToolbarButton>
          <TrixToolbarButton
            attribute="number"
            editorRef={editorRef}
            title="Numbered List"
          >
            1.
          </TrixToolbarButton>
        </div>

        <span className="toolbar-divider" />

        <div className="custom-toolbar-group">
          <TrixToolbarButton
            action="undo"
            editorRef={editorRef}
            title="Undo (Ctrl+Z)"
          >
            ↩
          </TrixToolbarButton>
          <TrixToolbarButton
            action="redo"
            editorRef={editorRef}
            title="Redo (Ctrl+Shift+Z)"
          >
            ↪
          </TrixToolbarButton>
        </div>
      </TrixToolbar>

      <TrixEditor
        ref={editorRef}
        toolbar="custom-toolbar"
        placeholder="Try the custom toolbar above..."
        initialValue="<p>This editor uses a <strong>custom React toolbar</strong> instead of the default Trix toolbar.</p>"
      />

      <div className="meta">
        Editor ready: {isReady ? "✅ Yes" : "⏳ Loading..."}
      </div>
    </section>
  );
}

// =============================================================================
// Example 4: Attachment Upload with Progress
// =============================================================================

function AttachmentUploadExample() {
  const editorRef = useRef<TrixEditorRef>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Simulated upload function
  const handleUpload = useCallback(
    async (
      file: File,
      handlers: { setProgress: (p: number) => void; setAttributes: (attrs: Record<string, unknown>) => void }
    ) => {
      setUploadStatus(`Uploading: ${file.name}...`);

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        handlers.setProgress(progress);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Simulate server response with URL
      // In production, this would be the actual upload endpoint response
      const fakeUrl = URL.createObjectURL(file);

      handlers.setAttributes({
        url: fakeUrl,
        href: fakeUrl,
      });

      setUploadStatus(`✅ Uploaded: ${file.name}`);

      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(""), 3000);
    },
    []
  );

  // Use the attachment hook
  useTrixAttachment(editorRef, {
    onUpload: handleUpload,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/*", "application/pdf"],
    onFileAccept: (file) => {
      // Custom validation example
      if (file.name.includes("secret")) {
        alert("Files with 'secret' in the name are not allowed!");
        return false;
      }
      return true;
    },
  });

  return (
    <section className="example-section">
      <h2>4. Attachment Upload with Progress</h2>
      <p className="description">
        Drag and drop files or use the attach button. The useTrixAttachment hook handles uploads with progress tracking.
      </p>

      <TrixEditor
        ref={editorRef}
        placeholder="Try dragging an image here..."
        initialValue="<p>Drag and drop an image or click the <strong>attach</strong> button in the toolbar.</p>"
      />

      {uploadStatus && (
        <div className="upload-status">{uploadStatus}</div>
      )}

      <div className="meta">
        Allowed: Images and PDFs up to 10MB
      </div>
    </section>
  );
}

// =============================================================================
// Example 5: Read-Only Content Display
// =============================================================================

function ReadOnlyDisplayExample() {
  const sampleContent = `
    <h1>Article Title</h1>
    <p>This is a <strong>read-only</strong> display of rich text content using the <em>TrixContent</em> component.</p>
    <blockquote>
      <p>The content is sanitized with DOMPurify for security.</p>
    </blockquote>
    <ul>
      <li>Feature 1: XSS Protection</li>
      <li>Feature 2: Proper Trix styling</li>
      <li>Feature 3: No editing capability</li>
    </ul>
    <pre>const greeting = "Hello, World!";</pre>
  `;

  return (
    <section className="example-section">
      <h2>5. Read-Only Content Display</h2>
      <p className="description">
        Use TrixContent to display saved HTML content with proper Trix styling.
      </p>

      <div className="content-display-box">
        <TrixContent html={sampleContent} />
      </div>
    </section>
  );
}

// =============================================================================
// Example 6: Disabled Editor
// =============================================================================

function DisabledEditorExample() {
  const [isDisabled, setIsDisabled] = useState(true);

  return (
    <section className="example-section">
      <h2>6. Disabled Editor</h2>
      <p className="description">
        Toggle the disabled state to enable/disable editing.
      </p>

      <TrixEditor
        disabled={isDisabled}
        initialValue="<p>This editor can be <strong>disabled</strong> and <strong>enabled</strong> dynamically.</p>"
        placeholder="Cannot edit when disabled..."
      />

      <button
        onClick={() => setIsDisabled(!isDisabled)}
        className="toggle-button"
      >
        {isDisabled ? "Enable Editor" : "Disable Editor"}
      </button>
    </section>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================

export default function TrixExamplesPage() {
  return (
    <div className="trix-examples-page">
      <header>
        <h1>🖊️ Trix Editor - React Components</h1>
        <p>
          A comprehensive set of React 19.2 components wrapping the Trix rich text editor
          for Next.js 15.5.6 applications.
        </p>
      </header>

      <main>
        <BasicEditorExample />
        <FormIntegrationExample />
        <CustomToolbarExample />
        <AttachmentUploadExample />
        <ReadOnlyDisplayExample />
        <DisabledEditorExample />
      </main>

      <footer>
        <h3>Installation</h3>
        <pre>{`npm install trix dompurify
npm install -D @types/dompurify`}</pre>
        
        <h3>Quick Start</h3>
        <pre>{`import TrixEditor from '@/react-trix/components/TrixEditor';
import '@/react-trix/styles/trix.css';

export default function MyPage() {
  return (
    <TrixEditor
      placeholder="Write here..."
      onValueChange={(html) => console.log(html)}
    />
  );
}`}</pre>
      </footer>

      <style jsx>{`
        .trix-examples-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: system-ui, -apple-system, sans-serif;
        }

        header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #eee;
        }

        header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        header p {
          color: #666;
          font-size: 1.1rem;
        }

        .example-section {
          margin-bottom: 3rem;
          padding: 1.5rem;
          border: 1px solid #eee;
          border-radius: 8px;
          background: #fafafa;
        }

        .example-section h2 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .description {
          color: #666;
          margin-bottom: 1rem;
        }

        .meta {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #888;
        }

        .button-row {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .button-row button,
        .toggle-button {
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .button-row button:hover,
        .toggle-button:hover {
          background: #f5f5f5;
        }

        .button-row button[type="submit"] {
          background: #0070f3;
          color: white;
          border-color: #0070f3;
        }

        .button-row button[type="submit"]:hover {
          background: #0051cc;
        }

        .preview-box,
        .content-display-box {
          margin-top: 1rem;
          padding: 1rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .preview-box h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #666;
        }

        details {
          margin-top: 1rem;
        }

        summary {
          cursor: pointer;
          color: #0070f3;
          font-size: 0.875rem;
        }

        .html-output {
          margin-top: 0.5rem;
          padding: 1rem;
          background: #1e1e1e;
          color: #9cdcfe;
          border-radius: 4px;
          font-size: 0.75rem;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .upload-status {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #e8f5e9;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .custom-toolbar-group {
          display: inline-flex;
          gap: 2px;
        }

        .toolbar-divider {
          display: inline-block;
          width: 1px;
          height: 1.5em;
          background: #ddd;
          margin: 0 0.5rem;
          vertical-align: middle;
        }

        .toggle-button {
          margin-top: 1rem;
        }

        footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        footer h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }

        footer pre {
          padding: 1rem;
          background: #1e1e1e;
          color: #9cdcfe;
          border-radius: 4px;
          font-size: 0.875rem;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
