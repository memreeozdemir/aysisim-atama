import { useEffect, useState } from 'react'

export default function Mektup({ kapat }) {
  const [acik, setAcik] = useState(false)

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && kapat()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [kapat])

  return (
    <div className="mektup-perde" role="dialog" aria-modal="true" aria-label="Ayşişim’e bir not">
      <div className="kalpler" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} style={{ '--i': i, fontSize: 14 + (i % 4) * 6 }}>
            {i % 3 ? '♥' : '✿'}
          </span>
        ))}
      </div>

      {!acik ? (
        <button className="zarf" onClick={() => setAcik(true)}>
          <span className="zarf-kapak" />
          <span className="zarf-govde">
            <span className="zarf-muhur">♥</span>
            <span className="zarf-yazi">Ayşişim’e</span>
          </span>
          <span className="zarf-ipucu">açmak için dokun</span>
        </button>
      ) : (
        <article className="mektup">
          <p className="mektup-hitap">Ayşişim,</p>
          <p>
            Atama heyecanını biraz olsun hafifletmek için bu küçük uygulamayı senin için hazırladım. Bütün diş tabibi
            kadroları burada; filtrele, karşılaştır, 10 tercihini gönül rahatlığıyla sırala.
          </p>
          <p>Nereye çıkarsa çıksın, en güzel yer orası olacak; çünkü sen orada olacaksın.</p>
          <p>Ama yine de… Akıllı Sıralama’ya bir göz at derim 😊</p>
          <p className="mektup-son">Bol şans, diş hekimim 🦷💛</p>
          <button className="btn buyuk" onClick={kapat}>
            Hadi tercihlere bakalım
          </button>
        </article>
      )}
    </div>
  )
}
