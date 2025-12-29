"use client";

import React, { useRef, useState } from 'react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  name?: string;
  className?: string;
  'aria-label'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

interface ToolbarButton {
  label: string;
  icon: string;
  action: () => void;
  title: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text with markdown formatting...',
  rows = 8,
  id,
  name,
  className = '',
  ...ariaProps
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '', placeholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newValue =
      value.substring(0, start) +
      before +
      textToInsert +
      after +
      value.substring(end);

    onChange(newValue);

    // Set cursor position after insertion
    setTimeout(() => {
      if (selectedText) {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + textToInsert.length
        );
      } else {
        textarea.focus();
        const newPosition = start + before.length + placeholder.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const toolbarButtons: ToolbarButton[] = [
    {
      label: 'B',
      icon: '**',
      action: () => insertMarkdown('**', '**', 'bold text'),
      title: 'Bold (Ctrl+B)',
    },
    {
      label: 'I',
      icon: '*',
      action: () => insertMarkdown('*', '*', 'italic text'),
      title: 'Italic (Ctrl+I)',
    },
    {
      label: 'H1',
      icon: '#',
      action: () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newValue =
          value.substring(0, lineStart) +
          '# ' +
          value.substring(lineStart);
        onChange(newValue);
        setTimeout(() => {
          textarea.focus();
          const newPosition = start + 2;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      },
      title: 'Heading 1',
    },
    {
      label: 'H2',
      icon: '##',
      action: () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newValue =
          value.substring(0, lineStart) +
          '## ' +
          value.substring(lineStart);
        onChange(newValue);
        setTimeout(() => {
          textarea.focus();
          const newPosition = start + 3;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      },
      title: 'Heading 2',
    },
    {
      label: '•',
      icon: '-',
      action: () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newValue =
          value.substring(0, lineStart) +
          '- ' +
          value.substring(lineStart);
        onChange(newValue);
        setTimeout(() => {
          textarea.focus();
          const newPosition = start + 2;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      },
      title: 'Bullet List',
    },
    {
      label: '1.',
      icon: '1.',
      action: () => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const newValue =
          value.substring(0, lineStart) +
          '1. ' +
          value.substring(lineStart);
        onChange(newValue);
        setTimeout(() => {
          textarea.focus();
          const newPosition = start + 3;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      },
      title: 'Numbered List',
    },
    {
      label: 'Link',
      icon: '[]',
      action: () => insertMarkdown('[', '](url)', 'link text'),
      title: 'Insert Link',
    },
    {
      label: 'Code',
      icon: '`',
      action: () => insertMarkdown('`', '`', 'code'),
      title: 'Inline Code',
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // History undo/redo support check (basic)
    // For more complex undo/redo, we would need to manage a history stack.
    // For now, we rely on browser native history which works for most programmed insertions 
    // if we use execCommand or specific React patterns, but direct value manipulation 
    // breaks the native history stack. 
    // NOTE: For a production-grade editor, consider wrapping with a history manager.

    // TAB: Indent/Unindent
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selection = value.substring(start, end);

      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = value.indexOf('\n', end);
      const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;

      // If multi-line selection or single line
      const textToProcess = value.substring(lineStart, actualLineEnd);
      const lines = textToProcess.split('\n');

      let processedLines: string[] = [];
      let selectionAdjustmentStart = 0;
      let selectionAdjustmentEnd = 0;

      if (e.shiftKey) {
        // Unindent (Shift+Tab)
        processedLines = lines.map((line, i) => {
          if (line.startsWith('  ')) {
            if (i === 0) selectionAdjustmentStart -= 2; // Create logical logic for selection
            selectionAdjustmentEnd -= 2;
            return line.substring(2);
          } else if (line.startsWith(' ')) {
            if (i === 0) selectionAdjustmentStart -= 1;
            selectionAdjustmentEnd -= 1;
            return line.substring(1);
          }
          return line;
        });
      } else {
        // Indent (Tab)
        processedLines = lines.map((line, i) => {
          if (i === 0) selectionAdjustmentStart += 2;
          selectionAdjustmentEnd += 2;
          return '  ' + line;
        });
      }

      const newValue = value.substring(0, lineStart) + processedLines.join('\n') + value.substring(actualLineEnd);
      onChange(newValue);

      // Restore selection
      setTimeout(() => {
        textarea.setSelectionRange(
          Math.max(lineStart, start + selectionAdjustmentStart),
          Math.max(lineStart, end + selectionAdjustmentEnd)
        );
      }, 0);
      return;
    }

    // ENTER: Smart list continuation
    if (e.key === 'Enter') {
      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const currentLine = value.substring(lineStart, start);

      // Regex for lists
      // 1. Numbered list: "   1. "
      const numberedListRegex = /^(\s*)(\d+)\.\s+(.*)$/;
      // 2. Bullet list: "   - " or "   * "
      const bulletListRegex = /^(\s*)([-*])\s+(.*)$/;
      // 3. Empty list item: "   1. " or "   - "
      const emptyListRegex = /^(\s*)((\d+)\.|[-*])\s*$/;

      const emptyMatch = currentLine.match(emptyListRegex);
      if (emptyMatch) {
        // Empty list item -> Terminate list
        e.preventDefault();
        // Remove the current list marker
        const newValue = value.substring(0, lineStart) + value.substring(start);
        onChange(newValue);
        // Move to next line naturally? No, just remove text and ensure newline?
        // Actually if we just remove the line content, we are still on the same line.
        // We want to effectively 'delete' this line's list marker and insert a newline or just stop.
        // Common behavior: First Enter clears line. Second Enter (already clear) makes new line.
        // Since this matches only if there are spaces/numbers but NO text, let's clear it.
        return;
      }

      const matchNum = currentLine.match(numberedListRegex);
      if (matchNum) {
        e.preventDefault();
        const indent = matchNum[1];
        const currentNum = parseInt(matchNum[2], 10);
        const nextNum = currentNum + 1;
        const insertion = `\n${indent}${nextNum}. `;

        const newValue = value.substring(0, start) + insertion + value.substring(start);
        onChange(newValue);
        setTimeout(() => {
          textarea.setSelectionRange(start + insertion.length, start + insertion.length);
        }, 0);
        return;
      }

      const matchBullet = currentLine.match(bulletListRegex);
      if (matchBullet) {
        e.preventDefault();
        const indent = matchBullet[1];
        const marker = matchBullet[2]; // - or *
        const insertion = `\n${indent}${marker} `;

        const newValue = value.substring(0, start) + insertion + value.substring(start);
        onChange(newValue);
        setTimeout(() => {
          textarea.setSelectionRange(start + insertion.length, start + insertion.length);
        }, 0);
        return;
      }
    }

    // Auto-wrapping characters: ", *, _, `, [, (
    const wrapChars: Record<string, string> = {
      '"': '"',
      '*': '*',
      '_': '_',
      '`': '`',
      '[': ']',
      '(': ')',
      '{': '}'
    };

    if (wrapChars[e.key] && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        e.preventDefault();
        const selectedText = value.substring(start, end);
        const openChar = e.key;
        const closeChar = wrapChars[e.key];

        const newValue = value.substring(0, start) + openChar + selectedText + closeChar + value.substring(end);
        onChange(newValue);

        setTimeout(() => {
          // Select the text inside
          textarea.setSelectionRange(start + 1, end + 1);
        }, 0);
      }
    }

    // Default formatting shortcuts
    // Handle Ctrl+B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**', 'bold text');
    }
    // Handle Ctrl+I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('*', '*', 'italic text');
    }
    // Handle Ctrl+K for link
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      if (selected) {
        // Wrap current selection
        insertMarkdown('[', '](url)', 'link text');
        // We might want to select 'url' part.
        // For simplicity using existing helper.
      } else {
        insertMarkdown('[', '](url)', 'link text');
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const clipboardData = e.clipboardData;
    const pastedText = clipboardData.getData('text');

    // Check if pasted text is a URL
    const urlRegex = /^(http|https):\/\/[^ "]+$/;

    if (urlRegex.test(pastedText)) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        // If text is selected and we paste a URL, turn it into a link
        e.preventDefault();
        const selectedText = value.substring(start, end);
        const newValue = value.substring(0, start) + `[${selectedText}](${pastedText})` + value.substring(end);
        onChange(newValue);
        return;
      }
    }
  };

  return (
    <div className="markdown-editor">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 border-b-0 rounded-t-lg bg-gray-50">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            title={button.title}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-colors touch-manipulation min-h-[32px]"
            aria-label={button.title}
          >
            {button.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`px-3 py-1.5 text-sm font-medium border rounded transition-colors touch-manipulation min-h-[32px] ${showPreview
              ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          aria-label={showPreview ? 'Hide preview' : 'Show preview'}
        >
          {showPreview ? '📝 Edit' : '👁 Preview'}
        </button>
      </div>

      {/* Editor/Preview Area */}
      {showPreview ? (
        <div className={`w-full px-4 py-3 border border-gray-300 rounded-b-lg bg-white prose prose-sm max-w-none min-h-[${rows * 24}px] overflow-auto ${className}`}>
          <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(value) }} />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={rows}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent touch-manipulation font-mono text-sm resize-y ${className}`}
          {...ariaProps}
        />
      )}

      {/* Help Text */}
      <p className="mt-1 text-xs text-gray-500">
        Markdown supported: **bold**, *italic*, # heading, - list, [link](url), `code`
      </p>
    </div>
  );
};

// Simple markdown preview renderer (basic implementation)
// This will be replaced with proper react-markdown in the view component
function renderMarkdownPreview(text: string): string {
  let html = text;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Lists
  html = html.replace(/^\- (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*<\/li>)/g, '<ul>$1</ul>');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}

export default MarkdownEditor;
