<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { parseResume } from '@/markdown/parse'
import { useResumeStore } from '@/stores/useResumeStore'
import SchemaRenderer from '@/templates/schema/SchemaRenderer.vue'
import { defaultSchema, unwrapSchemaFile, wrapSchemaFile } from '@/types/schema'
import type { TemplateSchema } from '@/types/schema'

const { t } = useI18n()
const store = useResumeStore()

// 草稿：编辑中的 schema（深拷贝，保存时才写入 store）
const draft = ref<TemplateSchema>(initDraft())

function initDraft(): TemplateSchema {
  const existing = store.designerSchemaId
    ? store.findCustomSchema(store.designerSchemaId)
    : undefined
  const base = existing ?? defaultSchema()
  const clone = JSON.parse(JSON.stringify(base)) as TemplateSchema
  if (!existing) clone.id = `custom-${crypto.randomUUID()}`
  return clone
}

const resumeData = computed(() => parseResume(store.markdown))
const sections = computed(() => resumeData.value.sections)

// ---- 保存 ----
const savedAt = ref(0)

function save() {
  draft.value.name = draft.value.name.trim() || t('designer.namePh')
  store.saveCustomSchema(JSON.parse(JSON.stringify(draft.value)))
  savedAt.value = Date.now()
  setTimeout(() => (savedAt.value = 0), 2000)
}

// ---- 导入 / 导出 ----
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
    // 与内置模板 id 冲突时重建 id
    const id = crypto.randomUUID()
    schema.id = id
    draft.value = schema
    importError.value = false
  } catch {
    importError.value = true
  }
  input.value = ''
}

// ---- 区块顺序 / 显隐 ----
function moveSection(id: string, dir: -1 | 1) {
  const order = currentOrder()
  const i = order.indexOf(id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= order.length) return
  ;[order[i], order[j]] = [order[j], order[i]]
  draft.value.section.order = order
}

function currentOrder(): string[] {
  const effective = sectionsOrderFallback()
  const i = draft.value.section.order
  return i.length ? i : effective
}

function sectionsOrderFallback(): string[] {
  return sections.value.map((s) => s.id)
}

function isHidden(id: string): boolean {
  return draft.value.section.hidden.includes(id)
}

function toggleHidden(id: string) {
  const hidden = new Set(draft.value.section.hidden)
  if (hidden.has(id)) hidden.delete(id)
  else hidden.add(id)
  draft.value.section.hidden = [...hidden]
}

