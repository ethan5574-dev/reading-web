"""
Level 2: Crawl chapter list from series page
"""
from typing import List
from datetime import datetime
from bs4 import BeautifulSoup
from ..base.crawler import BaseCrawler
from ..base.data_models import CrawlConfig, CrawlResult, ChapterInfo


class ChapterCrawler(BaseCrawler):
    """Crawler for chapter list (Level 2)"""
    
    def __init__(self, config: CrawlConfig):
        super().__init__(config)
        self.chapter_list = []
    
    def crawl(self, url: str, series_title: str = "Unknown Series") -> CrawlResult:
        """
        Crawl chapter list from series page
        
        Args:
            url: Series page URL
            series_title: Title of the series
            
        Returns:
            CrawlResult with list of ChapterInfo
        """
        try:
            self.logger.info(f"Starting chapter crawl from: {url}")
            
            # Fetch HTML
            html, final_url = self.http_client.fetch_html(url)
            soup = self.parse_html(html)
            
            # Extract chapter information
            chapter_data = self._extract_chapters(soup, final_url, series_title)
            
            self.logger.info(f"Found {len(chapter_data)} chapters")
            
            return CrawlResult(
                success=True,
                data=chapter_data,
                crawled_at=datetime.now(),
                url=url
            )
            
        except Exception as e:
            self.logger.error(f"Chapter crawl failed: {str(e)}")
            return CrawlResult(
                success=False,
                data=[],
                error_message=str(e),
                crawled_at=datetime.now(),
                url=url
            )
    
    def _extract_chapters(self, soup: BeautifulSoup, base_url: str, series_title: str) -> List[dict]:
        """Extract chapter information from HTML"""
        chapter_data = []
        
        # Find chapter list container
        chapter_container = soup.select_one("div.works-chapter-list")
        if not chapter_container:
            self.logger.warning("No chapter list container found")
            return chapter_data
        
        # Find all chapter items
        chapter_items = chapter_container.select("div.works-chapter-item")
        
        self.logger.info(f"Found {len(chapter_items)} chapter items")
        
        for i, item in enumerate(chapter_items):
            try:
                chapter_info = self._extract_single_chapter(item, base_url, series_title, i + 1)
                if chapter_info:
                    chapter_data.append(chapter_info)
            except Exception as e:
                self.logger.warning(f"Failed to extract chapter {i + 1}: {str(e)}")
                continue
        
        return chapter_data
    
    def _extract_single_chapter(self, item, base_url: str, series_title: str, index: int) -> dict:
        """Extract information from a single chapter item"""
        # Find link element
        link_element = item.find("a")
        if not link_element:
            self.logger.warning(f"Chapter {index}: No link found")
            return None
        
        # Extract link URL
        link_url = self.safe_get_attribute(link_element, "href")
        if not link_url:
            self.logger.warning(f"Chapter {index}: No href found in link")
            return None
        
        # Convert to absolute URL
        abs_link_url = self.make_absolute_url(base_url, link_url)
        if not self.is_http_url(abs_link_url):
            self.logger.warning(f"Chapter {index}: Invalid link URL: {abs_link_url}")
            return None
        
        # Extract chapter title/number
        chapter_title = self._extract_chapter_title(link_element, item)
        
        return {
            "index": index,
            "chapter_number": chapter_title,
            "chapter_url": self.canonical_url(abs_link_url),
            "series_title": series_title,
            "crawled_at": datetime.now().isoformat()
        }
    
    def _extract_chapter_title(self, link_element, item) -> str:
        """Extract chapter title from various sources"""
        # Try different methods to get chapter title
        title_sources = [
            link_element.get_text(strip=True),
            self.safe_get_attribute(link_element, "title", ""),
            self.safe_get_attribute(item.find("span"), "text", ""),
            self.safe_get_attribute(item.find("div"), "text", ""),
        ]
        
        for title in title_sources:
            if title and title.strip():
                return title.strip()
        
        return "Unknown Chapter"
