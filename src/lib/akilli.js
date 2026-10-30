import { ILLER, mesafeKm } from '../data/iller'

// Yakınlık için gizli referans noktası
const MERKEZ = 'MUĞLA'

const TUR_PUAN = {
  'Ağız ve Diş Sağlığı': 8,
  'Devlet Hastanesi': 4,
  'Birinci Basamak': 2,
  'Diğer Kamu': 2,
  'Ceza İnfaz': -4,
}

const ONE_CIKAN = [
  {
    eslesir: (k) => k.birim.includes('TAVAS'),
    puan: 36,
    nedenler: [
      'Denizli merkeze ~45 dk, Muğla’ya kısa yol',
      'Düşük yaşam maliyeti, sakin ilçe hayatı',
      'Devlet hastanesinde yoğun ve öğretici diş polikliniği',
    ],
  },
  {
    eslesir: (k) => k.il === 'AYDIN',
    puan: 28,
    nedenler: [
      'Ege kıyısı, ılıman iklim ve deniz',
      'İzmir & Muğla’ya yakın; havalimanı ve otoyol erişimi',
      'Nazilli, Kuşadası gibi yaşanabilir ilçeler',
    ],
  },
]

export function akilliPuan(k) {
  const il = ILLER[k.il] || {}
  const km = mesafeKm(MERKEZ, k.il) ?? 1100
  const nedenler = []
  let p = 34

  p += Math.max(0, 18 * (1 - km / 1100))
  if (il.bolge === 'Ege') { p += 8; nedenler.push('Ege bölgesi') }
  else if (il.bolge === 'Marmara' || il.bolge === 'Akdeniz') p += 4
  if (il.buyuksehir) { p += 3; nedenler.push('Büyükşehir imkânları') }
  if (il.sahil) { p += 3; nedenler.push('Denize yakın') }

  p += TUR_PUAN[k.tur] ?? 0
  if (k.tur === 'Ağız ve Diş Sağlığı') nedenler.push('Diş hekimliğine özel donanımlı kurum')
  if (k.birim.includes('İLÇE DEVLET')) p -= 2

  if (k.adet > 1) { p += Math.min(6, (k.adet - 1) * 2); nedenler.push(`${k.adet} kadro, şansın yüksek`) }
  if (k.sart) p -= 10

  let rozet = null
  for (const o of ONE_CIKAN) {
    if (o.eslesir(k)) {
      p += o.puan
      rozet = 'Altın tercih'
      nedenler.unshift(...o.nedenler)
      break
    }
  }

  // Ham puanı yumuşak bir eğriyle %'ye çevir; en iyiler birbirinden ayrışsın
  const skor = Math.max(5, Math.min(99, Math.round(100 * (1 - Math.exp(-Math.max(0, p) / 38)))))
  return { skor, ham: p, rozet, nedenler: [...new Set(nedenler)].slice(0, 4) }
}
