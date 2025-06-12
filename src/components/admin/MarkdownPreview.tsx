'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  if (!content) {
    return null;
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsPreviewVisible(!isPreviewVisible)}
        className="text-sm text-blue-600 hover:text-blue-800 mb-2 flex items-center"
      >
        {isPreviewVisible ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zm1.414 2.586a1 1 0 10-1.414-1.414l-1.414 1.414a1 1 0 101.414 1.414l1.414-1.414zM7.293 6.707a1 1 0 010-1.414l1.414-1.414a1 1 0 111.414 1.414L8.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Скрыть предпросмотр
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Показать предпросмотр
          </>
        )}
      </button>

      {isPreviewVisible && (
        <div className="border rounded-md p-4 bg-white">
          <div className="prose max-w-none">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
} 