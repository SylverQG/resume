<script setup lang="ts">
import { useResumeStore } from '@/stores/useResumeStore'
import { templates } from '@/templates/registry'

const emit = defineEmits<{ close: [] }>()

const store = useResumeStore()

function pick(id: string) {
  store.setTemplate(id)
  emit('close')
}
</script>

<template>
  <div class="max-h-[80vh] w-[560px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-2xl">
    <p class="sticky top-0 -mx-3 -mt-3 bg-white px-3 pb-2 pt-3 text-xs font-medium text-slate-500">
      {{ $t('picker.title', { count: templates.length }) }}
    </p>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="t in templates"
        :key="t.id"
        class="rounded-lg border p-2 text-left transition-colors hover:border-sky-400"
        :class="t.id === store.templateId ? 'border-sky-500 ring-1 ring-sky-400' : 'border-slate-200'"
        @click="pick(t.id)"
      >
        <!-- thumbnail 为项目自有静态 SVG 常量，非用户输入 -->
        <span
          class="block overflow-hidden rounded border border-slate-100 bg-white [&>svg]:block [&>svg]:w-full"
          v-html="t.thumbnail"
        />
        <span class="mt-1.5 block text-xs font-medium text-slate-800">{{ t.name }}</span>
        <span class="block text-[10px] leading-4 text-slate-400">{{ t.description }}</span>
      </button>
    </div>
  </div>
</template>
