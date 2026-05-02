# 任務五：OrderService 物件（組合與封裝）

這份說明以 `homework.js` 的解題方式，示範 `OrderService` 物件如何把任務一到任務四的功能組合起來，提供簡潔的 API 給前端或測試使用。

---

## 這題在做什麼

`OrderService` 是一個物件（object），內含多個方法：

- `fetchOrders()`：從後端抓訂單（使用任務四的 `getOrdersWithAxios()` 或自行呼叫 axios）
- `formatOrders(orders)`：對訂單加上 `formattedDate`（使用 `formatOrderDate()`）
- `filterUnpaidOrders(orders)`：篩選出未付款的訂單
- `validateUserInfo(userInfo)`：檢查使用者資訊（呼叫 `validateOrderUser()`）
- `getUnpaidOrdersFormatted()`：整合 `fetchOrders()`、`filterUnpaidOrders()`、`formatOrders()`，直接回傳格式化後的未付款訂單

`OrderService` 的目標是把常見流程封裝成方法，讓呼叫端（例如 UI 或測試）只要呼叫一個方法就能得到處理後的資料。

### 重要觀念

- 物件方法可以使用 `this` 存取物件內的設定（例如 `apiPath`、`baseURL`、`token`）。
- 封裝（encapsulation）：把多個小函式組合成一個有意義的服務介面。
- 非同步方法（`async`）：若內部有 `await`，整個方法要宣告為 `async` 並回傳 Promise。
- 組合函式（composition）：用小函式（format、filter）組成更複雜的工作流程。

---

## 逐步看懂程式

下面示範一個簡單的 `OrderService` 實作，與 `homework-ai.js` 中的版本一致：

```js
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
```

### 每一步拆解

1. `apiPath`, `baseURL`, `token`：把環境設定放在物件內，方法就能用 `this.apiPath` 存取。
2. `fetchOrders()`：檢查設定、呼叫 API、回傳訂單陣列或空陣列。
3. `formatOrders()`：對每筆訂單加上 `formattedDate` 欄位，裡面用 `formatOrderDate()` 將 `createdAt`（Unix 秒）轉成人類可讀字串。
4. `filterUnpaidOrders()`：簡單過濾 `paid === false` 的訂單（注意 API 有時會把布林轉成字串）。
5. `validateUserInfo()`：把驗證委派給任務二的 `validateOrderUser()`，維持單一職責（SRP）。
6. `getUnpaidOrdersFormatted()`：把上面幾個步驟串起來成一個方便用的高階方法。

---

## 偽程式

```text
OrderService:
  fetchOrders:
    1. 檢查 apiPath 與 token
    2. 發 GET 請求到 admin/orders
    3. 回傳 orders 陣列或 []

  filterUnpaidOrders:
    1. 接收 orders
    2. 回傳未付款的那些

  formatOrders:
    1. 接收 orders
    2. 把 createdAt 用 formatOrderDate() 轉成 formattedDate
    3. 回傳新的 orders

  getUnpaidOrdersFormatted:
    1. orders = await fetchOrders()
    2. unpaid = filterUnpaidOrders(orders)
    3. return formatOrders(unpaid)
```

---

## 流程圖

```mermaid
graph TD
  A[開始] --> B[呼叫 getUnpaidOrdersFormatted]
  B --> C[fetchOrders()]
  C --> D[filterUnpaidOrders()]
  D --> E[formatOrders()]
  E --> F[回傳格式化後的未付款訂單]
  F --> G[結束]
```

---

## 範例使用

```js
// 直接呼叫
OrderService.getUnpaidOrdersFormatted().then(list => {
  console.log(list); // 每筆都有 formattedDate
});

// 驗證使用者資料
const userCheck = OrderService.validateUserInfo({ name: '王小明', tel: '0912345678', email: 'a@b.c', address: '台北', payment: 'ATM' });
console.log(userCheck.isValid, userCheck.errors);
```

---

如果你要我把 `OrderService` 加回 `homework.js`（或調整成類別 class、或加入快取機制），我可以繼續幫你修改。