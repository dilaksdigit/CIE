"""
CIE v2.3.1 — Title validation and suggestion.
NON-NEGOTIABLE: Intent → Cluster → Attributes. First segment = user intent/problem; after pipe = attributes.
"""
import os
import re
from typing import Any

MAX_TITLE_LEN = 120
PIPE = "|"

# Primary intent (normalized key) → keywords/synonyms that MUST appear in the segment BEFORE the pipe
# So the title addresses the user's intent first (not attribute-stacking).
INTENT_TITLE_KEYWORDS: dict[str, list[str]] = {
    "problem_solving": ["solution", "solve", "problem", "fix", "need", "how to", "help", "lighting for", "for low", "glare-free", "warm"],
    "comparison": ["comparison", "compare", "vs", "versus", "alternative", "or", "versus"],
    "compatibility": ["compatible", "compatibility", "fit", "fits", "works with", "for ceiling", "for e27", "for b22", "fitting", "connect", "power"],
    "specification": ["specification", "spec", "technical", "details", "wattage", "max", "rating", "rated", "pendant cable", "cable set"],
    "installation": ["install", "installation", "wire", "wiring", "how to", "fitting", "safe", "simple", "made simple"],
    "troubleshooting": ["troubleshoot", "flickering", "issue", "fix", "repair", "problem"],
    "inspiration": ["inspiration", "style", "design", "ideas", "modern", "look", "warm", "diffused", "for living", "for kitchen"],
    "regulatory": ["regulatory", "safety", "compliant", "rated", "bathroom", "ip", "safe", "bs ", "en "],
    "replacement": ["replacement", "replace", "refill", "for floor lamp", "for pendant"],
}


def _norm_intent(primary_intent: str) -> str:
    if not primary_intent or not primary_intent.strip():
        return ""
    return primary_intent.strip().lower().replace(" ", "_").replace("-", "_")


def _get_intent_keywords(primary_intent: str) -> list[str]:
    key = _norm_intent(primary_intent)
    if not key:
        return []
    # Allow label variants (e.g. "Problem-Solving" -> problem_solving)
    for k, keywords in INTENT_TITLE_KEYWORDS.items():
        if k == key or k.replace("_", " ") in primary_intent.lower():
            return keywords
    return INTENT_TITLE_KEYWORDS.get(key, [])


def _load_brand_prefixes() -> set[str]:
    """Brand names that title must NOT start with. Load from env CIE_TITLE_BRAND_PREFIXES (comma-separated) or leave empty."""
    raw = os.environ.get("CIE_TITLE_BRAND_PREFIXES", "")
    if not raw:
        return set()
    return {s.strip().lower() for s in raw.split(",") if s.strip()}


def validate_title(
    title: str,
    primary_intent: str,
    cluster_id: str,
    brand_prefixes: set[str] | None = None,
) -> dict[str, Any]:
    """
    Validate product title against CIE rules.

    Rules:
    - Title must contain a pipe separator '|'
    - Text BEFORE the pipe = user intent/problem (not attributes)
    - Text AFTER the pipe = product attributes (size, colour, fitting)
    - Primary intent keyword (or synonym) must appear before the pipe
    - Title must not start with brand name
    - Max 120 characters total

    Returns:
        { "valid": bool, "issues": list[str], "suggested_fix": str | None }
    """
    issues: list[str] = []
    title = (title or "").strip()
    primary_intent = (primary_intent or "").strip()

    if not title:
        return {"valid": False, "issues": ["Title is required."], "suggested_fix": None}

    # Max 120 characters
    if len(title) > MAX_TITLE_LEN:
        issues.append(f"Title must not exceed {MAX_TITLE_LEN} characters (current: {len(title)}).")

    # Must contain pipe
    if PIPE not in title:
        issues.append("Title must contain a pipe separator '|' (intent phrase before, attributes after).")
        return {"valid": False, "issues": issues, "suggested_fix": None}

    parts = title.split(PIPE, 1)
    before = (parts[0] or "").strip()
    after = (parts[1] or "").strip()

    if not before:
        issues.append("Text before the pipe must describe user intent/problem, not be empty.")

    if not after:
        issues.append("Text after the pipe must contain product attributes (e.g. size, colour, fitting).")

    # Primary intent keyword (or synonym) must appear before the pipe
    if primary_intent:
        keywords = _get_intent_keywords(primary_intent)
        before_lower = before.lower()
        if keywords and not any(kw in before_lower for kw in keywords):
            issues.append(
                "The primary intent keyword (or synonym) must appear in the part before the pipe. "
                "First segment should address the user's intent/problem, not attributes."
            )

    # Title must not start with brand name
    if brand_prefixes is None:
        brand_prefixes = _load_brand_prefixes()
    if brand_prefixes and before:
        first_word = before.split()[0].lower() if before.split() else ""
        if first_word in brand_prefixes:
            issues.append("Title must not start with a brand name. Lead with intent/problem instead.")

    # Optional: basic attribute-stacking check — before pipe should not look like a list of attributes (numbers + units, colour first, etc.)
    if before and re.search(r"^\s*\d+\s*(cm|mm|m|w|watts?|k)\b", before.lower()):
        issues.append("Text before the pipe should describe intent/problem, not start with size/spec (e.g. '30cm' or '4W').")

    valid = len(issues) == 0
    suggested_fix = _build_suggested_fix(title, before, after, issues, primary_intent) if issues else None
    return {"valid": valid, "issues": issues, "suggested_fix": suggested_fix}


