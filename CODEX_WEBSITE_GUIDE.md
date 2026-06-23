# Codex 網站架構與更新指南

這個 `web` 目錄是一份從 `https://www.hserp.tw/wordpress/` 匯出的靜態網站鏡像，不是 WordPress 原始專案。更新網站時請直接修改靜態 HTML、CSS、JS、圖片與下載檔，再用根目錄的 `github_web_deploy.py` 推送到 GitHub。

## 目前結構

```text
web/
  index.html                         # 首頁，也是搜尋結果頁入口
  README.md                          # 靜態鏡像來源與失敗 URL 摘要
  CODEX_WEBSITE_GUIDE.md             # 本文件
  search-index.json                  # 站內搜尋索引，由 static/build-search-index.js 產生
  Webhserp_staticstatic_preview.png  # 靜態鏡像預覽圖
  assets/                            # 從 WordPress 下載的圖片、CSS、JS、PDF、EXE、feed 等資源
  pages/                             # 各頁面與文章，每頁通常是 pages/.../index.html
  static/                            # 靜態鏡像額外加上的手機選單、搜尋與修正樣式
```

實測狀態：

- `web` 是獨立 Git repository，遠端是 `git@github.com:GitHSERP/WEB.git`。
- 目前約有 `1826` 個檔案。
- `pages/**/index.html` 約 `232` 個。
- `search-index.json` 目前由 Node 可解析，收錄 `80` 筆可搜尋內容頁。
- `README.md` 記錄原始匯出結果：來源 WordPress、頁面數、資源數與失敗 URL。

## 重要檔案職責

`index.html`

- 首頁內容。
- 頁首主選單來源。
- 搜尋結果入口。網址帶 `?s=關鍵字` 時，`static/static-search.js` 會把首頁內容替換成搜尋結果。
- 目前只有首頁載入 `static/static-search.js` 與 `static/static-search.css`。

`pages/**/index.html`

- 網站內頁、文章、分類頁、標籤頁、附件頁都在這裡。
- 路徑就是靜態 URL。例如：
  - `pages/產品資訊/index.html`
  - `pages/2026/03/06/robotax/index.html`
  - `pages/category/product/index.html`
- 多數頁面都載入 `static/static-mobile.css` 與 `static/static-mobile.js`。

`assets/`

- WordPress 鏡像資源。
- 常見子目錄：
  - `assets/wordpress/`：WordPress theme、plugin、uploads、feeds。
  - `assets/docs/`、`assets/docx/`：鏡像到的文件相關頁面資源。
  - `assets/J25/`：下載區或舊站相關資源，含 EXE/ZIP。
- 優先新增自有圖片或下載檔到合適的 `assets/...` 子目錄，再從 HTML 用相對路徑引用。

`static/static-mobile.css`

- 全站響應式修正與手機版可用性修正。
- 搜尋框顯示、圖片寬度、表格橫向捲動、footer、手機 layout 都在這裡。
- 要做全站視覺修正，優先改這個檔，不要直接改 WordPress theme 的壓縮 CSS。

`static/static-mobile.js`

- 從頁面內的 `data-static-nav="true"` 主選單複製資料，建立手機抽屜選單。
- 會複製 logo、首頁連結、搜尋表單與多層選單。
- 如果主選單 HTML 結構改掉，要確認這支 JS 還能找到：
  - `[data-static-nav="true"]`
  - `#mega-menu-primary`
  - `[data-static-menu-toggle="true"]`

`static/static-search.js`

- 只在首頁搜尋結果模式使用。
- 讀取 `search-index.json`，依 `?s=` 參數即時過濾。
- 會隱藏首頁原本的 `banner-section`、`acc-content`、`primary` 等區塊，再插入搜尋結果。
- 因為使用 `fetch()`，搜尋功能需透過 HTTP server 預覽，直接用 `file://` 開啟會失敗。

`static/build-search-index.js`

- 從 `index.html` 與 `pages/**/index.html` 建立 `search-index.json`。
- 優先抽取 `<article>`，沒有 `<article>` 時使用首頁 `#acc-content`。
- 跳過 body class 代表的非內容頁：`attachment`、`archive`、`blog`、`home`、`login`、`search`、`error404`、`paged`。
- 每筆索引包含：
  - `url`
  - `title`
  - `text`，最多 4000 字。

