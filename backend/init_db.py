"""Initialize database with HSK data."""
import json
import os
import sys

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal, Base
from models import Hanzi, HandwrittenHanzi, Grammar, HanziLevel, HandwrittenLevel


def load_hanzi_data():
    """Load hanzi data from JSON files."""
    base_path = r"C:\Users\admin\code\other\HSK-3.0\New HSK (2025)"
    word_path = r"C:\Users\admin\code\other\chinese-xinhua\data\word.json"

    # Load word definitions
    with open(word_path, 'r', encoding='utf-8') as f:
        word_data = json.load(f)

    # Create word lookup
    word_lookup = {item['word']: item for item in word_data}

    # Load HSK hanzi levels
    with open(os.path.join(base_path, 'hsk_all_hanzi.json'), 'r', encoding='utf-8') as f:
        hanzi_levels = json.load(f)

    # Load HSK handwritten levels
    with open(os.path.join(base_path, 'hsk_all_handwritten.json'), 'r', encoding='utf-8') as f:
        handwritten_levels = json.load(f)

    return hanzi_levels, handwritten_levels, word_lookup


def load_grammar_data():
    """Load grammar data from JSON file."""
    base_path = r"C:\Users\admin\code\other\HSK-3.0\New HSK (2025)"

    with open(os.path.join(base_path, 'hsk_all_grammar.json'), 'r', encoding='utf-8') as f:
        grammar_levels = json.load(f)

    return grammar_levels


def init_database():
    """Initialize the database with HSK data."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if data already exists
        existing_hanzi = db.query(Hanzi).first()
        if existing_hanzi:
            print("Database already contains data. Skipping initialization.")
            return

        print("Loading data files...")
        hanzi_levels, handwritten_levels, word_lookup = load_hanzi_data()
        grammar_levels = load_grammar_data()

        # Process Hanzi (认读) data
        print("Processing Hanzi data...")
        for level, characters in hanzi_levels.items():
            for char in characters:
                word_info = word_lookup.get(char, {})
                hanzi = Hanzi(
                    word=char,
                    oldword=word_info.get('oldword', ''),
                    strokes=int(word_info.get('strokes', 0)) if word_info.get('strokes') else None,
                    pinyin=word_info.get('pinyin', ''),
                    radicals=word_info.get('radicals', ''),
                    explanation=word_info.get('explanation', ''),
                    more=word_info.get('more', '')
                )
                db.add(hanzi)

                # Add level association
                level_assoc = HanziLevel(hanzi=char, level=level)
                db.add(level_assoc)

        db.commit()
        print(f"Added hanzi characters")

        # Process Handwritten (书写) data
        print("Processing Handwritten data...")
        for level, characters in handwritten_levels.items():
            for char in characters:
                word_info = word_lookup.get(char, {})
                # Skip if already exists (some characters might be in both)
                existing = db.query(HandwrittenHanzi).filter(HandwrittenHanzi.word == char).first()
                if not existing:
                    handwritten = HandwrittenHanzi(
                        word=char,
                        oldword=word_info.get('oldword', ''),
                        strokes=int(word_info.get('strokes', 0)) if word_info.get('strokes') else None,
                        pinyin=word_info.get('pinyin', ''),
                        radicals=word_info.get('radicals', ''),
                        explanation=word_info.get('explanation', ''),
                        more=word_info.get('more', '')
                    )
                    db.add(handwritten)

                # Add level association (always add, even if char already exists)
                level_assoc = HandwrittenLevel(hanzi=char, level=level)
                db.add(level_assoc)

        db.commit()
        print("Added handwritten characters")

        # Process Grammar data - skip empty content and check for duplicates
        print("Processing Grammar data...")
        grammar_count = 0
        for level, grammar_items in grammar_levels.items():
            for item in grammar_items:
                content = item.get('语法内容', '')
                # Skip entries with empty content (header rows)
                if not content:
                    continue
                # Skip if already exists (check for duplicate level+content)
                existing = db.query(Grammar).filter(
                    Grammar.level == level,
                    Grammar.content == content
                ).first()
                if not existing:
                    grammar = Grammar(
                        level=level,
                        category=item.get('类别', ''),
                        category_name=item.get('类别名称', ''),
                        detail=item.get('细目', ''),
                        content=content
                    )
                    db.add(grammar)
                    grammar_count += 1

        db.commit()
        print(f"Added {grammar_count} grammar items")

        print("Database initialization complete!")

    except Exception as e:
        print(f"Error during initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_database()