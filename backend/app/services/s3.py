import boto3
from botocore.exceptions import NoCredentialsError, ClientError
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.access_key = settings.SPACES_ACCESS_KEY
        self.secret_key = settings.SPACES_SECRET_KEY
        self.bucket_name = settings.SPACES_BUCKET_NAME
        self.region = settings.SPACES_REGION_NAME
        self.endpoint_url = settings.SPACES_ENDPOINT_URL
        
        if not all([self.access_key, self.secret_key, self.bucket_name, self.region, self.endpoint_url]):
            logger.warning("DigitalOcean Spaces credentials not fully configured.")
            self.s3_client = None
        else:
            try:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    region_name=self.region,
                    endpoint_url=self.endpoint_url
                )
            except Exception as e:
                logger.error(f"Failed to initialize Boto3 client for Spaces: {e}")
                self.s3_client = None

    def upload_file(self, file_obj, object_name: str, content_type: str = None) -> str:
        """
        Uploads a file to S3 and returns the public URL.
        """
        if not self.s3_client:
            raise Exception("Spaces client is not initialized.")

        try:
            extra_args = {'ACL': 'public-read'}
            if content_type:
                extra_args['ContentType'] = content_type
                
            self.s3_client.upload_fileobj(
                file_obj, 
                self.bucket_name, 
                object_name,
                ExtraArgs=extra_args
            )
            
            # Construct the public URL
            url = self.get_file_url(object_name)
            
            logger.info(f"File uploaded to Spaces. URL: {url}")
            return url
            

        except ClientError as e:
            logger.error(f"Failed to upload file to Spaces: {e}")
            raise e
        except Exception as e:
            logger.error(f"Unexpected error uploading to Spaces: {e}")
            raise e

    def get_file_url(self, object_name: str) -> str:
        """
        Generates the public URL for a given object name.
        """
        if not self.endpoint_url:
            return ""
            
        # Construct the public URL
        # Format: https://<bucket>.<region>.digitaloceanspaces.com/<key>
        
        # Remove protocol from endpoint to construct clear URL
        endpoint_clean = self.endpoint_url.replace("https://", "").replace("http://", "")
        
        # Identify if the user included the bucket in the endpoint already (unlikely but possible)
        if endpoint_clean.startswith(f"{self.bucket_name}."):
            domain = endpoint_clean
        else:
            domain = f"{self.bucket_name}.{endpoint_clean}"

        return f"https://{domain}/{object_name}"

    def list_objects(self, prefix: str) -> list:
        """
        List objects in the bucket with a given prefix.
        Returns a list of dicts with Key, Size, LastModified.
        """
        if not self.s3_client:
            return []
            
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            return response.get('Contents', [])
        except Exception as e:
            logger.error(f"Failed to list objects in S3: {e}")
            return []

    def delete_object(self, object_name: str) -> bool:
        """
        Delete an object from S3.
        """
        if not self.s3_client:
            return False
            
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            return True
        except Exception as e:
            logger.error(f"Failed to delete object from S3: {e}")
            return False
    
    def get_object_metadata(self, object_name: str) -> dict:
        """
        Get metadata (including ContentLength) of an object.
        """
        if not self.s3_client:
            return None
            
        try:
            return self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
        except Exception as e:
            logger.error(f"Failed to head object in S3: {e}")
            return None


s3_service = S3Service()
