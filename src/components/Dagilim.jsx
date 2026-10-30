import { useMemo } from 'react'
import { ILLER } from '../data/iller'
import { baslik } from '../lib/util'

function topla(liste, anahtar) {
  const m = new Map()
  for (const k of liste) {
    const a = anahtar(k)
    if (!a) continue
    const o = m.get(a) || { ad: a, adet: 0, ilan: 0 }
    o.adet += k.adet
    o.ilan += 1
    m.set(a, o)
  }
  return [...m.values()].sort((a, b) => b.adet - a.adet)
}

function Cubuklar({ baslik: b, veri, ad = (x) => x, limit }) {
  const gosterilen = limit ? veri.slice(0, limit) : veri
  const max = Math.max(1, ...gosterilen.map((x) => x.adet))
  return (
    <section className="dagilim-kart kart">
      <h3>{b}</h3>
      {gosterilen.length === 0 ? (
        <p className="soluk">Veri yok</p>
      ) : (
        <ul className="cubuklar">
          {gosterilen.map((x) => (
            <li key={x.ad} tabIndex={0}>
              <span className="c-ad">{ad(x.ad)}</span>
              <span className="c-ray">
                <span className="c-dolu" style={{ '--w': `${(x.adet / max) * 100}%` }} />
              </span>
              <span className="c-deger">{x.adet}</span>
              <span className="c-ipucu" role="tooltip">
                {ad(x.ad)}: {x.adet} münhal · {x.ilan} ilan
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Dagilim({ kadrolar }) {
  const iller = useMemo(() => topla(kadrolar, (k) => k.il), [kadrolar])
  const bolgeler = useMemo(() => topla(kadrolar, (k) => ILLER[k.il]?.bolge), [kadrolar])
  const turler = useMemo(() => topla(kadrolar, (k) => k.tur), [kadrolar])
  const ege = iller.filter((x) => ILLER[x.ad]?.bolge === 'Ege')

  return (
    <div className="dagilim">
      <div className="dagilim-ust">
        <p>Diş tabibi kadrolarının dağılımı</p>
      </div>
      <div className="dagilim-grid">
        <Cubuklar baslik="En çok münhal olan iller" veri={iller} ad={baslik} limit={15} />
        <div className="dagilim-sutun">
          <Cubuklar baslik="Bölgelere göre" veri={bolgeler} />
          <Cubuklar baslik="Ege illeri" veri={ege} ad={baslik} />
        </div>
        <Cubuklar baslik="Kurum türüne göre" veri={turler} />
      </div>
    </div>
  )
}
