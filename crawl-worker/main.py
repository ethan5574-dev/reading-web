"""
Main entry point for the crawler system
"""
import json
import logging
import os
import sys
from datetime import datetime
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from src.config.settings import settings, CrawlerSettings
from src.base.data_models import CrawlConfig
from src.crawlers.series_crawler import SeriesCrawler
from src.crawlers.chapter_crawler import ChapterCrawler
from src.crawlers.downloader import ChapterImageDownloader
from src.base.s3_uploader import S3Uploader
from src.base.db_client import DatabaseClient
from src.utils.file_utils import slugify, chapter_slugify


class CrawlerOrchestrator:
    """Main orchestrator for the 3-level crawling system"""
    
    def __init__(self, config: CrawlerSettings = None):
        self.config = config or settings
        self.config.create_directories()
        self._setup_logging()
        
        # Initialize logger first
        self.logger = logging.getLogger(__name__)
        
        # Create crawler config
        self.crawl_config = CrawlConfig(
            base_url=self.config.BASE_URL,
            user_agent=self.config.USER_AGENT,
            timeout=self.config.TIMEOUT,
            delay_between_requests=self.config.DELAY_BETWEEN_REQUESTS,
            max_retries=self.config.MAX_RETRIES,
            cache_enabled=self.config.CACHE_ENABLED,
            output_format=self.config.OUTPUT_FORMAT
        )
        
        # Initialize crawlers
        self.series_crawler = SeriesCrawler(self.crawl_config)
        self.chapter_crawler = ChapterCrawler(self.crawl_config)
        self.downloader = ChapterImageDownloader(self.crawl_config)
        
        # Initialize S3 uploader if enabled
        self.s3_uploader = None
        if self.config.S3_ENABLED:
            try:
                self.s3_uploader = S3Uploader()
                self.logger.info("S3 uploader initialized")
            except Exception as e:
                self.logger.warning(f"Failed to initialize S3 uploader: {str(e)}")
        
        # Initialize database client if enabled
        self.db_client = None
        if self.config.DATABASE_ENABLED:
            try:
                self.db_client = DatabaseClient()
                # Only create tables if DB_SYNC is enabled
                if self.config.DB_SYNC:
                    try:
                        self.db_client.create_tables()
                        self.logger.info("Database tables created successfully")
                    except Exception as create_error:
                        self.logger.warning(f"Could not create tables (may already exist or no permission): {str(create_error)}")
                else:
                    self.logger.info("DB_SYNC is disabled, skipping table creation")
                self.logger.info("Database client initialized")
            except Exception as e:
                self.logger.warning(f"Failed to initialize database client: {str(e)}")
    
    def _setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=getattr(logging, self.config.LOG_LEVEL),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler()
            ]
        )
    
    def crawl_all(self, max_series: int = None, max_chapters_per_series: int = None) -> Dict[str, Any]:
        """
        Crawl all levels: Series -> Chapters -> Images
        
        Args:
            max_series: Maximum number of series to crawl (None for all)
            max_chapters_per_series: Maximum chapters per series (None for all)
            
        Returns:
            Complete crawl results
        """
        self.logger.info("Starting full crawl process")
        
        results = {
            "crawl_started": datetime.now().isoformat(),
            "series": [],
            "total_series": 0,
            "total_chapters": 0,
            "total_images": 0,
            "errors": []
        }
        
        try:
            # Level 1: Crawl series
            self.logger.info("=== LEVEL 1: Crawling series ===")
            series_result = self.series_crawler.crawl(self.config.BASE_URL)
            
            if not series_result.success:
                self.logger.error(f"Series crawl failed: {series_result.error_message}")
                results["errors"].append(f"Series crawl failed: {series_result.error_message}")
                return results
            
            series_list = series_result.data
            results["total_series"] = len(series_list)
            
            # Limit series if specified
            if max_series:
                series_list = series_list[:max_series]
                self.logger.info(f"Limited to {len(series_list)} series")
            
            # Process each series
            for series_data in series_list:
                try:
                    self.logger.info(f"Processing series: {series_data['title']}")
                    
                    # Level 2: Crawl chapters for this series
                    chapter_result = self.chapter_crawler.crawl(
                        series_data['series_url'], 
                        series_data['title']
                    )
                    
                    if not chapter_result.success:
                        self.logger.warning(f"Chapter crawl failed for {series_data['title']}: {chapter_result.error_message}")
                        results["errors"].append(f"Chapter crawl failed for {series_data['title']}: {chapter_result.error_message}")
                        continue
                    
                    chapters = chapter_result.data
                    results["total_chapters"] += len(chapters)
                    
                    # Limit chapters if specified
                    if max_chapters_per_series:
                        chapters = chapters[:max_chapters_per_series]
                        self.logger.info(f"Limited to {len(chapters)} chapters for {series_data['title']}")
                    
                    # Level 3: (Optional) Image URLs could be gathered here if needed
                    series_with_chapters = {
                        **series_data,
                        "chapters": []
                    }
                    
                    for chapter_data in chapters:
                        try:
                            self.logger.info(f"Processing chapter: {chapter_data['chapter_number']}")
                            
                            chapter_with_images = {
                                **chapter_data,
                                "images": []
                            }
                            
                            series_with_chapters["chapters"].append(chapter_with_images)
                            
                        except Exception as e:
                            self.logger.error(f"Error processing chapter {chapter_data['chapter_number']}: {str(e)}")
                            results["errors"].append(f"Error processing chapter {chapter_data['chapter_number']}: {str(e)}")
                            continue
                    
                    results["series"].append(series_with_chapters)
                    
                except Exception as e:
                    self.logger.error(f"Error processing series {series_data['title']}: {str(e)}")
                    results["errors"].append(f"Error processing series {series_data['title']}: {str(e)}")
                    continue
            
            results["crawl_completed"] = datetime.now().isoformat()
            self.logger.info("Crawl process completed")
            
        except Exception as e:
            self.logger.error(f"Fatal error in crawl process: {str(e)}")
            results["errors"].append(f"Fatal error: {str(e)}")
        
        finally:
            # Clean up
            self.series_crawler.close()
            self.chapter_crawler.close()
            self.downloader.close()
        
        return results
    
    def save_results(self, results: Dict[str, Any], filename: str = None):
        """Save results to file"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"crawl_results_{timestamp}.json"
        
        filepath = os.path.join(self.config.OUTPUT_DIR, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        self.logger.info(f"Results saved to: {filepath}")
        return filepath


def _cmd_crawl(orchestrator: CrawlerOrchestrator, args: List[str]):
    # Defaults
    max_series = None
    max_chapters = None
    # Parse simple flags: --max-series N --max-chapters N
    for i, a in enumerate(args):
        if a == "--max-series" and i + 1 < len(args):
            try:
                max_series = int(args[i + 1])
            except Exception:
                pass
        if a == "--max-chapters" and i + 1 < len(args):
            try:
                max_chapters = int(args[i + 1])
            except Exception:
                pass

    results = orchestrator.crawl_all(max_series=max_series, max_chapters_per_series=max_chapters)
    output_file = orchestrator.save_results(results)
    print(f"Results saved to: {output_file}")


def _cmd_download(orchestrator: CrawlerOrchestrator, args: List[str]):
    # Expected flags: --from <results.json>
    input_file = None
    for i, a in enumerate(args):
        if a == "--from" and i + 1 < len(args):
            input_file = args[i + 1]
    if not input_file or not os.path.exists(input_file):
        print("[!] Please provide a valid file via --from <path/to/results.json>")
        return

    with open(input_file, "r", encoding="utf-8") as f:
        results = json.load(f)

    total_downloaded = 0
    for series in results.get("series", []):
        title = series.get("title")
        for chapter in series.get("chapters", []):
            manifest = orchestrator.downloader.download_chapter(
                chapter_url=chapter["chapter_url"],
                chapter_number=chapter["chapter_number"],
                series_title=title,
            )
            chapter["local_manifest"] = manifest
            total_downloaded += manifest.get("count", 0)

    # Save updated results alongside original
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_file = os.path.join(orchestrator.config.OUTPUT_DIR, f"download_results_{ts}.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"Downloaded {total_downloaded} images. Results saved to: {out_file}")


def _cmd_upload(orchestrator: CrawlerOrchestrator, args: List[str]):
    """Upload downloaded images to S3"""
    if not orchestrator.s3_uploader:
        print("[!] S3 uploader not initialized. Please set S3_ENABLED=True in settings and configure AWS credentials.")
        return
    
    # Expected flags: --from <download_results.json>
    input_file = None
    for i, a in enumerate(args):
        if a == "--from" and i + 1 < len(args):
            input_file = args[i + 1]
    
    if not input_file or not os.path.exists(input_file):
        print("[!] Please provide a valid download results file via --from <path/to/download_results.json>")
        return
    
    with open(input_file, "r", encoding="utf-8") as f:
        results = json.load(f)
    
    total_uploaded = 0
    total_failed = 0
    
    for series in results.get("series", []):
        series_title = series.get("title", "unknown")
        series_slug = slugify(series_title)
        
        for chapter in series.get("chapters", []):
            chapter_number = chapter.get("chapter_number", "unknown")
            chapter_slug = chapter_slugify(chapter_number)
            
            # Check if chapter has local manifest
            local_manifest = chapter.get("local_manifest")
            if not local_manifest:
                print(f"[!] No local images found for {series_title} - {chapter_number}")
                continue
            
            chapter_dir = local_manifest.get("saved_at", "").split("T")[0]  # This is wrong, let me fix
            # Actually, we need to reconstruct the path
            chapter_dir = f"data/images/{series_slug}/{chapter_slug}"
            
            if not os.path.exists(chapter_dir):
                print(f"[!] Chapter directory not found: {chapter_dir}")
                continue
            
            print(f"Uploading {series_title} - {chapter_number}...")
            upload_results = orchestrator.s3_uploader.upload_chapter_images(
                chapter_dir, series_slug, chapter_slug
            )
            
            # Update chapter with S3 URLs
            chapter["s3_upload"] = upload_results
            total_uploaded += upload_results["success_count"]
            total_failed += len(upload_results["failed"])
    
    # Save updated results
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    out_file = os.path.join(orchestrator.config.OUTPUT_DIR, f"upload_results_{ts}.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"Upload completed: {total_uploaded} successful, {total_failed} failed")
    print(f"Results saved to: {out_file}")


def _cmd_database(orchestrator: CrawlerOrchestrator, args: List[str]):
    """Upload data to database"""
    if not orchestrator.db_client:
        print("[!] Database client not initialized. Please set DATABASE_ENABLED=True in settings and configure DATABASE_URL.")
        return
    
    # Expected flags: --from <upload_results.json>
    input_file = None
    for i, a in enumerate(args):
        if a == "--from" and i + 1 < len(args):
            input_file = args[i + 1]
    
    if not input_file or not os.path.exists(input_file):
        print("[!] Please provide a valid upload results file via --from <path/to/upload_results.json>")
        return
    
    with open(input_file, "r", encoding="utf-8") as f:
        results = json.load(f)
    
    total_series = 0
    total_chapters = 0
    total_images = 0
    
    for series_data in results.get("series", []):
        series_title = series_data.get("title", "unknown")
        series_slug = slugify(series_title)
        
        print(f"Saving series: {series_title}")
        
        # Save series
        series_obj = orchestrator.db_client.save_series({
            'name': series_title,
            'cover_url': series_data.get('cover_image'),
            'synopsis': series_data.get('description', ''),
            'status': 'ongoing'
        })
        
        if not series_obj:
            print(f"[!] Failed to save series: {series_title}")
            continue
        
        total_series += 1
        
        # Save chapters and images
        for chapter_data in series_data.get("chapters", []):
            chapter_number = chapter_data.get("chapter_number", "unknown")
            chapter_slug = chapter_slugify(chapter_number)
            
            print(f"  Saving chapter: {chapter_number}")
            
            # Prepare pages_url as JSON array
            pages_url = []
            local_manifest = chapter_data.get("local_manifest", {})
            s3_upload = chapter_data.get("s3_upload", {})
            
            # Combine local and S3 data to get final URLs
            for img in local_manifest.get("images", []):
                # Find corresponding S3 data
                s3_data = None
                for s3_img in s3_upload.get("uploaded", []):
                    if s3_img["filename"] == img["filename"]:
                        s3_data = s3_img
                        break
                
                if s3_data and s3_data.get('s3_url'):
                    pages_url.append(s3_data['s3_url'])
                elif img.get('source_url'):
                    pages_url.append(img['source_url'])
            
            # Set chapter_num as number of images in this chapter
            chapter_num = len(pages_url)

            # Save chapter
            chapter_obj = orchestrator.db_client.save_chapter(series_obj, {
                'number': chapter_num,
                'title': chapter_data.get('title', ''),
                'pages_url': pages_url,
                'released_at': None
            })
            
            if not chapter_obj:
                print(f"  [!] Failed to save chapter: {chapter_number}")
                continue
            
            total_chapters += 1
            print(f"    Saved chapter with {len(pages_url)} pages")
    
    print(f"\nDatabase upload completed:")
    print(f"  Series: {total_series}")
    print(f"  Chapters: {total_chapters}")


def _cmd_all(orchestrator: CrawlerOrchestrator, args: List[str]):
    # Run crawl with optional limits
    _cmd_crawl(orchestrator, args)

    # Find the latest crawl_results_*.json in output dir and run download
    crawl_files = [fn for fn in os.listdir(orchestrator.config.OUTPUT_DIR) if fn.startswith("crawl_results_") and fn.endswith(".json")]
    if not crawl_files:
        print("[!] No crawl results found to download from.")
        return
    crawl_files.sort()
    latest_crawl = os.path.join(orchestrator.config.OUTPUT_DIR, crawl_files[-1])
    _cmd_download(orchestrator, ["--from", latest_crawl])

    # Find the latest download_results_*.json in output dir and run upload
    download_files = [fn for fn in os.listdir(orchestrator.config.OUTPUT_DIR) if fn.startswith("download_results_") and fn.endswith(".json")]
    if not download_files:
        print("[!] No download results found to upload from.")
        return
    download_files.sort()
    latest_download = os.path.join(orchestrator.config.OUTPUT_DIR, download_files[-1])
    _cmd_upload(orchestrator, ["--from", latest_download])

    # Find the latest upload_results_*.json in output dir and run database
    upload_files = [fn for fn in os.listdir(orchestrator.config.OUTPUT_DIR) if fn.startswith("upload_results_") and fn.endswith(".json")]
    if not upload_files:
        print("[!] No upload results found to import into database.")
        return
    upload_files.sort()
    latest_upload = os.path.join(orchestrator.config.OUTPUT_DIR, upload_files[-1])
    _cmd_database(orchestrator, ["--from", latest_upload])


def main():
    print("🚀 Manga Crawler")
    print("Usage: python main.py [crawl|download|upload|database|all] [options]")
    print("Examples:")
    print("  python main.py crawl --max-series 2 --max-chapters 3")
    print("  python main.py download --from data/output/crawl_results_XXXX.json")
    print("  python main.py upload --from data/output/download_results_XXXX.json")
    print("  python main.py database --from data/output/upload_results_XXXX.json")
    print("  python main.py all --max-series 1 --max-chapters 2")

    orchestrator = CrawlerOrchestrator()

    mode = sys.argv[1] if len(sys.argv) > 1 else "crawl"
    args = sys.argv[2:]

    if mode == "crawl":
        _cmd_crawl(orchestrator, args)
    elif mode == "download":
        _cmd_download(orchestrator, args)
    elif mode == "upload":
        _cmd_upload(orchestrator, args)
    elif mode == "database":
        _cmd_database(orchestrator, args)
    elif mode == "all":
        _cmd_all(orchestrator, args)
    else:
        print(f"[!] Unknown mode: {mode}")


if __name__ == "__main__":
    main()
