// ========================================
// 第七週作業：使用第三方套件優化電商系統
// 執行方式：npm install && node homework.js
// ========================================

// 載入環境變數與套件
require("dotenv").config({ path: ".env" });
const dayjs = require("dayjs");
const axios = require("axios");

// API 設定（從 .env 讀取）
const API_PATH = process.env.API_PATH;
const BASE_URL = "https://livejs-api.hexschool.io";
const ADMIN_TOKEN = process.env.API_KEY;

// ========================================
// 任務一：日期處理 - dayjs
// ========================================

/**
 * 1. 將 Unix timestamp 轉換為可讀日期
 * @param {number} timestamp - Unix timestamp（秒）
 * @returns {string} - 格式 'YYYY/MM/DD HH:mm'，例如 '2024/01/01 08:00'
 */
function formatOrderDate(timestamp) {
  if (timestamp == null) return "";
  return dayjs.unix(Number(timestamp)).format("YYYY/MM/DD HH:mm");
}

/**
 * 2. 計算訂單距今幾天
 * @param {number} timestamp - Unix timestamp（秒）
 * @returns {string} - 例如 '3 天前' 或 '今天'
 */
function getDaysAgo(timestamp) {
  const now = dayjs();
  const then = dayjs.unix(Number(timestamp));
  const diff = now.diff(then, "day");
  return diff === 0 ? "今天" : `${diff} 天前`;
}

/**
 * 3. 判斷訂單是否超過 7 天（可能需要催付款）
 * @param {number} timestamp - Unix timestamp（秒）
 * @returns {boolean} - 超過 7 天回傳 true
 */
function isOrderOverdue(timestamp) {
  const now = dayjs();
  const then = dayjs.unix(Number(timestamp));
  const diff = now.diff(then, "day");
  return diff > 7;
}

/**
 * 4. 取得本週的訂單
 * @param {Array} orders - 訂單陣列，每筆訂單有 createdAt 欄位
 * @returns {Array} - 篩選出 createdAt 在本週的訂單
 */
function getThisWeekOrders(orders) {
  if (!Array.isArray(orders)) return [];
  const start = dayjs().startOf("week");
  const end = dayjs().endOf("week");
  return orders.filter((o) => {
    const d = dayjs.unix(Number(o.createdAt));
    return (
      (d.isAfter(start) || d.isSame(start)) &&
      (d.isBefore(end) || d.isSame(end))
    );
  });
}

// ========================================
// 任務二：資料驗證（原生 JS 實作）
// ========================================

/**
 * 1. 驗證訂單使用者資料
 * @param {Object} data - { name, tel, email, address, payment }
 * @returns {Object} - { isValid: boolean, errors: string[] }
 *
 * 驗證規則：
 * - name: 不可為空
 * - tel: 必須是 09 開頭的 10 位數字
 * - email: 必須包含 @ 符號
 * - address: 不可為空
 * - payment: 必須是 'ATM', 'Credit Card', 'Apple Pay' 其中之一
 */
function validateOrderUser(data) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["資料格式不正確"] };
  }
  if (!data.name || String(data.name).trim() === "")
    errors.push("name 不可為空");
  if (!data.tel || !/^09\d{8}$/.test(String(data.tel)))
    errors.push("tel 格式錯誤，應為 09 開頭的 10 位數字");
  if (!data.email || !String(data.email).includes("@"))
    errors.push("email 必須包含 @");
  if (!data.address || String(data.address).trim() === "")
    errors.push("address 不可為空");
  const allowed = ["ATM", "Credit Card", "Apple Pay"];
  if (!allowed.includes(data.payment)) errors.push("payment 非允許的付款方式");
  return { isValid: errors.length === 0, errors };
}

/**
 * 2. 驗證購物車數量
 * @param {number} quantity - 數量
 * @returns {Object} - { isValid: boolean, error?: string }
 *
 * 驗證規則：
 * - 必須是正整數
 * - 不可小於 1
 * - 不可大於 99
 */
