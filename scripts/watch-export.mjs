// 监控导出目标目录，记录文件创建/大小变化（2 分钟）
import fs from 'node:fs'

const dirs = ['D:/resume-export-test', 'D:/Documents', 'D:/Downloads']
const marker = 'D:/Works/resume/.watch-marker'
fs.writeFileSync(marker, String(Date.now()))

const seen = new Map()
const log = (line) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${line}`)
}

log('watching: ' + dirs.join(', '))

for (let i = 0; i < 180; i++) {
  for (const dir of dirs) {
    let entries = []
    try {
      entries = fs.readdirSync(dir)
    } catch {
      continue
    }
    for (const name of entries) {
      const full = `${dir}/${name}`
      let size = -1
      try {
        size = fs.statSync(full).size
      } catch {
        continue
      }
      if (name.endsWith('.crdownload') || name.endsWith('.tmp')) {
        log(`PARTIAL ${full} (${size}b)`)
        continue
      }
      if (name.endsWith('.pdf') || name.endsWith('.zd')) {
        const key = `${full}`
        if (seen.get(key) !== size) {
          seen.set(key, size)
          log(`FILE ${full} -> ${size} bytes`)
        }
      }
    }
  }
  await new Promise((r) => setTimeout(r, 1000))
}
log('watch finished')
