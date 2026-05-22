import { AlertTriangle } from 'lucide-react';

interface FallbackComponentProps {
  type: string;
  config: any;
}

export const FallbackComponent: React.FC<FallbackComponentProps> = ({ type, config }) => {
  return (
    <div className="p-5 border-2 border-dashed border-amber-500/40 rounded-xl bg-amber-500/5 text-amber-200 shadow-md transition-all duration-300">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-sm tracking-wide text-amber-300 uppercase">
            Unrecognized Component: &quot;{type}&quot;
          </h4>
          <p className="text-xs text-amber-200/70">
            The platform parsed a widget tag that is not loaded in the runtime component registry.
          </p>
          
          <div className="mt-3">
            <details className="text-xs group border border-amber-500/20 rounded-md bg-zinc-900/60 p-2 cursor-pointer transition-all duration-200">
              <summary className="font-medium text-amber-400 flex items-center justify-between outline-none select-none">
                <span>View Configuration Node</span>
                <span className="text-zinc-500 group-open:rotate-180 transition-transform duration-200">▼</span>
              </summary>
              <pre className="mt-2 p-2 rounded bg-zinc-950 font-mono text-[10px] text-emerald-400 overflow-x-auto select-all">
                {JSON.stringify(config, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackComponent;
