import boto3
from botocore.exceptions import NoCredentialsError, ClientError
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.access_key = settings.AWS_ACCESS_KEY
        self.secret_key = settings.AWS_ACCESS_SECRET_KEY
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        self.region = settings.AWS_S3_REGION_NAME
        
        if not all([self.access_key, self.secret_key, self.bucket_name, self.region]):
            logger.warning("AWS S3 credentials not fully configured.")
            self.s3_client = None
        else:
            try:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    region_name=self.region
                )
            except Exception as e:
                logger.error(f"Failed to initialize Boto3 client: {e}")
                self.s3_client = None

    def upload_file(self, file_obj, object_name: str, content_type: str = None) -> str:
        """
        Uploads a file to S3 and returns the public URL.
        """
        if not self.s3_client:
            raise Exception("AWS S3 client is not initialized.")

        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
                
            self.s3_client.upload_fileobj(
                file_obj, 
                self.bucket_name, 
                object_name,
                ExtraArgs=extra_args
            )
            
            # Construct the public URL
            # Format: https://<bucket>.s3.<region>.amazonaws.com/<key>
            url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{object_name}"
            return url
            
        except ClientError as e:
            logger.error(f"Failed to upload file to S3: {e}")
            raise e
        except Exception as e:
            logger.error(f"Unexpected error uploading to S3: {e}")
            raise e

s3_service = S3Service()
