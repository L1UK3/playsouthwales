import os
import httpx
from fastapi import Request, HTTPException, status
from clerk_backend_api import Clerk
from clerk_backend_api.security import AuthenticateRequestOptions
from dotenv import load_dotenv

load_dotenv()

clerk = Clerk(bearer_auth=os.environ["CLERK_SECRET_KEY"])

# This is here as clerks authenticate request function doesnt accept flask requests and so we convert it to httpx
def _fast_api_to_httpx_request(request: Request):
    return httpx.Request(
        method=request.method,
        url=str(request.url),
        headers=dict(request.headers),
    )

async def require_auth(request: Request):
    """
    FastAPI dependency to verify Clerk authentication.
    Constructs an HTTPX request from the FastAPI Request, then authenticates with Clerk.
    Raises 401 HTTP exception if the user is not signed in.
    """
    httpx_req = _fast_api_to_httpx_request(request)
    
    # Sends login token to clerk to verify that it is legitimate
    state = clerk.authenticate_request(
        httpx_req,
        AuthenticateRequestOptions(
            # URL you are accessing the route from in this case we have it set to the frontend
            # all other urls are blocked from accessing routes protected this way
            authorized_parties=["http://localhost:5173", "http://playwales.vercel.app"]
        ),
    )
    
    if not state.is_signed_in:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "unauthorized", "message": "Unauthorized"}
        )
        
    return state.payload
