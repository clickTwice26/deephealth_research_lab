from fastapi import APIRouter
from app.api.v1.endpoints import (
    items,
    auth,
    users,
    notifications,
    search,
    news,
    publications,
    jobs,
    community,
    research_groups,
    blog,
    upload,
    bucket, # Added bucket to imports
)

api_router = APIRouter()
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(publications.router, prefix="/publications", tags=["publications"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(community.router, prefix="/community", tags=["community"])
api_router.include_router(research_groups.router, prefix="/research-groups", tags=["research-groups"])
api_router.include_router(blog.router, prefix="/blog", tags=["blog"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(bucket.router, prefix="/bucket", tags=["bucket"]) # Added bucket router
