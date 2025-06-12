import React from 'react';

interface MarkdownToolbarProps {
  textareaId: string;
}

export default function MarkdownToolbar({ textareaId }: MarkdownToolbarProps) {
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    const newText = selectedText 
      ? beforeText + prefix + selectedText + suffix + afterText
      : beforeText + prefix + suffix + afterText;

    textarea.value = newText;

    // Trigger change event to update React state
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);

    // Set cursor position
    textarea.focus();
    setTimeout(() => {
      textarea.selectionStart = selectedText ? start + prefix.length : start + prefix.length;
      textarea.selectionEnd = selectedText ? end + prefix.length : start + prefix.length;
    }, 0);
  };

  const buttonClass = "px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded text-sm transition-colors duration-150 flex items-center justify-center min-w-[36px]";

  return (
    <div className="flex flex-wrap gap-1.5 mb-2 p-1.5 bg-gray-50 border border-gray-200 rounded-md">
      <button
        type="button"
        onClick={() => insertMarkdown('**', '**')}
        className={buttonClass}
        title="Жирный текст"
      >
        <span className="font-bold">Ж</span>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('*', '*')}
        className={buttonClass}
        title="Курсив"
      >
        <span className="italic">К</span>
      </button>
      <div className="h-6 w-px bg-gray-200 mx-1"></div>
      <button
        type="button"
        onClick={() => insertMarkdown('## ')}
        className={buttonClass}
        title="Заголовок H2"
      >
        <span className="font-semibold">H2</span>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('### ')}
        className={buttonClass}
        title="Заголовок H3"
      >
        <span className="font-semibold">H3</span>
      </button>
      <div className="h-6 w-px bg-gray-200 mx-1"></div>
      <button
        type="button"
        onClick={() => insertMarkdown('- ')}
        className={buttonClass}
        title="Маркированный список"
      >
        <span>•</span>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('1. ')}
        className={buttonClass}
        title="Нумерованный список"
      >
        <span>1.</span>
      </button>
      <div className="h-6 w-px bg-gray-200 mx-1"></div>
      <button
        type="button"
        onClick={() => insertMarkdown('[', '](https://)')}
        className={buttonClass}
        title="Ссылка"
      >
        <span>🔗</span>
      </button>
      <button
        type="button"
        onClick={() => insertMarkdown('> ')}
        className={buttonClass}
        title="Цитата"
      >
        <span>❝</span>
      </button>
    </div>
  );
} 