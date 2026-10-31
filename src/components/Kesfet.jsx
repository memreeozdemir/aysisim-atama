import { useDeferredValue, useMemo, useState } from 'react'
import { BOLGELER, ILLER } from '../data/iller'
import { baslik, fold, trSort, useStored } from '../lib/util'
import KadroKart from './KadroKart'

const SIRALAMA = {
  adet: { ad: 'Münhal (çoktan aza)', fn: (a, b) => b.adet - a.adet },
  il: { ad: 'İl (A→Z)', fn: (a, b) => trSort(a.il, b.il) || trSort(a.birim, b.birim) },
}

const BOS = { ara: '', iller: [], bolgeler: [], turler: [], sira: 'adet' }
const SAYFA = 36

export default function Kesfet({ kadrolar, ...ortak }) {
  const [f, setF] = useStored('ds.filtre', BOS)
  const [ilAra, setIlAra] = useState('')
  const [limit, setLimit] = useState(SAYFA)
  const [acik, setAcik] = useState(false)
  const ara = useDeferredValue(f.ara)
  const sira = SIRALAMA[f.sira] ? f.sira : BOS.sira

  const set = (p) => {
    setF((o) => ({ ...o, ...p }))
    setLimit(SAYFA)
  }
  const toggle = (alan, v) => set({ [alan]: f[alan].includes(v) ? f[alan].filter((x) => x !== v) : [...f[alan], v] })

  // Sadece veride gerçekten geçen kurum türleri ve iller listelenir
  const turler = useMemo(() => {
    const m = new Map()
    for (const k of kadrolar) m.set(k.tur, (m.get(k.tur) || 0) + k.adet)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [kadrolar])
  const tumIller = useMemo(() => {
    const m = new Map()
    for (const k of kadrolar) m.set(k.il, (m.get(k.il) || 0) + k.adet)
    return [...m.entries()].sort((a, b) => trSort(a[0], b[0]))
  }, [kadrolar])

  const sonuc = useMemo(() => {
    const q = fold(ara).split(/\s+/).filter(Boolean)
    return kadrolar
      .filter((k) => {
        if (f.iller.length && !f.iller.includes(k.il)) return false
        if (f.bolgeler.length && !f.bolgeler.includes(ILLER[k.il]?.bolge)) return false
        if (f.turler.length && !f.turler.includes(k.tur)) return false
        if (q.length) {
          const metin = fold(`${k.il} ${k.birim}`)
          if (!q.every((w) => metin.includes(w))) return false
        }
        return true
      })
      .sort(SIRALAMA[sira].fn)
  }, [kadrolar, f, ara, sira])

  const toplamAdet = sonuc.reduce((s, k) => s + k.adet, 0)
  const ilListesi = tumIller.filter(([il]) => !ilAra || fold(il).includes(fold(ilAra)))
  const aktifFiltre = f.iller.length + f.bolgeler.length + f.turler.length + (f.ara ? 1 : 0)

  return (
    <div className="kesfet">
      <aside className={`filtreler kart${acik ? ' acik' : ''}`}>
        <div className="filtre-baslik">
          <button className="filtre-ac" onClick={() => setAcik((a) => !a)} aria-expanded={acik}>
            <h3>Filtreler</h3>
            <span className="ok" aria-hidden>
              ▾
            </span>
          </button>
          {aktifFiltre > 0 && (
            <button className="link" onClick={() => set({ ...BOS, sira: f.sira })}>
              Temizle ({aktifFiltre})
            </button>
          )}
        </div>

        <div className="ara-kutu">
          <span aria-hidden>🔎</span>
          <input
            value={f.ara}
            onChange={(e) => set({ ara: e.target.value })}
            placeholder="Hastane, ilçe ara… (örn. nazilli)"
          />
        </div>

        <div className="filtre-govde">
          <div className="grup">
            <h4>Bölge</h4>
            <div className="chipler">
              {BOLGELER.map((b) => (
                <button key={b} className={`chip${f.bolgeler.includes(b) ? ' on' : ''}`} onClick={() => toggle('bolgeler', b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="grup">
            <h4>Kurum türü</h4>
            <div className="chipler">
              {turler.map(([t, n]) => (
                <button key={t} className={`chip${f.turler.includes(t) ? ' on' : ''}`} onClick={() => toggle('turler', t)}>
                  {t} <small>{n}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="grup">
            <h4>İl {f.iller.length > 0 && <b>{f.iller.length} seçili</b>}</h4>
            {f.iller.length > 0 && (
              <div className="chipler secili-iller">
                {f.iller.map((il) => (
                  <button key={il} className="chip on" onClick={() => toggle('iller', il)}>
                    {baslik(il)} ✕
                  </button>
                ))}
              </div>
            )}
            <input className="mini-ara" value={ilAra} onChange={(e) => setIlAra(e.target.value)} placeholder="İl ara…" />
            <div className="il-liste">
              {ilListesi.map(([il, n]) => (
                <label key={il}>
                  <input type="checkbox" checked={f.iller.includes(il)} onChange={() => toggle('iller', il)} />
                  {baslik(il)} <small>{n}</small>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="sonuclar">
        <div className="sonuc-ust">
          <p>
            <strong>{sonuc.length.toLocaleString('tr-TR')}</strong> ilan ·{' '}
            <strong>{toplamAdet.toLocaleString('tr-TR')}</strong> münhal
          </p>
          <select value={sira} onChange={(e) => set({ sira: e.target.value })} aria-label="Sıralama">
            {Object.entries(SIRALAMA).map(([k, v]) => (
              <option key={k} value={k}>
                {v.ad}
              </option>
            ))}
          </select>
        </div>

        {sonuc.length === 0 ? (
          <div className="bos kart">
            <span>🌤️</span>
            <h3>Bu filtrelere uyan kadro yok</h3>
            <p>Filtreleri biraz gevşetmeyi dene.</p>
          </div>
        ) : (
          <div className="grid">
            {sonuc.slice(0, limit).map((k) => (
              <KadroKart key={k.id} k={k} {...ortak} />
            ))}
          </div>
        )}
        {sonuc.length > limit && (
          <button className="btn daha" onClick={() => setLimit((l) => l + SAYFA)}>
            Daha fazla göster ({sonuc.length - limit} kaldı)
          </button>
        )}
      </section>
    </div>
  )
}
