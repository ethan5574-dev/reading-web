"""
S3 Uploader for manga images
"""
import os
import logging
from typing import Optional, Dict, Any
import boto3
from botocore.exceptions import ClientError, NoCredentialsError


class S3Uploader:
    """S3 uploader for manga images"""
    
    def __init__(self, 
                 aws_region: str = None,
                 aws_access_key_id: str = None, 
                 aws_secret_access_key: str = None,
                 bucket_name: str = None):
        """
        Initialize S3 uploader
        
        Args:
            aws_region: AWS region (default: from env AWS_REGION)
            aws_access_key_id: AWS access key (default: from env AWS_ACCESS_KEY_ID)
            aws_secret_access_key: AWS secret key (default: from env AWS_SECRET_ACCESS_KEY)
            bucket_name: S3 bucket name (default: from env S3_BUCKET)
        """
        self.aws_region = aws_region or os.getenv('AWS_REGION', 'us-east-1')
        self.aws_access_key_id = aws_access_key_id or os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_access_key = aws_secret_access_key or os.getenv('AWS_SECRET_ACCESS_KEY')
        self.bucket_name = bucket_name or os.getenv('S3_BUCKET')
        
        self.logger = logging.getLogger(__name__)
        
        # Validate required config
        if not all([self.aws_access_key_id, self.aws_secret_access_key, self.bucket_name]):
            raise ValueError("Missing required S3 configuration. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET environment variables.")
        
        # Initialize S3 client
        try:
            self.s3_client = boto3.client(
                's3',
                region_name=self.aws_region,
                aws_access_key_id=self.aws_access_key_id,
                aws_secret_access_key=self.aws_secret_access_key
            )
            self.logger.info(f"S3 client initialized for bucket: {self.bucket_name}")
        except NoCredentialsError:
            raise ValueError("Invalid AWS credentials")
        except Exception as e:
            raise ValueError(f"Failed to initialize S3 client: {str(e)}")
    
    def upload_file(self, local_file_path: str, s3_key: str, 
                   content_type: str = None, make_public: bool = True) -> Optional[str]:
        """
        Upload file to S3
        
        Args:
            local_file_path: Path to local file
            s3_key: S3 object key (path in bucket)
            content_type: MIME type (auto-detect if None)
            make_public: Whether to make object public
            
        Returns:
            S3 URL if successful, None if failed
        """
        if not os.path.exists(local_file_path):
            self.logger.error(f"Local file not found: {local_file_path}")
            return None
        
        try:
            # Auto-detect content type if not provided
            if not content_type:
                content_type = self._get_content_type(local_file_path)
            
            # Upload parameters
            extra_args = {
                'ContentType': content_type,
                'CacheControl': 'public, max-age=31536000'  # 1 year cache
            }
            
            # Note: ACL removed due to bucket policy restrictions
            # Make bucket public via bucket policy instead of ACL
            
            # Upload file
            self.s3_client.upload_file(
                local_file_path,
                self.bucket_name,
                s3_key,
                ExtraArgs=extra_args
            )
            
            # Generate public URL
            s3_url = f"https://{self.bucket_name}.s3.{self.aws_region}.amazonaws.com/{s3_key}"
            
            self.logger.info(f"Uploaded {local_file_path} to {s3_url}")
            return s3_url
            
        except ClientError as e:
            self.logger.error(f"Failed to upload {local_file_path}: {str(e)}")
            return None
        except Exception as e:
            self.logger.error(f"Unexpected error uploading {local_file_path}: {str(e)}")
            return None
    
    def _get_content_type(self, file_path: str) -> str:
        """Get content type from file extension"""
        ext = os.path.splitext(file_path)[1].lower()
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.avif': 'image/avif'
        }
        return content_types.get(ext, 'application/octet-stream')
    
    def upload_chapter_images(self, chapter_dir: str, series_slug: str, chapter_slug: str) -> Dict[str, Any]:
        """
        Upload all images in a chapter directory to S3
        
        Args:
            chapter_dir: Local directory containing chapter images
            series_slug: Series slug for S3 key prefix
            chapter_slug: Chapter slug for S3 key prefix
            
        Returns:
            Dictionary with upload results
        """
        results = {
            "uploaded": [],
            "failed": [],
            "total": 0,
            "success_count": 0
        }
        
        if not os.path.exists(chapter_dir):
            self.logger.error(f"Chapter directory not found: {chapter_dir}")
            return results
        
        # Find all image files
        image_files = []
        for filename in os.listdir(chapter_dir):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif')):
                image_files.append(filename)
        
        image_files.sort()  # Sort to maintain order
        results["total"] = len(image_files)
        
        self.logger.info(f"Uploading {len(image_files)} images from {chapter_dir}")
        
        for filename in image_files:
            local_path = os.path.join(chapter_dir, filename)
            s3_key = f"stories/{series_slug}/{chapter_slug}/{filename}"
            
            s3_url = self.upload_file(local_path, s3_key)
            
            if s3_url:
                results["uploaded"].append({
                    "filename": filename,
                    "local_path": local_path,
                    "s3_key": s3_key,
                    "s3_url": s3_url
                })
                results["success_count"] += 1
            else:
                results["failed"].append({
                    "filename": filename,
                    "local_path": local_path,
                    "s3_key": s3_key
                })
        
        self.logger.info(f"Upload completed: {results['success_count']}/{results['total']} successful")
        return results