// ---- 选项枚举 ----
const active = 'bg-sky-600 text-white'
const idle = 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
      <h1 class="text-sm font-semibold">{{ $t('designer.title') }}</h1>
      <input
        v-model="draft.name"
        :placeholder="$t('designer.namePh')"
        class="ml-2 w-56 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs outline-none focus:border-sky-500"
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

    <!-- 三栏主体 -->
    <div class="flex min-h-0 flex-1">
      <!-- 左：内容区块 -->
      <aside class="w-64 shrink-0 overflow-auto border-r border-slate-800 bg-slate-900/60 p-3">
        <p class="mb-2 text-xs font-medium text-slate-400">{{ $t('designer.content') }}</p>

        <div class="space-y-2">
          <label class="flex items-center justify-between text-xs text-slate-300">
            {{ $t('designer.headerShow') }}
            <input v-model="draft.header.show" type="checkbox" class="accent-sky-600" />
          </label>
          <label class="flex items-center justify-between text-xs text-slate-300">
            {{ $t('designer.summaryShow') }}
            <input v-model="draft.header.showSummary" type="checkbox" class="accent-sky-600" />
          </label>
          <label class="flex items-center justify-between text-xs text-slate-300">
            {{ $t('designer.photoShow') }}
            <input v-model="draft.header.photo.show" type="checkbox" class="accent-sky-600" />
          </label>
        </div>

        <p class="mb-1 mt-4 text-xs font-medium text-slate-400">{{ $t('designer.order') }}</p>
        <p class="mb-1.5 text-[10px] leading-4 text-slate-500">{{ $t('designer.contentHint') }}</p>
        <div class="space-y-1">
          <div
            v-for="(sec, i) in sections"
            :key="sec.id"
            class="flex items-center justify-between rounded bg-slate-800/70 px-2 py-1"
          >
            <label class="flex min-w-0 cursor-pointer items-center gap-1.5 text-xs text-slate-200">
              <input
                type="checkbox"
                class="accent-sky-600"
                :checked="!isHidden(sec.id)"
                @change="toggleHidden(sec.id)"
              />
              <span class="truncate">{{ sec.title }}</span>
            </label>
            <span class="flex shrink-0">
              <button
                class="rounded px-1 text-xs text-slate-400 hover:bg-slate-700 disabled:opacity-30"
                :disabled="i === 0"
                :title="$t('designer.up')"
                @click="moveSection(sec.id, -1)"
              >
                ↑
              </button>
              <button
                class="rounded px-1 text-xs text-slate-400 hover:bg-slate-700 disabled:opacity-30"
                :disabled="i === sections.length - 1"
                :title="$t('designer.down')"
                @click="moveSection(sec.id, 1)"
              >
                ↓
              </button>
            </span>
          </div>
        </div>
      </aside>

      <!-- 中：实时预览 -->
      <main class="min-w-0 flex-1 overflow-auto bg-slate-800 p-6">
        <div class="mx-auto" style="width: 794px">
          <div
            class="resume-page rounded-sm bg-white shadow-xl"
            style="min-height: 1123px; width: 794px"
          >
            <SchemaRenderer
              :schema="draft"
              :data="resumeData"
              :photo="store.activeDoc?.photo"
            />
          </div>
        </div>
      </main>

      <!-- 右：属性面板 -->
      <aside class="w-72 shrink-0 overflow-auto border-l border-slate-800 bg-slate-900/60 p-3">
        <div class="space-y-3.5">
          <div>
            <p class="mb-1 text-xs font-medium text-slate-400">{{ $t('designer.page') }}</p>
            <label class="mb-1 block text-[11px] text-slate-500">{{ $t('designer.padY') }}</label>
            <input
              v-model.number="draft.page.padY"
              type="range"
              min="6"
              max="25"
              step="1"
              class="w-full accent-sky-600"
            />
            <label class="mb-1 block text-[11px] text-slate-500">{{ $t('designer.padX') }}</label>
            <input
              v-model.number="draft.page.padX"
              type="range"
              min="6"
              max="25"
              step="1"
              class="w-full accent-sky-600"
            />
            <label class="mb-1 mt-1 block text-[11px] text-slate-500">{{ $t('designer.pageBg') }}</label>
            <input
              type="color"
              :value="draft.page.bg"
              class="h-6 w-12 cursor-pointer rounded border border-slate-700 bg-transparent"
              @input="draft.page.bg = ($event.target as HTMLInputElement).value"
            />
          </div>

          <div>
            <p class="mb-1 text-xs font-medium text-slate-400">{{ $t('designer.colors') }}</p>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center gap-1.5 text-[11px] text-slate-400">
                {{ $t('designer.accent') }}
                <input
                  type="color"
                  :value="draft.colors.accent"
                  class="ml-auto h-6 w-9 cursor-pointer rounded border border-slate-700 bg-transparent"
                  @input="draft.colors.accent = ($event.target as HTMLInputElement).value"
                />
              </label>
              <label class="flex items-center gap-1.5 text-[11px] text-slate-400">
                {{ $t('designer.textColor') }}
                <input
                  type="color"
                  :value="draft.colors.text"
                  class="ml-auto h-6 w-9 cursor-pointer rounded border border-slate-700 bg-transparent"
                  @input="draft.colors.text = ($event.target as HTMLInputElement).value"
                />
              </label>
              <label class="flex items-center gap-1.5 text-[11px] text-slate-400">
                {{ $t('designer.mutedColor') }}
                <input
                  type="color"
                  :value="draft.colors.muted"
                  class="ml-auto h-6 w-9 cursor-pointer rounded border border-slate-700 bg-transparent"
                  @input="draft.colors.muted = ($event.target as HTMLInputElement).value"
                />
              </label>
              <label class="flex items-center gap-1.5 text-[11px] text-slate-400">
                {{ $t('designer.hairline') }}
                <input
                  type="color"
                  :value="draft.colors.hairline"
                  class="ml-auto h-6 w-9 cursor-pointer rounded border border-slate-700 bg-transparent"
                  @input="draft.colors.hairline = ($event.target as HTMLInputElement).value"
                />
              </label>
            </div>
          </div>

          <div>
            <p class="mb-1 text-xs font-medium text-slate-400">{{ $t('designer.font') }}</p>
            <div class="mb-1.5 flex gap-1">
              <button
                class="flex-1 rounded px-2 py-1 text-xs"
                :class="draft.font.family === 'sans' ? active : idle"
                @click="draft.font.family = 'sans'"
              >
                {{ $t('designer.sans') }}
              </button>
              <button
                class="flex-1 rounded px-2 py-1 text-xs"
                :class="draft.font.family === 'serif' ? active : idle"
                @click="draft.font.family = 'serif'"
              >
                {{ $t('designer.serif') }}
              </button>
            </div>
            <label class="mb-1 block text-[11px] text-slate-500">{{ $t('designer.fontScale') }}</label>
            <input
              v-model.number="draft.font.scale"
              type="range"
              min="0.85"
              max="1.15"
              step="0.05"
              class="w-full accent-sky-600"
            />
          </div>

          <div>
            <p class="mb-1 text-xs font-medium text-slate-400">{{ $t('designer.header') }}</p>
            <p class="mb-1 text-[11px] text-slate-500">{{ $t('designer.layout') }}</p>
            <div class="mb-1.5 flex gap-1">
              <button
                class="flex-1 rounded px-2 py-1 text-xs"
                :class="draft.header.layout === 'center' ? active : idle"
                @click="draft.header.layout = 'center'"
              >
                {{ $t('designer.centered') }}
              </button>
              <button
                class="flex-1 rounded px-2 py-1 text-xs"
                :class="draft.header.layout === 'left' ? active : idle"
                @click="draft.header.layout = 'left'"
              >
                {{ $t('designer.left') }}
              </button>
            </div>
            <label class="mb-1 block text-[11px] text-slate-500">{{ $t('designer.headerBg') }}</label>
            <div class="mb-1.5 flex items-center gap-2">
              <button
                class="rounded px-2 py-1 text-[11px]"
                :class="draft.header.bg === 'none' ? active : idle"
                @click="draft.header.bg = 'none'"
              >
                {{ $t('designer.headerBgNone') }}
              </button>
              <input
                type="color"
                :value="draft.header.bg === 'none' ? '#4338ca' : draft.header.bg"
                class="h-6 w-12 cursor-pointer rounded border border-slate-700 bg-transparent"
                :title="$t('designer.headerBg')"
                @input="draft.header.bg = ($event.target as HTMLInputElement).value"
              />
              <label class="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
                {{ $t('designer.headerText') }}
                <input
                  type="color"
                  :value="draft.header.bgText"
                  class="h-6 w-9 cursor-pointer rounded border border-slate-700 bg-transparent"
                  @input="draft.header.bgText = ($event.target as HTMLInputElement).value"
                />
              </label>
            </div>
            <label class="mb-1 block text-[11px] text-slate-500">{{ $t('designer.photoHeight') }}</label>
            <input
              v-model.number="draft.header.photo.height"
              type="range"
              min="56"
              max="140"
              step="2"
              class="w-full accent-sky-600"
            />
          </div>

          <div>
            <p class="mb-1 text-xs font-medium text-slate-400">{{ $t('designer.body') }}</p>
            <p class="mb-1 text-[11px] text-slate-500">{{ $t('designer.columns') }}</p>
            <div class="mb-1.5 flex gap-1">
              <button
                class="flex-1 rounded px-2 py-1 text-xs"
                :class="draft.body.columns === 1 ? active : idle"
                @click="draft.body.columns = 1"
              >
                {{ $t('designer.single') }}
              </button>
              <button
                class="flex-1 rounded px-2 py-1 text-xs"
                :class="draft.body.columns === 2 ? active : idle"
                @click="draft.body.columns = 2"
              >
                {{ $t('designer.two') }}
              </button>
            </div>
            <label class="mb-1 block text-[11px] text-slate-500">{{ $t('designer.columnGap') }}</label>
            <input
              v-model.number="draft.body.columnGap"
              type="range"
              min="12"
              max="48"
              step="2"
              class="w-full accent-sky-600"
            />
          </div>

          <div>
            <p class="mb-1 text-xs font-medium text-slate-400">{{ $t('designer.sectionStyle') }}</p>
            <p class="mb-1 text-[11px] text-slate-500">{{ $t('designer.titleStyle') }}</p>
            <div class="mb-1.5 grid grid-cols-4 gap-1">
              <button
                v-for="s in ['underline', 'bar', 'plain', 'boxed']"
                :key="s"
                class="rounded px-1 py-1 text-[11px]"
                :class="draft.section.titleStyle === s ? active : idle"
                @click="draft.section.titleStyle = s as TemplateSchema['section']['titleStyle']"
              >
                {{ $t(`designer.ts_${s}`) }}
              </button>
            </div>
            <p class="mb-1 text-[11px] text-slate-500">{{ $t('designer.bullets') }}</p>
            <div class="mb-1.5 grid grid-cols-3 gap-1">
              <button
                v-for="b in ['disc', 'dash', 'none']"
                :key="b"
                class="rounded px-1 py-1 text-[11px]"
                :class="draft.section.bullets === b ? active : idle"
                @click="draft.section.bullets = b as TemplateSchema['section']['bullets']"
              >
                {{ $t(`designer.bl_${b}`) }}
              </button>
            </div>
            <label class="flex items-center justify-between text-xs text-slate-300">
              {{ $t('designer.skillChips') }}
              <input v-model="draft.section.skillChips" type="checkbox" class="accent-sky-600" />
            </label>
            <label class="mt-1 flex items-center justify-between text-xs text-slate-300">
              {{ $t('designer.icons') }}
              <input v-model="draft.section.showIcons" type="checkbox" class="accent-sky-600" />
            </label>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
