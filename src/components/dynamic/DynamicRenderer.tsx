import React from 'react';
import { ComponentConfig } from '@/types';
import DynamicForm from './DynamicForm';
import DynamicTable from './DynamicTable';
import DynamicCard from './DynamicCard';
import DynamicDashboard from './DynamicDashboard';
import DynamicStats from './DynamicStats';
import DynamicModal from './DynamicModal';
import DynamicText from './DynamicText';
import DynamicButton from './DynamicButton';
import FallbackComponent from './FallbackComponent';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackType: string;
  fallbackConfig: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Visual Error Boundary targeting configuration compiling errors inside layouts.
 * If a custom nested panel throws an error, this boundary isolates the issue,
 * displaying standard diagnostic telemetry, while leaving the rest of the application active.
 */
class ComponentErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CRITICAL: Dynamic Component compiled exception prevented:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-rose-500/20 rounded-xl bg-rose-500/5 text-rose-300">
          <h4 className="font-semibold text-xs tracking-wider text-rose-400 uppercase">
            Compilation Error Prevented
          </h4>
          <p className="text-[10px] text-zinc-400 mt-1 font-mono">
            {this.state.error?.message || 'Exception compiling layout node properties'}
          </p>
          <pre className="mt-2 p-1.5 rounded bg-zinc-950 font-mono text-[9px] text-zinc-500 max-h-24 overflow-y-auto select-all">
            {JSON.stringify(this.props.fallbackConfig, null, 2)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

interface DynamicRendererProps {
  node: ComponentConfig;
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ node }) => {
  if (!node || typeof node !== 'object') {
    return <FallbackComponent type="null_node" config={node} />;
  }

  const { type, title, collection, fields, columns, metrics, children, content, variant } = node;

  const renderComponent = () => {
    switch (type) {
      case 'dashboard':
        return <DynamicDashboard childrenConfig={children} />;

      case 'card':
        return <DynamicCard title={title} childrenConfig={children} />;

      case 'stats':
        return <DynamicStats title={title} metrics={metrics} />;

      case 'form':
        return (
          <DynamicForm
            title={title}
            collection={collection || ''}
            fields={fields || []}
          />
        );

      case 'table':
        return (
          <DynamicTable
            title={title}
            collection={collection || ''}
            columns={columns}
          />
        );

      case 'modal':
        return <DynamicModal title={title} childrenConfig={children} />;

      case 'text':
        return <DynamicText content={content} variant={variant} />;

      case 'button':
        return <DynamicButton title={title} variant={variant} />;

      default:
        return <FallbackComponent type={type} config={node} />;
    }
  };

  return (
    <ComponentErrorBoundary fallbackType={type} fallbackConfig={node}>
      {renderComponent()}
    </ComponentErrorBoundary>
  );
};

export default DynamicRenderer;
