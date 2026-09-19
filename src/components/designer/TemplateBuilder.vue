<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { parseResume } from '@/markdown/parse'
import { sampleEn } from '@/markdown/samples/sample.en'
import { sampleZh } from '@/markdown/samples/sample.zh'
import { useResumeStore } from '@/stores/useResumeStore'
import SchemaRenderer from '@/templates/schema/SchemaRenderer.vue'
import { defaultSchema, unwrapSchemaFile, wrapSchemaFile } from '@/types/schema'
import type { SchemaBlock, TemplateSchema } from '@/types/schema'

const { t } = useI18n()
const store = useResumeStore()

// ---- 草稿：从零开始的全新模板 ----
const draft = ref<TemplateSchema>(initDraft())

function initDraft(): TemplateSchema {
  const schema = defaultSchema()
  schema.id = `custom-${crypto.randomUUID()}`
  schema.name = t('builder.newName')
  schema.layout = {
    aside: 'none',
    asideWidth: 32,
    main: [{ id: `blk-${crypto.randomUUID()}`, kind: 'header' }],
    side: [],
  }
  return schema
}

// 新建模板统一用示例数据（张三）做预览与素材来源，保证区块 id 稳定（work/education/projects/skills）
const sampleLocale = computed(() => (store.locale === 'en' ? sampleEn : sampleZh))
const resumeData = computed(() => parseResume(sampleLocale.value))
const sections = computed(() => resumeData.value.sections)

const layout = computed(() => {
  // 保证旧草稿也有 layout
  if (!draft.value.layout) {
    draft.value.layout = { aside: 'none', asideWidth: 32, main: [], side: [] }
  }
  return draft.value.layout
})

const paletteSections = computed(() =>
  sections.value.filter((s) => {
    if (!s.title.trim()) return false
    return ![...layout.value.main, ...layout.value.side].some((b) => b.ref === s.id || b.ref === s.kind)
  }),
)

// ---- 拖拽状态 ----
type Zone = 'main' | 'side'
const dragging = ref<{ from: 'palette'; kind: SchemaBlock['kind']; ref?: string } | { from: 'zone'; zone: Zone; blockId: string } | null>(null)
const dropHint = ref<{ zone: Zone; beforeId: string | null } | null>(null)

function paletteAvailable(kind: SchemaBlock['kind'], ref?: string): boolean {
  if (kind === 'divider') return true
  if (kind === 'header') return !layout.value.main.some((b) => b.kind === 'header')
  if (!ref) return false
  return ![...layout.value.main, ...layout.value.side].some((b) => b.ref === ref)
}

function blockName(block: SchemaBlock): string {
  if (block.kind === 'header') return t('builder.blockHeader')
  if (block.kind === 'divider') return t('builder.blockDivider')
  return sectionTitle(block.ref)
}

function sectionTitle(ref: string | undefined): string {
  return sections.value.find((s) => s.id === ref || s.kind === ref)?.title ?? ref ?? '?'
}

// ---- 编排操作 ----
function newBlock(kind: SchemaBlock['kind'], ref?: string): SchemaBlock {
  return { id: `blk-${crypto.randomUUID()}`, kind, ref }
}

function listOf(zone: Zone): SchemaBlock[] {
  return zone === 'main' ? layout.value.main : layout.value.side
}

function insert(zone: Zone, block: SchemaBlock, beforeId: string | null) {
  const list = listOf(zone)
  const idx = beforeId ? list.findIndex((b) => b.id === beforeId) : -1
  if (idx >= 0) list.splice(idx, 0, block)
  else list.push(block)
}

function removeBlock(zone: Zone, blockId: string) {
  const list = listOf(zone)
  const i = list.findIndex((b) => b.id === blockId)
  if (i >= 0) list.splice(i, 1)
}

function onDrop(zone: Zone, beforeId: string | null) {
  if (!dragging.value) {
    dropHint.value = null
    return
  }
  const d = dragging.value
  if (d.from === 'palette') {
    if (d.kind === 'header' && layout.value.main.some((b) => b.kind === 'header')) {
      dropHint.value = null
      return
    }
    insert(zone, newBlock(d.kind, d.ref), beforeId)
  } else {
    if (d.zone === zone && d.blockId === beforeId) {
      dropHint.value = null
      return
    }
    const block = listOf(d.zone).find((b) => b.id === d.blockId)
    if (!block) {
      dropHint.value = null
      return
    }
    removeBlock(d.zone, d.blockId)
    insert(zone, block, beforeId)
  }
  dragging.value = null
  dropHint.value = null
}

function onZoneDragOver(zone: Zone, e: DragEvent) {
  e.preventDefault()
  if (!dragging.value) return
  dropHint.value = { zone, beforeId: null }
}