function validateCartQuantity(quantity) {
  const isInteger = Number.isInteger(quantity);
  if (!isInteger) return { isValid: false, error: "數量必須為整數" };
  if (quantity < 1) return { isValid: false, error: "數量不可小於 1" };
  if (quantity > 99) return { isValid: false, error: "數量不可大於 99" };
  return { isValid: true };
}

// ========================================
// 任務三：唯一識別碼（原生 JS 實作）
// ========================================

/**
 * 1. 產生訂單編號
 * @returns {string} - 格式 'ORD-xxxxxxxx'
 */
function generateOrderId() {
  return (
    "ORD-" + (Date.now().toString(36) + Math.random().toString(36).slice(2))
  );
}

/**
 * 2. 產生購物車項目 ID
 * @returns {string} - 格式 'CART-xxxxxxxx'
 */
function generateCartItemId() {
  return (
    "CART-" + (Date.now().toString(36) + Math.random().toString(36).slice(2))
  );
}

// ========================================
// 任務四：使用 Axios 串接 API
// ========================================

/**
 * 1. 取得產品列表（使用 Axios）
 * @returns {Promise<Array>} - 回傳 products 陣列
 */
async function getProductsWithAxios() {
  if (!API_PATH) throw new Error("API_PATH 未設定");
  const url = `${BASE_URL}/api/livejs/v1/customer/${API_PATH}/products`;
  const res = await axios.get(url);
  return res.data && res.data.products ? res.data.products : [];
}

/**
 * 2. 加入購物車（使用 Axios）
 * @param {string} productId - 產品 ID
 * @param {number} quantity - 數量
 * @returns {Promise<Object>} - 回傳購物車資料
 */
async function addToCartWithAxios(productId, quantity) {
  if (!API_PATH) throw new Error("API_PATH 未設定");
  const url = `${BASE_URL}/api/livejs/v1/customer/${API_PATH}/carts`;
  const data = { data: { productId, quantity } };
  const res = await axios.post(url, data);
  return res.data;
}

/**
 * 3. 取得訂單（使用 Axios，需認證）
 * @returns {Promise<Array>} - 回傳訂單陣列
 */
async function getOrdersWithAxios() {
  if (!API_PATH || !ADMIN_TOKEN) throw new Error("API_PATH 或 API_KEY 未設定");
  const url = `${BASE_URL}/api/livejs/v1/admin/${API_PATH}/orders`;
  const res = await axios.get(url, { headers: { authorization: ADMIN_TOKEN } });
  return res.data && res.data.orders ? res.data.orders : [];
}

/*
比較題：請說明 fetch 和 axios 的主要差異

1. fetch 回傳的是原生 Response 物件，通常要再手動呼叫 res.json() 才能取得 JSON；axios 會自動把 JSON 解析好，資料直接放在 res.data。

2. fetch 的寫法比較偏原生 API，常常要自己寫 res.json()、res.ok 檢查；axios 的語法比較精簡，回傳結果可以直接用 data，也比較容易閱讀。

3. axios 內建攔截器、timeout、預設 headers 等功能，寫 API 請求時比較方便；fetch 較輕量，但很多進階功能要自己補。
*/

// ========================================
// 任務五：整合應用 (挑戰)
// ========================================

/**
 * 建立一個完整的「訂單服務」物件
 */
