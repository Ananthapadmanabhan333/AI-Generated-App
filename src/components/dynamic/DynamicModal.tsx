import React, { useState } from 'react';
import DynamicRenderer from './DynamicRenderer';
import { ComponentConfig } from '@/types';
import { X, Layers } from 'lucide-react';

interface DynamicModalProps {
  title?: string;
  childrenConfig?: ComponentConfig[];
}

export const DynamicModal: React.FC<DynamicModalProps> = ({ title = 'Overlay Dialog', childrenConfig = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600 border border-zinc-700/50 rounded-lg transition-all flex items-center space-x-2 active:scale-95 cursor-pointer shadow-md"
      >
        <Layers className="w-3.5 h-3.5 text-zinc-400" />
        <span>Open {title}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-scaleIn">
            
            {/* Close Toggle */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 p-1.5 border border-zinc-800 bg-zinc-950/60 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {title && (
              <h3 className="text-sm font-bold text-white mb-4 pr-10 border-b border-zinc-800/60 pb-2">
                {title}
              </h3>
            )}

            {/* Inner Content Area */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {childrenConfig.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No inner components configured inside dialog.</p>
              ) : (
                childrenConfig.map((child, i) => (
                  <DynamicRenderer key={i} node={child} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicModal;
