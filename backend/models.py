"""SQLAlchemy models for HSK Tutor."""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


class HanziLevel(Base):
    """Association table for Hanzi and their HSK levels."""
    __tablename__ = "hanzi_levels"

    hanzi = Column(String(1), ForeignKey("hanzi.word", ondelete="CASCADE"), primary_key=True)
    level = Column(String(20), primary_key=True)
    hanzi_obj = relationship("Hanzi", back_populates="levels")


class Hanzi(Base):
    """Model for Chinese characters (汉字)."""
    __tablename__ = "hanzi"

    word = Column(String(1), primary_key=True)
    oldword = Column(String(10))
    strokes = Column(Integer)
    pinyin = Column(String(50))
    radicals = Column(String(20))
    explanation = Column(Text)
    more = Column(Text)

    # Relationships
    levels = relationship("HanziLevel", back_populates="hanzi_obj")

    @property
    def level_list(self):
        return [level.level for level in self.levels]


class HandwrittenLevel(Base):
    """Association table for handwritten characters and their HSK levels."""
    __tablename__ = "handwritten_levels"

    hanzi = Column(String(1), ForeignKey("handwritten.word", ondelete="CASCADE"), primary_key=True)
    level = Column(String(20), primary_key=True)
    hanzi_obj = relationship("HandwrittenHanzi", back_populates="levels")


class HandwrittenHanzi(Base):
    """Model for handwritten characters (书写汉字)."""
    __tablename__ = "handwritten"

    word = Column(String(1), primary_key=True)
    oldword = Column(String(10))
    strokes = Column(Integer)
    pinyin = Column(String(50))
    radicals = Column(String(20))
    explanation = Column(Text)
    more = Column(Text)

    # Relationships
    levels = relationship("HandwrittenLevel", back_populates="hanzi_obj")

    @property
    def level_list(self):
        return [level.level for level in self.levels]


class Grammar(Base):
    """Model for HSK grammar points."""
    __tablename__ = "grammar"

    id = Column(Integer, primary_key=True, autoincrement=True)
    level = Column(String(20), index=True)
    category = Column(String(50))
    category_name = Column(String(100))
    detail = Column(String(100))
    content = Column(Text)

    __table_args__ = (
        UniqueConstraint('level', 'content', name='unique_level_content'),
    )


class UserFavorite(Base):
    """Model for user favorites."""
    __tablename__ = "user_favorites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), index=True)
    item_type = Column(String(20))  # 'hanzi', 'handwritten', 'grammar'
    item_id = Column(String(50))  # The word or grammar id
    created_at = Column(Integer)  # Unix timestamp

    __table_args__ = (
        UniqueConstraint('user_id', 'item_type', 'item_id', name='unique_user_favorite'),
    )


class UserVisited(Base):
    """Model for user visited items."""
    __tablename__ = "user_visited"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), index=True)
    item_type = Column(String(20))  # 'hanzi', 'handwritten', 'grammar'
    item_id = Column(String(50))  # The word or grammar id
    visited_at = Column(Integer)  # Unix timestamp

    __table_args__ = (
        UniqueConstraint('user_id', 'item_type', 'item_id', name='unique_user_visited'),
    )