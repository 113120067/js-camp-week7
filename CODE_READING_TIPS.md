# 寫給初學者的：怎樣讀懂複雜的一行程式

你是不是常常看到這樣的程式：

```js
const now = Math.floor(Date.now() / 1000);
```

然後想：「這一行到底在做什麼？」

這份指南會教你 6 個技巧，讓你能看懂這些「看起來很複雜」的一行程式。

---

## 技巧 1：從右到左讀（由內而外）

### 是什麼？

不要從左到右讀，要**從最內層的括號開始，往外一層一層讀**。

### 怎麼做？

```js
const now = Math.floor(Date.now() / 1000);
```

把括號標記出來：

```js
const now = Math.floor(  Date.now()  / 1000  );
              ↑         ↑          ↑         ↑
              外層       最內層
```

讀的順序：

1. 最裡面：`Date.now()` → 拿到現在時間（毫秒）
2. 往外：`Date.now() / 1000` → 把毫秒換成秒
3. 再往外：`Math.floor(...)` → 去掉小數點
4. 最後：把結果存到 `now`

### 小例子

```js
// 一行程式
const result = Math.abs(5 - 10);

// 從右到左（由內而外）讀
const result = Math.abs(5 - 10);
                 ↑     ↑ ↑
              最外層   最內層

// 讀的順序
1. 先算：5 - 10 = -5
2. 再算：Math.abs(-5) = 5
3. 結果：result = 5
```

---

## 技巧 2：分行拆解

### 是什麼？

把一行程式拆成**多行**，這樣更容易看懂。

### 怎麼做？

原本的一行：

```js
const now = Math.floor(Date.now() / 1000);
```

拆成多行：

```js
const milliseconds = Date.now();      // 第 1 步：拿到毫秒
const seconds = milliseconds / 1000;  // 第 2 步：換成秒
const now = Math.floor(seconds);      // 第 3 步：去掉小數
```

或者用臨時變數：

```js
const now = Math.floor(Date.now() / 1000);

// 等同於：
const timeInMs = Date.now();
const timeInSec = timeInMs / 1000;
const now = Math.floor(timeInSec);
```

### 為什麼有用？

- 每一步只做一件事
- 看得清楚是從哪個變數得到下一個變數
- 可以加 `console.log` 檢查每一步的結果

---

## 技巧 3：分步驟測試

### 是什麼？

寫程式的時候，不要直接寫一大行。**先分步驟執行，看看每一步的結果**。

### 怎麼做？

在 VS Code 終端機執行 `node`：

```bash
$ node
Welcome to Node.js v18.0.0.
> 
```

然後逐步輸入：

```js
> Date.now()
1704067200123

> 1704067200123 / 1000
1704067200.123

> Math.floor(1704067200.123)
1704067200

> const now = 1704067200
> now
1704067200
```

每次按 Enter，你就看到結果。

### 為什麼有用？

- 看得到**每一步真正的數值**
- 知道自己是對還是錯
- 可以發現問題出在哪一步

### 小例子

```js
> const orders = [
...   { price: 100, qty: 2 },
...   { price: 50, qty: 1 }
... ]
> orders.length
2

> orders[0]
{ price: 100, qty: 2 }

> orders[0].price
100

> orders[0].price * orders[0].qty
200
```

這樣就看得清楚了。

---

## 技巧 4：先看函式名字

### 是什麼？

如果程式用了一個函式（比如 `Math.floor`），**先看函式的名字，猜猜它在做什麼**。

### 怎麼做？

看看常見的函式名字，猜猜意思：

| 函式 | 名字意思 | 它的工作 |
|------|--------|--------|
| `Math.floor()` | floor = 地板 | 向下捨入 |
| `Math.ceil()` | ceil = 天花板 | 向上進位 |
| `Math.abs()` | abs = absolute | 絕對值（正數） |
| `Date.now()` | now = 現在 | 拿到現在時間 |
| `String.length` | length = 長度 | 字串的長度 |
| `Array.includes()` | includes = 包含 | 陣列裡有沒有 |

### 例子

```js
Math.floor(3.7)
```

看到 `floor`，你就知道：「哦，這是向下捨入。」

所以 `Math.floor(3.7)` 會得到 `3`。

---

## 技巧 5：從結果反推

### 是什麼？

**先想想「我需要什麼結果」，再反推「需要哪些步驟」**。

