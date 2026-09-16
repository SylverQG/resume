<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))
</script>

<template>
  <div class="r-ledger">
    <header class="lg-header">
      <div>
                <img v-if="photo" class="lg-photo" :src="photo" alt="" />
        <h1 v-if="data.basics.name" class="lg-name">{{ data.basics.name }}</h1>
        <p v-if="data.basics.label" class="lg-label">{{ data.basics.label }}</p>
      </div>
      <div v-if="contacts.length" class="lg-contact">
        <template v-for="c in contacts" :key="c.text">
          <span>{{ c.text }}</span>
        </template>
      </div>
    </header>

    <div class="lg-rows">
      <section v-for="sec in data.sections" :key="sec.id" class="lg-row">
        <h2 class="lg-row-label">{{ sec.title }}</h2>
        <div class="lg-content">
          <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="lg-paragraph">
            <RenderInline :source="text" />
          </p>
          <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="lg-item">
            <div class="lg-item-head">
              <span class="lg-item-title">
                {{ item.title }}<span v-if="item.subtitle" class="lg-item-subtitle">{{ item.subtitle }}</span>
              </span>
              <span v-if="item.date" class="lg-item-date">{{ item.date }}</span>
            </div>
            <ul v-if="item.bullets.length" class="lg-bullets">
              <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
            </ul>
          </div>
        </div>
      </section>
    </div>

      </div>
</template>

<style scoped>
/* ledger 表格左标签：左列区块标签 + 右列内容，发丝线分行，欧式表格式简历 */
.r-ledger {
  padding: var(--page-pad-y) var(--page-pad-x);
  font-family: var(--font-body);
  font-size: calc(12.5px * var(--font-scale));
  line-height: var(--leading);
  color: #1f2933;
}

.lg-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1.5px solid #111827;
}

.lg-name {
  margin: 0;
  font-size: calc(22px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 2px;
}

.lg-label {
  margin: 3px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.lg-contact {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: 10.5px;
  color: #6b7280;
  text-align: right;
}

.lg-contact a {
  color: inherit;
  text-decoration: none;
}

.lg-row {
  display: grid;
  grid-template-columns: 118px 1fr;
  column-gap: 18px;
  padding: calc(var(--section-gap) * 0.5) 0;
  border-bottom: 1px solid #eef1f4;
}

.lg-row-label {
  margin: 0;
  padding-top: 2px;
  font-size: calc(11.5px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent);
}

.lg-paragraph {
  margin: 3px 0;
}

.lg-item {
  margin: 0 0 var(--item-gap);
}

.lg-item:last-child {
  margin-bottom: 0;
}

.lg-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.lg-item-title {
  font-weight: 700;
}

.lg-item-subtitle {
  margin-left: 8px;
  font-weight: 400;
  font-size: 0.95em;
  color: #6b7280;
}

.lg-item-date {
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
}

.lg-bullets {
  margin: 3px 0 0;
  padding-left: 1.2em;
}

.lg-bullets li {
  margin: 2px 0;
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}

:deep(code) {
  padding: 0 4px;
  border-radius: 3px;
  background: #f5f3ff;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}
.lg-header > div:first-child {
  overflow: hidden;
}

.lg-photo {
  float: left;
  height: 64px;
  width: auto;
  max-width: 48px;
  object-fit: cover;
  margin: 0 10px 4px 0;
}
</style>
