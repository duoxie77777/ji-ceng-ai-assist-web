<template>
    <div class="calendar-section">
        <div class="section-header">
            <div class="section-title">
                <el-icon>
                    <Calendar />
                </el-icon>
                <span>会议日程</span>
            </div>
            <div class="view-switch">
                <el-radio-group v-model="localViewMode" size="small">
                    <el-radio-button label="day">日</el-radio-button>
                    <el-radio-button label="week">周</el-radio-button>
                    <el-radio-button label="month">月</el-radio-button>
                </el-radio-group>
            </div>
            <div class="date-nav">
                <el-button text circle @click="prevDate">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                </el-button>
                <span class="current-date">{{ currentDateStr }}</span>
                <el-button text circle @click="nextDate">
                    <el-icon>
                        <ArrowRight />
                    </el-icon>
                </el-button>
                <el-button size="small" @click="goToday" class="today-btn">今天</el-button>
            </div>
        </div>

        <div class="calendar-body">
            <!-- 周视图 -->
            <div v-if="localViewMode === 'week'" class="week-view">
                <div class="time-column">
                    <div class="time-header"></div>
                    <div v-for="hour in hours" :key="hour" class="time-slot">
                        {{ hour }}:00
                    </div>
                </div>
                <div class="days-container">
                    <div v-for="(day, index) in weekDays" :key="index" class="day-column"
                        :class="{ today: day.isToday }">
                        <div class="day-header">
                            <span class="day-name">{{ day.name }}</span>
                            <span class="day-date" :class="{ 'is-today': day.isToday }">{{ day.date }}</span>
                        </div>
                        <div class="day-slots">
                            <div v-for="hour in hours" :key="hour" class="hour-slot">
                                <template v-for="meeting in getMeetingsForSlot(day.fullDate, hour)" :key="meeting.id">
                                    <div class="meeting-block" :class="meeting.type"
                                        :style="{ height: meeting.duration * 60 + 'px' }"
                                        @click="$emit('view-meeting', meeting)">
                                        <div class="meeting-time">{{ meeting.startTime }}</div>
                                        <div class="meeting-title">{{ meeting.title }}</div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 月视图 -->
            <div v-else-if="localViewMode === 'month'" class="month-view">
                <div class="month-header">
                    <div v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="month-day-name">
                        周{{ day }}
                    </div>
                </div>
                <div class="month-grid">
                    <div v-for="(day, index) in monthDays" :key="index" class="month-day" :class="{
                        'other-month': !day.currentMonth,
                        'today': day.isToday,
                        'has-meeting': day.meetings > 0
                    }">
                        <span class="day-number">{{ day.date }}</span>
                        <div class="day-meetings" v-if="day.meetings > 0">
                            <span class="meeting-dot" v-for="n in Math.min(day.meetings, 3)" :key="n"></span>
                            <span class="meeting-count" v-if="day.meetings > 3">+{{ day.meetings - 3 }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 日视图 -->
            <div v-else class="day-view">
                <div class="day-timeline">
                    <div v-for="hour in hours" :key="hour" class="timeline-slot">
                        <div class="slot-time">{{ hour }}:00</div>
                        <div class="slot-content">
                            <template v-for="meeting in getMeetingsForSlot(currentDateISO, hour)" :key="meeting.id">
                                <div class="day-meeting-card" :class="meeting.type"
                                    @click="$emit('view-meeting', meeting)">
                                    <div class="card-header">
                                        <span class="meeting-type-tag">{{ getTypeLabel(meeting.type) }}</span>
                                        <span class="meeting-duration">{{ meeting.duration }}小时</span>
                                    </div>
                                    <div class="card-title">{{ meeting.title }}</div>
                                    <div class="card-info">
                                        <span class="info-item">
                                            <el-icon>
                                                <Clock />
                                            </el-icon>
                                            {{ meeting.startTime }} - {{ meeting.endTime }}
                                        </span>
                                        <span class="info-item">
                                            <el-icon>
                                                <User />
                                            </el-icon>
                                            {{ meeting.participants }}人
                                        </span>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { Calendar, ArrowLeft, ArrowRight, Clock, User } from '@element-plus/icons-vue'

interface Meeting {
    id: string
    title: string
    type: string
    date: string
    startTime: string
    endTime: string
    duration: number
    participants: number
}

const props = defineProps<{
    meetings: Meeting[]
    viewMode: string
}>()

const emit = defineEmits(['update:viewMode', 'view-meeting'])

const localViewMode = ref(props.viewMode)
const currentDate = ref(new Date())

watch(() => props.viewMode, (val) => {
    localViewMode.value = val
})

watch(localViewMode, (val) => {
    emit('update:viewMode', val)
})

const hours = Array.from({ length: 12 }, (_, i) => i + 8)

const currentDateStr = computed(() => {
    const d = currentDate.value
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

const currentDateISO = computed(() => {
    return currentDate.value.toISOString().split('T')[0]
})

const weekDays = computed(() => {
    const today = new Date()
    const current = new Date(currentDate.value)
    const dayOfWeek = current.getDay() || 7
    const monday = new Date(current)
    monday.setDate(current.getDate() - dayOfWeek + 1)

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return {
            name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
            date: d.getDate(),
            fullDate: d.toISOString().split('T')[0],
            isToday: d.toDateString() === today.toDateString()
        }
    })
})

const monthDays = computed(() => {
    const today = new Date()
    const current = new Date(currentDate.value)
    const year = current.getFullYear()
    const month = current.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = (firstDay.getDay() || 7) - 1
    const days: any[] = []

    for (let i = startPadding; i > 0; i--) {
        const d = new Date(year, month, 1 - i)
        days.push({
            date: d.getDate(),
            currentMonth: false,
            isToday: false,
            meetings: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0
        })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const d = new Date(year, month, i)
        days.push({
            date: i,
            currentMonth: true,
            isToday: d.toDateString() === today.toDateString(),
            meetings: Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0
        })
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
        days.push({
            date: i,
            currentMonth: false,
            isToday: false,
            meetings: Math.random() > 0.8 ? Math.floor(Math.random() * 2) : 0
        })
    }

    return days
})

const getMeetingsForSlot = (date: string, hour: number) => {
    return props.meetings.filter(m => {
        const meetingHour = parseInt(m.startTime.split(':')[0])
        return m.date === date && meetingHour === hour
    })
}

const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
        normal: '普通',
        important: '重要',
        training: '培训'
    }
    return map[type] || '普通'
}

