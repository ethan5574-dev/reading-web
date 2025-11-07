"""
Database client for manga data
"""
import os
import re
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from .db_models import Base, Series, Chapter, Author, SeriesAuthor, ChapterViewStatsDaily


class DatabaseClient:
    """Database client for manga data operations"""
    
    def __init__(self, db_host: str = None, db_port: str = None, db_user: str = None, 
                 db_password: str = None, db_name: str = None):
        """
        Initialize database client
        
        Args:
            db_host: Database host
            db_port: Database port
            db_user: Database user
            db_password: Database password
            db_name: Database name
        """
        self.db_host = db_host or os.getenv('DB_HOST')
        self.db_port = db_port or os.getenv('DB_PORT')
        self.db_user = db_user or os.getenv('DB_USER')
        self.db_password = db_password or os.getenv('DB_PASSWORD')
        self.db_name = db_name or os.getenv('DB_NAME')
        
        # Validate required config
        if not all([self.db_host, self.db_port, self.db_user, self.db_password, self.db_name]):
            raise ValueError("Missing required database configuration. Please set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME environment variables.")
        
        self.logger = logging.getLogger(__name__)
        
        # Create database URL
        database_url = f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        
        # Create engine and session
        try:
            self.engine = create_engine(database_url, echo=False)
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
    
    def save_author(self, author_name: str) -> Optional[Author]:
        """Save or get author by name (code is auto-generated)"""
        session = self.get_session()
        try:
            # Check if author exists by label (name)
            existing_author = session.query(Author).filter(
                Author.label == author_name
            ).first()
            
            if existing_author:
                self.logger.info(f"Author already exists: {author_name}")
                return existing_author
            else:
                # Create new author (code will be auto-generated)
                new_author = Author(
                    label=author_name
                )
                session.add(new_author)
                session.commit()
                session.refresh(new_author)
                self.logger.info(f"Created new author: {author_name} (code: {new_author.code})")
                return new_author
                
        except SQLAlchemyError as e:
            session.rollback()
            self.logger.error(f"Failed to save author {author_name}: {str(e)}")
            return None
        finally:
            session.close()
    
    def save_series_author(self, series: Series, author: Author) -> Optional[SeriesAuthor]:
        """Save series-author relationship"""
        session = self.get_session()
        try:
            # Check if relationship exists
            existing = session.query(SeriesAuthor).filter(
                SeriesAuthor.series_id == series.series_id,
                SeriesAuthor.code == author.code
            ).first()
            
            if existing:
                self.logger.info(f"Series-Author relationship already exists")
                return existing
            else:
                # Create new relationship
                new_relation = SeriesAuthor(
                    series_id=series.series_id,
                    code=author.code
                )
                session.add(new_relation)
                session.commit()
                self.logger.info(f"Created series-author relationship")
                return new_relation
                
        except SQLAlchemyError as e:
            session.rollback()
            self.logger.error(f"Failed to save series-author relationship: {str(e)}")
            return None
        finally:
            session.close()
    
    def close(self):
        """Close database connection"""
        if hasattr(self, 'engine'):
            self.engine.dispose()
