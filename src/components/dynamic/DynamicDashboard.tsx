import React from 'react';
import DynamicRenderer from './DynamicRenderer';
import { ComponentConfig } from '@/types';

interface DynamicDashboardProps {
  childrenConfig?: ComponentConfig[];
}

export const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ childrenConfig = [] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {childrenConfig.length === 0 ? (
        <div className="col-span-full py-12 text-center text-xs text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
          No dashboard panels defined. Add cards, tables, or forms inside the layout.
        </div>
      ) : (
        childrenConfig.map((child, i) => {
          // Dynamic width spanning: table and stats span full row, cards/forms sit side-by-side
          const isFullRow = child.type === 'table' || child.type === 'stats';
          return (
            <div
              key={i}
              className={isFullRow ? 'col-span-full' : 'col-span-1'}
            >
              <DynamicRenderer node={child} />
            </div>
          );
        })
      )}
    </div>
  );
};

export default DynamicDashboard;
