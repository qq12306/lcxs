# 图像素材生成需求 · 网页小游戏配套素材

> 配套《docs/game-design.md》v0.1
> 目标：为已锁定的主角（默认/移动/动作三组 GIF）补齐一套风格统一的配套素材。
> 本文件只覆盖"待新增"素材；主角素材一律不重新生成、不重绘。

---

## 0. 全局约定

### 0.1 主角与视口基准（所有尺寸以此推算）

- 游戏逻辑视口：**1280 × 720**（16:9）。
- 主角显示高度基准：**约 150 px**（运行时视觉占比）。
- 因此背景层建议按 1280×720（或更高倍）生成；地面条高度约 100–140 px；障碍 / 敌人对象高度约 90–150 px；UI 元素 32–96 px。

### 0.2 透明背景实现约定（重要）

本平台文生图输出的是普通 PNG，**无法直接输出带 alpha 的透明背景**。统一采用以下流程：

1. 对象 / 条带 / UI 类素材，一律生成在 **纯白背景（#FFFFFF）** 上；
2. 提示词中写明"**isolated on pure white background, full object visible, no ground shadow touching canvas edges**"；
3. 生成后做"去白抠图"（色差去白 / 简单抠图工具），得到透明背景 PNG 存入项目；
4. 纯背景类（天空）与整幅地面不透明素材不抠图，直接使用。

> 因此文档中标注"透明背景：是"的素材，实际生成阶段使用纯白底 + 后处理抠白。

### 0.3 通用画风锚点（拼接到每条提示词，保证与主角统一）

主角视觉基准色板：

| 用途 | 色值 |
|---|---|
| 深灰黑（主体/描边/阴影） | #1A1A1A |
| 墨绿 | #2E5A32 |
| 亮绿（点缀/草） | #6FA26F |
| 米白（高光/UI 文字） | #E0E0C0 |

统一风格描述（直接粘贴使用）：

```
flat 2D children's picture-book game art, thick rounded dark charcoal outline (#1A1A1A), soft cel shading, muted cozy palette of deep forest green (#2E5A32), mid sage green (#6FA26F) and warm cream (#E0E0C0), gentle paper texture, clean readable silhouette
```

---

## 1. 素材清单总表

| # | 素材 | 命名建议 | 类型 | 透明背景 | 优先级 |
|---|---|---|---|---|---|
| A1 | 天空背景 | `bg_sky.png` | 全幅背景 | 否 | 高 |
| A2 | 远景森林/山丘视差层 | `bg_forest_far.png` | 条带 | 是（抠白） | 高 |
| B1 | 地面草土条 | `ground_tile.png` | 平铺条带 | 是（顶部草缘抠白） | 高 |
| C1 | 障碍·树桩倒木 | `obstacle_stump.png` | 对象 | 是（抠白） | 高 |
| C2 | 障碍·尖刺 | `obstacle_spike.png` | 对象 | 是（抠白） | 中 |
| D1 | 敌人·墨绿小怪 | `enemy_slime.png` | 对象 | 是（抠白） | 高 |
| E1 | UI 圆角面板底 | `ui_panel.png` | UI | 是 | 中 |
| E2 | UI 主按钮底 | `ui_button.png` | UI | 是 | 中 |
| E3 | UI 生命格图标 | `ui_heart.png` | UI | 是 | 中 |
| F1 | 挥砍残影（可选） | `fx_slash.png` | 特效 | 是 | 低 |

---

## 2. 逐素材生成需求

每条包含：用途 / 尺寸与比例 / 透明 / 生图提示词（英文，可直接使用）。

---

### A1 · 天空背景 —— `bg_sky.png`

- **用途**：游戏最底层天空（静态，不随镜头滚动或极慢漂移）。黄昏森林氛围，衬托深绿主角色。
- **尺寸建议**：生成 16:9，≥ 1280×720（建议 2048 宽，向下兼容高清屏）。
- **透明背景**：否（整幅不透明）。
- **生图提示词**：
```
seamless full-bleed background for a 2D side-scrolling game, moody twilight forest sky, smooth vertical gradient from warm cream horizon (#E0E0C0) up to deep muted forest green (#2E5A32) and charcoal (#1A1A1A) at top, a few stylized rounded clouds, gentle soft glow at the horizon line, flat 2D children's picture-book style, soft muted palette, no characters, no trees, no ground, no text, empty lower third of frame
```

---

### A2 · 远景森林 / 山丘视差层 —— `bg_forest_far.png`

