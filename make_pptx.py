"""
Actual slide order in this PPTX (python-pptx 0-based index):
  0: PulseGuard (Title)
  1: Healthy Start for a Happy Pregnancy
  2: Daily Wellness Routine
  3: Nourishing Your Body
  4: Staying Hydrated and Energized
  5: Emotional Wellbeing Matters
  6: Rest and Sleep Quality
  7: Safe Movement and Activity
  8: Relaxation and Mindfulness
  9: Preparing for a Healthy Journey Ahead
  10: Thank You

Target order (12 slides after adding RAG):
  0: Title | 1: Preparing | 2: RAG | 3: Healthy Start |
  4: Daily | 5: Nourishing | 6: Hydrated | 7: Emotional |
  8: Rest | 9: Movement | 10: Relaxation | 11: Thank You
"""
from pptx import Presentation
from pptx.util import Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn
from pptx.oxml import parse_xml
from lxml import etree
import copy, os

BASE     = r'D:\VSCODE\HACKATHON\PulseGuard'
PPTX_IN  = os.path.join(BASE, 'Pink Soft Pregnancy Wellness Guide Presentation.pptx')
PPTX_OUT = os.path.join(BASE, 'Pink Soft Pregnancy Wellness Guide Presentation - FINAL.pptx')
IMG      = os.path.join(BASE, 'ReadmeImages')

prs = Presentation(PPTX_IN)
SW, SH = prs.slide_width, prs.slide_height


# ── helpers ───────────────────────────────────────────────────────────────────

def reorder_slides(prs, new_order):
    """Reorder all slides in one pass. new_order = list of 0-based original indices."""
    lst   = prs.slides._sldIdLst
    items = list(lst)
    for item in items:
        lst.remove(item)
    for idx in new_order:
        lst.append(items[idx])


def duplicate_slide(prs, idx):
    """Deep-copy a slide's shapes into a new slide appended at the end."""
    src  = prs.slides[idx]
    ns   = prs.slides.add_slide(src.slide_layout)
    s_sp = src.shapes._spTree
    n_sp = ns.shapes._spTree
    for child in list(n_sp):
        n_sp.remove(child)
    for child in s_sp:
        n_sp.append(copy.deepcopy(child))
    return ns


def _first_rPr(txBody):
    for p in txBody.findall(qn('a:p')):
        for r in p.findall(qn('a:r')):
            rp = r.find(qn('a:rPr'))
            if rp is not None:
                return copy.deepcopy(rp)
    return None


def _first_pPr(txBody):
    for p in txBody.findall(qn('a:p')):
        pp = p.find(qn('a:pPr'))
        if pp is not None:
            return copy.deepcopy(pp)
    return None


def _set_txbody(txBody, text):
    rPr  = _first_rPr(txBody)
    pPr  = _first_pPr(txBody)
    for p in list(txBody.findall(qn('a:p'))):
        txBody.remove(p)
    safe  = text.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
    NS    = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
    new_p = parse_xml(f'<a:p {NS}><a:r><a:t>{safe}</a:t></a:r></a:p>')
    if pPr is not None:
        new_p.insert(0, pPr)
    if rPr is not None:
        new_p.find(qn('a:r')).insert(0, rPr)
    txBody.append(new_p)


def set_body_text(slide, new_text):
    """Replace first Lorem-ipsum text frame; clear any additional ones."""
    done = False
    for shape in slide.shapes:
        if not shape.has_text_frame:
            continue
        if 'Lorem' not in shape.text_frame.text and 'lorem' not in shape.text_frame.text:
            continue
        if not done:
            _set_txbody(shape.text_frame._txBody, new_text)
            done = True
        else:
            tb = shape.text_frame._txBody
            for p in list(tb.findall(qn('a:p'))):
                tb.remove(p)
            NS = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
            tb.append(parse_xml(f'<a:p {NS}><a:r><a:t></a:t></a:r></a:p>'))


def set_title(slide, new_title, hint):
    for shape in slide.shapes:
        if not shape.has_text_frame:
            continue
        if 'Lorem' in shape.text_frame.text:
            continue
        if hint in shape.text_frame.text:
            _set_txbody(shape.text_frame._txBody, new_title)
            return


def replace_run_text(slide, find, replace):
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                for run in para.runs:
                    if find in run.text:
                        run.text = run.text.replace(find, replace)


def add_image(slide, fname, placement):
    path = os.path.join(IMG, fname)
    if not os.path.exists(path):
        print(f'  !! Missing: {path}')
        return
    if placement == 'right':
        x, y, w, h = int(SW*.56), int(SH*.13), int(SW*.41), int(SH*.75)
    elif placement == 'left':
        x, y, w, h = int(SW*.02), int(SH*.13), int(SW*.41), int(SH*.75)
    elif placement == 'bottom':
        x, y, w, h = int(SW*.05), int(SH*.54), int(SW*.90), int(SH*.43)
    slide.shapes.add_picture(path, x, y, w, h)


