import json
import os
import re

_BN_SCRIPT = re.compile(r"[ঀ-৿]")

_BANGLISH_WORDS = {
    "jor", "jor ache", "matha byatha", "matha byetha", "mathay byatha",
    "bomi", "ulti", "pet byatha", "pote byatha", "rokto", "chakkar",
    "chhokkor", "pa fola", "payer fola", "swash koshto", "dam",
    "ki korte pari", "akhon", "khub", "beshi", "amr", "amar", "ache",
    "durbolota", "klanti", "pete byatha", "pithe byatha", "komore byatha",
    "baccha", "bacchar", "proshob", "khabar", "ki khabo", "pani", "pipasha",
    "ga gula", "goromi", "thanda", "fakashe", "hemoglobin", "rokto shunyo",
    "buk jola", "asidity", "gola jola", "paye khichuni", "matha ghore",
    "dam nite", "shwash", "energy nei", "shokti nei",
}


def _detect_language(message: str, locale_hint: str = "en") -> str:
    if _BN_SCRIPT.search(message):
        return "bn"
    lower = message.lower()
    for word in _BANGLISH_WORDS:
        if word in lower:
            return "bn"
    return locale_hint if locale_hint in ("bn", "en") else "en"


_QA_CACHE: list | None = None


def _load_qa() -> list:
    global _QA_CACHE
    if _QA_CACHE is None:
        path = os.path.join(os.path.dirname(__file__), "qa_data.json")
        with open(path, encoding="utf-8") as f:
            _QA_CACHE = json.load(f)
    return _QA_CACHE


def match(message: str, language: str = "en") -> dict:
    """
    Keyword-score every Q&A entry against the message.
    Returns the best match (or a safe generic fallback) and the detected language.
    """
    qa = _load_qa()
    lang = _detect_language(message, language)
    lower = message.lower()

    best_score = 0
    best_entry = None

    for entry in qa:
        score = 0
        for kw in entry.get("keywords_en", []):
            if kw.lower() in lower:
                score += 1
        for kw in entry.get("keywords_banglish", []):
            if kw.lower() in lower:
                score += 2
        for kw in entry.get("keywords_bn", []):
            if kw in message:
                score += 2
        if score > best_score:
            best_score = score
            best_entry = entry

    if best_entry and best_score > 0:
        answer = best_entry["answer_bn"] if lang == "bn" else best_entry["answer_en"]
    else:
        if lang == "bn":
            answer = (
                "**সতর্কবার্তা:** আমি একজন এআই, কোনো ডাক্তার নই।\n\n"
                "আপনার লক্ষণ সম্পর্কে অফলাইনে পর্যাপ্ত তথ্য পাওয়া যাচ্ছে না। "
                "দয়া করে আপনার নিকটস্থ স্বাস্থ্যকর্মী বা ক্লিনিকে যোগাযোগ করুন।\n\n"
                "**জরুরি অবস্থায়:** ৯৯৯ বা ১৬৭৬৭ নম্বরে কল করুন।"
            )
        else:
            answer = (
                "**Warning:** I am an AI, not a doctor.\n\n"
                "I could not find specific guidance for your symptoms in offline mode. "
                "Please contact your nearest health worker or clinic.\n\n"
                "**In an emergency:** Call 999 or 16767."
            )

    return {"text": answer, "lang": lang}
