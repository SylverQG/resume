<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { sampleEn } from '@/markdown/samples/sample.en'
import { sampleZh } from '@/markdown/samples/sample.zh'
import { useResumeStore } from '@/stores/useResumeStore'

const emit = defineEmits<{ close: [] }>()

const { tm, rt, locale } = useI18n()
const store = useResumeStore()

const rules = computed(() => (tm('help.rules') as unknown[]).map((m) => rt(m as never)))
const example = computed(() => (locale.value === 'en' ? sampleEn : sampleZh))

const copied = ref(false)

async function copyExample() {
  try {
    await navigator.clipboard.writeText(example.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // 剪贴板不可用（非安全上下文等）：静默
  }
}

function loadExample() {
  store.setMarkdown(example.value)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-40 bg-slate-950/60" @click.self="emit('close')">
    <aside
      class="absolute inset-y-0 right-0 flex w-[460px] max-w-full flex-col border-l border-slate-200 bg-white shadow-2xl"
    >
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <h2 class="text-sm font-semibold text-slate-800">{{ $t('help.title') }}</h2>
        <button class="text-slate-400 hover:text-slate-700" @click="emit('close')">✕</button>
      </div>

      <div class="min-h-0 flex-1 overflow-auto px-5 py-4">
        <h3 class="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {{ $t('help.rulesTitle') }}
        </h3>
        <ul class="space-y-2">
          <li
            v-for="(rule, i) in rules"
            :key="i"
            class="flex gap-2 text-xs leading-5 text-slate-600"
          >
            <span
              class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-semibold text-sky-700"
            >
              {{ i + 1 }}
            </span>
            <span>{{ rule }}</span>
          </li>
        </ul>

        <h3 class="mt-6 mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          {{ $t('help.exampleTitle') }}
        </h3>
        <div class="mb-2 flex gap-1.5">
          <button
            class="rounded bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-500"
            @click="loadExample"
          >
            {{ $t('help.loadExample') }}
          </button>
          <button
            class="rounded border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
            @click="copyExample"
          >
            {{ copied ? $t('help.copied') : $t('help.copyExample') }}
          </button>
        </div>
        <pre
          class="max-h-72 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-[11px] leading-5 whitespace-pre-wrap text-slate-600"
          >{{ example }}</pre
        >

        <p class="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-800">
          {{ $t('help.tip') }}
        </p>
      </div>
    </aside>
  </div>
</template>
