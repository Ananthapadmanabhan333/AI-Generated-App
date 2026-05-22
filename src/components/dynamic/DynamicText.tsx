import React from 'react';

interface DynamicTextProps {
  content?: string;
  variant?: 'heading' | 'subheading' | 'body' | string;
}

export const DynamicText: React.FC<DynamicTextProps> = ({ content = '', variant = 'body' }) => {
  if (variant === 'heading') {
    return <h2 className="text-xl font-bold tracking-tight text-white mb-2">{content}</h2>;
  }
  if (variant === 'subheading') {
    return <h3 className="text-base font-semibold text-zinc-300 mb-1">{content}</h3>;
  }
  return <p className="text-sm text-zinc-400 leading-relaxed">{content}</p>;
};

export default DynamicText;
