import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TrendingUp, Users, Database, Layers } from 'lucide-react';

interface MetricDef {
  label: string;
  value: string | number;
  source?: string;
}

interface DynamicStatsProps {
  title?: string;
  metrics?: MetricDef[];
}

export const DynamicStats: React.FC<DynamicStatsProps> = ({ title = 'Application Stats', metrics = [] }) => {
  const { previewData, fetchCollectionData } = useAppStore();

  useEffect(() => {
    metrics.forEach((metric) => {
      if (metric.source) {
        fetchCollectionData(metric.source);
      }
    });
  }, [metrics, fetchCollectionData]);

  const resolveValue = (metric: MetricDef) => {
    if (metric.source && metric.value === 'count') {
      const records = previewData[metric.source];
      return Array.isArray(records) ? records.length : 0;
    }
    return metric.value !== undefined ? metric.value : 0;
  };

  const getMetricIcon = (index: number) => {
    const icons = [
      <Users className="w-5 h-5 text-indigo-400" key="users" />,
      <Database className="w-5 h-5 text-emerald-400" key="db" />,
      <Layers className="w-5 h-5 text-cyan-400" key="layers" />,
      <TrendingUp className="w-5 h-5 text-amber-400" key="trending" />,
    ];
    return icons[index % icons.length];
  };

  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.length === 0 ? (
          <div className="col-span-full py-6 text-center text-xs text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/30">
            No stats metrics defined.
          </div>
        ) : (
          metrics.map((metric, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/60 shadow-md backdrop-blur-md flex items-center justify-between group transition-all duration-300"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-400/80 group-hover:text-zinc-300 transition-colors">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold tracking-tight text-white">
                  {resolveValue(metric)}
                </p>
              </div>
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/60 shadow-inner group-hover:scale-105 transition-transform duration-200">
                {getMetricIcon(i)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DynamicStats;
