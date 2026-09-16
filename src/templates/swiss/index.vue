<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))

/** 瑞士风格：区块编号 01 / 02 / 03 */
const num = (i: number) => String(i + 1).padStart(2, '0')
</script>

<template>
  <div class="r-swiss">
    <header class="sw-header">
      <div class="sw-heading">
                <img v-if="photo" class="sw-photo" :src="photo" alt="" />
        <h1 v-if="data.basics.name" class="sw-name">{{ data.basics.name }}</h1>
        <p v-if="data.basics.label" class="sw-label">{{ data.basics.label }}</p>
      </div>
      <div v-if="contacts.length" class="sw-contact">
        <template v-for="c in contacts" :key="c.text">
          <span>{{ c.text }}</span>
        </template>
      </div>
    </header>

    <section v-for="(sec, i) in data.sections" :key="sec.id" class="sw-section">
      <h2 class="sw-title"><span class="sw-num">{{ num(i) }}</span>{{ sec.title }}</h2>
      <p v-for="(text, j) in sec.paragraphs" :key="`p-${j}`" class="sw-paragraph">
        <RenderInline :source="text" />
      </p>
      <div v-for="(item, j) in sec.items" :key="`item-${j}`" class="sw-item">
        <div class="sw-item-head">
          <span class="sw-item-title">
            {{ item.title }}<span v-if="item.subtitle" class="sw-item-subtitle">{{ item.subtitle }}</span>
          </span>
          <span v-if="item.date" class="sw-item-date">{{ item.date }}</span>
        </div>
        <ul v-if="item.bullets.length" class="sw-bullets">
          <li v-for="(b, k) in item.bullets" :key="`b-${k}`"><RenderInline :source="b" /></li>
        </ul>
      </div>
    </section>

      </div>
</template>

<style scoped>
/* swiss 瑞士栅格：粗黑大字头 + 区块编号 + 通栏横线，国际主义排印风 */
.r-swiss {
  padding: var(--page-pad-y) var(--page-pad-x);
  font-family: var(--font-body);
  font-size: calc(13px * var(--font-scale));
  line-height: var(--leading);
  color: #111111;
}

.sw-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.sw-name {
  margin: 0;
  font-size: calc(30px * var(--font-scale));
  font-weight: 800;
  letter-spacing: 1px;
  line-height: 1.15;
}

.sw-name::after {
  content: '';
  display: block;
  width: 52px;
  height: 5px;
  margin-top: 7px;
  background: var(--accent);
}

.sw-label {
  margin: 6px 0 0;
  font-size: 12.5px;
  font-weight: 500;
  color: #4b5563;
}

.sw-contact {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: 11px;
  color: #4b5563;
  text-align: right;
}

.sw-contact a {
  color: inherit;
  text-decoration: none;
}

.sw-section {
  margin-top: calc(var(--section-gap) * 1.05);
}

.sw-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 8px;
  padding-top: 7px;
  border-top: 2px solid #111;
  font-size: calc(14px * var(--font-scale));
  font-weight: 800;
  letter-spacing: 1.5px;
}

.sw-num {
  font-size: 0.85em;
  color: var(--accent);
}

.sw-paragraph {
  margin: 4px 0;
}

.sw-item {
  margin: 0 0 var(--item-gap);
}

.sw-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.sw-item-title {
  font-weight: 700;
}

.sw-item-subtitle {
  margin-left: 8px;
  font-weight: 400;
  font-size: 0.95em;
  color: #4b5563;
}

.sw-item-date {
  font-size: 11.5px;
  font-weight: 500;
  color: #4b5563;
  white-space: nowrap;
}

.sw-bullets {
  margin: 4px 0 0;
  padding-left: 1.2em;
}

.sw-bullets li {
  margin: 2.5px 0;
}

.sw-bullets li::marker {
  color: var(--accent);
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}

:deep(code) {
  padding: 0 4px;
  border-radius: 0;
  background: #f3f4f6;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}
.sw-heading {
  overflow: hidden;
}

.sw-photo {
  float: left;
  height: 72px;
  width: auto;
  max-width: 56px;
  object-fit: cover;
  margin: 0 12px 6px 0;
}
</style>