## Codex 更新網站的標準流程

1. 先確認狀態：

```powershell
git -c safe.directory=G:/wwwHSERP/git/web -C .\web status --short --branch
```

2. 找要改的頁面：

```powershell
rg -n "要找的文字" .\web\index.html .\web\pages
```

3. 修改對應 HTML、CSS、JS 或資源。

4. 若改到可搜尋內容頁，重建搜尋索引：

```powershell
cd .\web
node .\static\build-search-index.js
cd ..
```

5. 用 HTTP server 預覽：

```powershell
cd .\web
python -m http.server 8000
```

然後開 `http://localhost:8000/`。搜尋功能不要用直接開檔案方式測。

6. 檢查變更：

```powershell
git -c safe.directory=G:/wwwHSERP/git/web -C .\web diff --stat
git -c safe.directory=G:/wwwHSERP/git/web -C .\web status --short --branch
```

7. 需要推送時，在專案根目錄執行：

```powershell
python .\github_web_deploy.py --key-path .\id_ed25519_github --known-hosts .\.known_hosts --yes
```

## 修改首頁

首頁檔案是 `web/index.html`。

常見修改區域：

- `<head>`：title、SEO meta、CSS 引用。
- 主選單：搜尋 `id="mega-menu-primary"`。
- 手機選單來源：搜尋 `data-static-nav="true"`。
- 首頁主要內容：搜尋 `id="acc-content"`。
- 首頁搜尋功能：搜尋 `static/static-search.js`。
- 手機修正：搜尋 `static/static-mobile.js`。

修改首頁時要注意：

- 首頁也是搜尋結果入口，保留 `static/static-search.css` 與 `static/static-search.js`。
- 若刪除或改名 `#acc-content`，需同步檢查 `static/build-search-index.js` 與 `static/static-search.js`。
- 主選單若只改首頁，內頁的選單不會自動同步，因為每個 HTML 都有自己的選單副本。

## 修改內頁或文章

內頁位置通常是：

```text
web/pages/<slug>/index.html
web/pages/YYYY/MM/DD/<slug>/index.html
web/pages/category/<category>/index.html
web/pages/tag/<tag>/index.html
```

修改內容時優先找：

- `<title>`
- `property="og:title"`
- `property="og:url"`
- JSON-LD schema 中的 `name`、`url`、`dateModified`
- `<h1 class="entry-title">`
- `<article ...>`
- `<div class="entry-content" itemprop="text">`

如果只是改文章正文，通常只需要改 `<article>` 內的內容；若同時要顯示在搜尋結果，改完請重建 `search-index.json`。

## 新增頁面

新增頁面建議流程：

1. 從相同類型頁面複製一份 HTML：
   - 一般頁：參考 `pages/產品資訊/index.html`
   - 文章：參考 `pages/YYYY/MM/DD/<既有文章>/index.html`
   - 下載頁：參考 `pages/下載專區/index.html`
2. 放到新的 `pages/.../index.html`。
3. 更新 `<title>`、SEO meta、canonical、og:url、schema、breadcrumb、body class、文章標題與正文。
4. 檢查所有 `assets/`、`static/`、`index.html` 連結的相對路徑。
5. 需要導覽入口時，把主選單或相關列表中的連結也補上。
6. 執行 `node static/build-search-index.js`。
7. 用 HTTP server 預覽新頁與搜尋。

## 相對路徑規則

這個網站沒有 build system，HTML 裡的連結必須手動正確。

從頁面目錄回到 `web/` 根目錄的層數，決定前綴：

```text
index.html                                  -> assets/... 或 static/...
pages/產品資訊/index.html                    -> ../../assets/... 或 ../../static/...
pages/2026/03/06/robotax/index.html        -> ../../../../../assets/... 或 ../../../../../static/...
```

規則：

- `index.html` 在根目錄，不需要 `../`。
- `pages/a/index.html` 的檔案所在目錄是 `pages/a/`，回根目錄要 `../../`。
- `pages/YYYY/MM/DD/slug/index.html` 回根目錄通常要 `../../../../../`。
- 連到首頁用同樣前綴加 `index.html`。
- 連到其他頁面也從目前頁面算相對路徑，不要假設瀏覽器會自動從根目錄開始。

