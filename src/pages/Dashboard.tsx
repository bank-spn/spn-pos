import { useStore } from '../lib/store';

export const Dashboard = () => {
  const { language } = useStore();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        {language === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        {language === 'th'
          ? 'สรุปภาพรวมของร้านค้า (เร็วๆ นี้)'
          : 'Store overview summary (Coming soon)'}
      </p>
    </div>
  );
};

