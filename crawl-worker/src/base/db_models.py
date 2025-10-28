"""
Database models for manga data - MySQL schema
"""
from sqlalchemy import create_engine, Column, BigInteger, String, Text, DateTime, ForeignKey, DECIMAL, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()


class Series(Base):
    """Series/Manga table"""
    __tablename__ = 'series'
    
    series_id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(250), nullable=False)
    status = Column(String(16), nullable=False, default='ongoing')  # ongoing, completed
    cover_url = Column(Text)
    synopsis = Column(Text)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    chapters = relationship("Chapter", back_populates="series", cascade="all, delete-orphan")


class Chapter(Base):
    """Chapter table"""
    __tablename__ = 'chapters'
    
    chapter_id = Column(BigInteger, primary_key=True, autoincrement=True)
    series_id = Column(BigInteger, ForeignKey('series.series_id'), nullable=False)
    number = Column(DECIMAL(10, 2), nullable=False)  # e.g., 1.0, 1.5, 2.0
    title = Column(String(250))
    pages_url = Column(JSON, nullable=False)  # JSON array of image URLs
    released_at = Column(DateTime)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    series = relationship("Series", back_populates="chapters")
    
    # Indexes
    __table_args__ = (
        {'extend_existing': True}
    )


class Author(Base):
    """Author table"""
    __tablename__ = 'author'
    
    code = Column(String(40), primary_key=True)
    label = Column(String(80), nullable=False)


class SeriesAuthor(Base):
    """Series-Author relationship table"""
    __tablename__ = 'series_author'
    
    series_id = Column(BigInteger, ForeignKey('series.series_id'), nullable=False, primary_key=True)
    code = Column(String(40), ForeignKey('author.code'), nullable=False, primary_key=True)
    
    # Relationships
    series = relationship("Series")
    author = relationship("Author")


class ChapterViewStatsDaily(Base):
    """Chapter view statistics table"""
    __tablename__ = 'chapter_view_stats_daily'
    
    chapter_id = Column(BigInteger, ForeignKey('chapters.chapter_id'), nullable=False, primary_key=True)
    bucket_date = Column(DateTime, nullable=False, primary_key=True)
    count = Column(BigInteger, nullable=False, default=0)
    
    # Relationships
    chapter = relationship("Chapter")
