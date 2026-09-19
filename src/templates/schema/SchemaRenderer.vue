<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'

import { RenderInline } from '@/markdown/inline'
import type { ResumeData, Section, StyleOptions } from '@/types/resume'
import type { SchemaBlock, TemplateSchema } from '@/types/schema'
import { applySectionOrder } from '../shared/sectionOrder'
import { SANS_STACK, SERIF_STACK } from '../shared/styleVars'
import { contactItems } from '../shared/useContacts'

const props = defineProps<{
  schema: TemplateSchema
  data: ResumeData
  options?: StyleOptions
  photo?: string
}>()

const contacts = computed(() => contactItems(props.data.basics))

const accent = computed(() => props.options?.accentColor ?? props.schema.colors.accent)

/** 可见区块（legacy 模式按 order/hidden 过滤排序；blocks 模式按块存在性） */
const visibleSections = computed<Section[]>(() => {
  const s = props.schema.section
  return applySectionOrder(props.data.sections, s.order).filter(
    (sec) => !s.hidden.includes(sec.id) && !s.hidden.includes(sec.kind),
  )
})

/** 块布局（v2）：缺省时按 legacy 合成 */
const layout = computed(() => {
  if (props.schema.layout) return props.schema.layout
  const main: SchemaBlock[] = []
  if (props.schema.header.show) main.push({ id: 'blk-header', kind: 'header' })
  for (const sec of visibleSections.value) {
    main.push({ id: `blk-${sec.id}`, kind: 'section', ref: sec.id })
  }
  return { aside: 'none' as const, asideWidth: 32, main, side: [] }
})

function sectionByRef(ref: string | undefined): Section | undefined {
  if (!ref) return undefined
  return props.data.sections.find((s) => s.id === ref || s.kind === ref)
}

const rootStyle = computed(() => {
  const s = props.schema
  const scale = (props.options?.fontScale ?? 1) * s.font.scale
  return {
    backgroundColor: s.page.bg,
    padding: `${s.page.padY}mm ${s.page.padX}mm`,
    fontFamily: s.font.family === 'serif' ? SERIF_STACK : SANS_STACK,
    fontSize: `calc(13px * ${scale})`,
    '--s-accent': accent.value,
    '--s-text': s.colors.text,
    '--s-muted': s.colors.muted,
    '--s-line': s.colors.hairline,
    '--s-gap': `${s.body.columnGap}px`,
    '--s-photo': `${s.header.photo.height}px`,
    '--s-font-scale': String(s.font.scale),
  }
})

const headerStyle = computed(() => {
  const h = props.schema.header
  const base: Record<string, string> = { position: 'relative' }
  if (h.bg !== 'none') base.background = h.bg
  return base
})

const STROKE: Record<string, string> = {
  phone:
    'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  email: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6',
  location: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  github:
    'M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.05.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z',
  chat: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  globe:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
}

const IconMini = defineComponent({
  name: 'IconMini',
  props: { name: { type: String, required: true } },
  setup(iconProps) {
    const filled = iconProps.name === 'github'
    return () =>
      h(
        'svg',
        {
          width: 11,
          height: 11,
          viewBox: '0 0 24 24',
          fill: filled ? 'currentColor' : 'none',
          stroke: filled ? 'none' : 'currentColor',
          'stroke-width': 2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true',
        },
        [h('path', { d: STROKE[iconProps.name] ?? STROKE.link })],
      )
  },
})

/** 单个区块的渲染（标题/段落/条目/要点/技能标签） */
const BlockSection = defineComponent({
  name: 'BlockSection',
  props: {
    section: { type: Object, required: true },
    sectionStyle: { type: Object, required: true },
  },
  setup(blockProps) {
    const style = blockProps.sectionStyle as TemplateSchema['section']
    const items = blockProps.section as Section
    return () => {
      const children: ReturnType<typeof h>[] = [
        h('h2', { class: ['sc-title', `is-${style.titleStyle}`] }, items.title),
      ]
      items.paragraphs.forEach((text, i) => {
        children.push(h('p', { class: 'sc-paragraph', key: `p-${i}` }, [h(RenderInline, { source: text })]))
      })
      for (const item of items.items) {
        if (item.title === '' && style.skillChips) {
          children.push(
            h(
              'div',
              { class: 'sc-chips' },
              item.bullets.map((b, j) =>
                h('span', { class: 'sc-chip', key: `chip-${j}` }, [h(RenderInline, { source: b })]),
              ),
            ),
          )
          continue
        }
        children.push(
          h('div', { class: 'sc-item' }, [
            h('div', { class: 'sc-item-head' }, [
              h('span', { class: 'sc-item-title' }, [
                item.title,
                item.subtitle ? h('span', { class: 'sc-item-subtitle' }, item.subtitle) : null,
              ]),
              item.date ? h('span', { class: 'sc-item-date' }, item.date) : null,
            ]),
            item.bullets.length
              ? h(
                  'ul',
                  { class: ['sc-bullets', `is-${style.bullets}`] },
                  item.bullets.map((b, j) =>
                    h('li', { key: `b-${j}` }, [h(RenderInline, { source: b })]),
                  ),
                )
              : null,
          ]),
        )
      }
      return h('div', children)
    }
  },
})
</script>

