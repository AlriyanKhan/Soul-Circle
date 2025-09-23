import re

KEYWORDS = [
    r"kill myself",
    r"suicide",
    r"hurt myself",
    r"end my life",
]


def contains_self_harm_risk(text: str) -> bool:
    if not text:
        return False
    t = text.lower()
    for kw in KEYWORDS:
        if re.search(kw, t):
            return True
    return False
