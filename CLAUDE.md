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