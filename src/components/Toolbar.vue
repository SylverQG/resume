<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { sampleEn } from '@/markdown/samples/sample.en'
import { sampleZh } from '@/markdown/samples/sample.zh'
import { useResumeStore } from '@/stores/useResumeStore'
import FileMenu from './FileMenu.vue'
import StylePanel from './StylePanel.vue'
import TemplatePicker from './TemplatePicker.vue'

const store = useResumeStore()

const openPanel = ref<'template' | 'style' | 'file' | null>(null)
const controls = ref<HTMLElement | null>(null)

function toggle(panel: 'template' | 'style' | 'file') {
  openPanel.value = openPanel.value === panel ? null : panel
}

function loadSample() {
  store.setMarkdown(store.locale === 'en' ? sampleEn : sampleZh)
}

function toggleLocale() {
  store.locale = store.locale === 'zh-CN' ? 'en' : 'zh-CN'
}

function exportPdf() {
  window.print()
}

function onDocMouseDown(e: MouseEvent) {
  if (openPanel.value && controls.value && !controls.value.contains(e.target as Node)) {
    openPanel.value = null
  }
}

onMounted(() => document.addEventListener('mousedown', onDocMouseDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocMouseDown))
</script>

<template>
  <header
    class="app-toolbar flex h-12 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4"
  >
    <div class="flex items-center gap-2">
      <img src="/favicon.svg" alt="" class="h-5 w-5" />
      <h1 class="text-sm font-semibold tracking-wide">MD Resume</h1>
    </div>

    <div ref="controls" class="relative flex items-center gap-2">
      <button
        class="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
        @click="loadSample"
      >
        {{ $t('toolbar.sample') }}
      </button>
      <button
        class="rounded px-2.5 py-1 text-xs"
        :class="openPanel === 'file' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
        @click="toggle('file')"
      >
        {{ $t('file.file') }}
      </button>
      <button
        class="rounded bg-sky-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-sky-500"
        :title="$t('toolbar.exportTip')"
        @click="exportPdf"
      >
        {{ $t('toolbar.export') }}
      </button>
      <button
        class="rounded px-2.5 py-1 text-xs"
        :class="openPanel === 'template' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
        @click="toggle('template')"
      >
        {{ $t('toolbar.template') }}
      </button>
      <button
        class="rounded px-2.5 py-1 text-xs"
        :class="openPanel === 'style' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
        @click="toggle('style')"
      >
        {{ $t('toolbar.style') }}
      </button>
      <button
        class="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
        @click="toggleLocale"
      >
        {{ store.locale === 'zh-CN' ? 'EN' : '中文' }}
      </button>

      <div v-if="openPanel" class="absolute right-0 top-full z-20 mt-2">
        <TemplatePicker v-if="openPanel === 'template'" @close="openPanel = null" />
        <StylePanel v-else-if="openPanel === 'style'" />
        <FileMenu v-else />
      </div>
    </div>
  </header>
</template>
