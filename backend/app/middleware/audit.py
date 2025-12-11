from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from app.api.deps import get_current_user, oauth2_scheme
from app.core.config import settings
from app.db.mongodb import get_database
from jose import jwt
from datetime import datetime

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Only log state-changing methods
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            try:
                # Manual token extraction since we are in middleware
                auth_header = request.headers.get("Authorization")
                if auth_header and auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                    email = payload.get("sub")
                    
                    impersonator = payload.get("impersonator") # Extract impersonator email if present
                    
                    if email:
                        db = await get_database()
                        log_entry = {
                            "timestamp": datetime.utcnow(),
                            "method": request.method,
                            "url": str(request.url),
                            "user_email": email,
                            "status_code": response.status_code,
                            "is_impersonated": bool(impersonator),
                            "impersonator_email": impersonator
                        }
                        await db["activity_logs"].insert_one(log_entry)
            except Exception as e:
                # Don't fail request if logging fails
                print(f"Audit log failed: {e}")
                
        return response
