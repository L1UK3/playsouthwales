import os
from functools import wraps

import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security import AuthenticateRequestOptions
from dotenv import load_dotenv
from flask import g, jsonify, request

# Purpose of this file is to provide a function to check if a user is signed in or not to protect admin routes e.g update league delete league etc
load_dotenv()

clerk = Clerk(bearer_auth=os.environ["CLERK_SECRET_KEY"])


# This is here as clerks authenticate request function doesnt accept flask requests and so we convert it to httpx
def _flask_to_httpx_request():
    return httpx.Request(
        method=request.method,
        url=str(request.url),
        headers=dict(request.headers),
    )


# makes a decorater see delete event and other admin functions for examples of how to use this
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        httpx_req = _flask_to_httpx_request()
        # Sends login token to clerk to verify that it is legitamate
        state = clerk.authenticate_request(
            httpx_req,
            AuthenticateRequestOptions(
                # URL you are accessing the route from in this case we have it set to the frontend
                # all other urls are blocked from accessing routes protected this way
                authorized_parties=["http://localhost:5173"]
            ),
        )
        if not state.is_signed_in:
            return jsonify({"error": "Unauthorized"}), 401
        # stores the users data in temporary "g" storage so it can be accessed within route if need be
        g.auth = state.payload
        return f(*args, **kwargs)

    return decorated
