# 泡泡城市（PowPow City）项目交接文档

> 本文档记录「泡泡城市」从 fork 到上线的完整过程、关键技术发现、部署配置与避坑指南，
> 供下一个游戏/游乐场项目快速复用。最后更新：2026-09-22（commit 对应 R3 完成）。

---

## 1. 项目概览

| 项 | 值 |
|---|---|
| 线上地址 | https://powpowcity.powpow.online |
| 代码仓库 | https://github.com/durenzidu/isometric-city （fork 自 amilich/isometric-city） |
| 上游项目 | https://github.com/amilich/isometric-city |
| 本地克隆 | `D:\powpowcity\isometric-city` |
| 性质 | PowPow 平台活动小游戏：等距视角城市建造（SimCity 风格），含合作多人共建 |
| 技术栈 | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind + canvas 渲染 |
| 部署 | Vercel（push main 自动部署）+ Cloudflare DNS（橙云代理，保证大陆可访问） |
| 数据库 | PowPow 的 Supabase（Postgres），表 `game_rooms` |

### 与 PowPow 主站的关系
- 活动入口卡片在 PowPow 主站「活动页」（https://global.powpow.online/campaign ），卡片文案「泡泡城市」。
- 游戏内「返回泡泡」按钮 → `https://global.powpow.online/campaign`。
- v1 不做账号互通，游戏使用匿名 localStorage 存档 + Supabase 房间码联机。

---

## 2. 品牌定制（相对上游的改动）

### 主题色（globals.css）
- `--primary: 0 68% 42%`（PowPow 红 #B22222），`--primary-foreground: 0 0% 98%`。
- `--ring`、`--sidebar-border` 同步改红；55 处装饰性 `hsl(210 60% x%)` 批量替换为红色系 `hsl(0 45% x%)`。
- `--accent` 保留青色（teal）作为辅助色。

### 品牌资源
- `public/logo-powpow.svg` —— 官方 logo（红圆 +「泡泡」字标，约 3:1 横版）。**落地页必须用这个，不要自绘替代**（用户已纠正过一次）。
- `src/app/icon.png`（512 favicon）、`src/app/opengraph-image.png`（1200×630 og 图）、`public/apple-touch-icon.png`（180）——均为红圆 + 白「泡」。
- metadata（layout.tsx）：标题「泡泡城市 — PowPow 城市建造」，`metadataBase: https://powpowcity.powpow.online`。

### 落地页（src/app/page.tsx）
- **白底黑字**（用户明确要求），游戏内保持深色主题。
- logo 与标题**永远上下排列**（PC + 手机都竖排）；标题字体 `ZCOOL QingKe HuangYou`（站酷庆科黄油体）。
- 按钮从上到下：新游戏/继续（红底白字）→ Co-op → 加载示例 → **返回泡泡**（红描边）。
- 页脚：PowPow（global.powpow.online）+ Powered by IsoCity（上游 GitHub）。

### 游戏内（深色主题）
- 桌面 TopBar：`返回泡泡`（ghost 按钮）+ `邀请好友共建城市`（Users 图标 + 红字，≥xl 屏显示文字）。
- 移动端 MobileTopBar：home 图标链接（title=返回泡泡）+ Users 图标（邀请）。
- 彩蛋：VinnieDialog 改为「神秘泡泡」（$500,000 接受 / $10,000 拒绝加廉洁值）。

---

## 3. 多人合作（邀请码）功能 —— 核心功能，改动时务必小心

### 数据流
1. 发起方打开 ShareModal（桌面 TopBar「邀请好友」/ 移动端 Users 图标）。
2. 若无房间，`createRoom(cityName, state)` → 把 LZ-string 压缩的城市状态写入 Supabase `game_rooms`，生成 5 位房间码，URL 变为 `/coop/{roomCode}`。
3. 好友打开邀请链接 `/coop/{房间码}` 或在落地页 CoopModal 输入房间码加入。
4. `useMultiplayerSync` 轮询/同步，多方实时共建。

