"""Web scraping module using httpx and BeautifulSoup."""

from __future__ import annotations

from typing import Optional

import httpx
from bs4 import BeautifulSoup


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


async def scrape_url(url: str, timeout: float = 30.0) -> tuple[str, Optional[str]]:
    """
    Scrape a URL and extract text content.

    Args:
        url: The URL to scrape
        timeout: Request timeout in seconds

    Returns:
        Tuple of (content, error_message). If successful, error_message is None.
        If failed, content is empty string and error_message describes the failure.
    """
    try:
        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
        ) as client:
            response = await client.get(url)
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

        return cleaned_text, None

    except httpx.TimeoutException:
        return "", f"Timeout while scraping {url}"
    except httpx.HTTPStatusError as e:
        return "", f"HTTP {e.response.status_code} error for {url}"
    except httpx.RequestError as e:
        return "", f"Request failed for {url}: {str(e)}"
    except Exception as e:
        return "", f"Unexpected error scraping {url}: {str(e)}"


async def scrape_urls(urls: list[str]) -> tuple[dict[str, str], list[str]]:
    """
    Scrape multiple URLs concurrently.

    Args:
        urls: List of URLs to scrape

    Returns:
        Tuple of (content_map, warnings).
        content_map: Dict mapping URL to its scraped content
        warnings: List of warning messages for failed scrapes
    """
    import asyncio

    content_map: dict[str, str] = {}
    warnings: list[str] = []

    # Normalize URLs
    normalized_urls = [normalize_url(url) for url in urls]

    # Scrape all URLs concurrently
    results = await asyncio.gather(
        *[scrape_url(url) for url in normalized_urls],
        return_exceptions=True
    )

    for url, result in zip(normalized_urls, results):
        if isinstance(result, Exception):
            warnings.append(f"Error scraping {url}: {str(result)}")
        else:
            content, error = result
            if error:
                warnings.append(error)
            elif content:
                content_map[url] = content

    return content_map, warnings
