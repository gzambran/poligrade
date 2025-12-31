"""FastAPI application with SSE streaming endpoint for policy position parsing."""

import json
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from analyzer import analyze_content
from cache import ResponseCache
from config import get_settings
from mock_data import MOCK_RESPONSE
from models import ParseRequest, ParserResponse
from scraper import scrape_urls, ScrapeErrorType


def get_user_friendly_error(error_type: ScrapeErrorType, domain: str) -> str:
    """Convert a scrape error into a user-friendly message."""
    messages = {
        ScrapeErrorType.BLOCKED: (
            f"{domain} is blocking automated access. "
            "You'll need to visit this page in your browser and enter the content manually."
        ),
        ScrapeErrorType.EMPTY_CONTENT: (
            f"{domain} uses JavaScript to load its content, which the parser can't read. "
            "Please copy and paste the content manually."
        ),
        ScrapeErrorType.TIMEOUT: (
            f"{domain} took too long to respond. "
            "Try again, or if this persists, the site may be experiencing issues."
        ),
        ScrapeErrorType.SERVER_ERROR: (
            f"{domain} is experiencing server issues and may be temporarily down. "
            "Try again later."
        ),
        ScrapeErrorType.NOT_FOUND: (
            f"The page on {domain} was not found (404). "
            "Please check the URL and try again."
        ),
        ScrapeErrorType.INVALID_URL: (
            f"Could not connect to {domain}. "
            "Please check the URL is correct and the site is accessible."
        ),
        ScrapeErrorType.UNKNOWN: (
            f"An unexpected error occurred while accessing {domain}. "
            "Please try again or enter the content manually."
        ),
    }
    return messages.get(error_type, messages[ScrapeErrorType.UNKNOWN])

app = FastAPI(
    title="Position Parser API",
    description="Extract politician policy positions from website URLs",
    version="1.0.0",
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize cache
cache = ResponseCache(settings.cache_dir)


def validate_api_key(request: Request) -> None:
    """Validate the API key from request headers."""
    if not settings.api_key:
        return  # No API key configured, allow all requests

    api_key = request.headers.get("X-API-Key")
    if api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


async def generate_sse(urls: list[str]) -> AsyncGenerator[str, None]:
    """
    Generate Server-Sent Events for the parsing process.

    Yields SSE-formatted strings with progress updates and final results.
    """
    warnings: list[str] = []

    # Check for DEV_MODE
    if settings.dev_mode:
        yield f"data: {json.dumps({'type': 'progress', 'message': 'DEV_MODE: Using mock data...'})}\n\n"
        result = MOCK_RESPONSE.copy()
        yield f"data: {json.dumps({'type': 'result', 'data': result})}\n\n"
        return

    # Check cache first
    if settings.cache_enabled:
        cached = cache.get(urls)
        if cached:
            yield f"data: {json.dumps({'type': 'progress', 'message': 'Found cached response...'})}\n\n"
            yield f"data: {json.dumps({'type': 'result', 'data': cached})}\n\n"
            return

    # Scrape URLs
    total_urls = len(urls)
    yield f"data: {json.dumps({'type': 'progress', 'message': f'Scraping {total_urls} URL(s)...'})}\n\n"

    content_map, scrape_errors = await scrape_urls(urls)

    # Convert structured errors to user-friendly warnings
    for error_type, domain in scrape_errors:
        warnings.append(get_user_friendly_error(error_type, domain))

    if not content_map:
        # All URLs failed - return the first error as the main error message
        if scrape_errors:
            error_type, domain = scrape_errors[0]
            error_message = get_user_friendly_error(error_type, domain)
        else:
            error_message = "Failed to scrape any content from provided URLs."
        yield f"data: {json.dumps({'type': 'error', 'message': error_message})}\n\n"
        return

    successful_count = len(content_map)
    if successful_count < total_urls:
        yield f"data: {json.dumps({'type': 'progress', 'message': f'Scraped {successful_count}/{total_urls} URLs successfully'})}\n\n"

    # Analyze with Claude
    yield f"data: {json.dumps({'type': 'progress', 'message': 'Analyzing content with Claude...'})}\n\n"

    try:
        result = analyze_content(content_map, settings.anthropic_api_key)

        # Add any scrape warnings to the result
        if warnings:
            existing_warnings = result.get("warnings", []) or []
            result["warnings"] = existing_warnings + warnings

        # Cache the result
        if settings.cache_enabled:
            cache.set(urls, result)

        yield f"data: {json.dumps({'type': 'result', 'data': result})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': f'Analysis failed: {str(e)}'})}\n\n"


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/api/parse")
async def parse_positions(request: Request, body: ParseRequest):
    """
    Parse policy positions from provided URLs.

    Returns a Server-Sent Events stream with progress updates and final results.
    """
    validate_api_key(request)

    # Validate URLs
    if not body.urls:
        raise HTTPException(status_code=400, detail="At least one URL is required")

    if len(body.urls) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 URLs allowed")

    # Filter empty URLs
    urls = [url.strip() for url in body.urls if url.strip()]
    if not urls:
        raise HTTPException(status_code=400, detail="At least one valid URL is required")

    return StreamingResponse(
        generate_sse(urls),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )


@app.post("/api/clear-cache")
async def clear_cache(request: Request):
    """Clear the response cache."""
    validate_api_key(request)
    count = cache.clear()
    return {"message": f"Cleared {count} cached responses"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)