### 关键文件
| 文件 | 职责 |
|---|---|
| `src/components/multiplayer/ShareModal.tsx` | 邀请弹窗（房间码 + 邀请链接 + 复制）。文案已 T 化中文化。 |
| `src/components/multiplayer/CoopModal.tsx` | 落地页创建/加入合作城市弹窗 |
| `src/context/MultiplayerContext.tsx` | 房间状态、createRoom/joinRoom、broadcastPlace |
| `src/hooks/useMultiplayerSync.ts` | 状态同步 |
| `src/hooks/useCopyRoomLink.ts` | 游戏内右上角指示器的复制链接 |
| `src/components/Game.tsx` | `showShareModal` 状态；**移动端和桌面端分支都要渲染 `<ShareModal>`**（R3 补上了桌面端） |
| `src/components/game/TopBar.tsx` | 桌面端 `onInvite` prop → 邀请按钮 |
| `src/lib/shareState.ts` | 单人模式的 URL 分享（LZ-string），**与房间码邀请是两回事，别混淆** |

### 数据库（Supabase）
```sql
-- game_rooms: room_code TEXT PK, city_name, game_state TEXT(LZ-string, ≤20MB),
--             player_count INT, created_at, updated_at
-- 公开 RLS（v1 接受匿名读写）；updated_at 触发器自动更新
```
- v2 待办：过期房间清理；账号互通。
- 环境变量（Vercel 已配）：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。

---

## 4. gt-next 国际化 —— 最重要的技术发现 ⭐

### 机制
- 组件内用 `<T>English text</T>`（JSX 场景）或 `msg('...')` + `useMessages()`（逻辑场景）包裹字符串。
- SWC 插件编译时把字符串替换为哈希 id；**浏览器运行时**对源字符串计算哈希并查询运行时拉取的词典 `/_gt/{locale}.json`。
- 语言检测自动：`x-generaltranslation-locale` header → `locale` cookie → `Accept-Language` → 默认 `en`。中文浏览器自动中文，无需写代码。
- 项目支持 9 语言（en/es/zh/ja/fr/de/pt-BR/it/tr）；未翻译的语言回退英文（安全）。

### 手动添加中文翻译的流程（无 API key 时的离线方案）
词典 key = `hashSource({ source: '<T>里的原文>', dataFormat: 'JSX' })`（sha256 前 16 位十六进制）：

```js
// add-zh-entries.js（临时脚本）
const { hashSource } = require('<project>/node_modules/generaltranslation/dist/id.cjs.min.cjs');
const zh = require('<project>/public/_gt/zh.json');
zh[hashSource({ source: 'Invite Friends', dataFormat: 'JSX' })] = '邀请好友共建城市';
fs.writeFileSync(zhPath, JSON.stringify(zh, null, 2) + '\n');
```

**注意**：
- 哈希对象是**纯文本内容**，不含 `<T>` 标签本身；JSX 内嵌变量/子组件的字符串哈希结构不同（数组/对象），改这类文案要先用脚本查已有 key 的结构。
- `msg()` 场景的 dataFormat 不同（'JS_INLINE' 等），本项目 UI_LABELS 已全部有翻译，一般不用动。
- 添加后必须重新构建（插件把原文编进 bundle），并确认线上 `/_gt/zh.json` 包含新 key。
- 目前 zh.json 共 345 条。

---

## 5. 构建与部署

### 本地构建
```powershell
$env:NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS="1"   # 必须！否则 Google Fonts TLS 握手失败
npm run build    # = npm run compress-images && next build（sharp 处理图片，增量跳过）
```

### 部署链路
`git push origin main` → Vercel 自动构建部署 → Cloudflare（橙云）代理 `powpowcity.powpow.online`。
- Vercel 项目名 `isocity`；查部署状态用 API v6（**不是 v13**）：
  `GET https://api.vercel.com/v6/deployments?projectId=<id>&teamId=<team>&limit=1`（Bearer token 在 Vercel 账号里，勿入库）。
- Cloudflare：先用灰云签发证书再开橙云。