const prevDate = () => {
    const d = new Date(currentDate.value)
    if (localViewMode.value === 'day') d.setDate(d.getDate() - 1)
    else if (localViewMode.value === 'week') d.setDate(d.getDate() - 7)
    else d.setMonth(d.getMonth() - 1)
    currentDate.value = d
}

const nextDate = () => {
    const d = new Date(currentDate.value)
    if (localViewMode.value === 'day') d.setDate(d.getDate() + 1)
    else if (localViewMode.value === 'week') d.setDate(d.getDate() + 7)
    else d.setMonth(d.getMonth() + 1)
    currentDate.value = d
}

const goToday = () => {
    currentDate.value = new Date()
}
</script>

<style scoped lang="less">
.calendar-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--white);
    border-radius: 10px;
    border: 1px solid var(--gray-200);
    overflow: hidden;

    .section-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--gray-100);

        .section-title {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            font-weight: 600;
            color: var(--gray-800);
        }

        .date-nav {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 6px;

            .current-date {
                font-size: 13px;
                font-weight: 500;
                color: var(--gray-700);
                min-width: 100px;
                text-align: center;
            }

            .today-btn {
                margin-left: 6px;
            }
        }
    }

    .calendar-body {
        flex: 1;
        overflow: auto;
        padding: 12px;
    }
}

