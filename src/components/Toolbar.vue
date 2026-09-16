<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { sampleEn } from '@/markdown/samples/sample.en'
import { sampleZh } from '@/markdown/samples/sample.zh'
import { useResumeStore } from '@/stores/useResumeStore'
import FileMenu from './FileMenu.vue'
import HelpDrawer from './HelpDrawer.vue'
import ResumeManager from './ResumeManager.vue'
import StylePanel from './StylePanel.vue'
import TemplatePicker from './TemplatePicker.vue'

const { t } = useI18n()
const store = useResumeStore()

const openPanel = ref<'resumes' | 'template' | 'style' | 'file' | null>(null)
const toolbarRef = ref<HTMLElement | null>(null)
const helpOpen = ref(false)

function toggle(panel: 'resumes' | 'template' | 'style' | 'file') {
  openPanel.value = openPanel.value === panel ? null : panel
}

function loadSample() {
  store.setMarkdown(store.locale === 'en' ? sampleEn : sampleZh)
}

function toggleLocale() {
  store.locale = store.locale === 'zh-CN' ? 'en' : 'zh-CN'
}

function exportPdf() {
  // Chrome 以页面标题命名 PDF：临时换成简历名，导出文件即「<简历名>-简历.pdf」，
  // 也避免多次导出同名覆盖 / 误开旧文件
  const previous = document.title
  document.title = `${store.activeDoc?.name ?? 'resume'}-${t('toolbar.resume')}`
  window.print()
  document.title = previous
}

// 点击工具栏以外区域时收起下拉面板
function onDocMouseDown(e: MouseEvent) {
  if (openPanel.value && toolbarRef.value && !toolbarRef.value.contains(e.target as Node)) {
    openPanel.value = null
  }
}

onMounted(() => document.addEventListener('mousedown', onDocMouseDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocMouseDown))
</script>

<template>
  <header
    ref="toolbarRef"
    class="app-toolbar flex h-12 shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4"
  >
    <!-- 左侧：标识 + 当前简历切换器 -->
    <div class="relative flex min-w-0 items-center gap-2">
      <img src="/favicon.svg" alt="" class="h-5 w-5 shrink-0" />
      <h1 class="hidden shrink-0 text-sm font-semibold tracking-wide lg:block">MD Resume</h1>
      <span class="mx-0.5 h-4 w-px shrink-0 bg-slate-700" />
      <button
        class="flex min-w-0 items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700"
        :class="openPanel === 'resumes' ? 'bg-sky-600 hover:bg-sky-500' : ''"
        :title="$t('manager.title')"
        @click="toggle('resumes')"
      >
        <span class="max-w-36 truncate">{{ store.activeDoc?.name }}</span>
        <span class="text-slate-500">▾</span>
      </button>

      <div v-if="openPanel === 'resumes'" class="absolute left-0 top-full z-20 mt-2">
        <ResumeManager @close="openPanel = null" />
      </div>
    </div>

    <!-- 右侧：功能按钮 -->
    <div class="relative flex shrink-0 items-center gap-2">
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
      <button
        class="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
        :title="$t('help.open')"
        @click="helpOpen = true"
      >
        ?
      </button>

      <div v-if="openPanel && openPanel !== 'resumes'" class="absolute right-0 top-full z-20 mt-2">
        <TemplatePicker v-if="openPanel === 'template'" @close="openPanel = null" />
        <StylePanel v-else-if="openPanel === 'style'" />
        <FileMenu v-else />
      </div>
    </div>

    <HelpDrawer v-if="helpOpen" @close="helpOpen = false" />
  </header>
</template>
