"""Claude API integration for policy position analysis."""

import json
import logging
import re
from typing import Any

import anthropic

from prompts import SYSTEM_PROMPT

logger = logging.getLogger(__name__)


def analyze_content(
    content_map: dict[str, str],
    api_key: str,
) -> dict[str, Any]:
    """
    Analyze scraped content using Claude API to extract policy positions.

    Args:
        content_map: Dict mapping URLs to their scraped text content
        api_key: Anthropic API key

    Returns:
        Parsed JSON response with policy positions

    Raises:
        Exception: If API call fails or response cannot be parsed
    """
    client = anthropic.Anthropic(api_key=api_key)

    # Build the user message with all content
    urls = list(content_map.keys())
    combined_sections = []

    for url, content in content_map.items():
        # Truncate very long content per URL
        truncated = content[:50000] if len(content) > 50000 else content
        combined_sections.append(f"=== Source: {url} ===\n{truncated}")

    combined_text = "\n\n".join(combined_sections)

    # Further truncate if total is too long (Claude has ~200k context but we want to be safe)
    if len(combined_text) > 150000:
        logger.warning(f"Content truncated from {len(combined_text)} to 150000 chars")
        combined_text = combined_text[:150000] + "\n\n[Content truncated due to length]"

    user_message = f"Source URLs: {', '.join(urls)}\n\nContent:\n{combined_text}"

    logger.info(f"Calling Claude API with {len(combined_text)} chars from {len(urls)} URL(s)")

    try:
        message = client.messages.create(
            model="claude-sonnet-5",
            max_tokens=8192,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
    except anthropic.APIError as e:
        logger.error(f"Claude API error: {type(e).__name__}: {e}")
        raise

    logger.info(f"Claude API response: {message.usage.input_tokens} input tokens, {message.usage.output_tokens} output tokens")

    # Extract text content from response. Claude sometimes prepends non-text
    # blocks (e.g. a "thinking" block) for longer/harder prompts, so the text
    # isn't reliably at index 0 — find the first actual text block instead.
    text_blocks = [block.text for block in message.content if block.type == "text"]
    if not text_blocks:
        logger.error(f"No text block in Claude response. Block types: {[b.type for b in message.content]}")
        raise ValueError("Claude's response didn't include any text content. This is usually transient — try again.")
    response_text = "".join(text_blocks)

    # Try to parse JSON from response
    # Sometimes Claude wraps JSON in markdown code blocks
    json_match = re.search(r"```(?:json)?\s*(\{[\s\S]*\})\s*```", response_text)
    if json_match:
        response_text = json_match.group(1)

    try:
        result = json.loads(response_text)
        logger.info(f"Successfully parsed response: {result.get('politician_name', 'Unknown')}")
        return result
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Claude response as JSON: {e}")
        logger.debug(f"Raw response: {response_text[:500]}...")
        # Raise rather than returning a fake "successful" empty result. A silent
        # 0-positions success would get cached and re-served as if it were real,
        # and the frontend would treat it as a completed analysis (disabling the
        # Analyze button) instead of surfacing a real, retriable error.
        raise ValueError(
            "Claude's response could not be parsed as valid JSON. This is usually transient — try again."
        ) from e
