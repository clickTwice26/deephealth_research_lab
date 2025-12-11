from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import uuid
from datetime import datetime
from jose import jwt, JWTError

from app.api import deps
from app.db.mongodb import get_database
from app.core.config import settings
from app.models.research_group import (
    ResearchGroup, ResearchGroupCreate, ResearchGroupUpdate, 
    GroupMember, GroupMemberDetail, GroupRole, Invitation, InvitationStatus, ChatMessage
)
from app.models.user import User, UserRole

router = APIRouter()

# --- Connection Manager for WebSockets ---
class ConnectionManager:
    def __init__(self):
        # group_id -> list of (websocket, user_id)
        self.active_connections: dict[str, List[tuple[WebSocket, str]]] = {} 

    async def connect(self, websocket: WebSocket, group_id: str, user_id: str):
        await websocket.accept()
        if group_id not in self.active_connections:
            self.active_connections[group_id] = []
        self.active_connections[group_id].append((websocket, user_id))
        
        # Broadcast user joined (optional, or rely on online status poller)
        await self.broadcast_status(group_id)

    def disconnect(self, websocket: WebSocket, group_id: str, user_id: str):
        if group_id in self.active_connections:
            self.active_connections[group_id] = [
                (ws, uid) for ws, uid in self.active_connections[group_id] if ws != websocket
            ]
            if not self.active_connections[group_id]:
                del self.active_connections[group_id]

    async def broadcast(self, message: str, group_id: str):
        if group_id in self.active_connections:
            for connection, _ in self.active_connections[group_id]:
                try:
                    await connection.send_text(message)
                except:
                    pass
    
    async def broadcast_status(self, group_id: str):
        """Broadcast who is currently connected"""
        if group_id in self.active_connections:
            online_users = list(set([uid for _, uid in self.active_connections[group_id]]))
            import json
            msg = json.dumps({"type": "status", "online_users": online_users})
            await self.broadcast(msg, group_id)

manager = ConnectionManager()

async def enrich_group_data(group: dict, db: AsyncIOMotorDatabase) -> dict:
    """Enrich group member data with user details (name, avatar)"""
    if not group or "members" not in group:
        return group
        
    member_ids = [m["user_id"] for m in group["members"]]
    users = await db["users"].find({"_id": {"$in": [ObjectId(uid) for uid in member_ids]}}).to_list(None)
    user_map = {str(u["_id"]): u for u in users}
    
    enriched_members = []
    for m in group["members"]:
        user = user_map.get(m["user_id"])
        member_detail = m.copy()
        if user:
            member_detail["name"] = user.get("full_name") or user.get("email")
            # Assuming avatar_url might be added to User model later or exists, 
            # for now we can simulate or check if it exists
            member_detail["avatar_url"] = user.get("avatar_url")
        else:
            member_detail["name"] = "Unknown User"
            
        enriched_members.append(member_detail)
        
    group["members"] = enriched_members
    return group

# --- Routes ---

