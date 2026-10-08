# CLAUDE.md - HSK Tutor Development Guide

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An HSK (Chinese proficiency test) learning application with recognition (认读), writing practice (书写), and grammar modules. Uses dual-storage: localStorage for unauthenticated users, server-side SQLite for cloud-synced users.

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: Vue 3 + Vite + Tailwind CSS + Pinia
- **Character rendering**: hanzi-writer for stroke animation
- **External APIs**: zidian.gushici.net (audio), v2.jinrishici.com (poetry), Omni-Gen (AI explanations)

## Architecture Patterns

### User Identity
- URL parameter `?user=xxx` identifies users
- `/api/favorites` and `/api/visited` endpoints require `user` query param
- Frontend `useUserStore()` handles localStorage for non-authenticated users, syncs to server for cloud users

### Database Models
- `Hanzi` + `HanziLevel` (many-to-many): 认读 characters
- `HandwrittenHanzi` + `HandwrittenLevel` (many-to-many): 书写 characters
- `Grammar`: HSK grammar points
- `UserFavorite` / `UserVisited`: Per-user tracking
- `Config`: Key-value application configuration

### AI Integration
- Omni-Gen API handles word/grammar explanations and translations
- Prompt templates stored in `Config` table, customizable via `/admin`
- Placeholders: `{content}`, `{topic}`, `{count}`, `{types}`, `{target_lang}`

## Key Files

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI app, all API endpoints, lifespan (DB init) |
| `backend/crud.py` | Database operations |
| `backend/models.py` | SQLAlchemy models |
| `backend/init_db.py` | Loads HSK data from JSON into SQLite |
| `frontend/src/stores/user.js` | User identity, favorites/visited state |
| `frontend/src/stores/api.js` | Backend API calls |
| `frontend/src/views/WordDetail.vue` | Character detail with HanziWriter |
| `frontend/src/views/AdminConfig.vue` | Config management UI |

## Development Commands

```bash
# Backend
cd backend && pip install -r requirements.txt && python init_db.py && uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev
```

## Frontend Structure

```
frontend/src/
├── stores/           # Pinia stores
│   ├── user.js       # User identity & favorites
│   ├── api.js        # Backend API calls
│   └── config.js     # Config from /api/config
├── views/            # Page components
│   ├── Home.vue
│   ├── ReadList.vue  # 认读 list
│   ├── WriteList.vue # 书写 list (with HanziWriter)
│   ├── GrammarList.vue
│   ├── GrammarDetail.vue
│   ├── WordDetail.vue
│   ├── Favorites.vue
│   └── AdminConfig.vue
└── router.js         # Vue Router config
```

## API Routes

- `/api/hanzi[?level=]` - 认读 list
- `/api/hanzi/{word}` - Character detail
- `/api/handwritten[?level=]` - 书写 list
- `/api/grammar[?level=]` - Grammar list
- `/api/favorites?user=xxx` - User favorites (GET/POST/DELETE)
- `/api/visited?user=xxx` - User visited (GET/POST)
- `/api/config` - All configs
- `/api/config/{key}` - Single config (GET/PUT)
- `/api/config/{key}/reset` - Reset to default
- `/api/audio/{pinyin}` - Returns audio URL for pinyin
- `/api/poetry` - Daily poetry from Jinrishici

## Config System

Configure via `/admin` page (password: `admin123` by default, change via `ADMIN_PASSWORD` env var).

Key config items:
- `OMNI_GEN_BASE_URL` - AI API endpoint
- `EXPLAIN_WORD_PROMPT` - Word explanation template
- `EXPLAIN_GRAMMAR_PROMPT` - Grammar explanation template
- `TRANSLATE_PROMPT` - Translation template
- `PRACTISE_PROMPT` - Practice generation template
- `NEEDLE_MODEL` - Local model type (`needle2` or `needle3`)

## Data Initialization

Source JSON files in `backend/data/`:
- `hsk_all_hanzi.json` - 认读 characters
- `hsk_all_handwritten.json` - 书写 characters
- `hsk_all_grammar.json` - Grammar points

These are loaded by `init_db.py` from external HSK data paths (see README for paths).