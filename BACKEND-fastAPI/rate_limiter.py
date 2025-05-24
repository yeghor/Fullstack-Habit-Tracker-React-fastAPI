from fastapi import Request, HTTPException
import hashlib
import time
from typing import Any
from functools import wraps
import os
from dotenv import load_dotenv

load_dotenv()

MAX_CALLS = os.getenv("MAX_CALLS")
PERIOD = os.getenv("PERIOD")

api_usage: dict[str, list[float]] = {}

def rate_limit(max_calls: int = MAX_CALLS, periods: int = PERIOD):
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs) -> Any:
            if not request.client:
                raise ValueError("Request has no client information")
            ip_address: str = request.client.host
            unique_id: str = hashlib.sha256(ip_address.encode()).hexdigest()
            now = time.time()
            if unique_id not in api_usage:
                api_usage[unique_id] = []
            timestamps = api_usage[unique_id]
            timestamps[:] = [t for t in timestamps if now - t  < periods]

            if len(timestamps) < max_calls:
                timestamps.append(now)
                return await func(request, *args, **kwargs)
            
            wait = round(periods - (now - timestamps[0]))
            raise HTTPException(status_code=429, detail=f"Rate limit exceeded. Retry in {wait} seconds")
        return wrapper
    return decorator