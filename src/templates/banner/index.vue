<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, ResumeItem, StyleOptions } from '@/types/resume'

import Icon from '../shared/Icon.vue'
import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))

/** 「技能」类无标题条目渲染为标签胶囊，其余条目正常渲染 */
function isChips(item: ResumeItem): boolean {
  return item.title === ''
}
</script>

<template>
  <div class="r-banner">
    <header
      class="rb-header"
      :class="options.headerLayout === 'left' ? 'is-left' : 'is-centered'"
    >
            <img v-if="photo" class="rb-photo" :src="photo" alt="" />
      <h1 v-if="data.basics.name" class="rb-name">{{ data.basics.name }}</h1>
      <p v-if="data.basics.label" class="rb-label">{{ data.basics.label }}</p>
      <p v-if="contacts.length" class="rb-contact">
        <span v-for="c in contacts" :key="c.text" class="rb-contact-item">
          <Icon :name="c.icon ?? 'link'" />
          <span>{{ c.text }}</span>
        </span>
      </p>
    </header>

    <div class="rb-body">
      <p v-if="data.basics.summary" class="rb-summary">{{ data.basics.summary }}</p>

      <section v-for="sec in data.sections" :key="sec.id" class="rb-section">
        <h2 class="rb-title">{{ sec.title }}</h2>
        <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="rb-paragraph">
          <RenderInline :source="text" />
        </p>
        <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="rb-item">
          <template v-if="isChips(item)">
            <div v-if="item.bullets.length" class="rb-chips">
              <span v-for="(b, j) in item.bullets" :key="`chip-${j}`" class="rb-chip">
                <RenderInline :source="b" />
              </span>
            </div>
          </template>
          <template v-else>
            <div class="rb-item-head">
              <span class="rb-item-title">
                {{ item.title }}<span v-if="item.subtitle" class="rb-item-subtitle">{{ item.subtitle }}</span>
              </span>
              <span v-if="item.date" class="rb-item-date">{{ item.date }}</span>
            </div>
            <ul v-if="item.bullets.length" class="rb-bullets">
              <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
            </ul>
          </template>
        </div>
      </section>

          </div>
  </div>
</template>

<style scoped>
/* banner 顶栏横幅：主题色横幅头部 + 技能标签化正文 */
.r-banner {
  font-family: var(--font-body);
  font-size: calc(13px * var(--font-scale));
  line-height: var(--leading);
  color: #1f2933;
}

.rb-header {
  padding: calc(var(--page-pad-y) * 0.72) var(--page-pad-x);
  background: var(--accent);
  color: #fff;
}

.is-centered .rb-header {
  text-align: center;
}

.rb-name {
  margin: 0;
  font-size: calc(24px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 3px;
}

.rb-label {
  margin: 3px 0 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.85);
}

.rb-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
  margin: 7px 0 0;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.85);
}

.is-centered .rb-contact {
  justify-content: center;
}

.rb-contact-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rb-contact-item .r-icon {
  color: rgba(255, 255, 255, 0.8);
}

.rb-contact a {
  color: inherit;
  text-decoration: none;
}

.rb-body {
  padding: calc(var(--page-pad-y) * 0.85) var(--page-pad-x);
}

.rb-summary {
  margin: 0 0 4px;
  font-size: 12px;
  color: #52606d;
}

.rb-section {
  margin-top: var(--section-gap);
}

.rb-title {
  margin: 0 0 7px;
  padding-left: 8px;
  border-left: 3px solid var(--accent);
  font-size: calc(13.5px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
}

.rb-paragraph {
  margin: 4px 0;
}

.rb-item {
  margin: 0 0 var(--item-gap);
}

.rb-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.rb-item-title {
  font-weight: 700;
}

.rb-item-subtitle {
  margin-left: 8px;
  font-weight: 400;
  font-size: 12px;
  color: #52606d;
}

.rb-item-date {
  font-size: 11.5px;
  color: #52606d;
  white-space: nowrap;
}

.rb-bullets {
  margin: 4px 0 0;
  padding-left: 1.25em;
}

.rb-bullets li {
  margin: 2px 0;
}

.rb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 2px 0;
}

.rb-chip {
  padding: 2px 10px;
  border: 1px solid #dbe2ea;
  border-radius: 999px;
  background: #f1f5f9;
  background: color-mix(in srgb, var(--accent) 8%, #fff);
  font-size: 11.5px;
  color: #3e4c59;
}

:deep(a) {
  color: var(--accent);
  text-decoration: none;
}

.rb-header :deep(a) {
  color: inherit;
}

:deep(code) {
  padding: 0 4px;
  border-radius: 3px;
  background: #eef2ff;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}
.rb-photo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 8px;
  border: 2px solid rgba(255, 255, 255, 0.55);
}

.is-left .rb-photo {
  margin: 0 0 8px;
}
</style>