- **用途**：第二视差层（约 0.35 倍速），横向滚动的远处山丘与树冠剪影，叠在 A1 之上。
- **尺寸建议**：生成 16:9，≥ 2048 宽（需要横向平移动画）；主体内容限制在画面下部 1/2。
- **透明背景**：是（剪影抠白成透明层，便于叠加与循环平移）。
- **生图提示词**：
```
wide horizontal silhouette band of layered rolling hills and rounded forest treetops in the lower half of the image, three depth tones of deep muted green (#2E5A32, #6FA26F, charcoal #1A1A1A), far background for a 2D side-scrolling game, flat children's picture-book style, thick dark outline on nearest layer only, upper half of image is pure white background, no characters, no buildings, no birds, no text, clean continuous bottom silhouette
```

---

### B1 · 地面草土条 —— `ground_tile.png`

- **用途**：角色脚下地面，横向平铺循环，MVP 可引擎重复贴。
- **尺寸建议**：生成 4:3，建议 1536 宽；后处理裁为约 1280×140 的横向条带（游戏内 100–140 px 高）。
- **透明背景**：是（保留顶部草缘，裁剪后顶部去白为透明，底部土面可延伸到底边）。
- **生图提示词**：
```
horizontal ground strip for a 2D side-scrolling game, top edge is a band of rounded stylized grass blades in sage green (#6FA26F) and deep green (#2E5A32), below is packed dark soil in warm charcoal brown with a few small rounded pebbles, flat children's picture-book style, subtle dark charcoal outline, repeating visual rhythm, top 25% and full-width grass texture, soil continues down to bottom edge, no characters, no plants sticking up, no roots above ground, no text
```

> 平铺接缝提示：grass 纹理做周期化节奏，最左与最右约 20% 内不放置明显大叶片，减少接缝感；MVP 对 1280 宽条做循环即可。

---

### C1 · 障碍·树桩倒木 —— `obstacle_stump.png`

- **用途**：跳跃规避障碍。类似主角环境的原木 / 苔藓树桩，带深色描边。
- **尺寸建议**：生成 1:1（建议 ≥ 1024），游戏内显示约 110–140 px 高。
- **透明背景**：是（抠白）。
- **生图提示词**：
```
single game asset sprite of a small mossy broken tree stump obstacle, round worn wooden top in warm dark brown, a few green moss patches (#2E5A32, #6FA26F), two tiny cream (#E0E0C0) mushroom dots for charm, full object visible, isolated on pure white background, centered, no ground shadow, no grass on the ground, flat children's picture-book style, thick dark charcoal outline (#1A1A1A), no characters, no text
```

---

### C2 · 障碍·尖刺 —— `obstacle_spike.png`

- **用途**：跳跃规避的尖锐障碍（石刺 / 木刺），呈危险感。
- **尺寸建议**：生成 1:1（建议 ≥ 1024），游戏内显示约 80–110 px 高。
- **透明背景**：是（抠白）。
- **生图提示词**：
```
single game asset sprite of a short sharp stone spike cluster obstacle, three charcoal-grey (#1A1A1A) and deep-green tinted (#2E5A32) pointed rock shards on a small mossy base, base rests flat on bottom edge, isolated on pure white background, centered, no ground shadow, flat children's picture-book style, clean thick dark outline, no characters, no dripping, no blood, no text
```

---

### D1 · 敌人·墨绿小怪 —— `enemy_slime.png`

- **用途**：MVP 唯一敌人，接近主角可被挥砍消灭；体型圆润、氛围友善但用色与主角区分。
- **尺寸建议**：生成 1:1（建议 ≥ 1024），游戏内显示约 100–130 px 高。MVP 用单帧 + 引擎 squash/闪白表现受击。
- **透明背景**：是（抠白）。
- **生图提示词**：
```
single game asset sprite of a cute round moss-ball forest monster enemy, plump oval body in deep moss green (#2E5A32) with lighter sage green (#6FA26F) belly, two small oval cream (#E0E0C0) eyes, tiny leaf sprout on top of the head, short stubby feet, standing idle facing right, full body visible, isolated on pure white background, centered, no ground shadow, flat children's picture-book style, thick dark charcoal outline, cute but not scary, no characters, no weapons, no text
```

---

### E1 · UI 圆角面板底 —— `ui_panel.png`

- **用途**：开始/结算界面信息底板，米白底 + 深绿描边。
- **尺寸建议**：生成 1:1（≥ 1024），使用时长边等比缩放为面板四角，建议按 9-patch 处理。
- **透明背景**：是（纯色圆角底板抠白，圆角外留纯白）。
- **生图提示词**：
```
single UI panel base asset, soft rounded rectangle with thick dark charcoal border (#1A1A1A), filled with warm cream (#E0E0C0) canvas and a thin deep green (#2E5A32) inner accent line, flat vector-like children's book UI, perfectly symmetric, solid flat fill, isolated on pure white background, centered, no text, no icons, no letters, no symbols, no inner content
```

