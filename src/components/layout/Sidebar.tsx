import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Wallet, FileText, Package, Moon, Sun, Menu } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/i18n';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { language, setLanguage, isDarkMode, toggleDarkMode } = useStore();
  const t = translations[language];

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t.dashboard },
    { path: '/pos', icon: ShoppingCart, label: t.pos },
    { path: '/inventory', icon: Package, label: language === 'th' ? 'คลังสินค้า' : 'Inventory' },
    { path: '/cashier', icon: Wallet, label: t.cashier },
    { path: '/audit', icon: FileText, label: t.auditLog },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && <h1 className="text-xl font-bold">SPN rOS</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer Controls */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!isCollapsed && <span>{isDarkMode ? 'Light' : 'Dark'}</span>}
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-semibold"
        >
          <span className="w-5 h-5 flex items-center justify-center">
            {language.toUpperCase()}
          </span>
          {!isCollapsed && <span>{language === 'th' ? 'ไทย' : 'English'}</span>}
        </button>
      </div>
    </aside>
  );
};