def add_placeholder_box(slide):
    x, y, w, h = int(SW*.56), int(SH*.13), int(SW*.41), int(SH*.75)
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    p  = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = '[ Add RAG diagram here ]'
    run.font.size  = Pt(20)
    run.font.bold  = True
    run.font.color.rgb = RGBColor(0xAA, 0xAA, 0xAA)
    sp   = tb._element
    spPr = sp.find(qn('p:spPr'))
    ln   = ('<a:ln xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" w="19050">'
            '<a:solidFill><a:srgbClr val="AAAAAA"/></a:solidFill>'
            '<a:prstDash val="dash"/></a:ln>')
    spPr.append(parse_xml(ln))


# ── step 1: duplicate Preparing (index 9) → appended at index 11 ─────────────
duplicate_slide(prs, 9)   # now 12 slides, RAG copy at index 11

# ── step 2: reorder all 12 slides in one pass ─────────────────────────────────
# Original indices after duplication:
#   0:Title  1:HealthyStart  2:Daily  3:Nourishing  4:Hydrated
#   5:Emotional  6:Rest  7:Movement  8:Relaxation
#   9:Preparing  10:ThankYou  11:RAG(dup)
reorder_slides(prs, [0, 9, 11, 1, 2, 3, 4, 5, 6, 7, 8, 10])

# Final indices:
#  0:Title  1:Preparing  2:RAG  3:HealthyStart  4:Daily
#  5:Nourishing  6:Hydrated  7:Emotional  8:Rest
#  9:Movement  10:Relaxation  11:ThankYou

# ── slide 0 — Title ───────────────────────────────────────────────────────────
replace_run_text(prs.slides[0], 'WrongCha', 'PulseGuard')

# ── slide 1 — Preparing for a Healthy Journey Ahead ──────────────────────────
set_body_text(prs.slides[1],
    'PulseGuard is an AI-native maternal health platform designed to support every mother '
    'through her pregnancy journey. From tracking vital signs to AI-powered health insights, '
    'PulseGuard brings personalized, evidence-based care to your fingertips — ensuring you '
    'and your baby stay safe and healthy at every stage.')
add_image(prs.slides[1], '01-landing-hero.png', 'right')

# ── slide 2 — RAG Mechanism ───────────────────────────────────────────────────
set_title(prs.slides[2], 'RAG Mechanism', 'Preparing')
set_body_text(prs.slides[2],
    'PulseGuard uses Retrieval-Augmented Generation (RAG) to deliver clinically grounded AI '
    'responses. When a patient or health worker asks a question, the RAG engine first retrieves '
    'the most relevant records from the patient\'s health history — including vitals, visit notes, '
    'lab results, and risk flags. These retrieved documents are passed as context to the AI model, '
    'which generates a response specific to that patient. This eliminates hallucination and ensures '
    'every recommendation is grounded in verified, real-world patient data.')
add_placeholder_box(prs.slides[2])

# ── slide 3 — Healthy Start for a Happy Pregnancy ────────────────────────────
set_body_text(prs.slides[3],
    'The first trimester sets the foundation for a healthy pregnancy. Start prenatal vitamins '
    'with folic acid (400 mcg daily) to support fetal development and reduce birth defects. '
    'Eat a balanced diet rich in fruits, vegetables, lean proteins, and whole grains, and stay '
    'hydrated by drinking 8-10 glasses of water daily. Get regular check-ups with your healthcare '
    'provider to monitor vital signs and fetal development, and track your health metrics including '
    'blood pressure, weight, and blood sugar — especially if you are at risk for complications.')
add_image(prs.slides[3], '05-patient-dashboard.png', 'left')

# ── slide 4 — Daily Wellness Routine ─────────────────────────────────────────
set_body_text(prs.slides[4],
    'Building a consistent daily routine is one of the most powerful things you can do for your '
    'pregnancy. Start each morning with a nutritious breakfast and a glass of water. Take your '
    'prenatal vitamins at the same time every day to build the habit. Schedule gentle movement, '
    'whether a short walk or prenatal stretching, and end the day with a calming wind-down routine. '
    'Consistency in small daily habits creates a strong foundation for both your health and your '
    'baby\'s development.')
add_image(prs.slides[4], '07-patient-daily-check.png', 'right')

# ── slide 5 — Nourishing Your Body ───────────────────────────────────────────
set_body_text(prs.slides[5],
    'Nutrition during pregnancy is not about eating more — it is about eating right. Focus on '
    'iron-rich foods like lentils and leafy greens to prevent anemia, and calcium sources like '
    'dairy or fortified alternatives for bone development. Include omega-3 fatty acids from fish '
    'or flaxseed for brain development. Limit processed foods, added sugars, and excess sodium. '
    'PulseGuard\'s nutrition tracker helps you log meals and flags nutritional gaps, giving you '
    'personalized dietary guidance every day.')