@router.post("/", response_model=ResearchGroup)
async def create_group(
    group_in: ResearchGroupCreate,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    group_data = group_in.model_dump()
    group_data["created_by"] = str(current_user.id)
    group_data["members"] = [
        GroupMember(user_id=str(current_user.id), role=GroupRole.ADMIN).model_dump()
    ]
    
    result = await db["research_groups"].insert_one(group_data)
    created_group = await db["research_groups"].find_one({"_id": result.inserted_id})
    created_group = await enrich_group_data(created_group, db)
    return ResearchGroup(**created_group)

@router.get("/", response_model=List[ResearchGroup])
async def read_groups(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Admin sees all, researchers/users see theirs
    query = {}
    if current_user.role != UserRole.ADMIN:
        query = {"members.user_id": str(current_user.id)}
    
    cursor = db["research_groups"].find(query).skip(skip).limit(limit)
    groups = await cursor.to_list(length=limit)
    
    # Enrich all groups
    enriched_groups = []
    for g in groups:
        enriched_groups.append(await enrich_group_data(g, db))
        
    return [ResearchGroup(**g) for g in enriched_groups]

@router.get("/{group_id}", response_model=ResearchGroup)
async def read_group(
    group_id: str,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(group_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    group = await db["research_groups"].find_one({"_id": oid})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    # Check access
    is_member = any(m["user_id"] == str(current_user.id) for m in group["members"])
    if not is_member and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not a member")
        
    return ResearchGroup(**await enrich_group_data(group, db))

@router.put("/{group_id}", response_model=ResearchGroup)
async def update_group(
    group_id: str,
    group_in: ResearchGroupUpdate,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(group_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    group = await db["research_groups"].find_one({"_id": oid})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    # Permission check: Group Admin or System Admin
    member_rec = next((m for m in group["members"] if m["user_id"] == str(current_user.id)), None)
    is_group_admin = member_rec and member_rec["role"] == GroupRole.ADMIN
    if not is_group_admin and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update group")

    update_data = {k: v for k, v in group_in.model_dump().items() if v is not None}
    
    if update_data:
        await db["research_groups"].update_one(
            {"_id": oid},
            {"$set": update_data}
        )
        
    updated_group = await db["research_groups"].find_one({"_id": oid})
    return ResearchGroup(**await enrich_group_data(updated_group, db))

@router.put("/{group_id}/members/{user_id}/role", response_model=ResearchGroup)
async def update_member_role(
    group_id: str,
    user_id: str,
    role: GroupRole = Query(...),
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(group_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    group = await db["research_groups"].find_one({"_id": oid})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Permission check
    member_rec = next((m for m in group["members"] if m["user_id"] == str(current_user.id)), None)
    is_group_admin = member_rec and member_rec["role"] == GroupRole.ADMIN
    if not is_group_admin and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to manage members")

    # Update member role
    result = await db["research_groups"].update_one(
        {"_id": oid, "members.user_id": user_id},
        {"$set": {"members.$.role": role}}
    )
    
    if result.modified_count == 0:
         # Check if user is actually in group
         if not any(m["user_id"] == user_id for m in group["members"]):
             raise HTTPException(status_code=404, detail="Member not found in group")
             
    updated_group = await db["research_groups"].find_one({"_id": oid})
    return ResearchGroup(**await enrich_group_data(updated_group, db))

@router.delete("/{group_id}/members/{user_id}", response_model=ResearchGroup)
async def remove_member(
    group_id: str,
    user_id: str,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(group_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")

    group = await db["research_groups"].find_one({"_id": oid})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Permission check
    member_rec = next((m for m in group["members"] if m["user_id"] == str(current_user.id)), None)
    is_group_admin = member_rec and member_rec["role"] == GroupRole.ADMIN
    
    # Allow users to leave (remove themselves)
    is_self_removal = str(current_user.id) == user_id
    
    if not is_group_admin and current_user.role != UserRole.ADMIN and not is_self_removal:
        raise HTTPException(status_code=403, detail="Not authorized to remove member")

    # Prevent removing the group creator unless by System Admin
    if user_id == group["created_by"] and current_user.role != UserRole.ADMIN and not is_self_removal:
        raise HTTPException(status_code=403, detail="Cannot remove the group creator")

    # Prevent removing the last admin? (Optional safety check)
    if is_self_removal and is_group_admin:
        admin_count = sum(1 for m in group["members"] if m["role"] == GroupRole.ADMIN)
        if admin_count <= 1:
             raise HTTPException(status_code=400, detail="Cannot leave group as the only admin. Promote another member first.")

    await db["research_groups"].update_one(
        {"_id": oid},
        {"$pull": {"members": {"user_id": user_id}}}
    )
    
    updated_group = await db["research_groups"].find_one({"_id": oid})
    return ResearchGroup(**await enrich_group_data(updated_group, db))

@router.post("/{group_id}/invite", response_model=Invitation)
async def invite_member(
    group_id: str,
    email: str = Query(...),
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        oid = ObjectId(group_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    group = await db["research_groups"].find_one({"_id": oid})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    # Check if user is admin of the group
    member_rec = next((m for m in group["members"] if m["user_id"] == str(current_user.id)), None)
    if not member_rec or member_rec["role"] != GroupRole.ADMIN:
         if current_user.role != UserRole.ADMIN:
             raise HTTPException(status_code=403, detail="Only group admins can invite")

    token = str(uuid.uuid4())
    invitation_data = {
        "group_id": group_id,
        "sender_id": str(current_user.id),
        "email": email,
        "status": InvitationStatus.PENDING,
        "token": token,
        "created_at": datetime.utcnow()
    }
    
    res = await db["invitations"].insert_one(invitation_data)
    created_invite = await db["invitations"].find_one({"_id": res.inserted_id})
    return Invitation(**created_invite)

@router.post("/join/{token}", response_model=ResearchGroup)
async def join_group(
    token: str,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    invite = await db["invitations"].find_one({"token": token, "status": InvitationStatus.PENDING})
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")
        
    if invite.get("email") and invite["email"] != current_user.email:
        # Optional: strictly enforce email match if invitation was specific
        pass
        
    group_id = invite["group_id"]
    try:
        oid = ObjectId(group_id)
    except:
         raise HTTPException(status_code=400, detail="Invalid Group ID in invite")
    
    # Check if already member
    group = await db["research_groups"].find_one({"_id": oid})
    if any(m["user_id"] == str(current_user.id) for m in group.get("members", [])):
        # Already member, just accept invite and return
        await db["invitations"].update_one(
            {"_id": invite["_id"]},
            {"$set": {"status": InvitationStatus.ACCEPTED}}
        )
        return ResearchGroup(**await enrich_group_data(group, db))

    new_member = GroupMember(user_id=str(current_user.id), role=GroupRole.MEMBER).model_dump()
    
    await db["research_groups"].update_one(
        {"_id": oid},
        {"$push": {"members": new_member}}
    )
    
    await db["invitations"].update_one(
        {"_id": invite["_id"]},
        {"$set": {"status": InvitationStatus.ACCEPTED}}
    )
    
    group = await db["research_groups"].find_one({"_id": oid})
    return ResearchGroup(**await enrich_group_data(group, db))

@router.get("/{group_id}/messages", response_model=List[ChatMessage])
async def get_messages(
    group_id: str,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(deps.get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    cursor = db["chat_messages"].find({"group_id": group_id}).sort("timestamp", -1).skip(skip).limit(limit)
    messages = await cursor.to_list(length=limit)
    return [ChatMessage(**m) for m in messages][::-1]

@router.websocket("/{group_id}/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    group_id: str,
    token: str = Query(...)
):
    # Validate token manually
    db = await get_database()
    try:
        payload = jwt.decode(
             token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        # Find user
        user_data = await db["users"].find_one({"email": email})
        if not user_data:
             await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
             return
        user = User(**user_data)
    except Exception as e:
        print(f"WS Auth Error: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, group_id, str(user.id))
    
    try:
        while True:
            data = await websocket.receive_text()
            # Construct message
            msg = ChatMessage(
                group_id=group_id,
                user_id=str(user.id),
                user_name=user.full_name or user.email,
                content=data
            )
            # Save
            await db["chat_messages"].insert_one(msg.model_dump())
            
            # Broadcast
            import json
            # We want to broadcast the message structure
            payload_json = msg.model_dump_json()
            # Wrap in type for client to distinguish from status updates
            broadcast_msg = json.dumps({"type": "message", "data": json.loads(payload_json)})
            
            await manager.broadcast(broadcast_msg, group_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, group_id, str(user.id))
        await manager.broadcast_status(group_id)
