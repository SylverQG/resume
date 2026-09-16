// 一次性脚本：CDP 驱动无头 Chrome，在有/无照片两种状态下调用 Page.printToPDF 复现用户问题
import { spawn } from 'node:child_process'
import fs from 'node:fs'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL_BASE = 'https://sylverqg.github.io/resume/'
const PORT = 9223

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
ws.onerror = (e) => console.error('ws error', e)
await new Promise((r) => (ws.onopen = r))

function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = ++msgId
    pending.set(id, { resolve })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function navigate(url) {
  await send('Page.enable')
  await send('Page.navigate', { url })
  await new Promise((r) => setTimeout(r, 6000)) // 等待加载 + Vue 渲染 + store 初始化
}

async function printToPdf(outFile) {
  const res = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true })
  if (res?.data) {
    fs.writeFileSync(outFile, Buffer.from(res.data, 'base64'))
    console.log(`  -> ${outFile}: ${fs.statSync(outFile).size} bytes`)
    return true
  }
  console.log('  -> printToPDF failed:', JSON.stringify(res))
  return false
}

// === 1. 对照组：无照片（默认示例简历） ===
console.log('[1] no photo')
await navigate(URL_BASE)
await printToPdf('repro-nophoto.pdf')

// === 2. 实验组：注入一张 3:4 测试照片 ===
console.log('[2] with photo')
await send('Runtime.evaluate', {
  expression: `(() => {
    const c = document.createElement('canvas')
    c.width = 300; c.height = 400
    const x = c.getContext('2d')
    x.fillStyle = '#dde3ea'; x.fillRect(0, 0, 300, 400)
    x.fillStyle = '#5b6b7d'; x.beginPath(); x.arc(150, 140, 60, 0, 7); x.fill()
    x.fillRect(80, 230, 140, 170)
    window.__photo = c.toDataURL('image/jpeg', 0.9)
    return window.__photo.length
  })()`,
  returnByValue: true,
}).then((r) => console.log('  photo dataURL length:', r?.result?.value))

await send('Runtime.evaluate', {
  expression: `(() => {
    const KEY = 'resume-app:v1'
    const state = {
      version: 2,
      resumes: [{
        id: 'repro-1',
        name: '复现测试',
        createdAt: ${Date.now()},
        updatedAt: ${Date.now()},
        markdown: '# 测试\\n\\n## 工作经历\\n### 测试公司 | 工程师 | 2021.07 - 至今\\n- 要点一\\n- 要点二\\n\\n## 教育经历\\n### 测试大学 | 本科 | 2017.09 - 2021.06\\n- 要点\\n\\n## 技能\\n- 技能 A\\n- 技能 B\\n',
        templateId: 'classic',
        optionsByTemplate: {},
        customCss: '',
        photo: window.__photo,
        photoScale: 1,
      }],
      activeResumeId: 'repro-1',
      presets: [],
      targetPages: 1,
      locale: 'zh-CN',
    }
    localStorage.setItem(KEY, JSON.stringify(state))
    return 'state written, photo len=' + window.__photo.length
  })()`,
  returnByValue: true,
}).then((r) => console.log('  localStorage:', r?.result?.value))

await navigate(URL_BASE) // 重载，store 从 localStorage 读到照片

// 确认照片真的渲染了
const check = await send('Runtime.evaluate', {
  expression: `(() => {
    const img = document.querySelector('.resume-page img')
    return img ? 'photo img rendered, src len=' + img.src.length : 'NO photo img found'
  })()`,
  returnByValue: true,
})
console.log('  check:', check?.result?.value)

await printToPdf('repro-photo.pdf')

// === 3. 再放大照片到 1.6x 复现滑杆大图场景 ===
console.log('[3] with photo @1.6x')
await send('Runtime.evaluate', {
  expression: `(() => {
    const state = JSON.parse(localStorage.getItem('resume-app:v1'))
    state.resumes[0].photoScale = 1.6
    localStorage.setItem('resume-app:v1', JSON.stringify(state))
    return 'scaled'
  })()`,
})
await navigate(URL_BASE)
await printToPdf('repro-photo-16x.pdf')

proc.kill()
ws.close()
console.log('done')
