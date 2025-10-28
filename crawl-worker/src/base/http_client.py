"""
HTTP client with retry, rate limiting, and caching
"""
import time
import hashlib
import json
import os
from typing import Tuple, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from .data_models import CrawlConfig


class HTTPClient:
    """HTTP client with retry, rate limiting, and caching"""
    
    def __init__(self, config: CrawlConfig):
        self.config = config
        self.session = self._create_session()
        self.last_request_time = 0
        
    def _create_session(self) -> requests.Session:
        """Create a session with retry strategy"""
        session = requests.Session()
        
        # Retry strategy
        retry_strategy = Retry(
            total=self.config.max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        return session
    
    def _rate_limit(self):
        """Implement rate limiting"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        if time_since_last_request < self.config.delay_between_requests:
            sleep_time = self.config.delay_between_requests - time_since_last_request
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
    
    def _get_cache_key(self, url: str) -> str:
        """Generate cache key for URL"""
        return hashlib.md5(url.encode()).hexdigest()
    
    def _load_from_cache(self, url: str) -> Optional[Tuple[str, str]]:
        """Load data from cache if available (disabled if cache_enabled=False)"""
        if not self.config.cache_enabled:
            return None
        return None
    
    def _save_to_cache(self, url: str, html: str, final_url: str):
        """Save data to cache (no-op when cache is disabled)"""
        if not self.config.cache_enabled:
            return
        return
    
    def fetch_html(self, url: str) -> Tuple[str, str]:
        """
        Fetch HTML content from URL with caching and rate limiting
        
        Returns:
            Tuple of (html_content, final_url)
        """
        # Check cache first
        cached_data = self._load_from_cache(url)
        if cached_data:
            return cached_data
        
        # Rate limiting
        self._rate_limit()
        
        # Headers
        headers = {
            "User-Agent": self.config.user_agent,
            "Accept-Language": "vi,en;q=0.8",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
        }
        
        try:
            response = self.session.get(
                url, 
                headers=headers, 
                timeout=self.config.timeout,
                allow_redirects=True
            )
            response.raise_for_status()
            
            # Save to cache
            self._save_to_cache(url, response.text, response.url)
            
            return response.text, response.url
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch {url}: {str(e)}")
    
    def close(self):
        """Close the session"""
        self.session.close()
