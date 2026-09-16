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
  <div class="r-timeline" :class="options.headerLayout === 'center' ? 'is-centered' : 'is-left'">
    <header class="rt-header">
            <img v-if="photo" class="rt-photo" :src="photo" alt="" />
      <h1 v-if="data.basics.name" class="rt-name">{{ data.basics.name }}</h1>
      <p v-if="data.basics.label" class="rt-label">{{ data.basics.label }}</p>
      <p v-if="contacts.length" class="rt-contact">
        <span v-for="c in contacts" :key="c.text" class="rt-contact-item">
          <Icon :name="c.icon ?? 'link'" />
          <span>{{ c.text }}</span>
        </span>
      </p>
      <p v-if="data.basics.summary" class="rt-summary">{{ data.basics.summary }}</p>
    </header>

    <section v-for="sec in data.sections" :key="sec.id" class="rt-section">
      <h2 class="rt-title"><i class="rt-title-dot" />{{ sec.title }}</h2>
      <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="rt-paragraph">
        <RenderInline :source="text" />
      </p>
      <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="rt-item">
        <span class="rt-date">{{ item.date }}</span>
        <span class="rt-rail"><i class="rt-node" /></span>
        <div class="rt-body">
          <p class="rt-item-title">
            {{ item.title }}<span v-if="item.subtitle" class="rt-item-subtitle">{{ item.subtitle }}</span>
          </p>
          <ul v-if="item.bullets.length" class="rt-bullets">
            <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
          </ul>
        </div>
      </div>
    </section>

      </div>
</template>

<style scoped>
/* timeline 时间轴：左侧时间列 + 竖向轴线，经历脉络一目了然 */
.r-timeline {
  padding: var(--page-pad-y) var(--page-pad-x);
  font-family: var(--font-body);
  font-size: calc(13px * var(--font-scale));
  line-height: var(--leading);
  color: #1f2933;
}

.is-centered .rt-header {
  text-align: center;
}

.is-centered .rt-contact {
  justify-content: center;
}

.rt-name {
  margin: 0;
  font-size: calc(23px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 2px;
}

.rt-label {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: var(--accent);
}

.rt-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0 10px;
  margin: 6px 0 0;
  font-size: 11.5px;
  color: #52606d;
}

.rt-contact-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rt-contact-item .r-icon {
  color: var(--accent);
}

.rt-contact a {
  color: inherit;
  text-decoration: none;
}

.rt-summary {
  margin: 8px 0 0;
  font-size: 12px;
  color: #52606d;
}

.rt-section {
  margin-top: var(--section-gap);
}

.rt-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 9px;
  font-size: calc(14px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent);
}

.rt-title-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--accent);
}

.rt-paragraph {
  margin: 4px 0;
}

.rt-item {
  display: grid;
  grid-template-columns: 84px 16px 1fr;
  column-gap: 4px;
  margin: 0 0 var(--item-gap);
}

.rt-date {
  padding-top: 2px;
  font-size: 11px;
  color: #52606d;
  text-align: right;
  white-space: nowrap;
}

.rt-rail {
  position: relative;
}

.rt-rail::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: -8px;
  left: 50%;
  width: 1px;
  background: #dbe2ea;
}

.rt-item:last-child .rt-rail::before {
  height: 10px;
  bottom: auto;
}

.rt-node {
  position: absolute;
  top: 4px;
  left: 50%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 2px #fff;
  transform: translateX(-50%);
}

.rt-item-title {
  margin: 0 0 2px;
  font-weight: 700;
}

.rt-item-subtitle {
  margin-left: 8px;
  font-weight: 400;
  font-size: 12px;
  color: #52606d;
}

.rt-bullets {
  margin: 3px 0 0;
  padding-left: 1.2em;
}

.rt-bullets li {
  margin: 2px 0;
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}

:deep(code) {
  padding: 0 4px;
  border-radius: 3px;
  background: #f6f3ee;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}
.rt-header {
  position: relative;
}

.rt-photo {
  position: absolute;
  top: 0;
  right: 0;
  height: calc(80px * var(--photo-scale, 1));
  width: auto;
  max-width: calc(104px * var(--photo-scale, 1));
  object-fit: cover;
}

.rt-header:has(.rt-photo) {
  min-height: 88px;
}
</style>
