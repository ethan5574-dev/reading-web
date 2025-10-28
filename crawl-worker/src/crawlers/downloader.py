"""
Downloader that, given a chapter_url, fetches page HTML and saves images locally
"""
import json
from datetime import datetime
from typing import Dict, Any, List
from bs4 import BeautifulSoup

from ..base.crawler import BaseCrawler
from ..base.data_models import CrawlConfig
from ..utils.file_utils import ensure_dir, slugify, chapter_slugify, ext_from_content_type, ext_from_url, compute_sha256, atomic_write


class ChapterImageDownloader(BaseCrawler):
    """Download images for a chapter by parsing div.page-chapter img"""

    def __init__(self, config: CrawlConfig, images_root: str = "data/images"):
        super().__init__(config)
        self.images_root = images_root
    
    def crawl(self, url: str) -> 'CrawlResult':
        """Required abstract method - not used in this downloader"""
        from ..base.data_models import CrawlResult
        return CrawlResult(
            success=False,
            data=[],
            error_message="Use download_chapter() method instead of crawl()"
        )

    def download_chapter(self, chapter_url: str, chapter_number: str, series_title: str) -> Dict[str, Any]:
        self.logger.info(f"Downloading chapter images: {series_title} - {chapter_number}")

        html, final_url = self.http_client.fetch_html(chapter_url)
        soup = self.parse_html(html)

        containers = soup.select("div.page-chapter")
        images: List[Dict[str, Any]] = []

        series_slug = slugify(series_title)
        chapter_slug = chapter_slugify(chapter_number)
        chapter_dir = f"{self.images_root}/{series_slug}/{chapter_slug}"
        ensure_dir(chapter_dir)

        page_idx = 0
        for container in containers:
            img = container.find("img")
            if not img:
                continue

            # extract URL with priority attributes
            url = self.extract_image_url(img, ["data-src", "data-original", "data-lazy-src", "data-actualsrc", "src"]) or ""
            if not url:
                continue

            abs_url = self.make_absolute_url(final_url, url)
            if not self.is_http_url(abs_url):
                continue

            # fetch image bytes with referer
            headers = {
                "User-Agent": self.config.user_agent,
                "Referer": chapter_url,
                "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            }

            response = self.http_client.session.get(abs_url, headers=headers, timeout=self.config.timeout)
            response.raise_for_status()

            content_type = response.headers.get("Content-Type")
            ext = ext_from_content_type(content_type) or ext_from_url(abs_url) or ".jpg"

            page_idx += 1
            filename = f"{page_idx:04d}{ext}"
            filepath = f"{chapter_dir}/{filename}"

            data = response.content
            sha256 = compute_sha256(data)
            atomic_write(filepath, data)

            images.append({
                "page": page_idx,
                "filename": filename,
                "local_path": filepath,
                "source_url": abs_url,
                "bytes": len(data),
                "sha256": sha256,
                "content_type": content_type,
                "downloaded_at": datetime.now().isoformat(),
            })

        # write manifest
        manifest = {
            "series_title": series_title,
            "chapter_number": chapter_number,
            "chapter_url": chapter_url,
            "images": images,
            "count": len(images),
            "saved_at": datetime.now().isoformat(),
        }
        with open(f"{chapter_dir}/manifest.json", "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        self.logger.info(f"Saved {len(images)} images to {chapter_dir}")
        return manifest


