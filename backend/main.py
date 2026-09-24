"""Main FastAPI application for HSK Tutor."""
import os
import httpx
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, Query, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import Optional

from database import engine, get_db, Base
from models import Hanzi, HandwrittenHanzi, Grammar, UserFavorite, UserVisited, HanziLevel, HandwrittenLevel
import crud
from schemas import (
    HanziResponse, HandwrittenResponse, GrammarResponse,
    LevelInfo, FavoriteCreate, FavoriteResponse,
    PoetryResponse, HanziListResponse, HandwrittenListResponse, GrammarListResponse
)

load_dotenv()

# Jinrishici API token
JINRISHICI_TOKEN = os.getenv("JINRISHICI_TOKEN", "")

# Server port
PORT = int(os.getenv("PORT", 8000))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="HSK Tutor API",
    description="API for HSK learning application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Health Check ============

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# ============ Poetry API ============

@app.get("/api/poetry")
async def get_poetry():
    """Get daily poetry from Jinrishici API."""
    headers = {"X-User-Token": JINRISHICI_TOKEN} if JINRISHICI_TOKEN else {}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://v2.jinrishici.com/one.json",
                params={"client": "npm-sdk/1.0"},
                headers=headers,
                timeout=10.0
            )
            response.raise_for_status()
            data = response.json()
            return {
                "status": data.get("status"),
                "data": data.get("data"),
                "token": data.get("token", ""),
                "ipAddress": data.get("ipAddress", ""),
                "warning": data.get("warning")
            }
        except Exception as e:
            import sys
            sys.stderr.write(f"POETRY_ERROR: {e}\n")
            sys.stderr.flush()
            return {
                "status": "error",
                "data": {
                    "id": "fallback",
                    "content": "落霞与孤鹜齐飞，秋水共长天一色。",
                    "popularity": 0,
                    "origin": {
                        "title": "滕王阁序",
                        "dynasty": "唐代",
                        "author": "王勃",
                        "content": ["落霞与孤鹜齐飞，秋水共长天一色。"],
                        "translate": []
                    },
                    "matchTags": []
                },
                "token": "",
                "ipAddress": "",
                "warning": str(e)
            }


# ============ Hanzi (认读) API ============

@app.get("/api/hanzi", response_model=list[HanziResponse])
async def get_hanzi_list(
    level: Optional[str] = Query(None, description="HSK level (e.g., hsk1, hsk2, hsk3-6, hsk7-9)"),
    user: Optional[str] = Query(None, description="User ID"),
    db: Session = Depends(get_db)
):
    """Get list of hanzi characters."""
    if level:
        hanzi_list = crud.get_hanzi_list_by_level(db, level)
    else:
        # Get all hanzi
        hanzi_list = db.query(Hanzi).all()

    result = []
    for h in hanzi_list:
        is_fav = False
        if user:
            is_fav = crud.check_favorite(db, user, "hanzi", h.word)
        result.append(HanziResponse(
            word=h.word,
            oldword=h.oldword,
            strokes=h.strokes,
            pinyin=h.pinyin,
            radicals=h.radicals,
            explanation=h.explanation,
            more=h.more,
            levels=h.level_list,
            is_favorited=is_fav
        ))
    return result


@app.get("/api/hanzi/levels", response_model=list[LevelInfo])
async def get_hanzi_levels(db: Session = Depends(get_db)):
    """Get all available HSK levels for hanzi."""
    return crud.get_all_hanzi_levels(db)


@app.get("/api/hanzi/{word}", response_model=HanziResponse)
async def get_hanzi_detail(
    word: str,
    user: Optional[str] = Query(None, description="User ID"),
    db: Session = Depends(get_db)
):
    """Get detail of a specific hanzi."""
    hanzi = crud.get_hanzi(db, word)
    if not hanzi:
        return {"error": "Character not found"}

    is_fav = False
    if user:
        is_fav = crud.check_favorite(db, user, "hanzi", word)

    return HanziResponse(
        word=hanzi.word,
        oldword=hanzi.oldword,
        strokes=hanzi.strokes,
        pinyin=hanzi.pinyin,
        radicals=hanzi.radicals,
        explanation=hanzi.explanation,
        more=hanzi.more,
        levels=hanzi.level_list,
        is_favorited=is_fav
    )


