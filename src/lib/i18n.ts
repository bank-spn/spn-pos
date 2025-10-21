import type { Language } from '../types';

export const translations = {
  th: {
    // Navigation
    dashboard: 'แดชบอร์ด',
    pos: 'ขายหน้าร้าน',
    cashier: 'แคชเชียร์',
    auditLog: 'บันทึกการตรวจสอบ',
    
    // POS
    posSystem: 'ระบบขายหน้าร้าน',
    posSubtitle: 'ระบบขายหน้าร้าน',
    grid: 'Grid',
    quickEdit: 'Quick Edit',
    all: 'ทั้งหมด',
    search: 'ค้นหา',
    searchPlaceholder: 'ค้นหาสินค้า...',
    
    // Cart
    orderList: 'รายการสั่งซื้อ',
    tableNumber: 'หมายเลขโต๊ะ',
    tableNumberPlaceholder: 'กรอกหมายเลขโต๊ะ (1-30)',
    emptyCart: 'ไม่มีรายการในตะกร้า',
    subtotal: 'ยอดรวม',
    tax: 'ภาษี',
    discount: 'ส่วนลด',
    total: 'รวมทั้งสิ้น',
    checkout: 'ชำระเงิน',
    
    // Checkout
    selectPaymentMethod: 'เลือกวิธีการชำระเงิน',
    cash: 'เงินสด',
    card: 'บัตร',
    qr: 'QR Code',
    receivedAmount: 'จำนวนเงินที่รับ',
    change: 'เงินทอน',
    confirmPayment: 'ยืนยันการชำระเงิน',
    cancel: 'ยกเลิก',
    
    // Cashier
    openShift: 'เปิดกะ',
    closeShift: 'ปิดกะ',
    startingCash: 'เงินสดเริ่มต้น',
    endingCash: 'เงินสดสิ้นสุด',
    cashIn: 'เงินเข้า',
    cashOut: 'เงินออก',
    reason: 'เหตุผล',
    
    // Common
    save: 'บันทึก',
    edit: 'แก้ไข',
    delete: 'ลบ',
    close: 'ปิด',
    confirm: 'ยืนยัน',
    baht: '฿',
    
    // Messages
    orderCompleted: 'สั่งซื้อสำเร็จ',
    orderFailed: 'สั่งซื้อไม่สำเร็จ',
    invalidPin: 'PIN ไม่ถูกต้อง',
    enterPin: 'กรอก PIN',
    pinPlaceholder: 'กรอก PIN 6 หลัก',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    pos: 'POS',
    cashier: 'Cashier',
    auditLog: 'Audit Log',
    
    // POS
    posSystem: 'Point of Sale System',
    posSubtitle: 'Point of Sale System',
    grid: 'Grid',
    quickEdit: 'Quick Edit',
    all: 'All',
    search: 'Search',
    searchPlaceholder: 'Search products...',
    
    // Cart
    orderList: 'Order List',
    tableNumber: 'Table Number',
    tableNumberPlaceholder: 'Enter table number (1-30)',
    emptyCart: 'No items in cart',
    subtotal: 'Subtotal',
    tax: 'Tax',
    discount: 'Discount',
    total: 'Total',
    checkout: 'Checkout',
    
    // Checkout
    selectPaymentMethod: 'Select Payment Method',
    cash: 'Cash',
    card: 'Card',
    qr: 'QR Code',
    receivedAmount: 'Received Amount',
    change: 'Change',
    confirmPayment: 'Confirm Payment',
    cancel: 'Cancel',
    
    // Cashier
    openShift: 'Open Shift',
    closeShift: 'Close Shift',
    startingCash: 'Starting Cash',
    endingCash: 'Ending Cash',
    cashIn: 'Cash In',
    cashOut: 'Cash Out',
    reason: 'Reason',
    
    // Common
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    confirm: 'Confirm',
    baht: '฿',
    
    // Messages
    orderCompleted: 'Order completed',
    orderFailed: 'Order failed',
    invalidPin: 'Invalid PIN',
    enterPin: 'Enter PIN',
    pinPlaceholder: 'Enter 6-digit PIN',
  },
};

export const t = (key: string, lang: Language = 'th'): string => {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

