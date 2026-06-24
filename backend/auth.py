import os
import httpx
import logging
from fastapi import Request, HTTPException, status
from clerk_backend_api import Clerk
from clerk_backend_api.security import AuthenticateRequestOptions
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

clerk = Clerk(bearer_auth=os.environ["CLERK_SECRET_KEY"])

# This is here as clerks authenticate request function doesnt accept fast-api requests and so we convert it to httpx
def _fast_api_to_httpx_request(request: Request):
    return httpx.Request(
        method=request.method,
        url=str(request.url),
        headers=dict(request.headers),
        cookies=dict(request.cookies)
    )

async def require_auth(request: Request):
    """
    FastAPI dependency to verify Clerk authentication.
    Constructs an HTTPX request from the FastAPI Request, then authenticates with Clerk.
    Raises 401 HTTP exception if the user is not signed in.
    """

    # URL you are accessing the route from in this case we have it set to the frontend
    # all other urls are blocked from accessing routes protected this way
    allowed_origins_env = os.environ.get("ALLOWED_ORIGINS")
    if allowed_origins_env:
        authorized_parties = [
            origin.strip() 
            for origin in allowed_origins_env.split(",") 
            if origin.strip()
        ]
    else:
        authorized_parties = []
        logger.warning("No allowed origins specified in environment variables. All origins will be blocked.")
        
    clerk_jwt_key = os.environ.get("CLERK_JWT_KEY")
    
    options = AuthenticateRequestOptions(
        authorized_parties=authorized_parties,
        jwt_key=clerk_jwt_key
    )
    
    # Log incoming authentication headers (securely)
    auth_header = request.headers.get("authorization")
    origin_header = request.headers.get("origin")
    logger.info(f"Authenticating request from origin: {origin_header}. Auth header present: {bool(auth_header)}. Local JWT Key configured: {bool(clerk_jwt_key)}")
    
    # Sends login token to clerk to verify that it is legitimate
    try:
        state = clerk.authenticate_request(request, options)
    except Exception as e:
        logger.error(f"Error authenticating with FastAPI request object: {e}")
        httpx_req = _fast_api_to_httpx_request(request)
        state = clerk.authenticate_request(httpx_req, options)
    
    if not state.is_signed_in:
        reason = getattr(state, "reason", "unknown_reason")
        logger.warning(f"Unauthorized access attempt. Reason: {reason}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "unauthorized", "message": f"Unauthorized: {reason}"}
        )
        
    return state.payload
