import { useEffect, useState } from 'react'

// Türkçe büyük/küçük harf + aksan katlama: "ŞEHİR" ve "sehir" eşleşir
const ASCII = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' }
export const fold = (s) => (s || '').toLocaleLowerCase('tr-TR').replace(/[çğıöşüâîû]/g, (c) => ASCII[c])

// "AYDIN ŞEHİR HASTANESİ" -> "Aydın Şehir Hastanesi"
const KUCUK = new Set(['ve', 'ile', 'veya'])
export const baslik = (s) =>
  (s || '')
    .toLocaleLowerCase('tr-TR')
    .split(' ')
    .map((w, i) => (i > 0 && KUCUK.has(w) ? w : w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1)))
    .join(' ')
    .replace(/\bEah\b/g, 'EAH')
    .replace(/\bDsi\b/g, 'DSİ')
    .replace(/\bSgk\b/g, 'SGK')

export const trSort = (a, b) => a.localeCompare(b, 'tr')

export function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw == null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* depolama kapalıysa sessizce devam */
    }
  }, [key, value])
  return [value, setValue]
}

export const MAX_TERCIH = 10
