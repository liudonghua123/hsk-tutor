"""CRUD operations for HSK Tutor."""
from typing import List, Optional
from sqlalchemy.orm import Session
from models import Hanzi, HandwrittenHanzi, Grammar, UserFavorite, UserVisited, HanziLevel, HandwrittenLevel
from datetime import datetime


# ============ Hanzi (认读) Operations ============

def get_hanzi(db: Session, word: str) -> Optional[Hanzi]:
    """Get a single hanzi by its character."""
    return db.query(Hanzi).filter(Hanzi.word == word).first()


def get_hanzi_levels(db: Session, level: Optional[str] = None) -> List[str]:
    """Get all hanzi words for a specific level or all levels."""
    query = db.query(HanziLevel)
    if level:
        query = query.filter(HanziLevel.level == level)
    return [h.hanzi for h in query.all()]


def get_hanzi_list_by_level(db: Session, level: str) -> List[Hanzi]:
    """Get all hanzi details for a specific level."""
    hanzi_words = db.query(HanziLevel.hanzi).filter(HanziLevel.level == level).all()
    hanzi_list = []
    for h in hanzi_words:
        hanzi = db.query(Hanzi).filter(Hanzi.word == h.hanzi).first()
        if hanzi:
            hanzi_list.append(hanzi)
    return hanzi_list


def get_all_hanzi_levels(db: Session) -> List[dict]:
    """Get all unique HSK levels."""
    levels = db.query(HanziLevel.level).distinct().all()
    return [{"level": l[0], "count": db.query(HanziLevel).filter(HanziLevel.level == l[0]).count()} for l in levels]


# ============ Handwritten (书写) Operations ============

def get_handwritten(db: Session, word: str) -> Optional[HandwrittenHanzi]:
    """Get a single handwritten hanzi by its character."""
    return db.query(HandwrittenHanzi).filter(HandwrittenHanzi.word == word).first()


def get_handwritten_levels(db: Session, level: Optional[str] = None) -> List[str]:
    """Get all handwritten characters for a specific level or all levels."""
    query = db.query(HandwrittenLevel)
    if level:
        query = query.filter(HandwrittenLevel.level == level)
    return [h.hanzi for h in query.all()]


def get_handwritten_list_by_level(db: Session, level: str) -> List[HandwrittenHanzi]:
    """Get all handwritten hanzi details for a specific level."""
    hanzi_words = db.query(HandwrittenLevel.hanzi).filter(HandwrittenLevel.level == level).all()
    hanzi_list = []
    for h in hanzi_words:
        hanzi = db.query(HandwrittenHanzi).filter(HandwrittenHanzi.word == h.hanzi).first()
        if hanzi:
            hanzi_list.append(hanzi)
    return hanzi_list


def get_all_handwritten_levels(db: Session) -> List[dict]:
    """Get all unique HSK levels for handwritten."""
    levels = db.query(HandwrittenLevel.level).distinct().all()
    return [{"level": l[0], "count": db.query(HandwrittenLevel).filter(HandwrittenLevel.level == l[0]).count()} for l in levels]


# ============ Grammar Operations ============

def get_grammar_by_id(db: Session, grammar_id: int) -> Optional[Grammar]:
    """Get a single grammar point by ID."""
    return db.query(Grammar).filter(Grammar.id == grammar_id).first()


def get_grammar_by_level_and_id(db: Session, level: str, grammar_id: int) -> Optional[Grammar]:
    """Get a single grammar point by level and ID."""
    return db.query(Grammar).filter(
        Grammar.level == level,
        Grammar.id == grammar_id
    ).first()


def get_grammar_list_by_level(db: Session, level: str) -> List[Grammar]:
    """Get all grammar points for a specific level."""
    return db.query(Grammar).filter(Grammar.level == level).all()


def get_all_grammar_levels(db: Session) -> List[dict]:
    """Get all unique HSK levels for grammar."""
    levels = db.query(Grammar.level).distinct().all()
    return [{"level": l[0], "count": db.query(Grammar).filter(Grammar.level == l[0]).count()} for l in levels]


# ============ Favorites Operations ============

def get_user_favorites(db: Session, user_id: str, item_type: Optional[str] = None) -> List[UserFavorite]:
    """Get all favorites for a user."""
    query = db.query(UserFavorite).filter(UserFavorite.user_id == user_id)
    if item_type:
        query = query.filter(UserFavorite.item_type == item_type)
    return query.all()


def add_favorite(db: Session, user_id: str, item_type: str, item_id: str) -> UserFavorite:
    """Add a favorite item for a user."""
    favorite = UserFavorite(
        user_id=user_id,
        item_type=item_type,
        item_id=item_id,
        created_at=int(datetime.now().timestamp())
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite


def remove_favorite(db: Session, user_id: str, item_type: str, item_id: str) -> bool:
    """Remove a favorite item for a user."""
    favorite = db.query(UserFavorite).filter(
        UserFavorite.user_id == user_id,
        UserFavorite.item_type == item_type,
        UserFavorite.item_id == item_id
    ).first()
    if favorite:
        db.delete(favorite)
        db.commit()
        return True
    return False


def check_favorite(db: Session, user_id: str, item_type: str, item_id: str) -> bool:
    """Check if an item is favorited by a user."""
    favorite = db.query(UserFavorite).filter(
        UserFavorite.user_id == user_id,
        UserFavorite.item_type == item_type,
        UserFavorite.item_id == item_id
    ).first()
    return favorite is not None


# ============ Visited Operations ============

def get_user_visited(db: Session, user_id: str) -> List[str]:
    """Get all visited items for a user as a list of 'type:id' strings."""
    visited = db.query(UserVisited).filter(UserVisited.user_id == user_id).all()
    return [f"{v.item_type}:{v.item_id}" for v in visited]


def add_visited(db: Session, user_id: str, item_type: str, item_id: str) -> UserVisited:
    """Add a visited item for a user."""
    # Check if already exists
    existing = db.query(UserVisited).filter(
        UserVisited.user_id == user_id,
        UserVisited.item_type == item_type,
        UserVisited.item_id == item_id
    ).first()

    if existing:
        return existing

    visited = UserVisited(
        user_id=user_id,
        item_type=item_type,
        item_id=item_id,
        visited_at=int(datetime.now().timestamp())
    )
    db.add(visited)
    db.commit()
    db.refresh(visited)
    return visited