const OrderService = {
  apiPath: API_PATH,
  baseURL: BASE_URL,
  token: ADMIN_TOKEN,

  /**
   * 使用 axios 取得訂單
   * @returns {Promise<Array>} - 訂單陣列
   */
  async fetchOrders() {
    if (!this.apiPath || !this.token)
      throw new Error("OrderService apiPath 或 token 未設定");
    const url = `${this.baseURL}/api/livejs/v1/admin/${this.apiPath}/orders`;
    const res = await axios.get(url, {
      headers: { authorization: this.token },
    });
    return res.data && res.data.orders ? res.data.orders : [];
  },

  /**
   * 使用 dayjs 格式化訂單日期
   * @param {Array} orders - 訂單陣列
   * @returns {Array} - 為每筆訂單加上 formattedDate 欄位
   */
  formatOrders(orders) {
    if (!Array.isArray(orders)) return [];
    return orders.map((o) => ({
      ...o,
      formattedDate: formatOrderDate(o.createdAt),
    }));
  },

  /**
   * 篩選未付款訂單
   * @param {Array} orders - 訂單陣列
   * @returns {Array} - paid: false 的訂單
   */
  filterUnpaidOrders(orders) {
    if (!Array.isArray(orders)) return [];
    return orders.filter((o) => o.paid === false || o.paid === "false");
  },

  /**
   * 驗證訂單使用者資料
   * @param {Object} userInfo - 使用者資料
   * @returns {Object} - 驗證結果
   */
  validateUserInfo(userInfo) {
    return validateOrderUser(userInfo);
  },

  /**
   * 整合：取得未付款訂單，並格式化日期
   * @returns {Promise<Array>} - 格式化後的未付款訂單
   */
  async getUnpaidOrdersFormatted() {
    const orders = await this.fetchOrders();
    const unpaid = this.filterUnpaidOrders(orders);
    return this.formatOrders(unpaid);
  },
};

// ========================================
// 匯出函式供測試使用
// ========================================
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
  OrderService,
};

// ========================================
// 直接執行測試
// ========================================
if (require.main === module) {
  // 測試資料
  const testOrders = [
    {
      id: "order-1",
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
      paid: false,
    },
    {
      id: "order-2",
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 10,
      paid: true,
    },
    { id: "order-3", createdAt: Math.floor(Date.now() / 1000), paid: false },
  ];

  async function runTests() {
    console.log("=== 第七週作業測試 ===\n");
    console.log("API_PATH:", API_PATH);
    console.log("");

    // 任務一測試
    console.log("--- 任務一：dayjs 日期處理 ---");
    const timestamp = 1704067200;
    console.log("formatOrderDate:", formatOrderDate(timestamp));
    console.log("getDaysAgo:", getDaysAgo(testOrders[0].createdAt));
    console.log("isOrderOverdue:", isOrderOverdue(testOrders[1].createdAt));
    console.log(
      "getThisWeekOrders:",
      getThisWeekOrders(testOrders)?.length,
      "筆",
    );

    // 任務二測試
    console.log("\n--- 任務二：資料驗證 ---");
    const validUser = {
      name: "王小明",
      tel: "0912345678",
      email: "test@example.com",
      address: "台北市信義區",
      payment: "Credit Card",
    };
    console.log("validateOrderUser (valid):", validateOrderUser(validUser));

    const invalidUser = {
      name: "",
      tel: "1234",
      email: "invalid",
      address: "",
      payment: "Bitcoin",
    };
    console.log("validateOrderUser (invalid):", validateOrderUser(invalidUser));

    console.log("validateCartQuantity (5):", validateCartQuantity(5));
    console.log("validateCartQuantity (0):", validateCartQuantity(0));

    // 任務三測試
    console.log("\n--- 任務三：ID 產生 ---");
    console.log("generateOrderId:", generateOrderId());
    console.log("generateCartItemId:", generateCartItemId());

    // 任務四測試
    if (API_PATH) {
      console.log("\n--- 任務四：Axios API 串接 ---");
      try {
        const products = await getProductsWithAxios();
        console.log(
          "getProductsWithAxios:",
          products ? `成功取得 ${products.length} 筆產品` : "回傳 undefined",
        );
      } catch (error) {
        console.log("getProductsWithAxios 錯誤:", error.message);
      }
    } else {
      console.log("\n--- 任務四：請先在 .env 設定 API_PATH ---");
    }

    console.log("\n=== 測試結束 ===");
    console.log("\n提示：執行 node test.js 進行完整驗證");
  }

  runTests();
}
