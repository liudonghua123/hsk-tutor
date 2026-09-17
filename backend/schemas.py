"""Pydantic models for API requests/responses."""
from pydantic import BaseModel
from typing import Optional, List


# ============ Hanzi (认读) Schemas ============

class HanziBase(BaseModel):
    word: str
    oldword: Optional[str] = None
    strokes: Optional[int] = None
    pinyin: Optional[str] = None
    radicals: Optional[str] = None
    explanation: Optional[str] = None
    more: Optional[str] = None
    levels: List[str] = []


class HanziResponse(HanziBase):
    is_favorited: bool = False


# ============ Handwritten (书写) Schemas ============

class HandwrittenBase(BaseModel):
    word: str
    oldword: Optional[str] = None
    strokes: Optional[int] = None
    pinyin: Optional[str] = None
    radicals: Optional[str] = None
    explanation: Optional[str] = None
    more: Optional[str] = None
    levels: List[str] = []


class HandwrittenResponse(HandwrittenBase):
    is_favorited: bool = False


# ============ Grammar Schemas ============

class GrammarBase(BaseModel):
    id: int
    level: str
    category: str
    category_name: str
    detail: Optional[str] = None
    content: str


class GrammarResponse(GrammarBase):
    is_favorited: bool = False


# ============ Level Schemas ============

class LevelInfo(BaseModel):
    level: str
    count: int


# ============ Favorite Schemas ============

class FavoriteCreate(BaseModel):
    item_type: str
    item_id: str


class FavoriteResponse(BaseModel):
    id: int
    user_id: str
    item_type: str
    item_id: str
    created_at: int


# ============ Poetry Schemas ============

class PoetryOrigin(BaseModel):
    title: str
    dynasty: str
    author: str
    content: List[str]
    translate: Optional[List[str]] = []


class PoetryData(BaseModel):
    id: str
    content: str
    popularity: int
    origin: PoetryOrigin
    matchTags: Optional[List[str]] = []


class PoetryResponse(BaseModel):
    status: str
    data: PoetryData
    token: Optional[str] = ""
    ipAddress: Optional[str] = ""
    warning: Optional[str] = None


# ============ List Response Schemas ============

class HanziListResponse(BaseModel):
    level: str
    count: int
    hanzi: List[str]


class HandwrittenListResponse(BaseModel):
    level: str
    count: int
    hanzi: List[str]


class GrammarListResponse(BaseModel):
    level: str
    count: int
    items: List[GrammarResponse]