add_image(prs.slides[5], '08-patient-nutrition.png', 'bottom')

# ── slide 6 — Staying Hydrated and Energized ─────────────────────────────────
set_body_text(prs.slides[6],
    'Dehydration during pregnancy can lead to fatigue, headaches, and even preterm contractions. '
    'Aim for 8-10 glasses of water daily, and increase intake during hot weather or after exercise. '
    'Herbal teas (pregnancy-safe varieties) and water-rich fruits like watermelon and cucumber count '
    'toward your hydration goals. To maintain energy levels, eat small frequent meals every 3-4 hours '
    'rather than large meals, focusing on complex carbohydrates and protein for steady blood sugar.')
add_image(prs.slides[6], '11-patient-calendar.png', 'right')

# ── slide 7 — Emotional Wellbeing Matters ────────────────────────────────────
set_body_text(prs.slides[7],
    'Pregnancy brings emotional changes as significant as physical ones. Hormonal shifts, physical '
    'discomfort, and anticipation of parenthood can all affect your mental health. It is normal to '
    'feel anxious or overwhelmed — but it does not have to be your daily experience. Practice '
    'mindfulness, talk openly with your partner or support network, and do not hesitate to seek '
    'professional counseling if needed. PulseGuard\'s wellness check-ins help you track your mood '
    'patterns and identify when you may need extra support.')
add_image(prs.slides[7], '06-patient-ai-chat.png', 'left')

# ── slide 8 — Rest and Sleep Quality ─────────────────────────────────────────
set_body_text(prs.slides[8],
    'Sleep is essential for fetal development and maternal recovery. Aim for 7-9 hours per night, '
    'and rest when you feel tired during the day. Sleep on your left side during the second and '
    'third trimesters to improve blood flow to the baby and reduce pressure on your organs. Use a '
    'pregnancy pillow for support and keep your bedroom cool and dark. Avoid screens for at least '
    '30 minutes before bed, and try a calming nighttime ritual like light reading or deep breathing.')
add_image(prs.slides[8], '13-patient-wellness.png', 'bottom')

# ── slide 9 — Safe Movement and Activity ─────────────────────────────────────
set_body_text(prs.slides[9],
    'Regular, gentle exercise during pregnancy reduces back pain, improves mood, and prepares your '
    'body for labor. Walking, swimming, and prenatal yoga are all safe for most pregnancies. Aim for '
    '30 minutes of moderate activity most days of the week. Avoid exercises that involve lying flat '
    'on your back after the first trimester, contact sports, or activities with a high fall risk. '
    'Always listen to your body — if something does not feel right, stop and rest. Consult your '
    'healthcare provider before starting any new exercise routine.')
add_image(prs.slides[9], '17-worker-vitals.png', 'right')

# ── slide 10 — Relaxation and Mindfulness ────────────────────────────────────
set_body_text(prs.slides[10],
    'Stress during pregnancy can affect both mother and baby, making relaxation an essential part '
    'of your wellness plan. Practice deep breathing exercises — inhale for 4 counts, hold for 4, '
    'exhale for 6 — to activate the parasympathetic nervous system and reduce cortisol. Prenatal '
    'meditation, guided imagery, and progressive muscle relaxation are proven tools for reducing '
    'anxiety. Even 10 minutes of quiet mindfulness per day can make a meaningful difference in '
    'your wellbeing and your baby\'s environment.')
add_image(prs.slides[10], '18-worker-ai-analysis.png', 'left')

# ── slide 11 — Thank You + Any Questions? ─────────────────────────────────────
ty = prs.slides[11]
tb = ty.shapes.add_textbox(int(SW*.20), int(SH*.65), int(SW*.60), int(SH*.18))
tf = tb.text_frame
p  = tf.paragraphs[0]
p.alignment = PP_ALIGN.CENTER
run = p.add_run()
run.text = 'Any Questions?'
run.font.size  = Pt(32)
run.font.bold  = True
run.font.color.rgb = RGBColor(0xC2, 0x18, 0x5B)
add_image(ty, '04-about.png', 'right')

# ── save ─────────────────────────────────────────────────────────────────────
prs.save(PPTX_OUT)
print(f'Saved: {PPTX_OUT}')
print(f'Total slides: {len(prs.slides)}')
for i, s in enumerate(prs.slides):
    texts = [sh.text_frame.text.strip()[:55]
             for sh in s.shapes if sh.has_text_frame and sh.text_frame.text.strip()
             and 'Lorem' not in sh.text_frame.text]
    print(f'  Slide {i+1:02d}: {texts[0] if texts else "(no text)"}')
