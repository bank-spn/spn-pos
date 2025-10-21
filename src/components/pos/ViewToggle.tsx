import { Grid3x3, List } from 'lucide-react';
import type { ViewMode } from '../../types';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle = ({ viewMode, onViewModeChange }: ViewToggleProps) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          viewMode === 'grid'
            ? 'bg-gray-200 dark:bg-gray-700'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <Grid3x3 className="w-4 h-4" />
        <span>Grid</span>
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white transition-colors ${
          viewMode === 'list'
            ? 'bg-primary-600'
            : 'hover:bg-primary-600'
        }`}
      >
        <List className="w-4 h-4" />
        <span>Quick Edit</span>
      </button>
    </div>
  );
};

