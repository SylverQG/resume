<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useResumeStore } from '@/stores/useResumeStore'

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useResumeStore()

const renamingId = ref<string | null>(null)
const renameDraft = ref('')

/** 重命名输入框自动聚焦（v-focus） */
const vFocus = { mounted: (el: HTMLElement) => el.focus() }

function create() {
  store.createResume(t('manager.newName', { n: store.resumes.length + 1 }))
  emit('close')
}

function switchTo(id: string) {
  store.switchResume(id)
  emit('close')
}

function startRename(id: string, current: string) {
  renamingId.value = id
  renameDraft.value = current
}

function commitRename() {
  if (!renamingId.value) return
  store.renameResume(renamingId.value, renameDraft.value)
  renamingId.value = null
}

function duplicate(id: string, name: string) {
  store.duplicateResume(id, t('manager.copyName', { name }))
}

function remove(id: string) {
  if (window.confirm(t('manager.deleteConfirm'))) store.deleteResume(id)
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleString()
}
</script>

<template>
  <div
    class="max-h-[75vh] w-80 overflow-auto rounded-xl border border-slate-200 bg-white p-3 shadow-2xl"
  >
    <div class="flex items-center justify-between px-1 pb-2">
      <p class="text-xs font-medium text-slate-500">{{ $t('manager.title') }}</p>
      <button
        class="rounded bg-sky-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-sky-500"
        @click="create"
      >
        + {{ $t('manager.new') }}
      </button>
    </div>

    <div class="space-y-1">
      <div
        v-for="r in store.resumes"
        :key="r.id"
        class="rounded-lg border px-2.5 py-2"
        :class="r.id === store.activeResumeId ? 'border-sky-400 bg-sky-50/60' : 'border-slate-200 hover:bg-slate-50'"
      >
        <div class="flex items-center gap-2">
          <input
            v-if="renamingId === r.id"
            v-model="renameDraft"
            v-focus
            class="min-w-0 flex-1 rounded border border-sky-300 px-1.5 py-0.5 text-xs outline-none"
            @keyup.enter="commitRename"
            @keyup.esc="renamingId = null"
            @blur="commitRename"
          />
          <template v-else>
            <button
              class="min-w-0 flex-1 truncate text-left text-xs font-medium text-slate-800"
              :title="r.name"
              @click="switchTo(r.id)"
            >
              <span
                v-if="r.id === store.activeResumeId"
                class="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-sky-500 align-middle"
              />
              {{ r.name }}
            </button>
            <span class="flex shrink-0 text-slate-400">
              <button
                class="rounded px-1 hover:bg-slate-200"
                :title="$t('manager.rename')"
                @click="startRename(r.id, r.name)"
              >
                ✎
              </button>
              <button
                class="rounded px-1 hover:bg-slate-200"
                :title="$t('manager.duplicate')"
                @click="duplicate(r.id, r.name)"
              >
                ⧉
              </button>
              <button
                class="rounded px-1 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30"
                :disabled="store.resumes.length <= 1"
                :title="store.resumes.length <= 1 ? $t('manager.deleteDisabled') : $t('manager.delete')"
                @click="remove(r.id)"
              >
                🗑
              </button>
            </span>
          </template>
        </div>
        <p class="mt-0.5 pl-0.5 text-[10px] text-slate-400">
          {{ $t('manager.updated') }} {{ fmtTime(r.updatedAt) }}
        </p>
      </div>
    </div>
  </div>
</template>
