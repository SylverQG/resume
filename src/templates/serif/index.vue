<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))
</script>

<template>
  <div class="r-serif" :class="options.headerLayout === 'left' ? 'is-left' : 'is-centered'">
    <header class="sf-header">
            <img v-if="photo" class="sf-photo" :src="photo" alt="" />
      <h1 v-if="data.basics.name" class="sf-name">{{ data.basics.name }}</h1>
      <p v-if="data.basics.label" class="sf-label">{{ data.basics.label }}</p>
      <p v-if="contacts.length" class="sf-contact">
        <template v-for="(c, i) in contacts" :key="c.text">
          <span v-if="i > 0" class="sf-sep">·</span>
          <span>{{ c.text }}</span>
        </template>
      </p>
    </header>

    <div class="sf-rule" />

    <section v-for="sec in data.sections" :key="sec.id" class="sf-section">
      <h2 class="sf-title">{{ sec.title }}</h2>
      <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="sf-paragraph">
        <RenderInline :source="text" />
      </p>
      <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="sf-item">
        <div class="sf-item-head">
          <span class="sf-item-title">
            {{ item.title }}<span v-if="item.subtitle" class="sf-item-subtitle">{{ item.subtitle }}</span>
          </span>
          <span v-if="item.date" class="sf-item-date">{{ item.date }}</span>
        </div>
        <ul v-if="item.bullets.length" class="sf-bullets">
          <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
        </ul>
      </div>
    </section>

      </div>
</template>

<style scoped>
/* serif 雅致衬线：衬线排印、双细线分隔、小型大写间距标题，学术/外企气质 */
.r-serif {
  padding: calc(var(--page-pad-y) * 1.1) calc(var(--page-pad-x) * 1.1);
  font-family: var(--font-body);
  font-size: calc(13px * var(--font-scale));
  line-height: calc(var(--leading) + 0.06);
  color: #292524;
}

.is-left .sf-header {
  text-align: left;
}

.sf-header {
  text-align: center;
}

.sf-name {
  margin: 0;
  font-size: calc(27px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 4px;
}

.sf-label {
  margin: 5px 0 0;
  font-style: italic;
  font-size: calc(13px * var(--font-scale));
  color: var(--accent);
}

.sf-contact {
  margin: 8px 0 0;
  font-size: 11.5px;
  letter-spacing: 0.5px;
  color: #57534e;
}

.is-centered .sf-contact {
  justify-content: center;
}

.sf-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0 8px;
}

.is-left .sf-contact {
  justify-content: flex-start;
}

.sf-sep {
  color: #d6d3d1;
}

.sf-contact a {
  color: inherit;
  text-decoration: none;
}

.sf-rule {
  margin-top: 12px;
  border-top: 3px double var(--accent);
}

.sf-section {
  margin-top: var(--section-gap);
}

.sf-title {
  margin: 0 0 9px;
  font-size: calc(12.5px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--accent);
  text-align: center;
}

.sf-title::after {
  content: '';
  display: block;
  width: 44px;
  height: 1px;
  margin: 5px auto 0;
  background: var(--accent);
  opacity: 0.55;
}

.is-left .sf-title {
  text-align: left;
}

.is-left .sf-title::after {
  margin-left: 0;
}

.sf-paragraph {
  margin: 4px 0;
}

.sf-item {
  margin: 0 0 var(--item-gap);
}

.sf-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.sf-item-title {
  font-weight: 700;
}

.sf-item-subtitle {
  margin-left: 8px;
  font-style: italic;
  font-weight: 400;
  font-size: 0.95em;
  color: #57534e;
}

.sf-item-date {
  font-size: 11.5px;
  color: #57534e;
  white-space: nowrap;
}

.sf-bullets {
  margin: 4px 0 0;
  padding-left: 1.3em;
}

.sf-bullets li {
  margin: 2.5px 0;
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}

:deep(code) {
  padding: 0 4px;
  border-radius: 3px;
  background: #f5f5f4;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.9em;
}
.sf-header {
  position: relative;
}

.sf-photo {
  position: absolute;
  top: 0;
  right: 0;
  height: 80px;
  width: auto;
  max-width: 104px;
  object-fit: cover;
}

.sf-header:has(.sf-photo) {
  min-height: 88px;
  padding-right: 112px;
}
</style>
