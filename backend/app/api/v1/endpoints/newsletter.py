from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_database
from app.models.subscriber import Subscriber, SubscriberCreate
from pymongo.errors import DuplicateKeyError

from app.core.ratelimit import limiter
from starlette.requests import Request
from fastapi.responses import HTMLResponse
from jose import jwt, JWTError
from app.core import security
from app.core.config import settings

router = APIRouter()

@router.post("/subscribe", response_model=Subscriber)
@limiter.limit("5/minute")
async def subscribe_newsletter(
    request: Request,
    subscriber: SubscriberCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> Any:
    """
    Subscribe to newsletter.
    """
    # Check if email exists
    existing = await db["subscribers"].find_one({"email": subscriber.email})
    if existing:
        return Subscriber(**existing)

    try:
        item_dict = subscriber.model_dump()
        result = await db["subscribers"].insert_one(item_dict)
        created_item = await db["subscribers"].find_one({"_id": result.inserted_id})
        return Subscriber(**created_item)
    except DuplicateKeyError:
         existing = await db["subscribers"].find_one({"email": subscriber.email})
         return Subscriber(**existing)

from app.models.user import User, UserRole, ROLE_WEIGHTS
from app.api import deps
from bson import ObjectId

@router.get("/subscribers", response_model=dict)
async def read_subscribers(
    page: int = 1,
    size: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Retrieve subscribers with pagination. Admin only.
    """
    skip = (page - 1) * size
    cursor = db["subscribers"].find().sort("subscribed_at", -1).skip(skip).limit(size)
    items = await cursor.to_list(length=size)
    total_count = await db["subscribers"].count_documents({})
    
    return {
        "items": [Subscriber(**item) for item in items],
        "total": total_count,
        "page": page,
        "size": size,
        "pages": (total_count + size - 1) // size
    }

@router.delete("/subscribers/{subscriber_id}", response_model=bool)
async def delete_subscriber(
    subscriber_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Delete a subscriber. Admin only.
    """
    try:
        oid = ObjectId(subscriber_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    result = await db["subscribers"].delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    return True

@router.get("/unsubscribe", response_class=HTMLResponse)
async def unsubscribe(
    token: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Unsubscribe from newsletter via token.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "unsubscribe":
            return HTMLResponse(content="<h1>Invalid or expired link.</h1>", status_code=400)
            
    except JWTError:
        return HTMLResponse(content="<h1>Invalid or expired link.</h1>", status_code=400)

    # Delete subscriber
    await db["subscribers"].delete_one({"email": email})
    
    return HTMLResponse(content="""
        <html>
            <head>
                <title>Unsubscribed</title>
                <style>
                    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f9fafb; margin: 0; }
                    .container { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center; }
                    h1 { color: #1f2937; margin-bottom: 1rem; }
                    p { color: #4b5563; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Unsubscribed Successfully</h1>
                    <p>You have been removed from the Research Lab newsletter.</p>
                </div>
            </body>
        </html>
    """)

from fastapi import BackgroundTasks
from app.utils.email import send_email

def send_newsletter_bg(emails: list[str], subject: str, message: str):
    """
    Background task to send newsletter to all recipients.
    """
    count = 0
    for email in emails:
        # Generate Unsubscribe Link
        token = security.create_access_token(subject=email, claims={"type": "unsubscribe"})
        unsubscribe_link = f"{settings.BACKEND_URL}{settings.API_V1_STR}/newsletter/unsubscribe?token={token}"
        
        footer = f"""
        <br><br>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="text-align: center; font-size: 12px; color: #999;">
            You received this email because you subscribed to Research Lab updates.
            <br>
            <a href="{unsubscribe_link}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
        </p>
        """
        
        full_message = message + footer
        
        if send_email(email, subject, full_message):
            count += 1
    print(f"Newsletter sent to {count}/{len(emails)} subscribers.")

@router.post("/send", response_model=dict)
async def send_newsletter(
    background_tasks: BackgroundTasks,
    subject: str = Body(...),
    message: str = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: User = Depends(deps.RoleChecker(required_weight=ROLE_WEIGHTS[UserRole.ADMIN])),
) -> Any:
    """
    Send newsletter to all subscribers. Admin only.
    """
    # Fetch all confirmed subscribers
    cursor = db["subscribers"].find({})
    subscribers = await cursor.to_list(length=10000) # Cap at 10k for now
    emails = [s["email"] for s in subscribers]
    
    if not emails:
        raise HTTPException(status_code=400, detail="No subscribers found")

    background_tasks.add_task(send_newsletter_bg, emails, subject, message)
    
    return {"status": "success", "message": f"Newsletter queued for {len(emails)} subscribers"}
