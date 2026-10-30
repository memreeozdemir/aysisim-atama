"""xlsx -> src/data/kadrolar.json, sadece DİŞ TABİBİ kadroları (stdlib only). Kullanım: python3 scripts/convert.py"""
import json, re, zipfile, xml.etree.ElementTree as ET
from pathlib import Path

SRC = Path(__file__).resolve().parents[2] / '2026-3-aciktan-atama-webxlsx.xlsx'
OUT = Path(__file__).resolve().parents[1] / 'src' / 'data' / 'kadrolar.json'
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

z = zipfile.ZipFile(SRC)
ss = [''.join(t.text or '' for t in si.iter(NS + 't'))
      for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall(NS + 'si')]

def cell(c):
    v = c.find(NS + 'v')
    if v is None:
        is_ = c.find(NS + 'is')
        return ''.join(t.text or '' for t in is_.iter(NS + 't')) if is_ is not None else ''
    return ss[int(v.text)] if c.get('t') == 's' else v.text

def kurum_turu(b):
    if 'EĞİTİM VE ARAŞTIRMA' in b or re.search(r'\bEAH\b', b): return 'Eğitim ve Araştırma'
    if 'ŞEHİR HASTANESİ' in b: return 'Şehir Hastanesi'
    if 'AĞIZ VE DİŞ' in b: return 'Ağız ve Diş Sağlığı'
    if 'DEVLET HASTANESİ' in b or 'HASTANESİ' in b and 'ÜNİVERSİTE' not in b: return 'Devlet Hastanesi'
    if 'ACİL SAĞLIK' in b: return '112 Acil'
    if any(k in b for k in ('İLÇE SAĞLIK', 'TOPLUM SAĞLIĞI', 'HALK SAĞLIĞI', 'İL SAĞLIK', 'SAĞLIK MERKEZİ', 'ENTEGRE')):
        return 'Birinci Basamak'
    if 'CEZA İNFAZ' in b or 'ADALET BAKANLIĞI' in b: return 'Ceza İnfaz'
    if 'ÜNİVERSİTE' in b: return 'Üniversite'
    return 'Diğer Kamu'

rows = []
for i, r in enumerate(ET.fromstring(z.read('xl/worksheets/sheet1.xml')).iter(NS + 'row')):
    if i == 0: continue
    d = {re.sub(r'\d', '', c.get('r')): cell(c).strip() for c in r.findall(NS + 'c')}
    if d.get('B') != 'DİŞ TABİBİ':
        continue
    birim = re.sub(r'\s+', ' ', d.get('D', ''))
    m = re.search(r'\((.*)\)\s*$', birim)
    rows.append({
        'id': i,
        'il': d.get('A', ''),
        'unvan': d.get('B', ''),
        'brans': d.get('C', ''),
        'birim': birim,
        'adet': int(d.get('E', '0') or 0),
        'aciklama': d.get('F', ''),
        'sart': (m.group(1) if m else '') or d.get('F', ''),
        'tur': kurum_turu(birim),
    })

OUT.write_text(json.dumps(rows, ensure_ascii=False, separators=(',', ':')))
print(len(rows), 'satır,', sum(r['adet'] for r in rows), 'münhal ->', OUT)
