<script setup lang="ts">
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, placeholder } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Codemirror } from 'vue-codemirror'

import { useResumeStore } from '@/stores/useResumeStore'

const { t } = useI18n()
const store = useResumeStore()

const extensions = computed(() => [
  basicSetup,
  markdown(),
  oneDark,
  EditorView.lineWrapping,
  placeholder(t('editor.placeholder')),
])
</script>

<template>
  <section class="editor-panel flex min-h-0 flex-col bg-slate-900/40">
    <div class="flex h-9 shrink-0 items-center justify-between border-b border-slate-800 px-3">
      <span class="text-xs font-medium text-slate-400">Markdown</span>
      <span class="text-[10px] text-slate-600">{{ $t('editor.autosave') }}</span>
    </div>
    <!-- 外层容器由 flex 决定高度，CodeMirror 在其中撑满并内部滚动，保证最后一行可达 -->
    <div class="min-h-0 flex-1 overflow-hidden">
      <Codemirror
        class="h-full"
        :model-value="store.markdown"
        :extensions="extensions"
        :tab-size="2"
        @update:model-value="store.setMarkdown"
      />
    </div>
  </section>
</template>

<style scoped>
.editor-panel :deep(.cm-editor) {
  height: 100%;
  background: transparent;
}

.editor-panel :deep(.cm-scroller) {
  overflow: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
}
</style>
