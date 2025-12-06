"""Simple metrics engine for analyzing speech transcripts.

Provides helpers to compute words-per-minute, count filler words,
split sentences, and aggregate basic metrics.
"""
from typing import Dict, List
import re


def compute_wpm(transcript: str, duration_seconds: float) -> float:
    """Compute words-per-minute (WPM) from a transcript and duration.

    Counts words using a simple word-regex and converts to words-per-minute.

    Args:
        transcript: The speech transcript text.
        duration_seconds: Duration of the recording in seconds.

    Returns:
        float: Words per minute. Returns 0.0 if there are no words or
        if duration_seconds is non-positive.

    Notes:
        To avoid division by very small durations, a small floor of 0.1s
        is used when computing the rate (so extremely short durations
        don't produce astronomical WPM values).
    """
    if not transcript:
        return 0.0

    # Find word-like tokens (include apostrophes and hyphens)
    words = re.findall(r"\b[\w'-]+\b", transcript)
    word_count = len(words)
    if word_count == 0:
        return 0.0

    safe_duration = max(float(duration_seconds), 0.1)
    wpm = (word_count / safe_duration) * 60.0
    return float(wpm)


def count_fillers(transcript: str, filler_list: List[str] | None = None) -> int:
    """Count filler words/phrases in the transcript.

    Performs case-insensitive matching. By default counts: "um", "uh",
    "like", and "you know".

    Args:
        transcript: Transcript text.
        filler_list: Optional list of filler words/phrases to search for.

    Returns:
        int: Total number of filler occurrences found.
    """
    if not transcript:
        return 0

    if filler_list is None:
        filler_list = ["um", "uh", "like", "you know"]

    text = transcript.lower()
    total = 0

    for filler in filler_list:
        # Use word-boundary matching so we don't match substrings.
        pattern = r"\b" + re.escape(filler.lower()) + r"\b"
        matches = re.findall(pattern, text)
        total += len(matches)

    return total


def split_sentences(transcript: str) -> List[str]:
    """Split a transcript into sentences using simple punctuation rules.

    This is a lightweight splitter that breaks on '.', '?', and '!' and
    trims whitespace. It does not attempt to handle abbreviations.

    Args:
        transcript: The transcript text.

    Returns:
        list[str]: Non-empty sentence strings.
    """
    if not transcript:
        return []

    parts = re.split(r"[\.\?!]+", transcript)
    sentences = [p.strip() for p in parts if p.strip()]
    return sentences


def compute_metrics(transcript: str, duration_seconds: float) -> Dict[str, float | int]:
    """Compute basic speech metrics from transcript and duration.

    Returns a dictionary with keys: wpm, totalWords, totalFillers, fillersPerMin.

    Args:
        transcript: The transcript text.
        duration_seconds: Duration in seconds.

    Returns:
        dict: Metrics as described above.
    """
    # Word tokenization for counting total words
    words = re.findall(r"\b[\w'-]+\b", transcript) if transcript else []
    total_words = len(words)

    wpm = compute_wpm(transcript, duration_seconds)
    total_fillers = count_fillers(transcript)

    if duration_seconds <= 0:
        fillers_per_min = 0.0
    else:
        safe_duration = max(float(duration_seconds), 0.1)
        fillers_per_min = (total_fillers / safe_duration) * 60.0

    return {
        "wpm": float(wpm),
        "totalWords": int(total_words),
        "totalFillers": int(total_fillers),
        "fillersPerMin": float(round(fillers_per_min, 2)),
    }


def compute_highlights(transcript: str, filler_list: List[str] | None = None) -> List[Dict[str, object]]:
    """Return highlights for the transcript.

    This implementation follows a simple whitespace split.

    Args:
        transcript: The transcript text.
        filler_list: Optional list of filler words to detect. Defaults to
            ["um", "uh", "like", "you know"]. Matching is case-insensitive.

    Returns:
        list[dict]: Each dict contains `wordIndex` (int, 0-based) and `type` (str).
    """
    if not transcript:
        return []

    if filler_list is None:
        filler_list = ["um", "uh", "like", "you know"]

    words = transcript.split()
    highlights: List[Dict[str, object]] = []
    lowered_fillers = {f.lower() for f in filler_list}

    for idx, word in enumerate(words):
        if word.lower() in lowered_fillers:
            highlights.append({"wordIndex": idx, "type": "filler"})

    return highlights