<template>
  <div class="schema-page" :style="rootStyle">
    <!-- v2 块布局 -->
    <template v-if="schema.layout">
      <div class="sc-columns" :class="{ 'aside-right': layout.aside === 'right' }">
        <aside
          v-if="layout.aside !== 'none'"
          class="sc-aside"
          :style="{ width: layout.asideWidth + '%' }"
        >
          <template v-for="block in layout.side" :key="block.id">
            <hr v-if="block.kind === 'divider'" class="sc-divider" />
            <section
              v-else-if="block.kind === 'section' && sectionByRef(block.ref)"
              class="sc-section sc-block"
            >
              <BlockSection :section="sectionByRef(block.ref)!" :section-style="schema.section" />
            </section>
          </template>
        </aside>
        <main class="sc-main" :class="{ 'is-two': layout.aside === 'none' && schema.body.columns === 2 }">
          <template v-for="block in layout.main" :key="block.id">
            <hr v-if="block.kind === 'divider'" class="sc-divider" />
            <header
              v-else-if="block.kind === 'header' && schema.header.show"
              class="sc-header"
              :class="`is-${schema.header.layout}`"
              :style="headerStyle"
            >
              <img
                v-if="photo && schema.header.photo.show"
                class="sc-photo"
                :src="photo"
                :style="{ height: 'var(--s-photo)' }"
                alt=""
              />
              <h1 v-if="data.basics.name" class="sc-name">{{ data.basics.name }}</h1>
              <p v-if="data.basics.label" class="sc-label">{{ data.basics.label }}</p>
              <p v-if="contacts.length" class="sc-contact">
                <template v-if="schema.section.showIcons">
                  <span v-for="c in contacts" :key="c.text" class="sc-contact-item">
                    <IconMini :name="c.icon ?? 'link'" />
                    <span>{{ c.text }}</span>
                  </span>
                </template>
                <template v-else>
                  <template v-for="(c, i) in contacts" :key="c.text">
                    <span v-if="i > 0" class="sc-sep">·</span>
                    <span>{{ c.text }}</span>
                  </template>
                </template>
              </p>
              <p
                v-if="data.basics.summary && schema.header.showSummary"
                class="sc-summary"
              >
                {{ data.basics.summary }}
              </p>
            </header>
            <section
              v-else-if="block.kind === 'section' && sectionByRef(block.ref)"
              class="sc-section sc-block"
            >
              <BlockSection :section="sectionByRef(block.ref)!" :section-style="schema.section" />
            </section>
          </template>
        </main>
      </div>
    </template>

    <!-- legacy（v1）：header + 全部区块顺排 -->
    <template v-else>
      <header
        v-if="schema.header.show"
        class="sc-header"
        :class="`is-${schema.header.layout}`"
        :style="headerStyle"
      >
        <img
          v-if="photo && schema.header.photo.show"
          class="sc-photo"
          :src="photo"
          :style="{ height: 'var(--s-photo)' }"
          alt=""
        />
        <h1 v-if="data.basics.name" class="sc-name">{{ data.basics.name }}</h1>
        <p v-if="data.basics.label" class="sc-label">{{ data.basics.label }}</p>
        <p v-if="contacts.length" class="sc-contact">
          <template v-if="schema.section.showIcons">
            <span v-for="c in contacts" :key="c.text" class="sc-contact-item">
              <IconMini :name="c.icon ?? 'link'" />
              <span>{{ c.text }}</span>
            </span>
          </template>
          <template v-else>
            <template v-for="(c, i) in contacts" :key="c.text">
              <span v-if="i > 0" class="sc-sep">·</span>
              <span>{{ c.text }}</span>
            </template>
          </template>
        </p>
        <p v-if="data.basics.summary && schema.header.showSummary" class="sc-summary">
          {{ data.basics.summary }}
        </p>
      </header>

      <main class="sc-body" :class="{ 'is-two': schema.body.columns === 2 }">
        <section v-for="sec in visibleSections" :key="sec.id" class="sc-section">
          <BlockSection :section="sec" :section-style="schema.section" />
        </section>
      </main>
    </template>

    <p v-if="!data.sections.length && !data.basics.name" class="sc-empty">
      {{ $t('preview.empty') }}
    </p>
  </div>