## 導覽與重複內容

這是靜態鏡像，頁首、主選單、footer 會複製在每個 HTML 檔裡。沒有共用 template。

因此：

- 改主選單文字或連結時，要全站搜尋同一段 HTML。
- 改 footer 聯絡資訊時，也要全站搜尋相同文字。
- 不要只改 `index.html` 就以為所有內頁會同步。
- 若要大量同步選單或 footer，應用腳本或嚴格的搜尋取代，修改後用 `rg` 抽查。

常用搜尋：

```powershell
rg -n "mega-menu-primary|site-footer|custom-logo-link|searchform" .\web\index.html .\web\pages
```

## 搜尋索引維護

修改下列內容後要重建 `search-index.json`：

- 新增、刪除或改名 `pages/**/index.html`
- 修改文章或頁面正文
- 修改 `<h1 class="entry-title">` 或 `<title>`
- 改 body class，可能影響是否被索引

重建指令：

```powershell
cd .\web
node .\static\build-search-index.js
```

驗證 JSON 可解析：

```powershell
node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('search-index.json','utf8')); console.log(j.length)"
```

注意：Windows PowerShell 直接 `ConvertFrom-Json` 可能因編碼或控制字元顯示異常；以 Node 驗證較可靠。

## 編碼注意事項

網站內容是繁體中文，請保持 UTF-8。

- 優先用 Codex `apply_patch` 或支援 UTF-8 的編輯器。
- 不要用未指定編碼的舊 PowerShell `Set-Content` 大量重寫 HTML。
- 若終端顯示亂碼，不一定代表檔案壞掉；先用 `rg` 或 Node 讀取確認。
- 修改含中文檔名的路徑時，完整複製實際路徑，不要手打近似字。

## 樣式修改策略

優先順序：

1. 小範圍頁面內容樣式：在該 HTML 既有 inline style 或頁面區塊內調整。
2. 全站手機/響應式修正：改 `static/static-mobile.css`。
3. 搜尋結果樣式：改 `static/static-search.css`。
4. WordPress theme/plugin 壓縮 CSS：除非明確知道影響範圍，否則避免改。

不要直接改大量 vendor/minified 檔案，因為難追蹤且容易影響全站。

## JavaScript 修改策略

- 手機導覽問題：看 `static/static-mobile.js`。
- 站內搜尋問題：看 `static/static-search.js`。
- WordPress 原本互動功能：多數在 `assets/wordpress/...`，但靜態鏡像不一定完整支援後端行為。
- 表單送出、登入、WordPress admin、PHP 動態功能通常不會在靜態網站上真正運作。

## 部署到 GitHub

部署腳本在專案根目錄：

```text
G:\wwwHSERP\git\github_web_deploy.py
```

預設部署：

- 本地目錄：`web`
- 遠端：`git@github.com:GitHSERP/WEB.git`
- branch：`main`
- commit message：`Update web`

推送指令：

```powershell
python .\github_web_deploy.py --key-path .\id_ed25519_github --known-hosts .\.known_hosts --yes
```

這支腳本會：

1. 檢查 SSH key。
2. 測試 GitHub access。
3. 同步遠端 `origin/main`。
4. `git add .`。
5. 有變更時 commit。
6. push 到 GitHub。

## Codex 接手時的快速提示

可以直接對 Codex 說：

```text
請先讀 web/CODEX_WEBSITE_GUIDE.md，再幫我修改「產品資訊」頁面的某段文字，改完重建搜尋索引並檢查狀態。
```

或：

```text
請先讀 web/CODEX_WEBSITE_GUIDE.md，新增一篇消息頁，放在 pages/YYYY/MM/DD/<slug>/index.html，並把首頁消息列表與搜尋索引一起更新。
```

每次更新內容時，Codex 應優先做這三件事：

1. 用 `rg` 找到實際 HTML。
2. 修改最小必要範圍。
3. 若改到內容頁，執行 `node static/build-search-index.js` 並檢查 Git status。
