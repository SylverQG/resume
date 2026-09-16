<script setup lang="ts">
import { computed } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, StyleOptions } from '@/types/resume'

import Icon from '../shared/Icon.vue'
import { contactItems } from '../shared/useContacts'

const props = defineProps<{ data: ResumeData; options: StyleOptions; photo?: string }>()

const contacts = computed(() => contactItems(props.data.basics))

/** 头像位：姓名首字（无姓名时用「简」） */
const monogram = computed(() => (props.data.basics.name ?? '简').trim().charAt(0).toUpperCase())
</script>

<template>
  <div class="r-cards">
    <header class="cd-header">
      <img v-if="photo" class="cd-mono cd-mono-img" :src="photo" alt="" />
      <span v-else class="cd-mono">{{ monogram }}</span>
      <div class="cd-heading">
        <h1 v-if="data.basics.name" class="cd-name">{{ data.basics.name }}</h1>
        <p v-if="data.basics.label" class="cd-label">{{ data.basics.label }}</p>
        <p v-if="contacts.length" class="cd-contact">
          <span v-for="c in contacts" :key="c.text" class="cd-contact-item">
            <Icon :name="c.icon ?? 'link'" />
            <span>{{ c.text }}</span>
          </span>
        </p>
      </div>
    </header>

    <section v-for="sec in data.sections" :key="sec.id" class="cd-card">
      <h2 class="cd-title"><i class="cd-dot" />{{ sec.title }}</h2>
      <p v-for="(text, i) in sec.paragraphs" :key="`p-${i}`" class="cd-paragraph">
        <RenderInline :source="text" />
      </p>
      <div v-for="(item, i) in sec.items" :key="`item-${i}`" class="cd-item">
        <div class="cd-item-head">
          <span class="cd-item-title">
            {{ item.title }}<span v-if="item.subtitle" class="cd-item-subtitle">{{ item.subtitle }}</span>
          </span>
          <span v-if="item.date" class="cd-item-date">{{ item.date }}</span>
        </div>
        <ul v-if="item.bullets.length" class="cd-bullets">
          <li v-for="(b, j) in item.bullets" :key="`b-${j}`"><RenderInline :source="b" /></li>
        </ul>
      </div>
    </section>

      </div>
</template>

<style scoped>
/* cards 卡片分区：首字母头像 + 圆角卡片区块，现代产品风 */
.r-cards {
  padding: var(--page-pad-y) var(--page-pad-x);
  font-family: var(--font-body);
  font-size: calc(12.5px * var(--font-scale));
  line-height: var(--leading);
  color: #1f2933;
}

.cd-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.cd-mono {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  font-size: calc(22px * var(--font-scale));
  font-weight: 700;
}

.cd-name {
  margin: 0;
  font-size: calc(20px * var(--font-scale));
  font-weight: 700;
}

.cd-label {
  margin: 2px 0 0;
  font-size: 12px;
  color: #52606d;
}

.cd-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 12px;
  margin: 5px 0 0;
  font-size: 11px;
  color: #52606d;
}

.cd-contact-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cd-contact-item .r-icon {
  color: var(--accent);
}

.cd-contact a {
  color: inherit;
  text-decoration: none;
}

.cd-card {
  margin-top: 12px;
  padding: 10px 14px 12px;
  border: 1px solid #e5e9ef;
  border-radius: 12px;
  background: #fafbfd;
  break-inside: avoid;
}

.cd-card:first-of-type {
  margin-top: 14px;
}

.cd-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 7px;
  font-size: calc(13px * var(--font-scale));
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent);
}

.cd-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
}

.cd-paragraph {
  margin: 4px 0;
}

.cd-item {
  margin: 0 0 var(--item-gap);
}

.cd-item:last-child {
  margin-bottom: 0;
}

.cd-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.cd-item-title {
  font-weight: 700;
}

.cd-item-subtitle {
  margin-left: 8px;
  font-weight: 400;
  font-size: 0.95em;
  color: #52606d;
}

.cd-item-date {
  font-size: 11px;
  color: #52606d;
  white-space: nowrap;
}

.cd-bullets {
  margin: 4px 0 0;
  padding-left: 1.2em;
}

.cd-bullets li {
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
.cd-mono-img {
  object-fit: cover;
}
</style>
