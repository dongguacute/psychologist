<script setup lang="ts">
import { useCheckInDates, dateKeyFromDate } from '@/composables/useCheckInDates'
import { CalendarDays, Check, ChevronLeft, ChevronRight } from '@lucide/vue'
import { computed, ref } from 'vue'

const { isChecked, checkInToday, todayKey, checkedToday } = useCheckInDates()

/** 当前展示月份：为该月 1 日 0 时的本地 Date */
const viewMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

const monthLabel = computed(() =>
  `${viewMonth.value.getFullYear()} 年 ${viewMonth.value.getMonth() + 1} 月`,
)

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日'] as const

type Cell = { key: string | null; day: number | null; inMonth: boolean }

const calendarCells = computed((): Cell[] => {
  const y = viewMonth.value.getFullYear()
  const m = viewMonth.value.getMonth()
  const first = new Date(y, m, 1)
  const firstDowMon0 = (first.getDay() + 6) % 7
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells: Cell[] = []

  for (let i = 0; i < firstDowMon0; i++)
    cells.push({ key: null, day: null, inMonth: false })

  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKeyFromDate(new Date(y, m, d))
    cells.push({ key, day: d, inMonth: true })
  }

  while (cells.length % 7 !== 0)
    cells.push({ key: null, day: null, inMonth: false })

  return cells
})

const monthCheckedCount = computed(() =>
  calendarCells.value.filter(
    (c): c is Cell & { key: string } =>
      c.key !== null && isChecked(c.key),
  ).length,
)

function shiftMonth(delta: number) {
  const y = viewMonth.value.getFullYear()
  const m = viewMonth.value.getMonth()
  viewMonth.value = new Date(y, m + delta, 1)
}

function goThisMonth() {
  const n = new Date()
  viewMonth.value = new Date(n.getFullYear(), n.getMonth(), 1)
}
</script>

<template>
  <div
    class="mx-auto max-w-3xl rounded-3xl border-2 border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-[0_6px_0_0_var(--app-border)] sm:p-8"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <span
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-b-[5px] border-[var(--app-primary)] bg-[var(--app-primary)] text-white shadow-[0_4px_0_0_var(--app-primary-depth)]"
      >
        <CalendarDays :size="28" :stroke-width="2.5" aria-hidden="true" />
      </span>
      <div class="min-w-0">
        <h1 class="text-xl font-extrabold text-[var(--app-text)] sm:text-2xl">
          打卡日历
        </h1>
        <p class="mt-2 font-bold leading-relaxed text-[var(--app-muted)]">
          在日历上查看已打卡日期；点击「今日打卡」记录今天（数据保存在本机浏览器）。
        </p>
      </div>
    </div>

    <div class="mt-8">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-[15px] font-extrabold text-[var(--app-text)]">
          {{ monthLabel }}
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-xl border-2 border-b-[4px] border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 font-extrabold text-[var(--app-text)] shadow-[0_3px_0_0_var(--app-border)] transition hover:bg-[var(--app-hover)] active:translate-y-px active:border-b-2 active:shadow-[0_2px_0_0_var(--app-border)]"
            aria-label="上一月"
            @click="shiftMonth(-1)"
          >
            <ChevronLeft :size="22" :stroke-width="2.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="rounded-xl border-2 border-b-[4px] border-[var(--app-border-strong)] bg-[var(--app-surface)] px-4 py-2 text-[13px] font-extrabold text-[var(--app-muted)] shadow-[0_3px_0_0_var(--app-border)] transition hover:bg-[var(--app-hover)] active:translate-y-px active:border-b-2 active:shadow-[0_2px_0_0_var(--app-border)]"
            @click="goThisMonth"
          >
            本月
          </button>
          <button
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-xl border-2 border-b-[4px] border-[var(--app-border-strong)] bg-[var(--app-surface)] px-3 font-extrabold text-[var(--app-text)] shadow-[0_3px_0_0_var(--app-border)] transition hover:bg-[var(--app-hover)] active:translate-y-px active:border-b-2 active:shadow-[0_2px_0_0_var(--app-border)]"
            aria-label="下一月"
            @click="shiftMonth(1)"
          >
            <ChevronRight :size="22" :stroke-width="2.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        class="mt-4 grid grid-cols-7 gap-2 rounded-2xl border-2 border-[var(--app-border)] bg-[var(--app-subtle)] p-3 sm:gap-2.5 sm:p-4"
        role="grid"
        :aria-label="`${monthLabel} 打卡日历`"
      >
        <div
          v-for="w in weekdayLabels"
          :key="w"
          class="flex h-9 items-center justify-center text-center text-[12px] font-extrabold text-[var(--app-muted)] sm:text-[13px]"
          role="columnheader"
        >
          {{ w }}
        </div>
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          role="gridcell"
          class="aspect-square min-h-[2.5rem] rounded-xl sm:min-h-[2.75rem]"
          :class="[
            cell.key === null
              ? 'bg-transparent'
              : isChecked(cell.key)
                ? 'border-2 border-[var(--app-primary-depth)] bg-[var(--app-primary-soft)] shadow-[inset_0_2px_0_0_rgba(255,255,255,0.35)]'
                : 'border-2 border-[var(--app-border)] bg-[var(--app-surface)]',
            cell.key === todayKey ? 'ring-2 ring-[var(--app-primary-ring)] ring-offset-2 ring-offset-[var(--app-subtle)]' : '',
          ]"
        >
          <div
            v-if="cell.day !== null"
            class="relative flex h-full flex-col items-center justify-center gap-0.5 px-0.5"
          >
            <span
              class="text-[14px] font-extrabold leading-none"
              :class="isChecked(cell.key!) ? 'text-[var(--app-primary-strong)]' : 'text-[var(--app-text)]'"
            >
              {{ cell.day }}
            </span>
            <Check
              v-if="cell.key && isChecked(cell.key)"
              :size="16"
              :stroke-width="3"
              class="text-[var(--app-primary)]"
              aria-hidden="true"
            />
            <span v-else class="h-4" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          class="rounded-2xl border-2 border-b-[5px] px-6 py-3 text-[15px] font-extrabold tracking-wide transition active:translate-y-[2px] active:border-b-[3px] disabled:pointer-events-none disabled:opacity-55"
          :class="checkedToday
            ? 'border-[var(--app-border-strong)] bg-[var(--app-hover)] text-[var(--app-muted)] shadow-[0_4px_0_0_var(--app-border)]'
            : 'border-[var(--app-primary-depth)] bg-[var(--app-primary)] text-white shadow-[0_4px_0_0_var(--app-primary-depth)] active:shadow-[0_2px_0_0_var(--app-primary-depth)]'"
          :disabled="checkedToday"
          @click="checkInToday"
        >
          {{ checkedToday ? '今日已打卡' : '今日打卡' }}
        </button>
        <p class="text-[14px] font-bold text-[var(--app-muted)]">
          本月已打卡 <span class="text-[var(--app-text)]">{{ monthCheckedCount }}</span> 天
        </p>
      </div>
    </div>
  </div>
</template>
