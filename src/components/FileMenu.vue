<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { fromJsonResume, toJsonResume } from '@/markdown/jsonresume'
import { parseResume } from '@/markdown/parse'
import { useResumeStore } from '@/stores/useResumeStore'
import type { Locale } from '@/i18n'

const emit = defineEmits<{ close: [] }>()

const store = useResumeStore()
const { t: $t } = useI18n()
const mdInput = ref<HTMLInputElement | null>(null)
const jrInput = ref<HTMLInputElement | null>(null)

function run(action: () => void) {
  action()
  emit('close')
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportMd() {
  download('resume.md', store.markdown, 'text/markdown;charset=utf-8')
}

function exportJsonResume() {
  const jr = toJsonResume(parseResume(store.markdown))
  download('resume.json', JSON.stringify(jr, null, 2), 'application/json')
}

async function onMdFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) store.setMarkdown(await file.text())
  input.value = ''
}

async function onJsonResumeFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    if (typeof data !== 'object' || data === null) throw new Error('bad json resume')
    store.setMarkdown(fromJsonResume(data, store.locale as Locale))
  } catch {
    window.alert($t('file.importFail'))
  }
  input.value = ''
}
</script>

<template>
  <div class="w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-2xl">
    <button
      class="block w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
      @click="run(() => mdInput?.click())"
    >
      {{ $t('file.importMd') }}
    </button>
    <button
      class="block w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
      @click="run(exportMd)"
    >
      {{ $t('file.exportMd') }}
    </button>
    <div class="my-1 border-t border-slate-100" />
    <button
      class="block w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
      @click="run(() => jrInput?.click())"
    >
      {{ $t('file.importJr') }}
    </button>
    <button
      class="block w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
      @click="run(exportJsonResume)"
    >
      {{ $t('file.exportJr') }}
    </button>

    <input
      ref="mdInput"
      type="file"
      accept=".md,.markdown,.txt,text/markdown,text/plain"
      class="hidden"
      @change="onMdFile"
    />
    <input ref="jrInput" type="file" accept=".json,application/json" class="hidden" @change="onJsonResumeFile" />
  </div>
</template>
