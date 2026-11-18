from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.user import User
from app.models.audit import AuditRecord
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse,
)
from app.auth.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from app.auth.dependencies import get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["Faculty & Reviewer Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    request: Request,
    payload: UserRegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Registers a new faculty member, reviewer, or administrator."""
    # Check if email is already taken
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered."
        )

    # Sanitize role
    valid_roles = ["FACULTY", "ADMIN", "REVIEWER", "STUDENT"]
    role = payload.role.upper()
    if role not in valid_roles:
        role = "FACULTY"

    hashed_pw = get_password_hash(payload.password)
    user = User(
        email=payload.email.lower(),
        hashed_password=hashed_pw,
        full_name=payload.full_name.strip(),
        department=payload.department.strip(),
        role=role,
        is_active=True
    )
    db.add(user)
    await db.flush()

    # Record audit log
    client_ip = request.client.host if request.client else None
    audit = AuditRecord(
        user_id=user.id,
        action="USER_REGISTERED",
        details={"email": user.email, "role": user.role, "department": user.department},
        ip_address=client_ip
    )
    db.add(audit)
    await db.commit()
    await db.refresh(user)

    # Generate token
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login_user(
    request: Request,
    payload: UserLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Authenticates a faculty user and issues an access token."""
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Contact administrator."
        )

    # Record login audit
    client_ip = request.client.host if request.client else None
    audit = AuditRecord(
        user_id=user.id,
        action="USER_LOGIN",
        details={"email": user.email, "role": user.role},
        ip_address=client_ip
    )
    db.add(audit)
    await db.commit()

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Retrieves the authenticated user's profile and active role."""
    return UserResponse.model_validate(current_user)


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_role(["ADMIN"]))
):
    """Lists all registered users (Admin only)."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.post("/seed-default-faculty", response_model=UserResponse)
async def seed_default_faculty(
    db: AsyncSession = Depends(get_db)
):
    """Seeds a default faculty evaluator account if none exists."""
    result = await db.execute(select(User).where(User.email == "faculty@university.edu"))
    user = result.scalar_one_or_none()
    if user:
        return UserResponse.model_validate(user)

    user = User(
        email="faculty@university.edu",
        hashed_password=get_password_hash("faculty123"),
        full_name="Dr. Alistair Vance, Ph.D.",
        department="Department of Computer Science & Engineering",
        role="FACULTY",
        is_active=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)

