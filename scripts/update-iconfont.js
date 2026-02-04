// iconfont-auto-update.js
// 功能：
// 1. 自动下载 iconfont symbol js
// 2. 自动移除非 -fill 结尾图标的 fill 属性
// 3. 保留 -fill 图标的原始颜色（用于实色 icon）

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ==================== 基础配置 ====================
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// iconfont 项目 Symbol 在线链接（无需加 https:）
const ICONFONT_URL = '//at.alicdn.com/t/c/font_5115244_qc9uco1dy2r.js'

// 输出路径（按你的项目结构调整）
const outputPath = path.resolve(
  __dirname,
  '../src/assets/iconfont/iconfont.js'
)

// ==================== 工具函数 ====================
function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, 'utf-8', (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

// ==================== 核心处理逻辑 ====================
// 规则：
// - symbol id 以 -fill 结尾 → 保留 fill
// - 其他 symbol → 移除 fill
async function removeSvgFill() {
  try {
    console.log('正在处理 fill 属性（保留 -fill 图标）...')

    const originalContent = await readFile(outputPath)

    const processedContent = originalContent.replace(
      /<symbol\s+[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g,
      (match, symbolId, symbolContent) => {
        // -fill 结尾的图标：原样返回
        if (symbolId.endsWith('-fill')) {
          return match
        }

        // 其他图标：移除 fill 属性
        const cleanedContent = symbolContent.replace(
          /fill="[^"]*"/g,
          ''
        )

        return match.replace(symbolContent, cleanedContent)
      }
    )

    await writeFile(outputPath, processedContent)

    console.log('fill 属性处理完成！')
  } catch (err) {
    console.error('处理 fill 属性失败：', err.message)
    process.exit(1)
  }
}

// ==================== 下载处理 ====================
function handleResponse(res) {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  })

  res.on('end', async () => {
    try {
      // 写入原始 iconfont.js
      fs.writeFileSync(outputPath, data, 'utf-8')
      console.log('iconfont.js 下载成功！')
      console.log(`文件路径：${outputPath}`)

      // 自动处理 fill
      await removeSvgFill()

      console.log('==============================')
      console.log('iconfont.js 下载 + 处理完成 ✅')
      console.log('可直接在项目中使用 currentColor')
    } catch (err) {
      console.error('文件写入或处理失败：', err.message)
      process.exit(1)
    }
  })
}

// ==================== 入口 ====================
console.log('正在下载 iconfont.js ...')

https
  .get(`https:${ICONFONT_URL}`, (res) => {
    // 处理 301 / 302 重定向
    if (res.statusCode === 301 || res.statusCode === 302) {
      console.log('检测到重定向，正在跳转...')
      https
        .get(res.headers.location, handleResponse)
        .on('error', (err) => {
          console.error('重定向下载失败：', err.message)
          process.exit(1)
        })
    } else {
      handleResponse(res)
    }
  })
  .on('error', (err) => {
    console.error('下载失败：', err.message)
    process.exit(1)
  })
