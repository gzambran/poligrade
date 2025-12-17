from pydantic import BaseModel, HttpUrl
from typing import Optional


class ParseRequest(BaseModel):
    """Request body for the parse endpoint."""

    urls: list[str]


class PolicyPosition(BaseModel):
    """A single policy position extracted from content."""

    stance: str
    source_urls: list[str]
    note: Optional[str] = None


class ParserResponse(BaseModel):
    """Full response from the parser."""

    politician_name: Optional[str] = None
    positions: list[PolicyPosition]
    warnings: Optional[list[str]] = None


class SSEProgressEvent(BaseModel):
    """Server-sent event for progress updates."""

    type: str = "progress"
    message: str


class SSEResultEvent(BaseModel):
    """Server-sent event for final results."""

    type: str = "result"
    data: ParserResponse


class SSEErrorEvent(BaseModel):
    """Server-sent event for errors."""

    type: str = "error"
    message: str
