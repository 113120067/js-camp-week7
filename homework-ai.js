// ========================================
// 第七週作業（參考答案） — homework-ai.js
// 這個檔案包含已實作的函式，供學生參考學習
// ========================================

// 載入環境變數與套件
require('dotenv').config({ path: '.env' });
const dayjs = require('dayjs');
const axios = require('axios');

// API 設定（從 .env 讀取）
const API_PATH = process.env.API_PATH;
const BASE_URL = 'https://livejs-api.hexschool.io';
const ADMIN_TOKEN = process.env.API_KEY;

// 任務一：日期處理
function formatOrderDate(timestamp) {
  if (timestamp == null) return '';
  return dayjs.unix(Number(timestamp)).format('YYYY/MM/DD HH:mm');
}

function getDaysAgo(timestamp) {
  const now = dayjs();
  const then = dayjs.unix(Number(timestamp));
  const diff = now.diff(then, 'day');
  return diff === 0 ? '今天' : `${diff} 天前`;
}

function isOrderOverdue(timestamp) {
  const now = dayjs();
  const then = dayjs.unix(Number(timestamp));
  const diff = now.diff(then, 'day');
  return diff > 7;
}

function getThisWeekOrders(orders) {
  if (!Array.isArray(orders)) return [];
  const start = dayjs().startOf('week');
  const end = dayjs().endOf('week');
  return orders.filter(o => {
    const d = dayjs.unix(Number(o.createdAt));
    return (d.isAfter(start) || d.isSame(start)) && (d.isBefore(end) || d.isSame(end));
  });
}

// 任務二：資料驗證
function validateOrderUser(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['資料格式不正確'] };
  }
  if (!data.name || String(data.name).trim() === '') errors.push('name 不可為空');
  if (!data.tel || !/^09\d{8}$/.test(String(data.tel))) errors.push('tel 格式錯誤，應為 09 開頭的 10 位數字');
  if (!data.email || !String(data.email).includes('@')) errors.push('email 必須包含 @');
  if (!data.address || String(data.address).trim() === '') errors.push('address 不可為空');
  const allowed = ['ATM', 'Credit Card', 'Apple Pay'];
  if (!allowed.includes(data.payment)) errors.push('payment 非允許的付款方式');
  return { isValid: errors.length === 0, errors };
}

function validateCartQuantity(quantity) {
  const isInteger = Number.isInteger(quantity);
  if (!isInteger) return { isValid: false, error: '數量必須為整數' };
  if (quantity < 1) return { isValid: false, error: '數量不可小於 1' };
  if (quantity > 99) return { isValid: false, error: '數量不可大於 99' };
  return { isValid: true };
}

// 任務三：唯一識別碼
function generateOrderId() {
  return 'ORD-' + (Date.now().toString(36) + Math.random().toString(36).slice(2));
}

function generateCartItemId() {
  return 'CART-' + (Date.now().toString(36) + Math.random().toString(36).slice(2));
}

// 任務四：Axios 串接
async function getProductsWithAxios() {
  if (!API_PATH) throw new Error('API_PATH 未設定');
  const url = `${BASE_URL}/api/${API_PATH}/products`;
  const res = await axios.get(url);
  return res.data && res.data.products ? res.data.products : [];
}

async function addToCartWithAxios(productId, quantity) {
  if (!API_PATH) throw new Error('API_PATH 未設定');
  const url = `${BASE_URL}/api/${API_PATH}/cart`;
  const data = { data: { productId, quantity } };
  const res = await axios.post(url, data);
  return res.data;
}

async function getOrdersWithAxios() {
  if (!API_PATH || !ADMIN_TOKEN) throw new Error('API_PATH 或 API_KEY 未設定');
  const url = `${BASE_URL}/api/${API_PATH}/admin/orders`;
  const res = await axios.get(url, { headers: { authorization: ADMIN_TOKEN } });
  return res.data && res.data.orders ? res.data.orders : [];
}

// 任務五：OrderService
const OrderService = {
  apiPath: API_PATH,
  baseURL: BASE_URL,
  token: ADMIN_TOKEN,

  async fetchOrders() {
    if (!this.apiPath || !this.token) throw new Error('OrderService apiPath 或 token 未設定');
    const url = `${this.baseURL}/api/${this.apiPath}/admin/orders`;
    const res = await axios.get(url, { headers: { authorization: this.token } });
    return res.data && res.data.orders ? res.data.orders : [];
  },

  formatOrders(orders) {
    if (!Array.isArray(orders)) return [];
    return orders.map(o => ({ ...o, formattedDate: formatOrderDate(o.createdAt) }));
  },

  filterUnpaidOrders(orders) {
    if (!Array.isArray(orders)) return [];
    return orders.filter(o => o.paid === false || o.paid === 'false');
  },

  validateUserInfo(userInfo) {
    return validateOrderUser(userInfo);
  },

  async getUnpaidOrdersFormatted() {
    const orders = await this.fetchOrders();
    const unpaid = this.filterUnpaidOrders(orders);
    return this.formatOrders(unpaid);
  }
};

module.exports = {
  API_PATH,
  BASE_URL,
  ADMIN_TOKEN,
  formatOrderDate,
  getDaysAgo,
  isOrderOverdue,
  getThisWeekOrders,
  validateOrderUser,
  validateCartQuantity,
  generateOrderId,
  generateCartItemId,
  getProductsWithAxios,
  addToCartWithAxios,
  getOrdersWithAxios,
  OrderService
};
