<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import Icon from '../shared/Icon.vue'
import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions }>()

const contacts = computed(() => contactItems(props.data.basics))

/** 右侧深栏放联系/技能类区块，左侧主体放经历 */
const asideSections = computed(() => props.data.sections.filter((s) => s.kind === 'skills'))
const mainSections = computed(() => props.data.sections.filter((s) => s.kind !== 'skills'))
</script>

<template>
  <div class="r-raildark">
    <main class="rd-main">
      <header class="rd-header">
        <h1 v-if="data.basics.name" class="rd-name">{{ data.basics.name }}</h1>
        <p v-if="data.basics.label" class="rd-label">{{ data.basics.label }}</p>
        <p v-if="data.basics.summary" class="rd-summary">{{ data.basics.summary }}</p>
      </header>

      <section v-for="sec in mainSections" :key="sec.id" class="rd-section">
        <h2 class="rd-title">{{ sec.title }}</h2>
        <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="rd-paragraph">
          <RenderInline :source="text" />
        </p>
        <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="rd-item">
          <div class="rd-item-head">
            <span class="rd-item-title">
              {{ item.title }}<span v-if="item.subtitle" class="rd-item-subtitle">{{ item.subtitle }}</span>
            </span>
            <span v-if="item.date" class="rd-item-date">{{ item.date }}</span>
          </div>
          <ul v-if="item.bullets.length" class="rd-bullets">
            <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
          </ul>
        </div>
      </section>

          </main>

    <aside v-if="contacts.length || asideSections.length" class="rd-aside">
      <div v-if="contacts.length" class="rd-aside-block">
        <template v-for="c in contacts" :key="c.text">
          <p class="rd-aside-contact">
            <Icon :name="c.icon" />
            <a v-if="c.url" :href="c.url" target="_blank" rel="noopener noreferrer">{{ c.text }}</a>
            <span v-else>{{ c.text }}</span>
          </p>
        </template>
      </div>

      <section v-for="sec in asideSections" :key="sec.id" class="rd-aside-block">
        <h2 class="rd-aside-title">{{ sec.title }}</h2>
        <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="rd-aside-text">
          <RenderInline :source="text" />
        </p>
        <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="rd-aside-item">
          <p v-if="item.title" class="rd-aside-item-title">{{ item.title }}</p>
          <ul v-if="item.bullets.length" class="rd-aside-bullets">
            <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
          </ul>
        </div>
      </section>
    </aside>
  </div>
</template>

<style scoped>
/* raildark 深色右栏：右侧主题色深栏反白（联系/技能），左侧经历主体 */
.r-raildark {
  display: flex;
  min-height: 100%;
  font-family: var(--font-body);
  font-size: calc(12.5px * var(--font-scale));
  line-height: var(--leading);
  color: #1f2933;
}

.rd-main {
  flex: 1;
  min-width: 0;
  padding: var(--page-pad-y) var(--page-pad-x);
}

.rd-name {
  margin: 0;
  font-size: calc(22px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
}

.rd-label {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--accent);
}

.rd-summary {
  margin: 10px 0 0;
  font-size: 11.5px;
  color: #52606d;
}

.rd-section {
  margin-top: var(--section-gap);
}

.rd-title {
  margin: 0 0 7px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e4e7eb;
  font-size: calc(13px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent);
}

.rd-paragraph {
  margin: 4px 0;
}

.rd-item {
  margin: 0 0 var(--item-gap);
}

.rd-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.rd-item-title {
  font-weight: 700;
}

.rd-item-subtitle {
  margin-left: 8px;
  font-weight: 400;
  font-size: 12px;
  color: #52606d;
}

.rd-item-date {
  font-size: 11px;
  color: #52606d;
  white-space: nowrap;
}

.rd-bullets {
  margin: 4px 0 0;
  padding-left: 1.2em;
}

.rd-bullets li {
  margin: 2px 0;
}

.rd-aside {
  display: flex;
  flex-direction: column;
  gap: var(--section-gap);
  width: 33%;
  min-width: 190px;
  padding: calc(var(--page-pad-y) * 0.9) calc(var(--page-pad-x) * 0.55);
  background: var(--accent);
  color: #fff;
}

.rd-aside-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rd-aside-contact {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.88);
  word-break: break-all;
}

.rd-aside-contact .r-icon {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.7);
}

.rd-aside-contact a {
  color: inherit;
  text-decoration: none;
}

.rd-aside-title {
  margin: 0;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  font-size: calc(12.5px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
}

.rd-aside-text {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
}

.rd-aside-item-title {
  margin: 0 0 2px;
  font-size: 11.5px;
  font-weight: 700;
  color: #fff;
}

.rd-aside-bullets {
  margin: 0;
  padding-left: 1.15em;
}

.rd-aside-bullets li {
  margin: 3px 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}

.rd-aside :deep(a) {
  color: inherit;
}

:deep(code) {
  padding: 0 4px;
  border-radius: 3px;
  background: #eef2f7;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}
</style>