function onBlockDragOver(zone: Zone, blockId: string, e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (!dragging.value) return
  dropHint.value = { zone, beforeId: blockId }
}

// ---- 侧栏开关 ----
function setAside(mode: 'none' | 'left' | 'right') {
  layout.value.aside = mode
  if (mode === 'none' && layout.value.side.length) {
    // 侧栏关闭时保留内容：并回主栏末尾
    layout.value.main.push(...layout.value.side)
    layout.value.side = []
  }
}

// ---- 保存 / 导入 / 导出 ----
const savedAt = ref(0)

function save() {
  draft.value.name = draft.value.name.trim() || t('builder.newName')
  store.saveCustomSchema(JSON.parse(JSON.stringify(draft.value)))
  savedAt.value = Date.now()
  setTimeout(() => (savedAt.value = 0), 2000)
}

const importInput = ref<HTMLInputElement | null>(null)
const importError = ref(false)

function exportJson() {
  const payload = JSON.stringify(wrapSchemaFile(JSON.parse(JSON.stringify(draft.value))), null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${draft.value.name || 'template'}.template.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

async function onImportFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const schema = unwrapSchemaFile(JSON.parse(await file.text()))
    if (!schema) throw new Error('invalid schema')
    schema.id = `custom-${crypto.randomUUID()}`
    if (!schema.layout) schema.layout = { aside: 'none', asideWidth: 32, main: [], side: [] }
    draft.value = schema
    importError.value = false
  } catch {
    importError.value = true
  }
  input.value = ''
}
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-200">
    <!-- 顶栏 -->
    <header class="flex h-12 shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-900 px-4">
      <button
        class="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
        @click="store.closeDesigner()"
      >
        ← {{ $t('designer.back') }}
      </button>
      <h1 class="text-sm font-semibold">{{ $t('builder.title') }}</h1>
      <input
        v-model="draft.name"
        :placeholder="$t('designer.namePh')"
        class="ml-2 w-52 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs outline-none focus:border-sky-500"
      />
      <span class="flex-1" />
      <span v-if="savedAt" class="text-xs text-emerald-400">{{ $t('designer.saved') }}</span>
      <button class="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700" @click="exportJson">
        {{ $t('designer.exportJson') }}
      </button>
      <button
        class="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
        @click="importInput?.click()"
      >
        {{ $t('designer.importJson') }}
      </button>
      <input ref="importInput" type="file" accept=".json,application/json" class="hidden" @change="onImportFile" />
      <button class="rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-500" @click="save">
        {{ $t('designer.save') }}
      </button>
    </header>

    <p v-if="importError" class="bg-red-500/20 px-4 py-1.5 text-xs text-red-300">
      {{ $t('designer.importFail') }}
    </p>

    <div class="flex min-h-0 flex-1">
      <!-- 左：素材库 -->
      <aside class="w-52 shrink-0 overflow-auto border-r border-slate-800 bg-slate-900/60 p-3">
        <p class="mb-2 text-xs font-medium text-slate-400">{{ $t('builder.palette') }}</p>
        <p class="mb-3 text-[10px] leading-4 text-slate-500">{{ $t('builder.paletteHint') }}</p>
        <div class="space-y-1.5">
          <div
            v-if="paletteAvailable('header')"
            draggable="true"
            class="cursor-grab rounded border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-xs text-slate-200 hover:border-sky-500"
            @dragstart="dragging = { from: 'palette', kind: 'header' }"
            @dragend="dragging = null"
          >
            {{ $t('builder.blockHeader') }}
          </div>
          <div
            v-for="sec in paletteSections"
            :key="sec.id"
            draggable="true"
            class="cursor-grab rounded border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-xs text-slate-200 hover:border-sky-500"
            @dragstart="dragging = { from: 'palette', kind: 'section', ref: sec.id }"
            @dragend="dragging = null"
          >
            {{ sec.title }}
          </div>
          <div
            draggable="true"
            class="cursor-grab rounded border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-xs text-slate-200 hover:border-sky-500"
            @dragstart="dragging = { from: 'palette', kind: 'divider' }"
            @dragend="dragging = null"
          >
            {{ $t('builder.blockDivider') }}
          </div>
        </div>
      </aside>

      <!-- 中：结构编排（拖拽画布） -->
      <div class="flex w-80 shrink-0 flex-col overflow-auto border-r border-slate-800 bg-slate-900/40 p-3">
        <div class="mb-2 flex items-center gap-2">
          <p class="text-xs font-medium text-slate-400">{{ $t('builder.layout') }}</p>
          <span class="flex-1" />
          <button
            v-for="m in ['none', 'left', 'right']"
            :key="m"
            class="rounded px-1.5 py-0.5 text-[11px]"
            :class="layout.aside === m ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
            @click="setAside(m as 'none' | 'left' | 'right')"
          >
            {{ $t(`builder.aside_${m}`) }}
          </button>
        </div>
        <template v-if="layout.aside !== 'none'">
          <div class="mb-1 flex items-center gap-2">
            <p class="text-xs font-medium text-slate-400">{{ $t('builder.asideWidth') }}</p>
            <span class="text-[10px] text-slate-500">{{ layout.asideWidth }}%</span>
          </div>
          <input
            v-model.number="layout.asideWidth"
            type="range"
            min="20"
            max="45"
            step="1"
            class="mb-3 w-full accent-sky-600"
          />
        </template>

        <p class="mb-1 text-xs font-medium text-slate-400">{{ $t('builder.main') }}</p>
        <div
          class="flex-1 space-y-1.5 rounded-lg border border-dashed p-2"
          :class="dropHint?.zone === 'main' && !dropHint.beforeId ? 'border-sky-500 bg-sky-500/5' : 'border-slate-700'"
          @dragover="onZoneDragOver('main', $event)"
          @drop.prevent="onDrop('main', null)"
        >
          <p v-if="!layout.main.length" class="py-6 text-center text-[11px] text-slate-600">
            {{ $t('builder.dropHere') }}
          </p>
          <div
            v-for="b in layout.main"
            :key="b.id"
            class="group flex items-center justify-between rounded border bg-slate-800/80 px-2 py-1.5"
            :class="[
              dropHint?.zone === 'main' && dropHint.beforeId === b.id ? 'border-t-2 border-t-sky-500' : 'border-transparent',
            ]"
            draggable="true"
            @dragstart="dragging = { from: 'zone', zone: 'main', blockId: b.id }"
            @dragend="dragging = null"
            @dragover="onBlockDragOver('main', b.id, $event)"
            @drop.prevent="onDrop('main', b.id)"
          >
            <span class="cursor-grab truncate text-xs text-slate-200">⠿ {{ blockName(b) }}</span>
            <button
              class="hidden rounded px-1 text-xs text-slate-500 group-hover:block hover:text-red-400"
              :title="$t('builder.remove')"
              @click.stop="removeBlock('main', b.id)"
            >
              ✕
            </button>
          </div>
        </div>

        <template v-if="layout.aside !== 'none'">
          <p class="mb-1 mt-3 text-xs font-medium text-slate-400">{{ $t('builder.side') }}</p>
          <div
            class="flex-1 space-y-1.5 rounded-lg border border-dashed p-2"
            :class="dropHint?.zone === 'side' && !dropHint.beforeId ? 'border-sky-500 bg-sky-500/5' : 'border-slate-700'"
            @dragover="onZoneDragOver('side', $event)"
            @drop.prevent="onDrop('side', null)"
          >
            <p v-if="!layout.side.length" class="py-6 text-center text-[11px] text-slate-600">
              {{ $t('builder.dropHere') }}
            </p>
            <div
              v-for="b in layout.side"
              :key="b.id"
              class="group flex items-center justify-between rounded border bg-slate-800/80 px-2 py-1.5"
              :class="[
                dropHint?.zone === 'side' && dropHint.beforeId === b.id ? 'border-t-2 border-t-sky-500' : 'border-transparent',
              ]"
              draggable="true"
              @dragstart="dragging = { from: 'zone', zone: 'side', blockId: b.id }"
              @dragend="dragging = null"
              @dragover="onBlockDragOver('side', b.id, $event)"
              @drop.prevent="onDrop('side', b.id)"
            >
              <span class="cursor-grab truncate text-xs text-slate-200">⠿ {{ blockName(b) }}</span>
              <button
                class="hidden rounded px-1 text-xs text-slate-500 group-hover:block hover:text-red-400"
                :title="$t('builder.remove')"
                @click.stop="removeBlock('side', b.id)"
              >
                ✕
              </button>
            </div>
          </div>
        </template>
        <p v-else class="mt-3 text-[10px] leading-4 text-slate-600">{{ $t('builder.sideOffHint') }}</p>
      </div>

      <!-- 右：实时预览 -->
      <main class="min-w-0 flex-1 overflow-auto bg-slate-800 p-6">
        <div class="mx-auto" style="width: 794px">
          <div class="resume-page rounded-sm bg-white shadow-xl" style="min-height: 1123px; width: 794px">
            <SchemaRenderer :schema="draft" :data="resumeData" :photo="store.activeDoc?.photo" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
