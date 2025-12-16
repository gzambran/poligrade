"""File-based response caching for development."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Optional


class ResponseCache:
    """Simple file-based cache for API responses during development."""

    def __init__(self, cache_dir: str = "./cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)

    def _get_key(self, urls: list[str]) -> str:
        """Generate a cache key from a list of URLs."""
        content = json.dumps(sorted(urls))
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def get(self, urls: list[str]) -> Optional[dict[str, Any]]:
        """
        Get cached response for given URLs.

        Args:
            urls: List of URLs that were parsed

        Returns:
            Cached response dict if found, None otherwise
        """
        key = self._get_key(urls)
        cache_file = self.cache_dir / f"{key}.json"

        if cache_file.exists():
            try:
                return json.loads(cache_file.read_text())
            except (json.JSONDecodeError, IOError):
                return None
        return None

    def set(self, urls: list[str], data: dict[str, Any]) -> None:
        """
        Cache a response for given URLs.

        Args:
            urls: List of URLs that were parsed
            data: Response data to cache
        """
        key = self._get_key(urls)
        cache_file = self.cache_dir / f"{key}.json"

        try:
            cache_file.write_text(json.dumps(data, indent=2))
        except IOError:
            pass  # Silently fail on cache write errors

    def clear(self) -> int:
        """
        Clear all cached responses.

        Returns:
            Number of cache files deleted
        """
        count = 0
        for cache_file in self.cache_dir.glob("*.json"):
            try:
                cache_file.unlink()
                count += 1
            except IOError:
                pass
        return count
