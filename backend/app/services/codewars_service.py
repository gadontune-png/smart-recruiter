import httpx

from app.core.config import settings


class CodewarsError(Exception):
    pass


def fetch_kata(kata_id: str) -> dict:
    """Fetch a single kata from the Codewars public API."""
    url = f"{settings.codewars_base_url}/code-challenges/{kata_id}"
    try:
        response = httpx.get(url, timeout=10.0)
    except httpx.RequestError as exc:
        raise CodewarsError(f"Could not reach Codewars: {exc}") from exc

    if response.status_code == 404:
        raise CodewarsError(f"Kata '{kata_id}' not found")
    if response.status_code != 200:
        raise CodewarsError(f"Codewars API error: {response.status_code}")

    return response.json()


def map_kata_to_question(kata: dict) -> dict:
    """Shape a raw Codewars kata response into our Question schema fields."""
    return {
        "type": "coding",
        "title": kata.get("name", "Untitled kata"),
        "prompt": kata.get("description", ""),
        "difficulty": (kata.get("rank") or {}).get("name", "unknown"),
        "languages": kata.get("languages", []),
        "source": "codewars",
        "source_id": kata.get("id"),
        "source_url": kata.get("url"),
        "tags": kata.get("tags", []),
    }


def import_kata_as_question(kata_id: str) -> dict:
    kata = fetch_kata(kata_id)
    return map_kata_to_question(kata)

