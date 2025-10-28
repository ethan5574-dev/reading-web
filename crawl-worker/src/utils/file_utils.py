"""
Utilities for filesystem ops and image saving
"""
import os
import re
import hashlib
from datetime import datetime
from typing import Optional


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


# Mapping tiếng Việt sang không dấu
_VIETNAMESE_MAP = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D'
}

_slug_re = re.compile(r"[^a-z0-9]+")


def slugify(value: str) -> str:
    """Convert Vietnamese text to slug format"""
    if not value:
        return "unknown"
    
    # Chuyển tiếng Việt sang không dấu
    result = ""
    for char in value:
        result += _VIETNAMESE_MAP.get(char, char)
    
    # Chuyển về lowercase và thay thế ký tự đặc biệt
    result = result.lower().strip()
    result = _slug_re.sub("-", result).strip("-")
    
    return result or "unknown"


def chapter_slugify(chapter_name: str) -> str:
    """Convert chapter name to simple number format"""
    if not chapter_name:
        return "unknown"
    
    # Tìm số trong tên chapter
    import re
    numbers = re.findall(r'\d+', chapter_name)
    if numbers:
        return numbers[0]  # Lấy số đầu tiên tìm thấy
    
    # Nếu không có số, dùng slugify thông thường
    return slugify(chapter_name)


def ext_from_content_type(content_type: Optional[str]) -> Optional[str]:
    if not content_type:
        return None
    mapping = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/avif": ".avif",
    }
    return mapping.get(content_type.split(";")[0].strip())


def ext_from_url(url: str) -> Optional[str]:
    # crude parse for last dot segment
    filename = url.split("?")[0].split("#")[0].rstrip("/").split("/")[-1]
    if "." in filename:
        ext = "." + filename.split(".")[-1].lower()
        if len(ext) <= 5:
            return ext
    return None


def compute_sha256(bytes_data: bytes) -> str:
    h = hashlib.sha256()
    h.update(bytes_data)
    return h.hexdigest()


def atomic_write(path: str, data: bytes) -> None:
    tmp_path = path + ".part"
    with open(tmp_path, "wb") as f:
        f.write(data)
    os.replace(tmp_path, path)


