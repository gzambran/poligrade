"""Web scraping module using httpx and BeautifulSoup."""

from __future__ import annotations

import logging
from enum import Enum
from typing import Optional
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class ScrapeErrorType(Enum):
    """Types of scraping errors for user-friendly messaging."""
    BLOCKED = "blocked"           # 403 - WAF/bot blocking
    TIMEOUT = "timeout"           # Request timed out
    SERVER_ERROR = "server_error" # 5xx errors
    NOT_FOUND = "not_found"       # 404
    INVALID_URL = "invalid_url"   # DNS failure, malformed URL
    EMPTY_CONTENT = "empty_content"  # JS-rendered or no content
    UNKNOWN = "unknown"           # Other errors


def get_domain(url: str) -> str:
    """Extract domain from URL for user-friendly messages."""
    try:
        parsed = urlparse(url)
        return parsed.netloc or url
    except Exception:
        return url


def normalize_url(url: str) -> str:
    """Normalize a URL to ensure it has a scheme."""
    url = url.strip()
    if not url:
        return url

    # If no scheme, add https://
    if not url.startswith(('http://', 'https://')):
        # Handle www. prefix
        if url.startswith('www.'):
            url = 'https://' + url
        else:
            url = 'https://' + url

    return url


async def scrape_url(url: str, timeout: float = 30.0) -> tuple[str, Optional[tuple[ScrapeErrorType, str]]]:
    """
    Scrape a URL and extract text content.

    Args:
        url: The URL to scrape
        timeout: Request timeout in seconds

    Returns:
        Tuple of (content, error). If successful, error is None.
        If failed, content is empty string and error is (error_type, domain).
    """
    domain = get_domain(url)
    logger.info(f"Scraping URL: {url}")

    try:
        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
        ) as client:
            response = await client.get(url)
            logger.info(f"Response from {domain}: HTTP {response.status_code}")
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove script, style, nav, footer, header elements
        for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
            element.decompose()

        # Get text content
        text = soup.get_text(separator="\n", strip=True)

        # Clean up excessive whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        cleaned_text = "\n".join(lines)

        # Check for empty/minimal content (likely JS-rendered)
        if len(cleaned_text) < 200:
            logger.warning(f"Empty/minimal content from {domain}: {len(cleaned_text)} chars (likely JS-rendered)")
            return "", (ScrapeErrorType.EMPTY_CONTENT, domain)

        logger.info(f"Successfully scraped {domain}: {len(cleaned_text)} chars")
        return cleaned_text, None

    except httpx.TimeoutException:
        logger.error(f"Timeout scraping {url} after {timeout}s")
        return "", (ScrapeErrorType.TIMEOUT, domain)
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        logger.error(f"HTTP {status} error for {url}")
        if status == 403:
            return "", (ScrapeErrorType.BLOCKED, domain)
        elif status == 404:
            return "", (ScrapeErrorType.NOT_FOUND, domain)
        elif status >= 500:
            return "", (ScrapeErrorType.SERVER_ERROR, domain)
        else:
            return "", (ScrapeErrorType.UNKNOWN, domain)
    except httpx.RequestError as e:
        logger.error(f"Request error for {url}: {type(e).__name__}: {e}")
        return "", (ScrapeErrorType.INVALID_URL, domain)
    except Exception as e:
        logger.exception(f"Unexpected error scraping {url}")
        return "", (ScrapeErrorType.UNKNOWN, domain)


async def scrape_urls(urls: list[str]) -> tuple[dict[str, str], list[tuple[ScrapeErrorType, str]]]:
    """
    Scrape multiple URLs concurrently.

    Args:
        urls: List of URLs to scrape

    Returns:
        Tuple of (content_map, errors).
        content_map: Dict mapping URL to its scraped content
        errors: List of (error_type, domain) tuples for failed scrapes
    """
    import asyncio

    content_map: dict[str, str] = {}
    errors: list[tuple[ScrapeErrorType, str]] = []

    # Normalize URLs
    normalized_urls = [normalize_url(url) for url in urls]

    # Scrape all URLs concurrently
    results = await asyncio.gather(
        *[scrape_url(url) for url in normalized_urls],
        return_exceptions=True
    )

    for url, result in zip(normalized_urls, results):
        if isinstance(result, Exception):
            errors.append((ScrapeErrorType.UNKNOWN, get_domain(url)))
        else:
            content, error = result
            if error:
                errors.append(error)
            elif content:
                content_map[url] = content

    return content_map, errors