### 怎麼做？

例如，你想把時間轉成日期文字：

```
需要的結果：2024/01/01 08:00
現在有的：1704067200（Unix 秒）
```

反推：

```
1. Unix 秒 → 日期物件（用 dayjs.unix()）
2. 日期物件 → 文字（用 .format()）
3. 得到：2024/01/01 08:00
```

所以程式就是：

```js
const result = dayjs.unix(1704067200).format('YYYY/MM/DD HH:mm');
```

### 例子

你看到這一行：

```js
const daysAgo = Math.ceil((now - timestamp) / 86400);
```

反推：

```
需要的結果：幾天前
現在有的：now（現在）、timestamp（過去的時間）

步驟：
1. (now - timestamp) → 秒差
2. 秒差 / 86400 → 天差（小數）
3. Math.ceil(...) → 向上進位成天數

就得到「幾天前」了
```

---

## 技巧 6：查文件

### 是什麼？

**不認識的函式或指令，就查文件**。沒什麼可丟人的。

### 在哪查？

| 查什麼 | 在哪查 |
|------|------|
| JavaScript 的函式 | [MDN Web Docs](https://developer.mozilla.org/) |
| dayjs 的用法 | [dayjs 官方文件](https://day.js.org/) |
| axios 的用法 | [axios 官方文件](https://axios-http.com/) |
| 一般問題 | ChatGPT、Google |

### 例子

你不認識 `Array.includes()`，想知道它怎麼用：

**查 MDN：**

```
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
```

看到：

> The `includes()` method determines whether an array includes a certain value among its entries, returning true or false as appropriate.

「哦，就是檢查陣列裡有沒有某個值。」

所以：

```js
const fruits = ['apple', 'banana', 'orange'];
fruits.includes('apple');  // true
fruits.includes('grape');  // false
```

---

## 把 6 個技巧組合起來

現在你看到一個複雜的程式：

```js
const daysAgo = Math.ceil((dayjs().unix() - timestamp) / 86400);
```

你可以這樣讀：

### 步驟 1：從右到左

```
最內層：dayjs() → 現在
       .unix() → 現在的 Unix 秒
       (dayjs().unix() - timestamp) → 秒差
       秒差 / 86400 → 天差
最外層：Math.ceil(...) → 天差向上進位
```

### 步驟 2：分行拆解

```js
const nowInSeconds = dayjs().unix();
const timeDiffInSeconds = nowInSeconds - timestamp;
const timeDiffInDays = timeDiffInSeconds / 86400;
const daysAgo = Math.ceil(timeDiffInDays);
```

### 步驟 3：測試

```js
> const nowInSeconds = dayjs().unix()
> nowInSeconds
1704067200

> const timeDiffInSeconds = 1704067200 - 1704066400
> timeDiffInSeconds
800

> const timeDiffInDays = 800 / 86400
> timeDiffInDays
0.00925...

> Math.ceil(0.00925)
1
```

### 步驟 4：先看函式名字

- `dayjs()` → 拿現在時間
- `.unix()` → 變成 Unix 秒
- `Math.ceil()` → 向上進位

### 步驟 5：從結果反推

「我要算幾天前，所以要：時間差 ÷ 86400，然後向上進位」

### 步驟 6：不認識的查文件

不知道 `dayjs().unix()`，就查 dayjs 文件。

---

## 練習題

試著用 6 個技巧讀懂這些程式：

### 練習 1

```js
const hour = Math.floor(timestamp / 3600) % 24;
```

（提示：3600 秒 = 1 小時；%24 是什麼意思？）

### 練習 2

```js
const isValid = quantity >= 1 && quantity <= 99 && Number.isInteger(quantity);
```

（提示：`&&` 是「而且」；`Number.isInteger()` 是檢查整數。）

### 練習 3

```js
const newOrders = orders.filter(order => order.status === 'unpaid');
```

（提示：`filter()` 是過濾；`=>` 是箭頭函式；`.status === 'unpaid'` 是檢查條件。）

---

## 最後的小建議

當你看不懂程式的時候，**不要急**。用這 6 個技巧，一步一步慢慢讀：

1. ✅ 從右到左拆開
2. ✅ 分行寫出來
3. ✅ 在 REPL 測試
4. ✅ 看看函式名字
5. ✅ 從結果反推
6. ✅ 查文件

99% 的時候，你就會看懂了。

加油！
