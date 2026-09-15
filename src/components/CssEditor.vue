<script setup lang="ts">
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { ref, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'

import { useResumeStore } from '@/stores/useResumeStore'

const emit = defineEmits<{ close: [] }>()

const store = useResumeStore()

const draft = ref(store.customCss)

// 防抖 400ms 实时写入 store（App 负责加作用域并注入，预览即时生效）
let timer: ReturnType<typeof setTimeout> | undefined
watch(draft, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    store.customCss = value
  }, 400)
})

// 外部变更（应用方案/清空）回同步到编辑器
watch(
  () => store.customCss,
  (value) => {
    if (value !== draft.value) draft.value = value
  },
)

const extensions = [basicSetup, css(), oneDark, EditorView.lineWrapping]

function clearCss() {
  draft.value = ''
  store.customCss = ''
}

function done() {
  clearTimeout(timer)
  store.customCss = draft.value
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/70 p-6"
    @click.self="emit('close')"
  >
    <div
      class="flex h-[70vh] w-[680px] max-w-full flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
    >
      <div class="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <p class="text-xs font-medium text-slate-300">{{ $t('css.title') }}</p>
        <button class="text-slate-500 hover:text-slate-300" title="Esc" @click="done">✕</button>
      </div>
      <p class="border-b border-slate-800 bg-slate-900/60 px-4 py-2 text-[11px] text-slate-500">
        {{ $t('css.hint') }}
      </p>
      <Codemirror v-model="draft" class="min-h-0 flex-1" :extensions="extensions" :tab-size="2" />
      <div class="flex items-center justify-between border-t border-slate-800 px-4 py-2.5">
        <button
          class="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-700"
          @click="clearCss"
        >
          {{ $t('css.reset') }}
        </button>
        <button
          class="rounded bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-500"
          @click="done"
        >
          {{ $t('css.done') }}
        </button>
      </div>
    </div>
  </div>
</template>
