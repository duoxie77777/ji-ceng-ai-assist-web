import type { MockMethod } from 'vite-plugin-mock'

// 模拟用户数据
const users = [
    { id: 1, username: 'admin', password: '123456', avatar: 'https://example.com/avatar.png' },
    { id: 2, username: 'user', password: '123456', avatar: 'https://example.com/avatar2.png' },
]

// 模拟 token
const createToken = (username: string) => `mock_token_${username}_${Date.now()}`

export default [
    // 登录接口
    {
        url: '/api/auth/login',
        method: 'post',
        response: ({ body }: { body: { username: string; password: string } }) => {
            const { username, password } = body
            const user = users.find(u => u.username === username && u.password === password)

            if (user) {
                return {
                    code: 0,
                    data: {
                        accessToken: createToken(username),
                        refreshToken: `refresh_${createToken(username)}`,
                        user: {
                            id: user.id,
                            username: user.username,
                            avatar: user.avatar,
                        },
                    },
                    message: '登录成功',
                }
            }

            return {
                code: 401,
                data: null,
                message: '用户名或密码错误',
            }
        },
    },

    // 获取用户信息
    {
        url: '/api/user/info',
        method: 'get',
        response: ({ headers }: { headers: Record<string, string> }) => {
            const token = headers.authorization?.replace('Bearer ', '')

            if (!token || !token.startsWith('mock_token_')) {
                return {
                    code: 401,
                    data: null,
                    message: '未登录或 token 已过期',
                }
            }

            // 从 token 中提取用户名
            const username = token.split('_')[2]
            const user = users.find(u => u.username === username)

            if (user) {
                return {
                    code: 0,
                    data: {
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar,
                    },
                    message: 'success',
                }
            }

            return {
                code: 401,
                data: null,
                message: '用户不存在',
            }
        },
    },

    // 退出登录
    {
        url: '/api/auth/logout',
        method: 'post',
        response: () => ({
            code: 0,
            data: null,
            message: '退出成功',
        }),
    },
] as MockMethod[]
