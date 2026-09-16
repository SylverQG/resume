<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))
</script>

<template>
  <div class="r-compact" :class="options.headerLayout === 'left' ? 'is-left' : 'is-centered'">
    <header class="cp-header">
            <img v-if="photo" class="cp-photo" :src="photo" alt="" />
      <span v-if="data.basics.name" class="cp-name">{{ data.basics.name }}</span>
      <span v-if="data.basics.label" class="cp-label">{{ data.basics.label }}</span>
      <p v-if="contacts.length" class="cp-contact">
        <template v-for="(c, i) in contacts" :key="c.text">
          <span v-if="i > 0" class="cp-sep">|</span>
          <span>{{ c.text }}</span>
        </template>
      </p>
      <p v-if="data.basics.summary" class="cp-summary">{{ data.basics.summary }}</p>
    </header>

    <section v-for="sec in data.sections" :key="sec.id" class="cp-section">
      <h2 class="cp-title">{{ sec.title }}</h2>
      <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="cp-paragraph">
        <RenderInline :source="text" />
      </p>
      <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="cp-item">
        <div class="cp-item-head">
          <span class="cp-item-title">
            {{ item.title }}<span v-if="item.subtitle" class="cp-item-subtitle">{{ item.subtitle }}</span>
          </span>
          <span v-if="item.date" class="cp-item-date">{{ item.date }}</span>
        </div>
        <ul v-if="item.bullets.length" class="cp-bullets">
          <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
        </ul>
      </div>
    </section>

      </div>
</template>

<style scoped>
/* compact 紧凑一页：小字号高密度窄边距，内容多时尽量压进一页 */
.r-compact {
  padding: calc(var(--page-pad-y) * 0.72) calc(var(--page-pad-x) * 0.72);
  font-family: var(--font-body);
  font-size: calc(11.5px * var(--font-scale));
  line-height: calc(var(--leading) - 0.07);
  color: #1f2933;
}

.is-centered .cp-header {
  text-align: center;
}

.cp-name {
  font-size: calc(18px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 2px;
}

.cp-label {
  margin-left: 10px;
  font-size: 11.5px;
  color: var(--accent);
}

.cp-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0 6px;
  margin: 4px 0 0;
  font-size: 10.5px;
  color: #52606d;
}

.is-centered .cp-contact {
  justify-content: center;
}

.cp-sep {
  color: #c0c8cf;
}

.cp-contact a {
  color: inherit;
  text-decoration: none;
}

.cp-summary {
  margin: 3px 0 0;
  font-size: 10.5px;
  color: #52606d;
}

.cp-section {
  margin-top: calc(var(--section-gap) * 0.8);
}

.cp-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 5px;
  font-size: calc(12px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent);
}

.cp-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e4e7eb;
}

.cp-paragraph {
  margin: 2px 0;
}

.cp-item {
  margin: 0 0 calc(var(--item-gap) * 0.7);
}

.cp-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.cp-item-title {
  font-weight: 700;
}

.cp-item-subtitle {
  margin-left: 6px;
  font-weight: 400;
  font-size: 0.95em;
  color: #52606d;
}

.cp-item-date {
  font-size: 10.5px;
  color: #52606d;
  white-space: nowrap;
}

.cp-bullets {
  margin: 2px 0 0;
  padding-left: 1.1em;
}

.cp-bullets li {
  margin: 1px 0;
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}

:deep(code) {
  padding: 0 3px;
  border-radius: 2px;
  background: #f1f5f9;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}
.cp-header {
  position: relative;
}

.cp-photo {
  position: absolute;
  top: 0;
  right: 0;
  height: calc(56px * var(--photo-scale, 1));
  width: auto;
  max-width: calc(44px * var(--photo-scale, 1));
  object-fit: cover;
}

.cp-header:has(.cp-photo) {
  min-height: calc(60px * var(--photo-scale, 1));
}
</style>
