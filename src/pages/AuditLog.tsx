import { useStore } from '../lib/store';

export const AuditLog = () => {
  const { language } = useStore();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        {language === 'th' ? 'บันทึกการตรวจสอบ' : 'Audit Log'}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        {language === 'th'
          ? 'ประวัติการทำรายการทั้งหมด (เร็วๆ นี้)'
          : 'All transaction history (Coming soon)'}
      </p>
    </div>
  );
};