### 验收方法（无浏览器自动化时的产物级验证）
- 落地页是 client component，**SSR HTML 只有 "Loading..."**，内容要去 JS bundle 里 grep。
- 中文翻译验证：确认 bundle 里有英文原文（运行时才算哈希），线上 `/_gt/zh.json` 里有对应 key。**不要去找 bundle 里的哈希值**（客户端是运行时计算，不出现）。
- 检查线上版本：对比 HTML 引用的 CSS/JS chunk 文件名与本地 `.next` 产物。

---

## 6. 字体（中文字体自托管）

- `layout.tsx` 用 `next/font/google` 的 `ZCOOL_QingKe_HuangYou`（weight 400, `variable: '--font-title'`, `preload: false`, subsets 只有 `latin`）。
- **关键**：next/font 的 css2 请求不带 subset 参数，Google 返回**全部** unicode-range 分片（~124 个 woff2，每个 ~40KB），全部自托管；浏览器按需只下载用到的 1-2 片。所以 `subsets:['latin']` 也能渲染中文（已验证覆盖 U+6CE1「泡」），且大陆访问无障碍（构建时下载，运行时自托管）。
- globals.css 里 `.font-title-display { font-family: var(--font-title), 'PingFang SC', 'Microsoft YaHei', sans-serif; }`。

---

## 7. 避坑清单（血泪经验）

1. **PowerShell + 中文**：.ps1 脚本文件里的中文必须 ASCII 化（用 `[char]0x6CE1` 之类码位），无 BOM UTF-8 中文会让解析错乱；inline `node -e` 带复杂引号必炸——**写临时 .js 文件执行**（放 `C:\Users\<user>\AppData\Local\Temp\deveco\`）。
2. 控制台显示中文乱码 ≠ 文件损坏：node 以 utf8 写入的文件是好的，PowerShell 5.1 用 GBK 读才乱。
3. 查 Vercel API 用 `/v6/deployments`，v13 报 Invalid API version。
4. zh.json 条目结构不一：简单字符串 / JSX 子节点数组（含 `i`/`t` 图标标记）/ 复数对象。修改前先看已有条目长什么样。
5. git push 到 fork 的 main 即触发部署；本地浅克隆。
6. 上游原始代码里桌面端**从来没有**邀请按钮（只有 import），别误以为是被删的。
7. 修改 `<T>` 文案后：哈希会变 → 旧翻译失效，必须同步更新 zh.json。
8. 图片生成（PowerShell System.Drawing）可用，但注意中文字体渲染要选对 FontFamily。

---

## 8. 遗留待办

| 优先级 | 事项 |
|---|---|
| 中 | 线上双浏览器端到端实测邀请码共建流程（目前只做了产物级验证） |
| 低 | 移动端地址栏 themeColor 仍为深色 `#0f1219`，落地页已是白底（layout.tsx viewport） |
| 低 | og 分享图仍是暗色风格，与白底落地页不一致，可出白底版 |
| v2 | game_rooms 过期房间清理；与 PowPow 账号体系互通 |

---

## 9. 下一个游戏项目的复用建议（Playbook）

1. **fork 上游 → Vercel 新建项目（连 fork 的 main）→ Cloudflare 加 CNAME（先灰云签证书再橙云）**。
2. 环境变量直接在 Vercel 配；Supabase 沿用 PowPow 实例，一个游戏一张表 + 公开 RLS 即可上线。
3. 品牌化三件套先行：globals.css 主题变量（primary/foreground/ring）、logo 资源（favicon/og/apple-touch）、layout.tsx metadata。
4. 中文翻译基建第一天就搭好：`hashSource` 脚本 + zh.json 流程（见第 4 节），比后补轻松十倍。
5. 中文字体一律 `next/font/google` 自托管（见第 6 节），不要用运行时 CDN（GFW）。
6. PowPow 主站仓库（D:\github_powpow）**只读**，活动卡片改动单独开 PR/commit，别动其他文件。
7. 本地构建记得 TLS 环境变量；验收用 bundle grep 法（见第 5 节）。
