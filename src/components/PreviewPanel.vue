<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import { parseResume } from '@/markdown/parse'
import { useResumeStore } from '@/stores/useResumeStore'
import { getTemplate } from '@/templates/registry'
import { applySectionOrder } from '@/templates/shared/sectionOrder'
import { styleVars } from '@/templates/shared/styleVars'
import { contactItems } from '@/templates/shared/useContacts'
import type { Density, ResumeData } from '@/types/resume'

/** A4 高度 @96dpi（与 --page-height 同源，§3.6） */
const PAGE_HEIGHT = 1123

const store = useResumeStore()

// 派生数据不进 store：markdown 变化 → 重新解析 + 应用区块排序（§3.4）
const resumeData = computed<ResumeData>(() => {
  const base = parseResume(store.markdown)
  return {
    basics: base.basics,
    sections: applySectionOrder(base.sections, store.styleOptions.sectionOrder),
  }
})

const template = computed(() => getTemplate(store.templateId))
const vars = computed(() => styleVars(store.styleOptions))

const isEmpty = computed(
  () =>
    !resumeData.value.sections.length &&
    !resumeData.value.basics.name &&
    !resumeData.value.basics.summary &&
    !contactItems(resumeData.value.basics).length,
)

// ---- 分页测量：单一连续画布 + 分页线，页数 = ceil(内容高度 / A4 高) ----
const pageEl = ref<HTMLElement | null>(null)
const pageCount = ref(1)
let observer: ResizeObserver | undefined

function measure() {
  const h = pageEl.value?.offsetHeight ?? PAGE_HEIGHT
  pageCount.value = Math.max(1, Math.ceil(h / PAGE_HEIGHT))
}

onMounted(() => {
  measure()
  observer = new ResizeObserver(measure)
  if (pageEl.value) observer.observe(pageEl.value)
})
onBeforeUnmount(() => observer?.disconnect())

const overCount = computed(() => Math.max(0, pageCount.value - store.targetPages))

// ---- 一键压缩（§3.6）：收紧密度 → 降一档字号，循环直到达标或到下限 ----
const DENSITY_ORDER: Record<Density, number> = { relaxed: 0, standard: 1, compact: 2 }

async function compressToFit() {
  store.beginCompressSnapshot()
  const densityLadder: Density[] = ['standard', 'compact']
  const scaleLadder = [1, 0.85]

  const trySteps: Array<() => boolean> = [
    ...densityLadder.map((d) => () => {
      if (DENSITY_ORDER[store.styleOptions.density] < DENSITY_ORDER[d]) {
        store.setOption('density', d)
        return true
      }
      return false
    }),
    ...scaleLadder.map((s) => () => {
      if (store.styleOptions.fontScale > s) {
        store.setOption('fontScale', s)
        return true
      }
      return false
    }),
  ]

  for (const step of trySteps) {
    if (overCount.value === 0) break
    if (!step()) continue
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(resolve))
    measure()
  }
}
</script>

<template>
  <div class="relative min-h-0 flex-1">
    <section class="preview-panel absolute inset-0 overflow-auto bg-slate-800 p-8">
      <div class="relative mx-auto" style="width: var(--page-width)">
        <!-- .resume-page 是打印时唯一输出的节点；L2 样式以 CSS Variables 注入 -->
        <div
          ref="pageEl"
          class="resume-page rounded-sm bg-white shadow-xl"
          :style="{ ...vars, 'min-height': 'var(--page-height)' }"
        >
          <component
            :is="template.component"
            :data="resumeData"
            :options="store.styleOptions"
            :photo="store.activeDoc?.photo"
          />
        </div>

        <!-- 分页虚线（仅预览，打印时隐藏） -->
        <div
          v-for="i in pageCount - 1"
          :key="i"
          class="page-break"
          :style="{ top: `calc(${i} * var(--page-height))` }"
          aria-hidden="true"
        >
          <span class="page-break-tag">p{{ i + 1 }}</span>
        </div>

        <!-- 空状态提示（模板不再内置文案，便于 i18n） -->
        <div v-if="isEmpty" class="absolute inset-0 flex items-center justify-center px-10 text-center">
          <p class="text-sm leading-6 text-slate-400">{{ $t('preview.empty') }}</p>
        </div>
      </div>
    </section>

    <!-- 长度提示徽标（§3.6） -->
    <div
      class="absolute right-5 top-5 z-10 flex flex-col items-end gap-1.5"
      :title="$t('preview.printNote')"
    >
      <div
        class="flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 shadow-lg backdrop-blur"
      >
        <span :class="overCount > 0 ? 'font-medium text-amber-400' : ''">
          {{ pageCount > 1 ? $t('preview.pages', { n: pageCount }) : $t('preview.page') }}
        </span>
        <span class="text-slate-600">|</span>
        <span class="text-slate-400">{{ $t('preview.target') }}</span>
        <span class="flex gap-0.5">
          <button
            v-for="n in [1, 2]"
            :key="n"
            class="rounded-full px-1.5 py-0.5 text-[11px]"
            :class="store.targetPages === n ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700'"
            @click="store.targetPages = n as 1 | 2"
          >
            {{ n }}
          </button>
        </span>
      </div>

      <div v-if="overCount > 0" class="flex items-center gap-1.5">
        <span class="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] text-amber-300 backdrop-blur">
          {{ $t('preview.overTarget', { over: overCount }) }}
        </span>
        <button
          class="rounded-full bg-amber-500 px-3 py-1 text-[11px] font-medium text-slate-900 shadow-lg hover:bg-amber-400"
          @click="compressToFit"
        >
          {{ $t('preview.compress', { n: store.targetPages }) }}
        </button>
      </div>

      <button
        v-if="store.compressSnapshot"
        class="rounded-full bg-slate-900/90 px-3 py-1 text-[11px] text-slate-300 shadow-lg backdrop-blur hover:bg-slate-800"
        @click="store.restoreCompress()"
      >
        {{ $t('preview.undoCompress') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.page-break {
  position: absolute;
  right: 0;
  left: 0;
  border-top: 1px dashed rgba(148, 163, 184, 0.75);
  pointer-events: none;
}

.page-break-tag {
  position: absolute;
  top: -9px;
  right: 8px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.85);
  color: #cbd5e1;
  font-size: 10px;
  line-height: 18px;
}
</style>