# ============ Handwritten (书写) API ============

@app.get("/api/handwritten", response_model=list[HandwrittenResponse])
async def get_handwritten_list(
    level: Optional[str] = Query(None, description="HSK level"),
    user: Optional[str] = Query(None, description="User ID"),
    db: Session = Depends(get_db)
):
    """Get list of handwritten characters."""
    if level:
        hanzi_list = crud.get_handwritten_list_by_level(db, level)
    else:
        hanzi_list = db.query(HandwrittenHanzi).all()

    result = []
    for h in hanzi_list:
        is_fav = False
        if user:
            is_fav = crud.check_favorite(db, user, "handwritten", h.word)
        result.append(HandwrittenResponse(
            word=h.word,
            oldword=h.oldword,
            strokes=h.strokes,
            pinyin=h.pinyin,
            radicals=h.radicals,
            explanation=h.explanation,
            more=h.more,
            levels=h.level_list,
            is_favorited=is_fav
        ))
    return result


@app.get("/api/handwritten/levels", response_model=list[LevelInfo])
async def get_handwritten_levels(db: Session = Depends(get_db)):
    """Get all available HSK levels for handwritten."""
    return crud.get_all_handwritten_levels(db)


@app.get("/api/handwritten/{word}", response_model=HandwrittenResponse)
async def get_handwritten_detail(
    word: str,
    user: Optional[str] = Query(None, description="User ID"),
    db: Session = Depends(get_db)
):
    """Get detail of a specific handwritten character."""
    hanzi = crud.get_handwritten(db, word)
    if not hanzi:
        return {"error": "Character not found"}

    is_fav = False
    if user:
        is_fav = crud.check_favorite(db, user, "handwritten", word)

    return HandwrittenResponse(
        word=hanzi.word,
        oldword=hanzi.oldword,
        strokes=hanzi.strokes,
        pinyin=hanzi.pinyin,
        radicals=hanzi.radicals,
        explanation=hanzi.explanation,
        more=hanzi.more,
        levels=hanzi.level_list,
        is_favorited=is_fav
    )


# ============ Grammar API ============

@app.get("/api/grammar", response_model=list[GrammarResponse])
async def get_grammar_list(
    level: Optional[str] = Query(None, description="HSK level"),
    user: Optional[str] = Query(None, description="User ID"),
    db: Session = Depends(get_db)
):
    """Get list of grammar points."""
    if level:
        grammar_list = crud.get_grammar_list_by_level(db, level)
    else:
        grammar_list = db.query(Grammar).all()

    result = []
    for g in grammar_list:
        is_fav = False
        if user:
            is_fav = crud.check_favorite(db, user, "grammar", str(g.id))
        result.append(GrammarResponse(
            id=g.id,
            level=g.level,
            category=g.category,
            category_name=g.category_name,
            detail=g.detail,
            content=g.content,
            is_favorited=is_fav
        ))
    return result


@app.get("/api/grammar/levels", response_model=list[LevelInfo])
async def get_grammar_levels(db: Session = Depends(get_db)):
    """Get all available HSK levels for grammar."""
    return crud.get_all_grammar_levels(db)


@app.get("/api/grammar/item/{grammar_id}", response_model=GrammarResponse)
async def get_grammar_detail(
    grammar_id: int,
    user: Optional[str] = Query(None, description="User ID"),
    db: Session = Depends(get_db)
):
    """Get detail of a specific grammar point."""
    grammar = crud.get_grammar_by_id(db, grammar_id)
    if not grammar:
        return HTTPException(status_code=404, detail="Grammar not found")

    is_fav = False
    if user:
        is_fav = crud.check_favorite(db, user, "grammar", str(grammar_id))

    return GrammarResponse(
        id=grammar.id,
        level=grammar.level,
        category=grammar.category,
        category_name=grammar.category_name,
        detail=grammar.detail,
        content=grammar.content,
        is_favorited=is_fav
    )


