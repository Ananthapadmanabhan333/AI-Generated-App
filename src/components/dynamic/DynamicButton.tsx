import React from 'react';

interface DynamicButtonProps {
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | string;
  onClick?: () => void;
}

export const DynamicButton: React.FC<DynamicButtonProps> = ({
  title = 'Submit',
  variant = 'primary',
  onClick,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/50';
      case 'outline':
        return 'border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 hover:text-white';
      case 'destructive':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'primary':
      default:
        return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/10 shadow-lg';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 active:scale-[0.98] ${getStyles()}`}
    >
      {title}
    </button>
  );
};

export default DynamicButton;
