<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { parseResume } from '@/markdown/parse'
import { useResumeStore } from '@/stores/useResumeStore'
import { templates } from '@/templates/registry'
import { effectiveOrder } from '@/templates/shared/sectionOrder'
import { fileToDataUrl } from '@/utils/image'
import type { Density } from '@/types/resume'

// CM6 较大，CssEditor 懒加载，避免拖累主包
const CssEditor = defineAsyncComponent(() => import('./CssEditor.vue'))

const { t: $t } = useI18n()
const store = useResumeStore()

const showCssEditor = ref(false)
const presetInput = ref<HTMLInputElement | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)

async function onPhoto(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.size > 1_000_000) {
    window.alert($t('style.photoTooLarge'))
    input.value = ''
    return
  }
  try {
    store.setPhoto(await fileToDataUrl(file))
  } catch {
    window.alert($t('style.photoFail'))
  }
  input.value = ''
}

const parsed = computed(() => parseResume(store.markdown))
const orderedIds = computed(() =>
  effectiveOrder(parsed.value.sections, store.styleOptions.sectionOrder),
)
const titleOf = (id: string) => parsed.value.sections.find((s) => s.id === id)?.title ?? id

function moveSection(id: string, dir: -1 | 1) {
  const ids = [...orderedIds.value]
  const i = ids.indexOf(id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= ids.length) return
  ;[ids[i], ids[j]] = [ids[j], ids[i]]
  store.setOption('sectionOrder', ids)
}

const SWATCHES = ['#1d4ed8', '#0f766e', '#b45309', '#4338ca', '#be123c', '#111827']

const FONT_SCALES = [
  { label: 'style.small', value: 0.85 },
  { label: 'style.standard', value: 1 },
  { label: 'style.large', value: 1.15 },
]

const DENSITIES: { label: string; value: Density }[] = [
  { label: 'style.compact', value: 'compact' },
  { label: 'style.standard', value: 'standard' },
  { label: 'style.relaxed', value: 'relaxed' },
]

const presetName = ref('')

function onSavePreset() {
  if (store.savePreset(presetName.value)) presetName.value = ''
}

function exportPresets() {
  const payload = JSON.stringify({ version: 1, presets: store.presets }, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'resume-presets.json'
  a.click()
  URL.revokeObjectURL(url)
}

async function onPresetFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    const list = Array.isArray(data) ? data : Array.isArray(data?.presets) ? data.presets : null
    if (!list || store.importPresets(list) === 0) throw new Error('no valid presets')
  } catch {
    window.alert($t('style.importFail'))
  }
  input.value = ''
}

const templateName = (id: string) => templates.find((t) => t.id === id)?.name ?? id

const active = 'bg-sky-600 text-white'
const idle = 'bg-slate-100 text-slate-600 hover:bg-slate-200'
</script>