---

### E2 · UI 主按钮底 —— `ui_button.png`

- **用途**：开始 / 重新开始等主按钮底板（叠放文字）。
- **尺寸建议**：生成 1:1（≥ 1024），使用时长边等比缩放为按钮高。
- **透明背景**：是（抠白）。
- **生图提示词**：
```
single UI button base asset, rounded rectangle pill shape with thick dark charcoal outline (#1A1A1A), solid deep forest green fill (#2E5A32), one small cream (#E0E0C0) highlight stripe near the top edge, flat vector-like children's book UI, symmetric, isolated on pure white background, centered, no text, no letters, no symbols, no inner content
```

---

### E3 · UI 生命格图标 —— `ui_heart.png`

- **用途**：HUD 生命格（3 格重复显示），受击变色由引擎处理。
- **尺寸建议**：生成 1:1（≥ 1024），游戏内约 36–48 px。
- **透明背景**：是（抠白）。
- **生图提示词**：
```
single small UI icon of a rounded flat heart, deep moss green (#2E5A32) fill with warm cream (#E0E0C0) highlight dot, thin dark charcoal (#1A1A1A) outline, flat children's picture-book style vector icon, perfectly centered, isolated on pure white background, no gradient, no glow, no shine effect, no text
```

> 工程提醒：E1–E3 这类小 UI 元素，文生图分辨率有限。建议以生成为"配色与质感参考"，最终用 Canvas/CSS 矢量重绘以保证小尺寸清晰度。

---

### F1 · 挥砍残影（可选）—— `fx_slash.png`

- **用途**：attack 动画播放时叠加的弧线残影，增强打击感。MVP 可用引擎绘制半透明扇形替代，本素材可选。
- **尺寸建议**：生成 1:1（≥ 1024），游戏内约 180–220 px。
- **透明背景**：是（抠白，弧度中心镂空）。
- **生图提示词**：
```
single smooth crescent slash arc effect for a 2D game, thin curved blade of light in warm cream (#E0E0C0) with a hint of sage green (#6FA26F), soft fading tail at both ends, arc interior is empty white background, isolated on pure white background, centered, flat cartoon effect, no glow, no lens flare, no text
```

---

## 3. 后处理与入库约定

1. **目录结构**（新增到项目）：
```
assets/
  bg/          A1, A2
  ground/      B1
  obstacles/   C1, C2
  enemies/     D1
  ui/          E1, E2, E3
  fx/          F1（可选）
```
2. **命名**：小写 snake_case，如上表，不要出现中文/空格。
3. **抠白**：所有标注"透明背景：是"的素材，先生成纯白底图，再色差去白；边缘残留白色用描边暗色收边，避免白边晕圈。
4. **条带素材**（A2、B1）：生成后裁掉大面积纯白区，仅保留内容条；用于横向循环，代码中做 `mod` 平移。
5. **验收**：对照统一色板（见 0.3）抽查主色占比；明显偏离（例如出现大面积红、蓝、霓虹色）需重生成或调色。

---

## 4. 禁止项（生成与筛选均需规避）

### 风格禁止项
- 像素画 / 8-bit / retro arcade 像素
- 3D 渲染、低多边形、写实照片感
- 高饱和霓虹、荧光、发光描边
- 大面积红色 / 猩红主色调（危险提示可用少量深红点缀）
- 日系二次元/萌系大眼动漫风（主角非此风格）
- 油画厚重笔触、噪点胶片颗粒

### 构图 / 内容禁止项
- 画面中出现文字、LOGO、水印、字母、数字
- 与主角不相关的角色 / 人类 / 动物乱入
- 对象素材中出现地面、投影地面、场景杂物
- 半透明渐变、复杂光效叠加（干扰抠白）
- 超出 MVP 的复杂机械、科技风道具

### 平台限制说明
- 本平台文生图接口无 negative prompt 参数：**不要把禁止词写入正向提示词**（避免模型联想生成）；禁止项用于人工筛选与评审。

---

## 5. 生成顺序建议（按依赖分批）

1. **第 1 批**：A1 天空 → A2 远景 → B1 地面（先搭场景基调，可即时预览整体氛围是否与主角协调）。
2. **第 2 批**：C1 树桩 → D1 敌人（核心可玩元素，先验证与主角同框比例）。
3. **第 3 批**：C2 尖刺 → E1/E2/E3 UI → F1 挥砍残影（锦上添花项）。

> 每批生成后先与主角 GIF 首帧同屏比对再进入下一批，避免风格漂移。
