"""Simple JSONL session logger for AI Speech Persona Builder.

Provides a log_session function that appends session data as JSON lines
to a file for later analysis or debugging.
"""
import json
import os
from typing import Dict, Any


def log_session(data: Dict[str, Any], filepath: str = "logs/sessions.jsonl") -> None:
    """Log session data as a single JSON line.

    Appends a JSON-serialized dict to the specified file, one line per call.
    Handles errors gracefully by printing a warning instead of raising.

    Args:
        data: Dictionary of session data to log.
        filepath: Path to the JSONL log file (default: "logs/sessions.jsonl").
    """
    try:
        # Ensure the directory exists
        directory = os.path.dirname(filepath)
        if directory and not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)

        # Append one JSON line to the file
        with open(filepath, "a", encoding="utf-8") as f:
            f.write(json.dumps(data, ensure_ascii=False) + "\n")
    except Exception as e:
        print(f"WARNING: Failed to log session to {filepath}: {e}")
