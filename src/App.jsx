import { useCallback, useEffect, useMemo, useState } from 'react'
import KADROLAR from './data/kadrolar.json'
import { akilliPuan } from './lib/akilli'
import { useStored, MAX_TERCIH } from './lib/util'
import Kesfet from './components/Kesfet'
import Akilli from './components/Akilli'
import Tercihler from './components/Tercihler'
import Dagilim from './components/Dagilim'

const SEKMELER = [
  { id: 'kesfet', ad: 'Keşfet', ikon: '🧭' },
  { id: 'akilli', ad: 'Akıllı Sıralama', ikon: '✨' },
  { id: 'tercih', ad: 'Tercih Listem', ikon: '📋' },
  { id: 'dagilim', ad: 'Dağılım', ikon: '📊' },
]

// Her kadronun akıllı puanı sabit; bir kez hesaplanır
const KADROLAR_AI = KADROLAR.map((k) => ({ ...k, ai: akilliPuan(k) }))
const KADRO_MAP = new Map(KADROLAR_AI.map((k) => [k.id, k]))
const TOPLAM_MUNHAL = KADROLAR.reduce((s, k) => s + k.adet, 0)
const IL_SAYISI = new Set(KADROLAR.map((k) => k.il)).size

export default function App() {
  const [sekme, setSekme] = useStored('ds.sekme', 'kesfet')
  const [kayitliIdler, setTercihIdler] = useStored('ds.tercihler', [])
  const [toast, setToast] = useState(null)

  // #akilli gibi bir adresle doğrudan sekme açılabilsin
  useEffect(() => {
    const h = location.hash.slice(1)
    if (SEKMELER.some((s) => s.id === h)) setSekme(h)
  }, [setSekme])

  // Veri değişirse artık olmayan kadroları listeden düşür
  const tercihIdler = useMemo(() => kayitliIdler.filter((id) => KADRO_MAP.has(id)), [kayitliIdler])

  const bildir = useCallback((mesaj, tur = 'ok') => {
    const id = Date.now()
    setToast({ id, mesaj, tur })
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2400)
  }, [])

  const tercihler = tercihIdler.map((id) => KADRO_MAP.get(id))

  const ekle = useCallback(
    (k) => {
      const list = tercihIdler
      if (list.includes(k.id)) return
      if (list.length >= MAX_TERCIH) {
        bildir('Tercih listen dolu (10/10). Önce birini çıkar.', 'uyari')
        return
      }
      bildir(list.length + 1 === MAX_TERCIH ? 'Harika! 10 tercihin tamamlandı 🎉' : `${list.length + 1}. tercih olarak eklendi`)
      setTercihIdler([...list, k.id])
    },
    [tercihIdler, setTercihIdler, bildir],
  )
  const ekleBirden = useCallback(
    (ks) => {
      const yeni = [...tercihIdler]
      for (const k of ks) if (yeni.length < MAX_TERCIH && !yeni.includes(k.id)) yeni.push(k.id)
      const n = yeni.length - tercihIdler.length
      if (n) {
        setTercihIdler(yeni)
        bildir(`${n} öneri tercih listene eklendi ✨`)
      }
    },
    [tercihIdler, setTercihIdler, bildir],
  )
  const cikar = useCallback((id) => setTercihIdler(tercihIdler.filter((x) => x !== id)), [tercihIdler, setTercihIdler])
  const tercihSirasi = useCallback((id) => tercihIdler.indexOf(id) + 1, [tercihIdler])

  const ortak = { ekle, ekleBirden, cikar, tercihSirasi, tercihSayi: tercihIdler.length }

  return (
    <div className="app">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />

      <header className="hero">
        <div className="hero-metin">
          <span className="kicker">2026-3 Açıktan Atama · Diş Tabibi</span>
          <h1>
            <em>Ayşişim</em> için atama uygulaması <span className="dalga">🦷</span>
          </h1>
        </div>
        <div className="hero-sayilar">
          <div className="sayi vurgu">
            <strong>{TOPLAM_MUNHAL.toLocaleString('tr-TR')}</strong>
            <span>diş tabibi münhali</span>
          </div>
          <div className="sayi">
            <strong>{IL_SAYISI}</strong>
            <span>il</span>
          </div>
          <div className="sayi">
            <strong>
              {tercihIdler.length}
              <small>/10</small>
            </strong>
            <span>tercih</span>
          </div>
        </div>
      </header>

      <nav className="sekmeler" role="tablist">
        {SEKMELER.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={sekme === s.id}
            className={sekme === s.id ? 'aktif' : ''}
            onClick={() => setSekme(s.id)}
          >
            <span aria-hidden>{s.ikon}</span> {s.ad}
            {s.id === 'tercih' && tercihIdler.length > 0 && <b className="rozet-sayi">{tercihIdler.length}</b>}
          </button>
        ))}
      </nav>

      <main>
        {sekme === 'kesfet' && <Kesfet kadrolar={KADROLAR_AI} {...ortak} />}
        {sekme === 'akilli' && <Akilli kadrolar={KADROLAR_AI} {...ortak} />}
        {sekme === 'tercih' && (
          <Tercihler
            tercihler={tercihler}
            setTercihIdler={setTercihIdler}
            bildir={bildir}
            gitKesfet={() => setSekme('kesfet')}
            {...ortak}
          />
        )}
        {sekme === 'dagilim' && <Dagilim kadrolar={KADROLAR_AI} />}
      </main>

      <footer>
        Ayşişim için 💛 ile yapıldı · Veri: 2026-3 İlk Defa ve Yeniden Atama, Diş Tabibi kadroları · Tercihini göndermeden
        önce resmî ilan metnini mutlaka kontrol et.
      </footer>

      {toast && (
        <div key={toast.id} className={`toast ${toast.tur}`} role="status">
          {toast.mesaj}
        </div>
      )}
    </div>
  )
}
