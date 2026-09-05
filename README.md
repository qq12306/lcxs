# 森林疾驰 · Grove Sprint

一个 2D 横版无尽跑酷网页小游戏，主角是一只戴眼镜的绿衣小猴，在黄昏森林中奔跑、跳跃、挥砍。

## 游戏玩法

- 主角自动向右奔跑，距离越远速度越快
- 前方随机生成树桩、尖刺等障碍物，以及墨绿小怪敌人
- 跳跃越过障碍物，挥砍消灭敌人获得加分
- 碰到障碍物或敌人扣除 1 点生命（共 3 点），生命归零游戏结束
- 得分 = 奔跑距离 + 击杀 × 60，历史最高分保存在本地

## 操作方式

| 按键 | 动作 |
|---|---|
| `←` / `→` | 左右移动 |
| `空格` / `↑` | 跳跃 |
| `X` / `J` | 挥砍攻击 |
| `P` | 暂停 / 继续 |
| `R` | 暂停时重新开始 |

## 技术栈

- 纯 HTML5 Canvas + 原生 JavaScript，无框架依赖
- 固定逻辑分辨率 1280×720，等比缩放适配窗口
- 角色动画由 GIF 拆帧生成精灵表（idle 8帧 / run 12帧 / attack 12帧）
- 视差滚动背景：天空 → 远景森林 → 地面三层

## 目录结构

```
├── index.html              # 游戏入口页面
├── css/
│   └── style.css           # 全局样式与 UI 面板
├── js/
│   ├── assets.js           # 素材加载与色板定义
│   └── game.js             # 游戏主逻辑（循环/物理/渲染/碰撞）
├── assets/
│   ├── character/          # 角色精灵表 + meta.json
│   │   ├── idle_sheet.png
│   │   ├── run_sheet.png
│   │   ├── attack_sheet.png
│   │   └── meta.json
│   ├── bg/                 # 背景层
│   │   ├── bg_sky.png
│   │   └── bg_forest_far.png
│   ├── ground/             # 地面
│   │   └── ground_tile.png
│   ├── obstacles/          # 障碍物
│   │   ├── obstacle_stump.png
│   │   └── obstacle_spike.png
│   ├── enemies/            # 敌人
│   │   └── enemy_slime.png
│   ├── ui/                 # UI 素材
│   │   ├── ui_panel.png
│   │   ├── ui_button.png
│   │   └── ui_heart.png
│   └── fx/                 # 特效
│       └── fx_slash.png
└── docs/
    ├── game-design.md      # 游戏设计文档
    └── sprite-asset-generation-requirements.md  # 素材生成需求
```

## 本地运行

```bash
# 在项目根目录启动任意静态服务器
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
```

## 色板

| 用途 | 色值 |
|---|---|
| 深灰黑（描边/阴影） | `#1A1A1A` |
| 墨绿（主体/按钮） | `#2E5A32` |
| 亮绿（草/点缀） | `#6FA26F` |
| 米白（高光/文字） | `#E0E0C0` |
