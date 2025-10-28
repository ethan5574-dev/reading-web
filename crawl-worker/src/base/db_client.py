"""
Database client for manga data
"""
import os
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from .db_models import Base, Series, Chapter, Author, SeriesAuthor, ChapterViewStatsDaily


class DatabaseClient:
    """Database client for manga data operations"""
    
    def __init__(self, database_url: str = None):
        """
        Initialize database client
        
        Args:
            database_url: Database connection URL (default: from env DATABASE_URL)
        """
        self.database_url = database_url or os.getenv('DATABASE_URL')
        
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        
        self.logger = logging.getLogger(__name__)
        
        # Create engine and session
        try:
            self.engine = create_engine(self.database_url, echo=False)
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
            self.logger.info("Database client initialized successfully")
        except Exception as e:
            raise ValueError(f"Failed to initialize database client: {str(e)}")
    
    def create_tables(self):
        """Create all tables"""
        try:
            Base.metadata.create_all(bind=self.engine)
            self.logger.info("Database tables created successfully")
        except Exception as e:
            self.logger.error(f"Failed to create tables: {str(e)}")
            raise
    
    def get_session(self) -> Session:
        """Get database session"""
        return self.SessionLocal()
    
    def save_series(self, series_data: Dict[str, Any]) -> Optional[Series]:
        """Save or update series"""
        session = self.get_session()
        try:
            # Check if series exists by name
            existing_series = session.query(Series).filter(
                Series.name == series_data['name']
            ).first()
            
            if existing_series:
                # Update existing series
                existing_series.name = series_data['name']
                existing_series.cover_url = series_data.get('cover_url')
                existing_series.synopsis = series_data.get('synopsis', '')
                existing_series.status = series_data.get('status', 'ongoing')
                existing_series.updated_at = datetime.utcnow()
                session.commit()
                self.logger.info(f"Updated series: {series_data['name']}")
                return existing_series
            else:
                # Create new series
                new_series = Series(
                    name=series_data['name'],
                    cover_url=series_data.get('cover_url'),
                    synopsis=series_data.get('synopsis', ''),
                    status=series_data.get('status', 'ongoing')
                )
                session.add(new_series)
                session.commit()
                session.refresh(new_series)
                self.logger.info(f"Created new series: {series_data['name']}")
                return new_series
                
        except SQLAlchemyError as e:
            session.rollback()
            self.logger.error(f"Failed to save series {series_data['name']}: {str(e)}")
            return None
        finally:
            session.close()
    
    def save_chapter(self, series: Series, chapter_data: Dict[str, Any]) -> Optional[Chapter]:
        """Save or update chapter"""
        session = self.get_session()
        try:
            # Check if chapter exists
            existing_chapter = session.query(Chapter).filter(
                Chapter.series_id == series.series_id,
                Chapter.number == chapter_data['number']
            ).first()
            
            if existing_chapter:
                # Update existing chapter
                existing_chapter.title = chapter_data.get('title', '')
                existing_chapter.pages_url = chapter_data.get('pages_url', [])
                existing_chapter.released_at = chapter_data.get('released_at')
                existing_chapter.updated_at = datetime.utcnow()
                session.commit()
                self.logger.info(f"Updated chapter: {chapter_data['number']}")
                return existing_chapter
            else:
                # Create new chapter
                new_chapter = Chapter(
                    series_id=series.series_id,
                    number=chapter_data['number'],
                    title=chapter_data.get('title', ''),
                    pages_url=chapter_data.get('pages_url', []),
                    released_at=chapter_data.get('released_at')
                )
                session.add(new_chapter)
                session.commit()
                session.refresh(new_chapter)
                self.logger.info(f"Created new chapter: {chapter_data['number']}")
                return new_chapter
                
        except SQLAlchemyError as e:
            session.rollback()
            self.logger.error(f"Failed to save chapter {chapter_data['number']}: {str(e)}")
            return None
        finally:
            session.close()
    
    
    
    def close(self):
        """Close database connection"""
        if hasattr(self, 'engine'):
            self.engine.dispose()
