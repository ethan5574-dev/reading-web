# Manga Crawler System

A structured, 3-level web crawler system for extracting manga series, chapters, and images from manga websites.

## 🏗️ Project Structure

```
crawl-worker/
├── src/
│   ├── base/                   # Base classes and utilities
│   │   ├── crawler.py         # Base crawler class
│   │   ├── http_client.py     # HTTP client with retry & caching
│   │   └── data_models.py     # Data models
│   ├── crawlers/              # Specific crawlers
│   │   ├── series_crawler.py  # Level 1: Series list
│   │   ├── chapter_crawler.py # Level 2: Chapter list
│   │   └── image_crawler.py   # Level 3: Chapter images
│   ├── config/                # Configuration
│   │   └── settings.py        # Settings and selectors
│   └── utils/                 # Utility functions
├── data/
│   ├── cache/                 # HTTP response cache
│   ├── output/                # Crawl results
│   └── logs/                  # Log files
├── tests/                     # Unit tests
├── main.py                    # Main entry point
└── requirements.txt
```

## 🚀 Features

### **3-Level Crawling System:**
1. **Level 1**: Crawl series list from homepage
2. **Level 2**: Crawl chapter list from each series page  
3. **Level 3**: Crawl images from each chapter page

### **Advanced Features:**
- ✅ **Rate Limiting**: Respectful crawling with delays
- ✅ **Retry Logic**: Automatic retry on failures
- ✅ **Caching**: HTTP response caching to avoid re-requests
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Structured Data**: Clean, organized data output
- ✅ **Configurable**: Easy to configure selectors and settings
- ✅ **Logging**: Detailed logging for debugging

## 📦 Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Create data directories
mkdir -p data/{cache,output,logs}
```

## 🎯 Usage

### **Basic Usage:**
```bash
python main.py
```

### **Programmatic Usage:**
```python
from src.config.settings import settings
from main import CrawlerOrchestrator

# Create orchestrator
orchestrator = CrawlerOrchestrator()

# Crawl with limits
results = orchestrator.crawl_all(
    max_series=5,           # Limit to 5 series
    max_chapters_per_series=3  # Limit to 3 chapters per series
)

# Save results
orchestrator.save_results(results)
```

## ⚙️ Configuration

Edit `src/config/settings.py` to customize:

```python
@dataclass
class CrawlerSettings:
    BASE_URL: str = "https://truyenqqgo.com/"
    USER_AGENT: str = "Mozilla/5.0 ..."
    DELAY_BETWEEN_REQUESTS: float = 1.0
    MAX_RETRIES: int = 3
    CACHE_ENABLED: bool = True
    
    # CSS Selectors
    SERIES_SELECTORS = {
        "container": "div.book_avatar",
        "image": "img",
        "link": "a"
    }
```

## 📊 Output Format

Results are saved as JSON with this structure:

```json
{
  "crawl_started": "2024-01-01T10:00:00",
  "total_series": 5,
  "total_chapters": 15,
  "total_images": 450,
  "series": [
    {
      "title": "Series Title",
      "cover_image": "https://...",
      "series_url": "https://...",
      "chapters": [
        {
          "chapter_number": "Chap 1",
          "chapter_url": "https://...",
          "images": [
            {
              "page_number": 1,
              "image_url": "https://...",
              "alt_text": "Page 1"
            }
          ]
        }
      ]
    }
  ]
}
```

## 🔧 Customization

### **Adding New Sites:**
1. Update selectors in `settings.py`
2. Modify crawlers if needed
3. Test with new URL

### **Adding New Data Fields:**
1. Update data models in `data_models.py`
2. Modify extraction logic in crawlers
3. Update output format

## 📝 Logging

Logs are saved to `data/logs/` with timestamps. Check logs for:
- Crawl progress
- Errors and warnings
- Performance metrics

## 🗄️ Database Upload (Step 3)

Upload crawled and processed data to a MySQL database:

```bash
python main.py database --from data/output/upload_results_20251029_012440.json
```

**Database Schema:**
- `series`: Series information (series_id, name, status, cover_url, synopsis)
- `chapters`: Chapter information (chapter_id, series_id, number, title, pages_url JSON)
- `author`: Author information
- `series_author`: Series-Author relationships
- `chapter_view_stats_daily`: View statistics

**Environment Variables:**
```bash
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/database_name
```

## 🧪 Testing

```bash
# Run tests
python -m pytest tests/

# Run specific test
python -m pytest tests/test_crawlers.py
```

## 🚨 Error Handling

The system handles:
- Network timeouts
- HTTP errors
- Invalid HTML
- Missing elements
- Rate limiting

All errors are logged and reported in the final results.

## 📈 Performance

- **Caching**: Reduces redundant requests
- **Rate Limiting**: Prevents server overload
- **Parallel Processing**: Can be extended for concurrent crawling
- **Memory Efficient**: Processes data incrementally

## 🔒 Best Practices

1. **Respect robots.txt** and website terms
2. **Use appropriate delays** between requests
3. **Monitor logs** for errors
4. **Test with small limits** first
5. **Cache results** to avoid re-crawling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
