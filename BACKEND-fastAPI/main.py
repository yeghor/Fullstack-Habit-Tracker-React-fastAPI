from fastapi import FastAPI, HTTPException, Body, Header, Query
from typing import List, Dict, Optional, Annotated


app = FastAPI()

@app.get("/")
async def test() -> str:
    return "Hello World"