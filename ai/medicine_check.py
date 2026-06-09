import base64
from typing import Optional
from pydantic import BaseModel


class MedicineCheckRequest(BaseModel):
    query: Optional[str] = None
    imageBase64: Optional[str] = None
    role: str = 'patient'
    pregnancyWeek: Optional[int] = None
    language: str = 'en'


def _parse_response(raw: str, identified: str) -> dict:
    result = {"identified": identified, "raw": raw}
    for line in raw.strip().splitlines():
        if ':' in line:
            k, _, v = line.partition(':')
            result[k.strip()] = v.strip()
    return result


async def handle_medicine_check(req: MedicineCheckRequest, cascade) -> dict:
    gemini = getattr(cascade, '_gemini', None)
    medicine_name = req.query

    if req.imageBase64:
        try:
            img_bytes = base64.b64decode(req.imageBase64)
            id_prompt = (
                "Identify the medicine shown in this image. "
                "Reply with ONLY the generic name and brand name separated by a slash, nothing else. "
                "Example: Paracetamol / Napa"
            )
            identified = gemini.generate_multimodal(id_prompt, img_bytes)
            if identified:
                medicine_name = identified.strip()
        except Exception as e:
            print(f"Multimodal identification failed: {e}")

    if not medicine_name:
        return {"error": "No medicine specified"}

    lang_label = "Bengali" if req.language == "bn" else "English"

    if req.role == 'worker':
        prompt = f"""You are advising a Community Health Worker (CHW) in rural Bangladesh.
Provide pregnancy safety guidance for the medicine: "{medicine_name}".
Answer in {lang_label}. Be clinical and precise.
Use exactly this format (one line each, no extra text):
SAFETY: SAFE | CAUTION | AVOID
T1_GUIDE: (weeks 1-13: when to use and dose)
T2_GUIDE: (weeks 14-26: when to use and dose)
T3_GUIDE: (weeks 27-40: when to use and dose)
CONTRAINDICATIONS: (key contraindications, comma-separated)
CHW_NOTE: (one sentence: how to counsel the patient about this medicine)"""
    else:
        week_ctx = f" at week {req.pregnancyWeek} of pregnancy" if req.pregnancyWeek else " during pregnancy"
        prompt = f"""You are a maternal health assistant for rural Bangladesh. Base your answer strictly on established medical consensus (WHO, NHS, and standard obstetrics guidelines).

Key reference facts:
- Paracetamol (acetaminophen, Napa, ACE, Renova) is SAFE for short-term use at standard doses throughout pregnancy — it is the first-line analgesic recommended by WHO and NHS for pregnant women.
- Ibuprofen, aspirin, and NSAIDs are CAUTION in first trimester and AVOID after 20 weeks.
- Metronidazole (Flagyl) is CAUTION in first trimester, SAFE in second/third trimester.
- Amoxicillin, Azithromycin are generally SAFE in pregnancy.
- Methotrexate, Thalidomide, Isotretinoin, Warfarin, ACE inhibitors are AVOID throughout pregnancy.
- Do NOT confuse short-term occasional paracetamol use (SAFE) with prolonged daily use concerns (CAUTION).

A pregnant woman{week_ctx} asks: is "{medicine_name}" safe to take?
Answer in {lang_label}. Use simple, plain language that a non-medical person can understand.
Use exactly this format (one line each, no extra text):
SAFETY: SAFE | CAUTION | AVOID
REASON: (1-2 sentences explaining the safety verdict based on established guidelines)
WEEK_NOTE: (specific advice for this stage of pregnancy, or "N/A" if not applicable)
ALTERNATIVES: (if AVOID, list 1-2 safer alternatives; otherwise write "None needed")"""

    raw = None
    try:
        groq_result = cascade._groq.ask(prompt)
        if groq_result and not groq_result.startswith("Error:"):
            raw = groq_result
    except Exception as e:
        print(f"Groq failed for medicine check: {e}")

    if not raw and gemini:
        try:
            raw = gemini.ask(prompt)
        except Exception as e:
            print(f"Gemini failed for medicine check: {e}")

    if not raw:
        return {"error": "AI unavailable"}

    return _parse_response(raw, medicine_name)