@app.get("/api/grammar/{level}/{grammar_id}", response_model=GrammarResponse)
async def get_grammar_by_level_and_id(
    level: str,
    grammar_id: int,
    user: Optional[str] = Query(None, description="User ID"),
    db: Session = Depends(get_db)
):
    """Get a specific grammar point by level and ID."""
    grammar = crud.get_grammar_by_level_and_id(db, level, grammar_id)
    if not grammar:
        return HTTPException(status_code=404, detail="Grammar not found")

    is_fav = False
    if user:
        is_fav = crud.check_favorite(db, user, "grammar", str(grammar_id))

    return GrammarResponse(
        id=grammar.id,
        level=grammar.level,
        category=grammar.category,
        category_name=grammar.category_name,
        detail=grammar.detail,
        content=grammar.content,
        is_favorited=is_fav
    )


# ============ Favorites API ============

@app.get("/api/favorites", response_model=list[FavoriteResponse])
async def get_favorites(
    user: str = Query(..., description="User ID"),
    item_type: Optional[str] = Query(None, description="Filter by type: hanzi, handwritten, grammar"),
    db: Session = Depends(get_db)
):
    """Get all favorites for a user."""
    favorites = crud.get_user_favorites(db, user, item_type)
    return [FavoriteResponse(
        id=f.id,
        user_id=f.user_id,
        item_type=f.item_type,
        item_id=f.item_id,
        created_at=f.created_at
    ) for f in favorites]


@app.post("/api/favorites", response_model=FavoriteResponse)
async def add_favorite(
    favorite: FavoriteCreate,
    user: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Add a favorite item."""
    return crud.add_favorite(db, user, favorite.item_type, favorite.item_id)


@app.delete("/api/favorites")
async def remove_favorite(
    user: str = Query(..., description="User ID"),
    item_type: str = Query(..., description="Item type"),
    item_id: str = Query(..., description="Item ID"),
    db: Session = Depends(get_db)
):
    """Remove a favorite item."""
    success = crud.remove_favorite(db, user, item_type, item_id)
    return {"success": success}


# ============ Visited API ============

@app.get("/api/visited")
async def get_visited(
    user: str = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get all visited items for a user."""
    visited = crud.get_user_visited(db, user)
    return visited


@app.post("/api/visited")
async def add_visited(
    user: str = Query(..., description="User ID"),
    item_type: str = Query(..., description="Item type"),
    item_id: str = Query(..., description="Item ID"),
    db: Session = Depends(get_db)
):
    """Add a visited item."""
    return crud.add_visited(db, user, item_type, item_id)


# ============ Audio API ============

@app.get("/api/audio/{pinyin}")
async def get_audio_url(pinyin: str):
    """Get audio URL for a pinyin pronunciation."""
    # Convert pinyin to URL-safe format
    # Example: ài -> ai%CC%80 or just use the pinyin directly
    # The format is: https://zidian.gushici.net/d/mp3/{pinyin}.mp3
    encoded_pinyin = pinyin.lower().replace(" ", "").replace("ā", "a1").replace("á", "a2").replace("ǎ", "a3").replace("à", "a4")
    encoded_pinyin = encoded_pinyin.replace("ē", "e1").replace("é", "e2").replace("ě", "e3").replace("è", "e4")
    encoded_pinyin = encoded_pinyin.replace("ī", "i1").replace("í", "i2").replace("ǐ", "i3").replace("ì", "i4")
    encoded_pinyin = encoded_pinyin.replace("ō", "o1").replace("ó", "o2").replace("ǒ", "o3").replace("ò", "o4")
    encoded_pinyin = encoded_pinyin.replace("ū", "u1").replace("ú", "u2").replace("ǔ", "u3").replace("ù", "u4")
    encoded_pinyin = encoded_pinyin.replace("ü", "v").replace("ǖ", "v1").replace("ǘ", "v2").replace("ǚ", "v3").replace("ǜ", "v4")

    url = f"https://zidian.gushici.net/d/mp3/{encoded_pinyin}.mp3"
    return {"url": url, "pinyin": pinyin}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)