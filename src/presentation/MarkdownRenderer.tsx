"use client";

import React from 'react';

interface MarkdownRendererProps {
  text?: string;
  onCalculatorRedirect?: () => void;
}

/**
 * Parses a string to replace **bold** markup with <strong> tags.
 */
const parseBold = (str: string) => {
  const parts = str.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <strong key={i} className="text-secondary font-extrabold">
          {part}
        </strong>
      );
    }
    return part;
  });
};

/**
 * Standalone component that safely parses and renders a custom subset of Markdown
 * (headings, numbered lists, bullet lists, bold text) for EcoPulse AI insights.
 * Follows the Single Responsibility Principle (SRP) by isolating text formatting logic.
 */
export default function MarkdownRenderer({ text, onCalculatorRedirect }: MarkdownRendererProps) {
  if (!text) {
    return (
      <div className="text-center py-8 text-on-surface-variant/80">
        <span className="material-symbols-outlined text-4xl block text-primary/40 mb-3" aria-hidden="true">
          auto_awesome
        </span>
        <p className="text-body-md font-medium">No AI insights generated yet.</p>
        {onCalculatorRedirect && (
          <button
            type="button"
            onClick={onCalculatorRedirect}
            className="mt-3 text-label-sm font-bold text-secondary underline hover:opacity-90 transition-all focus:outline-none"
          >
            Fill out Calculator to run AI analysis
          </button>
        )}
      </div>
    );
  }

  const lines = text.split('\n');

  return (
    <div className="space-y-4 font-body-md text-body-md text-on-surface-variant select-text pr-2 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('###')) {
          return (
            <h3
              key={idx}
              className="font-headline-sm text-headline-sm text-primary font-bold mt-5 mb-2.5 border-b border-white/5 pb-2"
            >
              {trimmed.replace(/^###\s*/, '')}
            </h3>
          );
        }

        if (trimmed.startsWith('##')) {
          return (
            <h2
              key={idx}
              className="font-headline-md text-headline-md text-primary font-bold mt-6 mb-3 border-b border-white/10 pb-2"
            >
              {trimmed.replace(/^##\s*/, '')}
            </h2>
          );
        }

        const numberedMatch = trimmed.match(/^\d+\./);
        if (numberedMatch) {
          const content = trimmed.replace(/^\d+\.\s*/, '');
          return (
            <div key={idx} className="flex gap-2.5 items-start pl-2 my-2.5">
              <span className="text-primary font-extrabold shrink-0">{numberedMatch[0]}</span>
              <span className="flex-1 text-on-surface-variant font-medium">{parseBold(content)}</span>
            </div>
          );
        }

        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.replace(/^[-*]\s*/, '');
          return (
            <div key={idx} className="flex gap-2.5 items-start pl-4 my-2.5">
              <span className="text-secondary shrink-0">•</span>
              <span className="flex-1 text-on-surface-variant font-medium">{parseBold(content)}</span>
            </div>
          );
        }

        if (trimmed === '') {
          return <div key={idx} className="h-1" />;
        }

        return (
          <p key={idx} className="font-medium text-on-surface-variant my-2.5">
            {parseBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
