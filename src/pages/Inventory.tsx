import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Search, Plus, Edit2, Save, X, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  nameTh: string;
  description: string | null;
  descriptionTh: string | null;
  category: string;
  price: number;
  cost: number | null;
  stockQuantity: number;
  unit: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const Inventory = () => {
  const { language } = useStore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    nameTh: '',
    description: '',
    descriptionTh: '',
    category: 'food',
    price: '',
    cost: '',
    stockQuantity: '',
    unit: 'unit',
    image: '',
    isActive: true
  });

  const categories = [
    { value: 'food', labelTh: 'อาหาร', labelEn: 'Food' },
    { value: 'beverage', labelTh: 'เครื่องดื่ม', labelEn: 'Beverage' },
    { value: 'dessert', labelTh: 'ของหวาน', labelEn: 'Dessert' },
    { value: 'appetizer', labelTh: 'ของว่าง', labelEn: 'Appetizer' },
    { value: 'other', labelTh: 'อื่นๆ', labelEn: 'Other' }
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, searchTerm, categoryFilter]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('erp.inventory_items')
        .select('*')
        .order('name', { ascending: true });

      const formatted = data?.map(item => ({
        id: item.id,
        sku: item.sku,
        name: item.name,
        nameTh: item.name_th,
        description: item.description,
        descriptionTh: item.description_th,
        category: item.category,
        price: parseFloat(item.price),
        cost: item.cost ? parseFloat(item.cost) : null,
        stockQuantity: item.stock_quantity,
        unit: item.unit,
        image: item.image,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })) || [];

      setItems(formatted);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error(language === 'th' ? 'เกิดข้อผิดพลาด' : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nameTh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      nameTh: '',
      description: '',
      descriptionTh: '',
      category: 'food',
      price: '',
      cost: '',
      stockQuantity: '',
      unit: 'unit',
      image: '',
      isActive: true
    });
  };

  const handleAdd = async () => {
    if (!formData.sku || !formData.name || !formData.nameTh || !formData.price || !formData.stockQuantity) {
      toast.error(language === 'th' ? 'กรุณากรอกข้อมูลที่จำเป็น' : 'Please fill required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('erp.inventory_items')
        .insert([{
          sku: formData.sku,
          name: formData.name,
          name_th: formData.nameTh,
          description: formData.description || null,
          description_th: formData.descriptionTh || null,
          category: formData.category,
          price: parseFloat(formData.price),
          cost: formData.cost ? parseFloat(formData.cost) : null,
          stock_quantity: parseInt(formData.stockQuantity),
          unit: formData.unit,
          image: formData.image || null,
          is_active: formData.isActive
        }]);

      if (error) throw error;

      toast.success(language === 'th' ? 'เพิ่มสินค้าสำเร็จ' : 'Product added successfully');
      setShowAddModal(false);
      resetForm();
      fetchInventory();
    } catch (error: any) {
      console.error('Error adding product:', error);
      if (error.code === '23505') {
        toast.error(language === 'th' ? 'SKU ซ้ำ' : 'SKU already exists');
      } else {
        toast.error(language === 'th' ? 'เกิดข้อผิดพลาด' : 'Failed to add product');
      }
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      sku: item.sku,
      name: item.name,
      nameTh: item.nameTh,
      description: item.description || '',
      descriptionTh: item.descriptionTh || '',
      category: item.category,
      price: item.price.toString(),
      cost: item.cost?.toString() || '',
      stockQuantity: item.stockQuantity.toString(),
      unit: item.unit,
      image: item.image || '',
      isActive: item.isActive
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedItem || !formData.name || !formData.nameTh || !formData.price || !formData.stockQuantity) {
      toast.error(language === 'th' ? 'กรุณากรอกข้อมูลที่จำเป็น' : 'Please fill required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('erp.inventory_items')
        .update({
          name: formData.name,
          name_th: formData.nameTh,
          description: formData.description || null,
          description_th: formData.descriptionTh || null,
          category: formData.category,
          price: parseFloat(formData.price),
          cost: formData.cost ? parseFloat(formData.cost) : null,
          stock_quantity: parseInt(formData.stockQuantity),
          unit: formData.unit,
          image: formData.image || null,
          is_active: formData.isActive
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast.success(language === 'th' ? 'อัปเดตสำเร็จ' : 'Product updated successfully');
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      fetchInventory();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(language === 'th' ? 'เกิดข้อผิดพลาด' : 'Failed to update product');
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: 'text-red-600', label: language === 'th' ? 'หมด' : 'Out of Stock' };
    if (quantity < 10) return { color: 'text-yellow-600', label: language === 'th' ? 'ใกล้หมด' : 'Low Stock' };
    return { color: 'text-green-600', label: language === 'th' ? 'มีสต็อก' : 'In Stock' };
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? (language === 'th' ? cat.labelTh : cat.labelEn) : category;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'th' ? 'จัดการสินค้าคงคลัง' : 'Inventory Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'จัดการสินค้าและสต็อก' : 'Manage products and stock'}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          {language === 'th' ? 'เพิ่มสินค้า' : 'Add Product'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'th' ? 'ค้นหาด้วยชื่อหรือ SKU...' : 'Search by name or SKU...'}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">{language === 'th' ? 'หมวดหมู่ทั้งหมด' : 'All Categories'}</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {language === 'th' ? cat.labelTh : cat.labelEn}
            </option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'สินค้าทั้งหมด' : 'Total Products'}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredItems.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'สินค้าหมด' : 'Out of Stock'}
          </p>
          <p className="text-2xl font-bold text-red-600">
            {filteredItems.filter(i => i.stockQuantity === 0).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'สต็อกต่ำ' : 'Low Stock'}
          </p>
          <p className="text-2xl font-bold text-yellow-600">
            {filteredItems.filter(i => i.stockQuantity > 0 && i.stockQuantity < 10).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'มูลค่าสต็อก' : 'Stock Value'}
          </p>
          <p className="text-2xl font-bold text-green-600">
            ฿{filteredItems.reduce((sum, item) => sum + (item.price * item.stockQuantity), 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            {language === 'th' ? 'ไม่พบสินค้า' : 'No products found'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const stockStatus = getStockStatus(item.stockQuantity);
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition"
              >
                <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {language === 'th' ? item.nameTh : item.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                    </div>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {getCategoryLabel(item.category)}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ฿{item.price.toFixed(2)}
                    </span>
                    <span className={`text-sm font-medium ${stockStatus.color}`}>
                      {item.stockQuantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.stockQuantity < 10 && (
                      <AlertTriangle className={`w-4 h-4 ${stockStatus.color}`} />
                    )}
                    <span className={`text-xs ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'th' ? 'เพิ่มสินค้าใหม่' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'หมวดหมู่' : 'Category'} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {language === 'th' ? cat.labelTh : cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ชื่อ (EN)' : 'Name (EN)'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ชื่อ (TH)' : 'Name (TH)'} *
                </label>
                <input
                  type="text"
                  value={formData.nameTh}
                  onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ราคา' : 'Price'} *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ต้นทุน' : 'Cost'}
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'จำนวนสต็อก' : 'Stock Quantity'} *
                </label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'หน่วย' : 'Unit'}
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="unit">{language === 'th' ? 'ชิ้น' : 'Unit'}</option>
                  <option value="kg">{language === 'th' ? 'กิโลกรัม' : 'Kilogram'}</option>
                  <option value="liter">{language === 'th' ? 'ลิตร' : 'Liter'}</option>
                  <option value="bottle">{language === 'th' ? 'ขวด' : 'Bottle'}</option>
                  <option value="plate">{language === 'th' ? 'จาน' : 'Plate'}</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'URL รูปภาพ' : 'Image URL'}
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'th' ? 'เปิดใช้งาน' : 'Active'}
                  </span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Save className="w-5 h-5" />
                {language === 'th' ? 'บันทึก' : 'Save'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Same structure as Add Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'th' ? 'แก้ไขสินค้า' : 'Edit Product'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU (Read-only)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'หมวดหมู่' : 'Category'} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {language === 'th' ? cat.labelTh : cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ชื่อ (EN)' : 'Name (EN)'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ชื่อ (TH)' : 'Name (TH)'} *
                </label>
                <input
                  type="text"
                  value={formData.nameTh}
                  onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ราคา' : 'Price'} *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ต้นทุน' : 'Cost'}
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'จำนวนสต็อก' : 'Stock Quantity'} *
                </label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'หน่วย' : 'Unit'}
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="unit">{language === 'th' ? 'ชิ้น' : 'Unit'}</option>
                  <option value="kg">{language === 'th' ? 'กิโลกรัม' : 'Kilogram'}</option>
                  <option value="liter">{language === 'th' ? 'ลิตร' : 'Liter'}</option>
                  <option value="bottle">{language === 'th' ? 'ขวด' : 'Bottle'}</option>
                  <option value="plate">{language === 'th' ? 'จาน' : 'Plate'}</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'URL รูปภาพ' : 'Image URL'}
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'th' ? 'เปิดใช้งาน' : 'Active'}
                  </span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Save className="w-5 h-5" />
                {language === 'th' ? 'อัปเดต' : 'Update'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                {language === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
