<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))
</script>

<template>
  <div class="r-minimal" :class="options.headerLayout === 'center' ? 'is-centered' : 'is-left'">
    <header class="mn-header">
            <img v-if="photo" class="mn-photo" :src="photo" alt="" />
      <h1 v-if="data.basics.name" class="mn-name">{{ data.basics.name }}</h1>
      <p v-if="data.basics.label" class="mn-label">{{ data.basics.label }}</p>
      <p v-if="contacts.length" class="mn-contact">
        <template v-for="(c, i) in contacts" :key="c.text">
          <span v-if="i > 0" class="mn-sep">/</span>
          <span>{{ c.text }}</span>
        </template>
      </p>
    </header>

    <section v-for="sec in data.sections" :key="sec.id" class="mn-section">
      <h2 class="mn-title">{{ sec.title }}</h2>
      <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="mn-paragraph">
        <RenderInline :source="text" />
      </p>
      <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="mn-item">
        <div class="mn-item-head">
          <span class="mn-item-title">
            {{ item.title }}<span v-if="item.subtitle" class="mn-item-subtitle">{{ item.subtitle }}</span>
          </span>
          <span v-if="item.date" class="mn-item-date">{{ item.date }}</span>
        </div>
        <ul v-if="item.bullets.length" class="mn-bullets">
          <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
        </ul>
      </div>
    </section>

      </div>
</template>

<style scoped>
/* minimal 极简：无色彩装饰、大留白，强调内容本身。不渲染图标（showIcons 对本模板不生效） */
.r-minimal {
  padding: var(--page-pad-y) calc(var(--page-pad-x) * 1.15);
  font-family: var(--font-body);
  font-size: calc(13px * var(--font-scale));
  line-height: calc(var(--leading) + 0.08);
  color: #1f2933;
}

.is-centered .mn-header {
  text-align: center;
}

.mn-name {
  margin: 0;
  font-size: calc(26px * var(--font-scale));
  font-weight: 600;
  letter-spacing: 3px;
  color: #111827;
}

.mn-label {
  margin: 4px 0 0;
  font-size: 12px;
  color: #6b7280;
}

.mn-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0 10px;
  margin: 8px 0 0;
  font-size: 11.5px;
  color: #6b7280;
}

.is-centered .mn-contact {
  justify-content: center;
}

.mn-sep {
  color: #d1d5db;
}

.mn-contact a {
  color: inherit;
  text-decoration: none;
}

.mn-section {
  margin-top: calc(var(--section-gap) * 1.3);
}

.mn-title {
  margin: 0 0 9px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #9ca3af;
}

.mn-paragraph {
  margin: 4px 0;
  color: #374151;
}

.mn-item {
  margin: 0 0 var(--item-gap);
}

.mn-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.mn-item-title {
  font-weight: 600;
}

.mn-item-subtitle {
  margin-left: 8px;
  font-weight: 400;
  font-size: 0.95em;
  color: #6b7280;
}

.mn-item-date {
  font-size: 11.5px;
  color: #9ca3af;
  white-space: nowrap;
}

.mn-bullets {
  margin: 5px 0 0;
  padding: 0;
  list-style: none;
}

.mn-bullets li {
  margin: 3px 0;
  color: #374151;
}

.mn-bullets :deep(a),
.mn-paragraph :deep(a) {
  color: #111827;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.mn-bullets :deep(strong) {
  font-weight: 600;
}
.mn-photo {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.is-centered .mn-photo {
  margin-left: auto;
  margin-right: auto;
}
</style>
