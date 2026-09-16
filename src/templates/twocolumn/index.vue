<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))
</script>

<template>
  <div class="r-twocolumn">
    <header class="tc-header">
      <div>
                <img v-if="photo" class="tc-photo" :src="photo" alt="" />
        <h1 v-if="data.basics.name" class="tc-name">{{ data.basics.name }}</h1>
        <p v-if="data.basics.label" class="tc-label">{{ data.basics.label }}</p>
      </div>
      <div v-if="contacts.length" class="tc-contact">
        <template v-for="c in contacts" :key="c.text">
          <span>{{ c.text }}</span>
        </template>
      </div>
    </header>

    <!-- 报刊式双栏：区块在两栏间自然流动，条目禁止跨栏切断 -->
    <div class="tc-columns">
      <section v-for="sec in data.sections" :key="sec.id" class="tc-section">
        <h2 class="tc-title">{{ sec.title }}</h2>
        <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="tc-paragraph">
          <RenderInline :source="text" />
        </p>
        <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="tc-item">
          <div class="tc-item-head">
            <span class="tc-item-title">
              {{ item.title }}<span v-if="item.subtitle" class="tc-item-subtitle">{{ item.subtitle }}</span>
            </span>
            <span v-if="item.date" class="tc-item-date">{{ item.date }}</span>
          </div>
          <ul v-if="item.bullets.length" class="tc-bullets">
            <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
          </ul>
        </div>
      </section>
    </div>

      </div>
</template>

<style scoped>
/* twocolumn 双栏报刊：正文双栏流动（CSS multi-column），头部通栏 */
.r-twocolumn {
  padding: var(--page-pad-y) var(--page-pad-x);
  font-family: var(--font-body);
  font-size: calc(12.5px * var(--font-scale));
  line-height: var(--leading);
  color: #1f2933;
}

.tc-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--accent);
}

.tc-name {
  margin: 0;
  font-size: calc(22px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
}

.tc-label {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--accent);
}

.tc-contact {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  font-size: 10.5px;
  color: #52606d;
  text-align: right;
}

.tc-contact a {
  color: inherit;
  text-decoration: none;
}

.tc-columns {
  margin-top: 12px;
  column-count: 2;
  column-gap: 26px;
}

.tc-section {
  break-inside: auto;
}

.tc-title {
  margin: 0 0 6px;
  padding-bottom: 3px;
  border-bottom: 1px solid #e2e8f0;
  font-size: calc(12.5px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent);
  break-after: avoid;
}

.tc-paragraph {
  margin: 3px 0;
  break-inside: avoid;
}

.tc-item {
  margin: 0 0 var(--item-gap);
  break-inside: avoid;
}

.tc-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.tc-item-title {
  font-weight: 700;
}

.tc-item-subtitle {
  margin-left: 6px;
  font-weight: 400;
  font-size: 0.95em;
  color: #52606d;
}

.tc-item-date {
  font-size: 10.5px;
  color: #52606d;
  white-space: nowrap;
}

.tc-bullets {
  margin: 3px 0 0;
  padding-left: 1.15em;
}

.tc-bullets li {
  margin: 2px 0;
  break-inside: avoid;
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}

:deep(code) {
  padding: 0 3px;
  border-radius: 3px;
  background: #f1f5f9;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}
.tc-photo {
  display: block;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
}
</style>
