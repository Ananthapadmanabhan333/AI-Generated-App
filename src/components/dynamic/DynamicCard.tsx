import React from 'react';
import DynamicRenderer from './DynamicRenderer';
import { ComponentConfig } from '@/types';

interface DynamicCardProps {
  title?: string;
  childrenConfig?: ComponentConfig[];
}

export const DynamicCard: React.FC<DynamicCardProps> = ({ title, childrenConfig = [] }) => {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/25 p-5 shadow-lg backdrop-blur-sm space-y-4 hover:border-zinc-800 transition-colors">
      {title && (
        <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase pb-2 border-b border-zinc-900">
          {title}
        </h3>
      )}
      <div className="space-y-4">
        {childrenConfig.length === 0 ? (
          <p className="text-[10px] text-zinc-600 italic">Empty layout box node</p>
        ) : (
          childrenConfig.map((child, i) => (
            <DynamicRenderer key={i} node={child} />
          ))
        )}
      </div>
    </div>
  );
};

export default DynamicCard;
