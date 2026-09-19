<script setup lang="ts">
import { defineAsyncComponent, watch } from 'vue'

import { i18n } from '@/i18n'
import { useResumeStore } from '@/stores/useResumeStore'
import { scopeUserCss } from '@/templates/shared/scopeUserCss'
import PreviewPanel from '@/components/PreviewPanel.vue'
import TemplateBuilder from '@/components/designer/TemplateBuilder.vue'
import Toolbar from '@/components/Toolbar.vue'

// CodeMirror 体积较大，编辑器懒加载，首屏只加载预览链路
const EditorPanel = defineAsyncComponent(() => import('@/components/EditorPanel.vue'))

const store = useResumeStore()

// 界面语言以 store 为事实源（随 localStorage 恢复），同步到 vue-i18n
watch(
  () => store.locale,
  (locale) => {
    i18n.global.locale.value = locale
  },
  { immediate: true },
)

// L3 自定义 CSS：加 .resume-page 作用域后注入 <style>，预览与打印共用同一 DOM，天然一致（§3.6）
let userStyleEl: HTMLStyleElement | undefined
watch(
  () => store.customCss,
  (css) => {
    if (!userStyleEl) {
      userStyleEl = document.createElement('style')
      userStyleEl.dataset.userCss = ''
      document.head.append(userStyleEl)
    }
    userStyleEl.textContent = scopeUserCss(css)
  },
  { immediate: true },
)
</script>

<template>
  <TemplateBuilder v-if="store.designerOpen" />
  <div v-else class="flex h-full flex-col overflow-hidden bg-slate-950 text-slate-200">
    <Toolbar />
    <main class="flex min-h-0 flex-1">
      <EditorPanel class="w-2/5 min-w-72 border-r border-slate-800" />
      <PreviewPanel class="min-w-0 flex-1" />
    </main>
  </div>
</template>