.week-view {
    display: flex;
    height: 100%;
    min-height: 400px;

    .time-column {
        width: 46px;
        flex-shrink: 0;

        .time-header {
            height: 36px;
        }

        .time-slot {
            height: 40px;
            display: flex;
            align-items: flex-start;
            justify-content: flex-end;
            padding-right: 8px;
            font-size: 11px;
            color: var(--gray-500);
        }
    }

    .days-container {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--gray-200);
        border-radius: 6px;
        overflow: hidden;

        .day-column {
            background: var(--white);

            &.today {
                background: var(--blue-50);

                .day-header {
                    background: var(--blue-500);

                    .day-name,
                    .day-date {
                        color: white;
                    }
                }
            }

            .day-header {
                height: 36px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: var(--gray-50);
                border-bottom: 1px solid var(--gray-200);

                .day-name {
                    font-size: 10px;
                    color: var(--gray-500);
                }

                .day-date {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--gray-800);

                    &.is-today {
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        background: var(--blue-500);
                        color: white;
                    }
                }
            }

            .day-slots {
                .hour-slot {
                    height: 40px;
                    border-bottom: 1px solid var(--gray-100);
                    position: relative;

                    .meeting-block {
                        position: absolute;
                        left: 2px;
                        right: 2px;
                        top: 0;
                        border-radius: 4px;
                        padding: 3px 5px;
                        cursor: pointer;
                        overflow: hidden;
                        transition: all 0.2s ease;
                        z-index: 1;

                        &:hover {
                            transform: scale(1.02);
                            z-index: 2;
                        }

                        &.normal {
                            background: var(--blue-100);
                            border-left: 2px solid var(--blue-500);
                        }

                        &.important {
                            background: var(--red-50);
                            border-left: 2px solid var(--red-500);
                        }

                        &.training {
                            background: var(--green-50);
                            border-left: 2px solid var(--green-500);
                        }

                        .meeting-time {
                            font-size: 10px;
                            color: var(--gray-500);
                        }

                        .meeting-title {
                            font-size: 11px;
                            font-weight: 500;
                            color: var(--gray-800);
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                    }
                }
            }
        }
    }
}

.month-view {
    .month-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        margin-bottom: 4px;

        .month-day-name {
            text-align: center;
            font-size: 11px;
            font-weight: 500;
            color: var(--gray-500);
            padding: 4px 0;
        }
    }

    .month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 1px;
        background: var(--gray-200);
        border-radius: 6px;
        overflow: hidden;

        .month-day {
            height: 80px;
            background: var(--white);
            padding: 4px 6px;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                background: var(--gray-50);
            }

            &.other-month {
                opacity: 0.4;
            }

            &.today {
                background: var(--blue-50);

                .day-number {
                    width: 18px;
                    height: 18px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background: var(--blue-500);
                    color: white;
                    font-size: 11px;
                }
            }

            .day-number {
                font-size: 11px;
                font-weight: 500;
                color: var(--gray-800);
            }

            .day-meetings {
                margin-top: 2px;
                display: flex;
                flex-wrap: wrap;
                gap: 2px;

                .meeting-dot {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: var(--blue-500);
                }

                .meeting-count {
                    font-size: 9px;
                    color: var(--gray-500);
                }
            }
        }
    }
}

.day-view {
    .day-timeline {
        .timeline-slot {
            display: flex;
            min-height: 56px;
            border-bottom: 1px solid var(--gray-100);

            .slot-time {
                width: 46px;
                flex-shrink: 0;
                font-size: 11px;
                color: var(--gray-500);
                padding-top: 6px;
            }

            .slot-content {
                flex: 1;
                padding: 6px;

                .day-meeting-card {
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 6px;

                    &:hover {
                        transform: translateX(3px);
                    }

                    &.normal {
                        background: var(--blue-100);
                        border-left: 3px solid var(--blue-500);
                    }

                    &.important {
                        background: var(--red-50);
                        border-left: 3px solid var(--red-500);
                    }

                    &.training {
                        background: var(--green-50);
                        border-left: 3px solid var(--green-500);
                    }

                    .card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 6px;

                        .meeting-type-tag {
                            font-size: 10px;
                            padding: 2px 6px;
                            border-radius: 8px;
                            background: rgba(0, 0, 0, 0.06);
                            color: var(--gray-600);
                        }

                        .meeting-duration {
                            font-size: 11px;
                            color: var(--gray-500);
                        }
                    }

                    .card-title {
                        font-size: 13px;
                        font-weight: 600;
                        color: var(--gray-800);
                        margin-bottom: 6px;
                    }

                    .card-info {
                        display: flex;
                        gap: 12px;

                        .info-item {
                            display: flex;
                            align-items: center;
                            gap: 3px;
                            font-size: 11px;
                            color: var(--gray-600);
                        }
                    }
                }
            }
        }
    }
}
</style>
