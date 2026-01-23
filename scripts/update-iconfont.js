import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

//  iconfont 项目 Symbol 在线链接
const ICONFONT_URL = '//at.alicdn.com/t/c/font_5115244_f4arwqis8s.js'

const outputPath = path.resolve(__dirname, '../src/assets/iconfont/iconfont.js')

console.log('正在下载 iconfont.js ...')

https.get(`https:${ICONFONT_URL}`, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
        // 处理重定向
        https.get(res.headers.location, handleResponse)
    } else {
        handleResponse(res)
    }
}).on('error', (err) => {
    console.error('下载失败:', err.message)
    process.exit(1)
})

function handleResponse(res) {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
        fs.writeFileSync(outputPath, data, 'utf-8')
        console.log('iconfont.js 更新成功！')
        console.log(`文件路径: ${outputPath}`)
    })
}
