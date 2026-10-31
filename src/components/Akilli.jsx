import { useMemo, useState } from 'react'
import { MAX_TERCIH } from '../lib/util'
import KadroKart from './KadroKart'

export default function Akilli({ kadrolar, ...ortak }) {
  const [adet, setAdet] = useState(24)

  const liste = useMemo(
    () => kadrolar.filter((k) => !k.ai.oneriDisi).sort((a, b) => b.ai.ham - a.ai.ham || b.adet - a.adet),
    [kadrolar],
  )

  return (
    <div className="akilli">
      <section className="akilli-hero kart">
        <div className="parilti" aria-hidden>✨</div>
        <div>
          <h2>Ayşişim’e özel akıllı sıralama</h2>
          <p>
            Konum, yaşam kalitesi, kurum imkânları ve kontenjan durumunu birlikte değerlendirerek diş tabibi kadroları
            arasından en mantıklı seçenekleri öne çıkardık.
          </p>
        </div>
        <button
          className="btn buyuk"
          onClick={() => ortak.ekleBirden(liste)}
          disabled={ortak.tercihSayi >= MAX_TERCIH}
        >
          Boş tercihlerimi önerilerle doldur
        </button>
      </section>

      <div className="podyum">
        {liste.slice(0, 3).map((k, i) => (
          <KadroKart key={k.id} k={k} sira={i + 1} akilliGoster {...ortak} />
        ))}
      </div>
      <div className="grid">
        {liste.slice(3, adet).map((k, i) => (
          <KadroKart key={k.id} k={k} sira={i + 4} akilliGoster {...ortak} />
        ))}
      </div>
      {liste.length > adet && (
        <button className="btn daha" onClick={() => setAdet((a) => a + 24)}>
          Daha fazla öneri göster
        </button>
      )}
    </div>
  )
}
