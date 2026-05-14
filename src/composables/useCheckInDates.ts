import { computed, ref } from 'vue'

const STORAGE_KEY = 'psychologist-check-in-dates'

export function dateKeyFromDate(d: Date): string {
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function loadKeys(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed))
      return []
    return parsed.filter(
      (x): x is string =>
        typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x),
    )
  }
  catch {
    return []
  }
}

function saveKeys(keys: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  }
  catch {
    /* 无痕模式等 */
  }
}

export function useCheckInDates() {
  const dates = ref<string[]>(loadKeys())
  const checked = computed(() => new Set(dates.value))

  function isChecked(key: string) {
    return checked.value.has(key)
  }

  function checkInOn(key: string) {
    if (checked.value.has(key))
      return
    const next = [...dates.value, key].sort()
    dates.value = next
    saveKeys(next)
  }

  function checkInToday() {
    checkInOn(dateKeyFromDate(new Date()))
  }

  const todayKey = computed(() => dateKeyFromDate(new Date()))
  const checkedToday = computed(() => isChecked(todayKey.value))

  return { dates, isChecked, checkInOn, checkInToday, todayKey, checkedToday }
}
