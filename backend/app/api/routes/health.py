from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
async def health_check():
    """Basic health check endpoint"""
    return {"status": "healthy", "service": "YuSpeak API"}


@router.get("/ready")
async def readiness_check():
    """Readiness check for container orchestration"""
    # Add any dependency checks here if needed
    return {"status": "ready"}
