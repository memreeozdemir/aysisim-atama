import { ILLER } from '../data/iller'
import { baslik, MAX_TERCIH } from '../lib/util'

export default function KadroKart({ k, ekle, cikar, tercihSirasi, tercihSayi }) {
  const s = tercihSirasi(k.id)
  const il = ILLER[k.il]
  const birim = baslik(k.birim.replace(/\s*\(.*\)\s*$/, ''))

  return (
    <article className={`kadro kart${s ? ' secili' : ''}`}>
      <div className="kadro-ust">
        <span className="il-chip">
          📍 {baslik(k.il)}
          {il && <em> · {il.bolge}</em>}
        </span>
        <span className="adet" title="Münhal sayısı">
          {k.adet}
          <small>kadro</small>
        </span>
      </div>
      <h3>{birim}</h3>
      <div className="etiketler">
        <span className="etiket tur">{k.tur}</span>
      </div>
      {k.sart && (
        <p className="sart" title={k.aciklama || k.sart}>
          ⚠️ {k.sart.length > 110 ? k.sart.slice(0, 110) + '…' : k.sart}
        </p>
      )}
      <div className="kadro-alt">
        {s ? (
          <button className="btn ghost" onClick={() => cikar(k.id)}>
            ✓ {s}. tercihin · çıkar
          </button>
        ) : (
          <button className="btn" disabled={tercihSayi >= MAX_TERCIH} onClick={() => ekle(k)}>
            + Tercihe ekle
          </button>
        )}
      </div>
    </article>
  )
}