</template>

<style scoped>
.schema-page {
  min-height: 100%;
  color: var(--s-text);
  line-height: 1.55;
}

/* ---- v2 块布局 ---- */
.sc-columns {
  display: flex;
  gap: var(--s-gap);
  align-items: flex-start;
}

.sc-columns.aside-right {
  flex-direction: row-reverse;
}

.sc-aside {
  flex-shrink: 0;
}

.sc-main {
  flex: 1;
  min-width: 0;
}

.sc-divider {
  margin: 14px 0;
  border: 0;
  border-top: 1px solid var(--s-line);
}

/* ---- 头部 ---- */
.sc-header {
  margin-bottom: 10px;
}

.sc-header.is-center {
  text-align: center;
}

.sc-photo {
  position: absolute;
  top: 0;
  right: 0;
  width: auto;
  max-width: calc(var(--s-photo) * 0.78);
  object-fit: cover;
}

.sc-name {
  margin: 0;
  font-size: calc(23px * var(--s-font-scale, 1));
  font-weight: 700;
  letter-spacing: 2px;
}

.sc-label {
  margin: 3px 0 0;
  font-size: 0.95em;
  font-weight: 500;
  color: var(--s-accent);
}

.sc-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 0 8px;
  margin: 6px 0 0;
  font-size: 0.88em;
  color: var(--s-muted);
}

.sc-header.is-center .sc-contact {
  justify-content: center;
}

.sc-header.on-bg .sc-contact,
.sc-header.on-bg .sc-summary {
  color: inherit;
  opacity: 0.85;
}

.sc-contact-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sc-contact-item svg {
  color: var(--s-accent);
}

.sc-header.on-bg .sc-contact-item svg {
  color: inherit;
}

.sc-sep {
  color: var(--s-line);
}

.sc-summary {
  max-width: 90%;
  margin: 8px auto 0;
  font-size: 0.92em;
  color: var(--s-muted);
}

.sc-header.is-left .sc-summary {
  margin-left: 0;
}

/* ---- 正文 ---- */
.sc-body.is-two {
  column-count: 2;
  column-gap: var(--s-gap);
}

.sc-section {
  margin-top: 14px;
  break-inside: auto;
}

.sc-title {
  margin: 0 0 7px;
  font-size: 1.05em;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--s-accent);
  break-after: avoid;
}

.sc-title.is-underline {
  padding-bottom: 4px;
  border-bottom: 1px solid var(--s-line);
}

.sc-title.is-bar {
  padding-left: 8px;
  border-left: 3px solid var(--s-accent);
}

.sc-title.is-plain {
  color: var(--s-text);
}

.sc-title.is-boxed {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--s-accent) 10%, #fff);
}

.sc-paragraph {
  margin: 4px 0;
  break-inside: avoid;
}

.sc-item {
  margin: 0 0 9px;
  break-inside: avoid;
}

.sc-item-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.sc-item-title {
  font-weight: 700;
}

.sc-item-subtitle {
  margin-left: 8px;
  font-weight: 400;
  font-size: 0.95em;
  color: var(--s-muted);
}

.sc-item-date {
  font-size: 0.9em;
  color: var(--s-muted);
  white-space: nowrap;
}

.sc-bullets {
  margin: 4px 0 0;
  padding-left: 1.2em;
}

.sc-bullets.is-dash {
  list-style: none;
  padding-left: 0.9em;
}

.sc-bullets.is-dash li::before {
  content: '– ';
  color: var(--s-accent);
}

.sc-bullets.is-none {
  list-style: none;
  padding-left: 0;
}

.sc-bullets li {
  margin: 2px 0;
  break-inside: avoid;
}

.sc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 2px 0;
}

.sc-chip {
  padding: 2px 10px;
  border: 1px solid var(--s-line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--s-accent) 8%, #fff);
  font-size: 0.92em;
  color: var(--s-text);
}

.schema-page :deep(a) {
  color: var(--s-accent);
  text-decoration: none;
}

.schema-page :deep(code) {
  padding: 0 4px;
  border-radius: 3px;
  background: #f1f5f9;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
  font-size: 0.92em;
}

.sc-empty {
  margin: 120px 0 0;
  text-align: center;
  font-size: 13px;
  color: #9aa5b1;
}
</style>
