<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import Icon from '../shared/Icon.vue'
import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))

/** 左栏放「技能」类区块，右栏放经历主体 */
const asideSections = computed(() => props.data.sections.filter((s) => s.kind === 'skills'))
const mainSections = computed(() => props.data.sections.filter((s) => s.kind !== 'skills'))

const hasAsideContent = computed(
  () => contacts.value.length > 0 || asideSections.value.length > 0 || Boolean(props.data.basics.summary),
)
</script>

<template>
  <div class="r-sidebar">
    <aside v-if="hasAsideContent" class="rs-aside">
            <img v-if="photo" class="rs-photo" :src="photo" alt="" />
      <h1 v-if="data.basics.name" class="rs-name">{{ data.basics.name }}</h1>
      <p v-if="data.basics.label" class="rs-label">{{ data.basics.label }}</p>
      <p v-if="data.basics.summary" class="rs-summary">{{ data.basics.summary }}</p>

      <div v-if="contacts.length" class="rs-contacts">
        <span v-for="c in contacts" :key="c.text" class="rs-contact">
          <Icon :name="c.icon ?? 'link'" />
          <span>{{ c.text }}</span>
        </span>
      </div>

      <section v-for="sec in asideSections" :key="sec.id" class="rs-section">
        <h2 class="rs-title">{{ sec.title }}</h2>
        <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="rs-paragraph">
          <RenderInline :source="text" />
        </p>
        <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="rs-item">
          <p v-if="item.title" class="rs-item-title">{{ item.title }}</p>
          <ul v-if="item.bullets.length" class="rs-bullets">
            <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
          </ul>
        </div>
      </section>
    </aside>

    <main class="rs-main" :class="{ 'is-solo': !hasAsideContent }">
      <section v-for="sec in mainSections" :key="sec.id" class="rm-section">
        <h2 class="rm-title">{{ sec.title }}</h2>
        <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="rm-paragraph">
          <RenderInline :source="text" />
        </p>
        <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="rm-item">
          <div class="rm-item-head">
            <span class="rm-item-title">
              {{ item.title }}<span v-if="item.subtitle" class="rm-item-subtitle">{{ item.subtitle }}</span>
            </span>
            <span v-if="item.date" class="rm-item-date">{{ item.date }}</span>
          </div>
          <ul v-if="item.bullets.length" class="rm-bullets">
            <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
          </ul>
        </div>
      </section>

          </main>
  </div>
</template>

<style scoped>
/* sidebar 双栏侧栏：左栏联系/技能，右栏经历主体 */
.r-sidebar {
  display: flex;
  min-height: 100%;
  font-family: var(--font-body);
  font-size: calc(12.5px * var(--font-scale));
  line-height: var(--leading);
  color: #1f2933;
}

.rs-aside {
  width: 31%;
  min-width: 190px;
  padding: calc(var(--page-pad-y) * 0.9) calc(var(--page-pad-x) * 0.55);
  background: #f2f5f8;
}

.rs-name {
  margin: 0;
  font-size: calc(20px * var(--font-scale));
  font-weight: 700;
  color: var(--accent);
}

.rs-label {
  margin: 3px 0 0;
  font-size: 12px;
  color: #52606d;
}

.rs-summary {
  margin: 10px 0 0;
  font-size: 11.5px;
  color: #52606d;
}

.rs-contacts {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.rs-contact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #3e4c59;
  word-break: break-all;
}

.rs-contact .r-icon {
  flex-shrink: 0;
  color: var(--accent);
}

.rs-contact a {
  color: inherit;
  text-decoration: none;
}

.rs-section {
  margin-top: var(--section-gap);
}

.rs-title,
.rm-title {
  margin: 0 0 7px;
  font-size: calc(13px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent);
}

.rs-bullets,
.rs-paragraph {
  margin: 0;
}

.rs-bullets {
  padding-left: 1.2em;
}

.rs-item {
  margin-bottom: 6px;
}

.rs-item-title {
  margin: 0 0 2px;
  font-weight: 700;
}

.rs-bullets li {
  margin: 2px 0;
}

.rs-main {
  flex: 1;
  min-width: 0;
  padding: var(--page-pad-y) var(--page-pad-x);
}

.rm-section {
  margin-top: var(--section-gap);
}

.rm-section:first-child {
  margin-top: 0;
}

.rm-title {
  padding-bottom: 4px;
  border-bottom: 1px solid #e4e7eb;
}

.rm-paragraph {
  margin: 4px 0;
}

.rm-item {
  margin: 0 0 var(--item-gap);
}

.rm-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.rm-item-title {
  font-size: calc(13px * var(--font-scale));
  font-weight: 700;
}

.rm-item-subtitle {
  margin-left: 8px;
  font-weight: 400;
  font-size: 12px;
  color: #52606d;
}

.rm-item-date {
  font-size: 11.5px;
  color: #52606d;
  white-space: nowrap;
}

.rm-bullets {
  margin: 4px 0 0;
  padding-left: 1.25em;
}

.rm-bullets li {
  margin: 2px 0;
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}

:deep(code) {
  padding: 0 4px;
  border-radius: 3px;
  background: #eef2f7;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}
.rs-photo {
  height: calc(88px * var(--photo-scale, 1));
  width: auto;
  max-width: calc(72px * var(--photo-scale, 1));
  object-fit: cover;
  margin-bottom: 10px;
}
</style>
