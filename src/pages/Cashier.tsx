import { useStore } from '../lib/store';

export const Cashier = () => {
  const { language } = useStore();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        {language === 'th' ? 'แคชเชียร์' : 'Cashier'}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        {language === 'th'
          ? 'จัดการกะการทำงานและลิ้นชักเงินสด (เร็วๆ นี้)'
          : 'Manage shifts and cash drawer (Coming soon)'}
      </p>
    </div>
  );
};

