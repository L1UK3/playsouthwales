from typing import Annotated
from clerk_backend_api import AuthenticateRequestOptions, authenticate_request
from clerk_backend_api.security.types import RequestState
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.config import Settings, get_settings

http_bearer = HTTPBearer(auto_error=False)


def require_auth(
    request: Request,
    settings: Annotated[Settings, Depends(get_settings)],
    _creds: Annotated[HTTPAuthorizationCredentials | None, Depends(http_bearer)] = None,
) -> RequestState:
    state = authenticate_request(
        request,
        AuthenticateRequestOptions(
            secret_key=settings.clerk_secret_key,
            jwt_key=settings.clerk_jwt_key,
            authorized_parties=settings.clerk_authorized_parties,
            accepts_token=["session_token"],
        ),
    )
    if not state.is_signed_in:
        raise HTTPException(
            status_code=401,
            detail=state.reason or "unauthorized",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return state