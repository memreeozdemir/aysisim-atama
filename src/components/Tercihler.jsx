import { useState } from 'react'
import { ILLER } from '../data/iller'
import { baslik, useStored, MAX_TERCIH } from '../lib/util'

const temizBirim = (k) => baslik(k.birim.replace(/\s*\(.*\)\s*$/, ''))

export default function Tercihler({ tercihler, setTercihIdler, cikar, bildir, gitKesfet }) {
  const [notlar, setNotlar] = useStored('ds.notlar', {})
  const [surukle, setSurukle] = useState(null)
  const [hedef, setHedef] = useState(null)

  const tasi = (from, to) => {
    if (to < 0 || to >= tercihler.length || from === to) return
    const yeni = tercihler.map((k) => k.id)
    const [x] = yeni.splice(from, 1)
    yeni.splice(to, 0, x)
    setTercihIdler(yeni)
  }

  const metin = () =>
    tercihler
      .map((k, i) => `${i + 1}. ${baslik(k.il)} – ${temizBirim(k)} (${k.tur}, ${k.adet} kadro)`)
      .join('\n')

  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(metin())
      bildir('Tercih listen panoya kopyalandı 📋')
    } catch {
      bildir('Kopyalanamadı, tarayıcı izin vermedi', 'uyari')
    }
  }

  const csvIndir = () => {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
    const satirlar = [
      ['Sıra', 'İl', 'Birim', 'Kurum türü', 'Münhal', 'Not'],
      ...tercihler.map((k, i) => [i + 1, k.il, k.birim, k.tur, k.adet, notlar[k.id] || '']),
    ]
    const blob = new Blob(['﻿' + satirlar.map((r) => r.map(esc).join(';')).join('\n')], {
      type: 'text/csv;charset=utf-8',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'tercih-listem.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const temizle = () => {
    if (confirm('Tüm tercih listesi silinsin mi?')) setTercihIdler([])
  }

  const bolgeler = [...new Set(tercihler.map((k) => ILLER[k.il]?.bolge).filter(Boolean))]
  const bosSayi = MAX_TERCIH - tercihler.length

  return (
    <div className="tercihler">
      <section className="tercih-ozet kart">
        <div className="halka" style={{ '--p': tercihler.length / MAX_TERCIH }}>
          <span>
            {tercihler.length}
            <small>/10</small>
          </span>
        </div>
        <div className="ozet-metin">
          <h2>Tercih listem</h2>
          <p>
            {tercihler.length === 0
              ? 'Henüz tercih eklemedin. Keşfet veya Akıllı Sıralama’dan ekleyebilirsin.'
              : bosSayi > 0
                ? `${bosSayi} boş tercihin var. Listeyi sürükleyerek sıralayabilirsin.`
                : 'Liste tamam! Sıralamayı son kez gözden geçir.'}
          </p>
          {tercihler.length > 0 && (
            <div className="mini-istat">
              <span>🗺️ {new Set(tercihler.map((k) => k.il)).size} farklı il</span>
              <span>🗺️ {bolgeler.join(', ')}</span>
              <span>🏥 {tercihler.reduce((s, k) => s + k.adet, 0)} toplam kadro</span>
            </div>
          )}
        </div>
        <div className="aksiyonlar no-print">
          <button className="btn ghost" onClick={kopyala} disabled={!tercihler.length}>
            Kopyala
          </button>
          <button className="btn ghost" onClick={csvIndir} disabled={!tercihler.length}>
            CSV indir
          </button>
          <button className="btn ghost" onClick={() => window.print()} disabled={!tercihler.length}>
            Yazdır
          </button>
          <button className="btn ghost tehlike" onClick={temizle} disabled={!tercihler.length}>
            Temizle
          </button>
        </div>
      </section>

      <ol className="slotlar">
        {tercihler.map((k, i) => (
          <li
            key={k.id}
            className={`slot dolu${surukle === i ? ' suruklenen' : ''}${hedef === i && surukle !== i ? ' hedef' : ''}`}
            draggable
            onDragStart={(e) => {
              setSurukle(i)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setHedef(i)
            }}
            onDrop={(e) => {
              e.preventDefault()
              tasi(surukle, i)
              setSurukle(null)
              setHedef(null)
            }}
            onDragEnd={() => {
              setSurukle(null)
              setHedef(null)
            }}
          >
            <span className="tutamac no-print" aria-hidden>
              ⋮⋮
            </span>
            <span className="slot-no">{i + 1}</span>
            <div className="slot-govde">
              <div className="slot-ust">
                <strong>{temizBirim(k)}</strong>
                <span className="il-chip">📍 {baslik(k.il)}</span>
              </div>
              <p className="unvan">
                {k.tur} · {k.adet} kadro
              </p>
              {k.sart && <p className="sart">⚠️ {k.sart}</p>}
              <input
                className="not no-print"
                placeholder="Kendine not ekle (örn. lojman var mı sor)"
                value={notlar[k.id] || ''}
                onChange={(e) => setNotlar((n) => ({ ...n, [k.id]: e.target.value }))}
              />
              {notlar[k.id] && <p className="sadece-print">Not: {notlar[k.id]}</p>}
            </div>
            <div className="slot-butonlar no-print">
              <button aria-label="Yukarı taşı" disabled={i === 0} onClick={() => tasi(i, i - 1)}>
                ↑
              </button>
              <button aria-label="Aşağı taşı" disabled={i === tercihler.length - 1} onClick={() => tasi(i, i + 1)}>
                ↓
              </button>
              <button aria-label="Çıkar" className="sil" onClick={() => cikar(k.id)}>
                ✕
              </button>
            </div>
          </li>
        ))}
        {Array.from({ length: bosSayi }, (_, j) => (
          <li key={`bos${j}`} className="slot bos-slot no-print">
            <span className="slot-no">{tercihler.length + j + 1}</span>
            <button className="link" onClick={gitKesfet}>
              + Boş tercih — kadro seçmek için Keşfet’e git
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
