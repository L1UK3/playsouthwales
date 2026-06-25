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
    if allowed_origins_env is None:
        logger.warning("ALLOWED_ORIGINS environment variable is not set. All origins will be blocked.")
        authorized_parties = []
    else:
        authorized_parties = [
            origin.strip()
            for origin in allowed_origins_env.split(",")
            if origin.strip()
        ]
        logger.info(f"Authorized parties: {authorized_parties}")

    options = AuthenticateRequestOptions(authorized_parties = authorized_parties)
    
    # Sends login token to clerk to verify that it is legitimate
    try:
        state = clerk.authenticate_request(request, options)
    except Exception as e:
        logger.error(f"Error authenticating request: {e}")
        httpx_req = _fast_api_to_httpx_request(request)
        state = clerk.authenticate_request(httpx_req, options)
    
    if not state.is_signed_in:
        logger.warning("Unauthorized access attempt.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "unauthorized", "message": "Unauthorized"}
        )
        
    return state.payload
