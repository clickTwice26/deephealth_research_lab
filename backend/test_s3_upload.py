import os
import boto3
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def upload_to_aws(local_file, bucket, s3_file):
    access_key = os.getenv('AWS_ACCESS_KEY')
    secret_key = os.getenv('AWS_ACCESS_SECRET_KEY')
    region = os.getenv('AWS_S3_REGION_NAME')

    if not access_key or not secret_key:
        print("Error: AWS Credentials not found in .env")
        return False

    print(f"Using Access Key: {access_key[:5]}...{access_key[-5:]}")
    print(f"Using Secret Key: {secret_key[:5]}...{secret_key[-5:]}")
    print(f"Target Bucket: {bucket}")
    print(f"Target Region: {region}")

    s3 = boto3.client(
        's3',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region
    )

    try:
        s3.upload_file(local_file, bucket, s3_file)
        print("Upload Successful")
        return True
    except FileNotFoundError:
        print("The file was not found")
        return False
    except NoCredentialsError:
        print("Credentials not available")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def main():
    # Create a dummy file
    test_filename = "test_upload.txt"
    with open(test_filename, "w") as f:
        f.write("This is a test file for S3 upload verification.")

    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
    if not bucket_name:
        print("Error: AWS_STORAGE_BUCKET_NAME not found in .env")
        return

    upload_to_aws(test_filename, bucket_name, test_filename)
    
    # Cleanup
    if os.path.exists(test_filename):
        os.remove(test_filename)

if __name__ == "__main__":
    main()
