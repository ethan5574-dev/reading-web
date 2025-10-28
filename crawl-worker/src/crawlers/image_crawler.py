"""
Level 3: Crawl images from chapter page
"""
from typing import List
from datetime import datetime
from bs4 import BeautifulSoup
from ..base.crawler import BaseCrawler
from ..base.data_models import CrawlConfig, CrawlResult, ImageInfo


class ImageCrawler(BaseCrawler):
    """Crawler for chapter images (Level 3)"""
    
    def __init__(self, config: CrawlConfig):
        super().__init__(config)
        self.image_list = []
    
    def crawl(self, url: str, chapter_number: str = "Unknown Chapter", series_title: str = "Unknown Series") -> CrawlResult:
        """
        Crawl images from chapter page
        
        Args:
            url: Chapter page URL
            chapter_number: Chapter number/name
            series_title: Title of the series
            
        Returns:
            CrawlResult with list of ImageInfo
        """
        try:
            self.logger.info(f"Starting image crawl from: {url}")
            
            # Fetch HTML
            html, final_url = self.http_client.fetch_html(url)
            soup = self.parse_html(html)
            
            # Extract image information
            image_data = self._extract_images(soup, final_url, chapter_number, series_title)
            
            self.logger.info(f"Found {len(image_data)} images")
            
            return CrawlResult(
                success=True,
                data=image_data,
                crawled_at=datetime.now(),
                url=url
            )
            
        except Exception as e:
            self.logger.error(f"Image crawl failed: {str(e)}")
            return CrawlResult(
                success=False,
                data=[],
                error_message=str(e),
                crawled_at=datetime.now(),
                url=url
            )
    
    def _extract_images(self, soup: BeautifulSoup, base_url: str, chapter_number: str, series_title: str) -> List[dict]:
        """Extract image information from HTML"""
        image_data = []
        
        # Find all image containers
        image_containers = soup.select("div.page-chapter")
        
        self.logger.info(f"Found {len(image_containers)} image containers")
        
        for i, container in enumerate(image_containers):
            try:
                image_info = self._extract_single_image(container, base_url, chapter_number, series_title, i + 1)
                if image_info:
                    image_data.append(image_info)
            except Exception as e:
                self.logger.warning(f"Failed to extract image {i + 1}: {str(e)}")
                continue
        
        return image_data
    
    def _extract_single_image(self, container, base_url: str, chapter_number: str, series_title: str, page_number: int) -> dict:
        """Extract information from a single image container"""
        # Find image element
        img_element = container.find("img")
        if not img_element:
            self.logger.warning(f"Image {page_number}: No image found")
            return None
        
        # Extract image URL
        image_attrs = ["src", "data-src", "data-original", "data-lazy-src", "data-actualsrc"]
        image_url = self.extract_image_url(img_element, image_attrs)
        
        if not image_url:
            self.logger.warning(f"Image {page_number}: No valid image URL found")
            return None
        
        # Convert to absolute URL
        abs_image_url = self.make_absolute_url(base_url, image_url)
        if not self.is_http_url(abs_image_url):
            self.logger.warning(f"Image {page_number}: Invalid image URL: {abs_image_url}")
            return None
        
        # Extract metadata
        alt_text = self.safe_get_attribute(img_element, "alt", "")
        title_text = self.safe_get_attribute(img_element, "title", "")
        
        return {
            "page_number": page_number,
            "image_url": self.canonical_url(abs_image_url),
            "chapter_number": chapter_number,
            "series_title": series_title,
            "alt_text": alt_text,
            "title_text": title_text,
            "crawled_at": datetime.now().isoformat()
        }
