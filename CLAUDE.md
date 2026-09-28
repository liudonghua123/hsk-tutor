# CLAUDE.md - HSK Tutor Development Guide

## Project Overview

This is an HSK learning application with recognition, writing practice, and grammar modules.

## Tech Stack
- Backend: FastAPI + SQLite
- Frontend: Vue 3 + Vite + Tailwind CSS
- Character writing: hanzi-writer
- Audio: zidian.gushici.net
- Poetry: v2.jinrishici.com

## Data Sources
- HSK data: `C:\Users\admin\code\other\HSK-3.0\New HSK (2025)\`
- Word definitions: `C:\Users\admin\code\other\chinese-xinhua\data\word.json`
- Source files for init: `backend/data/hsk_all_hanzi.json`, `hsk_all_handwritten.json`, `hsk_all_grammar.json`

## Key Files
- `backend/init_db.py` - Database initialization
- `backend/main.py` - FastAPI app
- `frontend/src/views/WordDetail.vue` - Character detail with HanziWriter

## Development Commands
```bash
# Backend
cd backend && pip install -r requirements.txt && python init_db.py && uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

## User System
- URL parameter `?user=xxx` for user identification
- Local storage for non-authenticated users
- Server-side for authenticated users

## Routes
- `/` - Home
- `/read` / `/read/:level` - Recognition list
- `/write` / `/write/:level` - Writing practice list
- `/grammar` / `/grammar/:level` - Grammar list
- `/word/:word` - Character detail
- `/favorites` - User favorites
- `/admin` - System configuration management

## Configuration System
Configuration is managed via the `/admin` page (password protected) and stored in the `config` database table.

**Config API endpoints:**
- `GET /api/config` - Get all config items
- `GET /api/config/{key}` - Get single config item
- `PUT /api/config/{key}` - Update config value
- `POST /api/config/{key}/reset` - Reset to default value
- `POST /api/config/check-password` - Verify admin password

**Key configuration items:**
- `OMNI_GEN_BASE_URL` - Omni-Gen API base URL
- `EXPLAIN_WORD_PROMPT` - Prompt for word/idiom/xiehouyu explanation (uses `{content}` placeholder)
- `EXPLAIN_GRAMMAR_PROMPT` - Prompt for grammar explanation (uses `{content}` placeholder)
- `TRANSLATE_PROMPT` - Prompt for translation (uses `{target_lang}` and `{content}` placeholders)
- `PRACTISE_PROMPT` - Prompt for practice generation (uses `{topic}`, `{count}`, `{types}` placeholders)
- `ADMIN_PASSWORD` - Password for accessing /admin page

Config values are loaded into frontend `useConfigStore()` and used by components for API calls.