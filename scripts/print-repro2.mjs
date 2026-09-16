// 补充复现：超宽横向照片 + 两页长简历（覆盖用户内容形态的剩余组合）
import { spawn } from 'node:child_process'
import fs from 'node:fs'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL_BASE = 'https://sylverqg.github.io/resume/'
const PORT = 9224

const proc = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=D:/Works/resume/.chrome-tmp',
    '--no-first-run',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
await new Promise((r) => setTimeout(r, 3000))

const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
const page = list.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
let msgId = 0
const pending = new Map()
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id).resolve(msg.result)
    pending.delete(msg.id)
  }
}
await new Promise((r) => (ws.onopen = r))
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++msgId
    pending.set(id, { resolve })
    ws.send(JSON.stringify({ id, method, params }))
  })

async function navigate(url) {
  await send('Page.enable')
  await send('Page.navigate', { url })
  await new Promise((r) => setTimeout(r, 6000))
}

async function printToPdf(outFile) {
  const res = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true })
  if (res?.data) {
    fs.writeFileSync(outFile, Buffer.from(res.data, 'base64'))
    console.log(`  -> ${outFile}: ${fs.statSync(outFile).size} bytes`)
  } else {
    console.log('  -> printToPDF FAILED:', JSON.stringify(res))
  }
}

const longMarkdown = [
  '# 长内容测试',
  '> 两页长简历 + 超宽横向照片的场景复现。',
  '## 工作经历',
  ...Array.from({ length: 6 }, (_, i) =>
    [
      `### 公司${i + 1} | 工程师 | 20${10 + i}.01 - 20${11 + i}.06`,
      '- 负责核心系统性能优化，QPS 提升 300%',
      '- 主导微服务改造，稳定性达到 99.99%',
      '- 搭建自动化发布流水线，发布时长缩短 80%',
    ].join('\n'),
  ),
].join('\n\n')

console.log('[A] 超宽横向照片（4000x1200）+ 长简历（约 2 页）')
await navigate(URL_BASE)
await send('Runtime.evaluate', {
  expression: `(() => {
    const c = document.createElement('canvas')
    c.width = 4000; c.height = 1200
    const x = c.getContext('2d')
    x.fillStyle = '#c8d4e0'; x.fillRect(0, 0, 4000, 1200)
    x.fillStyle = '#44566c'; x.font = '200px sans-serif'; x.fillText('WIDE PHOTO', 1200, 650)
    const md = ${JSON.stringify(longMarkdown)}
    const state = {
      version: 2,
      resumes: [{
        id: 'repro-2', name: '长简历', createdAt: ${Date.now()}, updatedAt: ${Date.now()},
        markdown: md, templateId: 'classic', optionsByTemplate: {}, customCss: '',
        photo: c.toDataURL('image/jpeg', 0.9), photoScale: 1,
      }],
      activeResumeId: 'repro-2', presets: [], targetPages: 2, locale: 'zh-CN',
    }
    localStorage.setItem('resume-app:v1', JSON.stringify(state))
    return 'state written, photo len=' + c.toDataURL('image/jpeg', 0.9).length
  })()`,
  returnByValue: true,
}).then((r) => console.log('  setup:', r?.result?.value))
await navigate(URL_BASE)
await printToPdf('repro-wide-long.pdf')

// 也测一下用户实际会用的交互路径等价物：不启用 preferCSSPageSize（用默认 A4 + 浏览器缩放）
console.log('[B] 同场景但忽略 @page（模拟部分浏览器行为）')
const res = await send('Page.printToPDF', { printBackground: true })
if (res?.data) {
  fs.writeFileSync('repro-wide-long-default.pdf', Buffer.from(res.data, 'base64'))
  console.log(`  -> repro-wide-long-default.pdf: ${fs.statSync('repro-wide-long-default.pdf').size} bytes`)
}

proc.kill()
ws.close()
console.log('done')
