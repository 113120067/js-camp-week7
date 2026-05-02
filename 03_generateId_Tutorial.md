# 任務三：唯一識別碼（ID）

這份說明只講「怎麼用原生 JavaScript 產生唯一識別碼」，並用 `homework.js` 的解題方式示範。

---

## 這題在做什麼

任務三要你實作兩個函式：

- `generateOrderId()`：產生一個訂單用的 ID，格式像 `ORD-xxxxx`。
- `generateCartItemId()`：產生一個購物車項目用的 ID，格式像 `CART-xxxxx`。

要求：ID 要夠不會輕易重複（實務上可用 UUID 或後端生成，但這題用簡單可靠的字串組合）。

### 重要觀念

- `Date.now()`：回傳目前時間（毫秒）。把時間放進 ID 可以降低重複機率。
- `Math.random()`：回傳 0 ~ 1 的亂數。配合字串處理可加入隨機性。
- `toString(36)`：把數字用 36 進位轉成較短的英數字串（0-9 + a-z），常用來壓縮數字為可讀字串。
- 字串相加（concat）：把多段字串拼成最終 ID，例如前綴 + 時間 + 隨機字串。

這些概念合在一起，就能產生「帶有時間戳 + 隨機字元」的唯一 ID。

---

## 逐步看懂程式

下面示範一個簡單且實用的作法：

```js
function generateOrderId() {
  // 第 1 步：用 Date.now() 拿到現在的毫秒數，轉為字串（36 進位）
  // 第 2 步：用 Math.random() 產生一段隨機字串，去掉 "0." 並取部分字元
  // 第 3 步：把前綴 'ORD-' 與上面的兩段字串拼接起來

  return 'ORD-' + (Date.now().toString(36) + Math.random().toString(36).slice(2));
}

function generateCartItemId() {
  return 'CART-' + (Date.now().toString(36) + Math.random().toString(36).slice(2));
}
```

### 每一步拆解

1. `Date.now()` 取得目前時間（毫秒），通常會是像 `1704067200123` 這樣的數字。
2. `Date.now().toString(36)` 把那個長數字轉成較短的英數字串，例如 `k5x9h3l`。
3. `Math.random().toString(36)` 會回傳像 `0.p3j1k9`，我們用 `.slice(2)` 去掉前面的 `0.`，只保留隨機字元，例如 `p3j1k9`。
4. 把時間字串跟隨機字串相加，再加上前綴（`ORD-` 或 `CART-`），得到像 `ORD-k5x9h3lp3j1k9` 的 ID。

這種 ID 並不是保證全球唯一，但對小型專案或前端臨時識別已足夠。

---

## 偽程式

```text
1. 取得現在時間毫秒數
2. 把毫秒數轉成 36 進位字串
3. 產生 Math.random() 的字串，去掉前面的 '0.'
4. 把時間字串和隨機字串合併
5. 在開頭加上適當前綴（例如 'ORD-'）
6. 回傳結果
```

---

## 流程圖

```mermaid
graph TD
  A[開始] --> B[呼叫 generateOrderId() 或 generateCartItemId()]
  B --> C[取得 Date.now()]
  C --> D[轉成 toString(36)]
  D --> E[產生 Math.random() 並 slice(2)]
  E --> F[把兩段字串相加]
  F --> G[加上前綴 'ORD-' 或 'CART-']
  G --> H[回傳 ID]
  H --> I[結束]
```

---

## 範例輸出

```js
console.log(generateOrderId());     // e.g. 'ORD-k5x9h3lp3j1k9'
console.log(generateCartItemId());  // e.g. 'CART-k5x9h3lp3j1k9'
```


---

如果你要我把這段範例直接加回 `homework.js`（或幫你寫更嚴謹的版本，例如加入檢查、避免重複的緩存策略），告訴我下一步要做什麼。