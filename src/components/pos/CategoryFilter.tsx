import type { Category } from '../../types';
import { useStore } from '../../lib/store';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) => {
  const { language } = useStore();


  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
          selectedCategory === null
            ? 'bg-primary-500 text-white'
            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
        }`}
      >
        {language === 'th' ? 'ทั้งหมด' : 'All'}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedCategory === category.id
              ? 'bg-primary-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {language === 'en' && category.name_en ? category.name_en : category.name}
        </button>
      ))}
    </div>
  );
};