<template>
  <div
    class="max-h-[75vh] w-72 overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-2xl"
  >
    <p class="px-1 pb-1 text-xs font-medium text-slate-500">{{ $t('style.title') }}</p>

    <div class="space-y-3 p-1">
      <div>
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('style.accent') }}</p>
        <div class="flex items-center gap-1.5">
          <button
            v-for="c in SWATCHES"
            :key="c"
            class="h-6 w-6 rounded-full border-2"
            :class="
              store.styleOptions.accentColor.toLowerCase() === c ? 'border-sky-500' : 'border-transparent'
            "
            :style="{ backgroundColor: c }"
            :title="c"
            @click="store.setOption('accentColor', c)"
          />
          <input
            type="color"
            class="ml-auto h-6 w-9 cursor-pointer rounded border border-slate-200 bg-white"
            :value="store.styleOptions.accentColor"
            :title="$t('style.customColor')"
            @input="store.setOption('accentColor', ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <div>
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('style.font') }}</p>
        <div class="flex gap-1">
          <button
            class="flex-1 rounded px-2 py-1 text-xs"
            :class="store.styleOptions.fontFamily === 'sans' ? active : idle"
            @click="store.setOption('fontFamily', 'sans')"
          >
            {{ $t('style.sans') }}
          </button>
          <button
            class="flex-1 rounded px-2 py-1 text-xs"
            :class="store.styleOptions.fontFamily === 'serif' ? active : idle"
            @click="store.setOption('fontFamily', 'serif')"
          >
            {{ $t('style.serif') }}
          </button>
        </div>
      </div>

      <div>
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('style.fontScale') }}</p>
        <div class="flex gap-1">
          <button
            v-for="f in FONT_SCALES"
            :key="f.value"
            class="flex-1 rounded px-2 py-1 text-xs"
            :class="store.styleOptions.fontScale === f.value ? active : idle"
            @click="store.setOption('fontScale', f.value)"
          >
            {{ $t(f.label) }}
          </button>
        </div>
      </div>

      <div>
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('style.density') }}</p>
        <div class="flex gap-1">
          <button
            v-for="d in DENSITIES"
            :key="d.value"
            class="flex-1 rounded px-2 py-1 text-xs"
            :class="store.styleOptions.density === d.value ? active : idle"
            @click="store.setOption('density', d.value)"
          >
            {{ $t(d.label) }}
          </button>
        </div>
      </div>

      <div>
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('style.header') }}</p>
        <div class="flex gap-1">
          <button
            class="flex-1 rounded px-2 py-1 text-xs"
            :class="store.styleOptions.headerLayout === 'center' ? active : idle"
            @click="store.setOption('headerLayout', 'center')"
          >
            {{ $t('style.centered') }}
          </button>
          <button
            class="flex-1 rounded px-2 py-1 text-xs"
            :class="store.styleOptions.headerLayout === 'left' ? active : idle"
            @click="store.setOption('headerLayout', 'left')"
          >
            {{ $t('style.left') }}
          </button>
        </div>
      </div>

      <div>
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('style.icons') }}</p>
        <label class="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            class="accent-sky-600"
            :checked="store.styleOptions.showIcons"
            @change="store.setOption('showIcons', ($event.target as HTMLInputElement).checked)"
          />
          {{ $t('style.iconsHint') }}
        </label>
      </div>

      <div>
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('style.photo') }}</p>
        <div class="flex items-center gap-2">
          <img
            v-if="store.activeDoc?.photo"
            :src="store.activeDoc.photo"
            class="h-10 w-10 rounded-full object-cover"
            alt=""
          />
          <button
            class="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200"
            @click="photoInput?.click()"
          >
            {{ store.activeDoc?.photo ? $t('style.photoReplace') : $t('style.photoUpload') }}
          </button>
          <button
            v-if="store.activeDoc?.photo"
            class="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200"
            @click="store.setPhoto(null)"
          >
            {{ $t('style.photoRemove') }}
          </button>
          <input ref="photoInput" type="file" accept="image/*" class="hidden" @change="onPhoto" />
        </div>
        <p class="mt-1 text-[10px] leading-4 text-slate-400">{{ $t('style.photoHint') }}</p>
        <div v-if="store.activeDoc?.photo" class="mt-1.5 flex items-center gap-2">
          <span class="shrink-0 text-[10px] text-slate-400">{{ $t('style.photoSize') }}</span>
          <input
            type="range"
            min="0.6"
            max="1.6"
            step="0.05"
            :value="store.activeDoc?.photoScale ?? 1"
            class="min-w-0 flex-1 accent-sky-600"
            @input="
              store.setPhotoScale(Number(($event.target as HTMLInputElement).value))
            "
          />
          <span class="w-10 shrink-0 text-right text-[10px] text-slate-500">
            {{ Math.round((store.activeDoc?.photoScale ?? 1) * 100) }}%
          </span>
        </div>
      </div>

      <div v-if="orderedIds.length > 1">
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('style.order') }}</p>
        <div class="space-y-1">
          <div
            v-for="(id, i) in orderedIds"
            :key="id"
            class="flex items-center justify-between rounded bg-slate-50 px-2 py-1"
          >
            <span class="truncate text-xs text-slate-600">{{ titleOf(id) }}</span>
            <span class="flex gap-0.5">
              <button
                class="rounded px-1.5 text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                :disabled="i === 0"
                :title="$t('style.moveUp')"
                @click="moveSection(id, -1)"
              >
                ↑
              </button>
              <button
                class="rounded px-1.5 text-xs text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                :disabled="i === orderedIds.length - 1"
                :title="$t('style.moveDown')"
                @click="moveSection(id, 1)"
              >
                ↓
              </button>
            </span>
          </div>
        </div>
      </div>

      <div>
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('css.title') }}</p>
        <button
          class="flex w-full items-center justify-between rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          @click="showCssEditor = true"
        >
          {{ $t('css.edit') }}
          <span
            v-if="store.customCss"
            class="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700"
          >
            {{ $t('css.enabled') }}
          </span>
        </button>
      </div>

      <div>
        <p class="mb-1 text-[11px] font-medium text-slate-400">{{ $t('style.presets') }}</p>
        <div class="flex gap-1">
          <input
            v-model="presetName"
            :placeholder="$t('style.presetName')"
            class="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400"
            @keyup.enter="onSavePreset"
          />
          <button
            class="rounded bg-sky-600 px-2 py-1 text-xs font-medium text-white hover:bg-sky-500"
            @click="onSavePreset"
          >
            {{ $t('style.save') }}
          </button>
        </div>
        <div class="mt-1 flex gap-1">
          <button
            class="flex-1 rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200"
            :disabled="store.presets.length === 0"
            :class="{ 'cursor-not-allowed opacity-40': store.presets.length === 0 }"
            @click="exportPresets"
          >
            {{ $t('style.presetsExport') }}
          </button>
          <button
            class="flex-1 rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-200"
            @click="presetInput?.click()"
          >
            {{ $t('style.presetsImport') }}
          </button>
          <input
            ref="presetInput"
            type="file"
            accept=".json,application/json"
            class="hidden"
            @change="onPresetFile"
          />
        </div>
        <div v-if="store.presets.length" class="mt-1.5 space-y-1">
          <div
            v-for="p in store.presets"
            :key="p.id"
            class="flex items-center justify-between rounded bg-slate-50 px-2 py-1"
          >
            <span
              class="min-w-0 truncate text-xs text-slate-600"
              :title="`${p.name}（${templateName(p.templateId)}）`"
            >
              {{ p.name }} · {{ templateName(p.templateId) }}
            </span>
            <span class="flex shrink-0 gap-1">
              <button
                class="rounded px-1.5 text-xs text-sky-600 hover:bg-slate-200"
                @click="store.applyPreset(p.id)"
              >
                {{ $t('style.apply') }}
              </button>
              <button
                class="rounded px-1.5 text-xs text-slate-400 hover:bg-slate-200"
                @click="store.deletePreset(p.id)"
              >
                {{ $t('style.delete') }}
              </button>
            </span>
          </div>
        </div>
      </div>

      <button
        class="w-full rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
        @click="store.resetStyle()"
      >
        {{ $t('style.reset') }}
      </button>
    </div>

    <CssEditor v-if="showCssEditor" @close="showCssEditor = false" />
  </div>
</template>