def _build_suggested_fix(
    title: str,
    before: str,
    after: str,
    issues: list[str],
    primary_intent: str,
) -> str | None:
    """Build a suggested title fix when possible (e.g. trim to 120 chars, or reorder if only attribute-stacking)."""
    if not before or not after:
        return None
    # If only over length, suggest trim
    if len(title) > MAX_TITLE_LEN:
        if len(before) > MAX_TITLE_LEN // 2:
            before_trim = before[: (MAX_TITLE_LEN // 2) - 3].rsplit(maxsplit=1)[0] + "..."
        else:
            before_trim = before
        after_trim = after[: MAX_TITLE_LEN - len(before_trim) - 2].rsplit(maxsplit=1)[0] if len(after) + len(before_trim) + 2 > MAX_TITLE_LEN else after
        return f"{before_trim} {PIPE} {after_trim}"[:MAX_TITLE_LEN]
    return None


# -------- Title suggestion: Intent → Cluster → Attributes --------


def _intent_phrase_templates(primary_intent: str) -> list[str]:
    """Templates for the intent-led first segment (before pipe). Suggestion picks one or builds from product_type."""
    key = _norm_intent(primary_intent)
    templates = {
        "problem_solving": ["{product_type} for {use_case}", "Warm Glare-Free {product_type} for {use_case}", "{product_type} — Solution for {use_case}"],
        "comparison": ["{product_type} — Compare Options for {use_case}", "{product_type} for {use_case}"],
        "compatibility": ["{product_type} for Ceiling Lights — Safe Wiring Made Simple", "{product_type} — Fits {use_case}", "{product_type} for {use_case}"],
        "specification": ["{product_type} — Technical Details for {use_case}", "{product_type} for {use_case}"],
        "installation": ["{product_type} — Safe Installation for {use_case}", "How to Fit {product_type} for {use_case}"],
        "troubleshooting": ["{product_type} to Fix {use_case} Issues", "{product_type} for {use_case}"],
        "inspiration": ["Warm Diffused {product_type} for {use_case}", "{product_type} — Style and Design for {use_case}"],
        "regulatory": ["{product_type} — Compliant and Safe for {use_case}", "Rated {product_type} for {use_case}"],
        "replacement": ["Replacement {product_type} for {use_case}", "{product_type} — Replace or Refill for {use_case}"],
    }
    return templates.get(key, ["{product_type} for {use_case}"])


def suggest_title(
    cluster_id: str,
    primary_intent: str,
    attributes: dict[str, Any],
) -> str:
    """
    Generate a CIE-compliant title: intent-led phrase before pipe, attributes after.

    Attributes dict should include at least:
    - product_type: e.g. "Pendant Cable Set", "Fabric Drum Lampshade", "LED Filament Bulb"
    - use_case (optional): e.g. "Living Rooms", "Low Ceilings", "Ceiling Lights"
    Plus any of: size, colour, fitting, style, wattage, etc. (joined after the pipe).

    Example:
      suggest_title("CLU-CABLE-PENDANT-E27", "Compatibility", {
        "product_type": "Pendant Cable Set",
        "use_case": "Ceiling Lights",
        "style": "3-Core Braided",
        "size": "1m",
        "fitting": "E27 Holder",
      })
      -> "Pendant Cable Set for Ceiling Lights — Safe Wiring Made Simple | 3-Core Braided 1m E27 Holder"
    """
    primary_intent = (primary_intent or "").strip()
    product_type = (attributes.get("product_type") or attributes.get("product_type_label") or "Product").strip()
    use_case = (attributes.get("use_case") or attributes.get("cluster_use_case") or "Your Setup").strip()

    templates = _intent_phrase_templates(primary_intent)
    template = templates[0] if templates else "{product_type} for {use_case}"
    before = template.format(product_type=product_type, use_case=use_case)

    # Build attribute segment: order size, colour, fitting, style, etc.
    attr_order = ["style", "colour", "color", "size", "wattage", "fitting", "cap", "finish", "material"]
    after_parts: list[str] = []
    seen_keys: set[str] = set()
    for k in attr_order:
        if k in attributes and attributes[k] not in (None, ""):
            v = str(attributes[k]).strip()
            if v and k not in seen_keys:
                after_parts.append(v)
                seen_keys.add(k)
    for k, v in attributes.items():
        if k in ("product_type", "product_type_label", "use_case", "cluster_use_case"):
            continue
        if v is None or v == "":
            continue
        if k in seen_keys:
            continue
        v = str(v).strip()
        if v:
            after_parts.append(v)
            seen_keys.add(k)

    after = " ".join(after_parts) if after_parts else product_type

    title = f"{before} {PIPE} {after}"
    if len(title) > MAX_TITLE_LEN:
        title = title[: MAX_TITLE_LEN - 3].rsplit(maxsplit=1)[0] + "..."
    return title
