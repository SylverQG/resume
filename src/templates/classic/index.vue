<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import Icon from '../shared/Icon.vue'
import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))
</script>

<template>
  <div
    class="r-classic"
    :class="options.headerLayout === 'left' ? 'is-left' : 'is-centered'"
  >
    <header v-if="data.basics.name || contacts.length || data.basics.summary" class="r-header">
            <img v-if="photo" class="r-photo" :src="photo" alt="" />
      <h1 v-if="data.basics.name" class="r-name">{{ data.basics.name }}</h1>
      <p v-if="data.basics.label" class="r-label">{{ data.basics.label }}</p>

      <p v-if="contacts.length" class="r-contact">
        <template v-if="options.showIcons">
          <span v-for="c in contacts" :key="c.text" class="r-contact-item">
            <Icon :name="c.icon ?? 'link'" />
            <span>{{ c.text }}</span>
          </span>
        </template>
        <template v-else>
          <template v-for="(c, i) in contacts" :key="c.text">
            <span v-if="i > 0" class="r-sep">·</span>
            <span>{{ c.text }}</span>
          </template>
        </template>
      </p>

      <p v-if="data.basics.summary" class="r-summary">{{ data.basics.summary }}</p>
    </header>

    <section v-for="sec in data.sections" :key="sec.id" class="r-section">
      <h2 class="r-section-title">{{ sec.title }}</h2>

      <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="r-paragraph">
        <RenderInline :source="text" />
      </p>

      <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="r-item">
        <div class="r-item-head">
          <span class="r-item-title">
            {{ item.title }}<span v-if="item.subtitle" class="r-item-subtitle">{{ item.subtitle }}</span>
          </span>
          <span v-if="item.date" class="r-item-date">{{ item.date }}</span>
        </div>
        <ul v-if="item.bullets.length" class="r-bullets">
          <li v-for="(b, j) in item.bullets" :key="`b-${j}`">
            <RenderInline :source="b" />
          </li>
        </ul>
      </div>
    </section>

      </div>
</template>

<style scoped>
/* classic 经典单栏：居中头部、细分隔线。颜色/字号/间距全部消费 CSS Variables（M2 样式面板注入） */
.r-classic {
  padding: var(--page-pad-y) var(--page-pad-x);
  font-family: var(--font-body);
  font-size: calc(13px * var(--font-scale));
  line-height: var(--leading);
  color: #1f2933;
}

.r-header {
  margin-bottom: 10px;
}

.is-centered .r-header {
  text-align: center;
}

.is-left .r-summary {
  margin-left: 0;
}

.r-name {
  margin: 0;
  font-size: calc(24px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 2px;
}

.r-label {
  margin: 3px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
}

.r-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0 6px;
  margin: 7px 0 0;
  font-size: 11.5px;
  color: #52606d;
}

.is-centered .r-contact {
  justify-content: center;
}

.r-contact-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.r-contact-item .r-icon {
  color: var(--accent);
}

.r-sep {
  color: #c0c8cf;
}

.r-link {
  color: #52606d;
  text-decoration: none;
}

.r-link:hover {
  color: var(--accent);
}

.r-summary {
  max-width: 88%;
  margin: 8px auto 0;
  font-size: 12px;
  color: #52606d;
}

.r-section {
  margin-top: var(--section-gap);
}

.r-section-title {
  margin: 0 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e4e7eb;
  font-size: calc(14px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent);
}

.r-paragraph {
  margin: 4px 0;
}

.r-item {
  margin: 0 0 var(--item-gap);
}

.r-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.r-item-title {
  font-size: 13px;
  font-weight: 700;
}

.r-item-subtitle {
  margin-left: 8px;
  font-size: 12.5px;
  font-weight: 400;
  color: #52606d;
}

.r-item-date {
  font-size: 12px;
  color: #52606d;
  white-space: nowrap;
}

.r-bullets {
  margin: 4px 0 0;
  padding-left: 1.25em;
}

.r-bullets li {
  margin: 2px 0;
}

/* RenderInline 生成的元素不带 scoped 属性，用 :deep 穿透 */
.r-bullets :deep(a),
.r-paragraph :deep(a) {
  color: var(--accent);
  text-decoration: none;
}

.r-bullets :deep(code),
.r-paragraph :deep(code) {
  padding: 0 4px;
  border-radius: 3px;
  background: #f1f5f9;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}
.r-photo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.is-centered .r-photo {
  display: block;
  margin: 0 auto 10px;
}

.is-left .r-photo {
  display: block;
  margin: 0 0 10px;
}
</style>
