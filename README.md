# HSK Tutor

一个交互式 HSK 学习应用，包含认读、书写和语法学习模块。

## 技术栈

- **后端**: FastAPI + SQLite 数据库
- **前端**: Vue 3 + Vite + Tailwind CSS
- **功能**: HanziWriter 汉字书写动画、音频发音、收藏系统

## 快速开始

### 1. 安装依赖

```bash
# 后端依赖 (使用 uv)
cd backend
uv sync

# 前端依赖
cd ../frontend
npm install
```

### 2. 初始化数据库

```bash
cd backend
python init_db.py
```

### 3. 启动开发服务器

```bash
# 终端 1: 启动后端
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 终端 2: 启动前端
cd frontend
npm run dev
```

### 4. 访问应用

打开浏览器访问 http://localhost:5173

## 功能特性

### 认读学习 (/read)
- 按 HSK 级别筛选汉字
- 显示拼音、释义、笔画数
- 点击汉字跳转到详情页

### 书写练习 (/write)
- 使用 HanziWriter 练习书写
- 显示/隐藏汉字
- 动画演示笔顺
- 清除重写

### 语法学习 (/grammar)
- 按 HSK 级别筛选语法点
- 分类显示（词类、句型、固定格式等）
- 详细释义

### 收藏功能
- 支持本地 localStorage 存储
- 登录后同步到服务器
- URL 携带 `?user=xxx` 参数实现用户隔离

### 每日诗词
- 集成今日诗词 API
- 显示古诗词名句

## 项目结构

```
hsk-tutor/
├── backend/
│   ├── main.py          # FastAPI 应用入口
│   ├── database.py      # 数据库配置
│   ├── models.py        # SQLAlchemy 模型
│   ├── schemas.py       # Pydantic 模型
│   ├── crud.py          # 数据库操作
│   ├── init_db.py       # 数据初始化脚本
│   ├── pyproject.toml   # Python 依赖 (uv)
│   └── .env             # 环境变量
├── frontend/
│   ├── src/
│   │   ├── components/  # Vue 组件
│   │   ├── views/       # 页面视图
│   │   ├── stores/      # Pinia 状态管理
│   │   ├── App.vue      # 根组件
│   │   ├── main.js      # 入口文件
│   │   ├── router.js    # 路由配置
│   │   └── style.css    # 全局样式
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── README.md
└── CLAUDE.md
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/poetry` | GET | 获取每日诗词 |
| `/api/hanzi` | GET | 获取汉字列表 |
| `/api/hanzi/{word}` | GET | 获取汉字详情 |
| `/api/hanzi/levels` | GET | 获取 HSK 级别列表 |
| `/api/handwritten` | GET | 获取书写汉字列表 |
| `/api/handwritten/{word}` | GET | 获取书写汉字详情 |
| `/api/handwritten/levels` | GET | 获取书写级别列表 |
| `/api/grammar` | GET | 获取语法列表 |
| `/api/grammar/item/{id}` | GET | 获取语法详情 |
| `/api/grammar/levels` | GET | 获取语法级别列表 |
| `/api/favorites` | GET/POST/DELETE | 收藏操作 |

## 数据来源

- HSK 级别数据: `HSK-3.0/New HSK (2025)`
- 汉字释义: `chinese-xinhua/data/word.json`
- 发音音频: `zidian.gushici.net`
- 每日诗词: `v2.jinrishici.com`

## 注意事项

1. 首次运行需要运行 `python init_db.py` 初始化数据库
2. 如需使用每日诗词 API 功能，请在 `.env` 中设置 `JINRISHICI_TOKEN`
3. 用户收藏数据支持本地和服务器两种存储方式