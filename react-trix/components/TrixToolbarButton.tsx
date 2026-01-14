"use client";

import React, { useEffect, useState, useCallback } from "react";
import type {
  TrixToolbarButtonProps,
  TrixAttribute,
  TrixAction,
  TrixAttributesChangeEvent,
  TrixActionsChangeEvent,
} from "../types";

/**
 * TrixToolbarButton - A toolbar button for controlling the Trix editor
 *
 * Can toggle formatting attributes (bold, italic, etc.) or invoke actions (undo, redo, etc.)
 *
 * @example
 * ```tsx
 * <TrixToolbarButton attribute="bold" editorRef={editorRef}>
 *   <strong>B</strong>
 * </TrixToolbarButton>
 *
 * <TrixToolbarButton action="undo" editorRef={editorRef}>
 *   ↩ Undo
 * </TrixToolbarButton>
 * ```
 */
function TrixToolbarButton({
  attribute,
  action,
  editorRef,
  children,
  activeClassName = "trix-active",
  className = "",
  title,
  disabled: disabledProp = false,
  style,
}: TrixToolbarButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Compute the button title
  const buttonTitle = title || attribute || action;

  // Handle attribute state changes
  const handleAttributesChange = useCallback(
    (event: Event) => {
      if (!attribute) return;
      const e = event as unknown as TrixAttributesChangeEvent;
      const attributes = (e as CustomEvent).detail?.attributes;
      if (attributes) {
        setIsActive(!!attributes[attribute]);
        // Disable if attribute value is explicitly false (not just falsy)
        setIsDisabled(attributes[attribute] === false);
      }
    },
    [attribute]
  );

  // Handle action state changes
  const handleActionsChange = useCallback(
    (event: Event) => {
      if (!action) return;
      const e = event as unknown as TrixActionsChangeEvent;
      const actions = (e as CustomEvent).detail?.actions;
      if (actions) {
        // For actions, availability means the action can be performed
        setIsDisabled(!actions[action]);
      }
    },
    [action]
  );

  // Subscribe to state changes
  useEffect(() => {
    const element = editorRef.current?.element;
    if (!element) return;

    if (attribute) {
      element.addEventListener("trix-attributes-change", handleAttributesChange);
      // Initial check - query current state
      const editor = editorRef.current?.editor;
      if (editor) {
        setIsActive(editor.attributeIsActive(attribute));
        setIsDisabled(!editor.canActivateAttribute(attribute));
      }
    }

    if (action) {
      element.addEventListener("trix-actions-change", handleActionsChange);
      // Initial check for actions
      const editor = editorRef.current?.editor;
      if (editor) {
        switch (action) {
          case "undo":
            setIsDisabled(!editor.canUndo());
            break;
          case "redo":
            setIsDisabled(!editor.canRedo());
            break;
          case "increaseNestingLevel":
            setIsDisabled(!editor.canIncreaseNestingLevel());
            break;
          case "decreaseNestingLevel":
            setIsDisabled(!editor.canDecreaseNestingLevel());
            break;
        }
      }
    }

    return () => {
      if (attribute) {
        element.removeEventListener("trix-attributes-change", handleAttributesChange);
      }
      if (action) {
        element.removeEventListener("trix-actions-change", handleActionsChange);
      }
    };
  }, [attribute, action, editorRef, handleAttributesChange, handleActionsChange]);

  // Handle click
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const editor = editorRef.current?.editor;
      if (!editor) return;

      if (attribute) {
        if (editor.attributeIsActive(attribute)) {
          editor.deactivateAttribute(attribute);
        } else {
          editor.activateAttribute(attribute);
        }
      } else if (action) {
        switch (action) {
          case "undo":
            editor.undo();
            break;
          case "redo":
            editor.redo();
            break;
          case "increaseNestingLevel":
            editor.increaseNestingLevel();
            break;
          case "decreaseNestingLevel":
            editor.decreaseNestingLevel();
            break;
          case "attachFiles":
            // Trigger file input click
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.addEventListener("change", () => {
              if (input.files) {
                editor.insertFiles(input.files);
              }
            });
            input.click();
            break;
          case "link":
            // The link action typically opens a dialog
            // For custom toolbars, you might want to handle this differently
            const url = prompt("Enter URL:");
            if (url) {
              editor.activateAttribute("href", url);
            }
            break;
        }
      }

      // Return focus to editor
      editorRef.current?.focus();
    },
    [attribute, action, editorRef]
  );

  // Compute class names
  const computedClassName = [
    "trix-button",
    className,
    isActive ? activeClassName : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={computedClassName}
      title={buttonTitle}
      disabled={disabledProp || isDisabled}
      onClick={handleClick}
      style={style}
      tabIndex={-1}
      data-trix-attribute={attribute}
      data-trix-action={action}
      data-trix-active={isActive ? "" : undefined}
    >
      {children}
    </button>
  );
}

export default TrixToolbarButton;
