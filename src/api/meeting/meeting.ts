import { get, post, put, del } from '@/utils/request'

export interface Meeting {
  id: number
  title: string
  description?: string
  roomId: string
  hostId: number
  host?: any
  startTime?: string
  endTime?: string
  status: 'scheduled' | 'ongoing' | 'ended' | 'cancelled'
  isRecording: boolean
  enableScreenShare: boolean
  enableSubtitle: boolean
  participants?: MeetingParticipant[]
  createdAt: string
  updatedAt: string
}

export interface MeetingParticipant {
  id: number
  meetingId: number
  userId: number
  user?: any
  role: 'host' | 'participant' | 'guest'
  status: 'invited' | 'joined' | 'left'
  cameraEnabled?: boolean
  micEnabled?: boolean
  screenSharing?: boolean
  joinTime?: string
  leaveTime?: string
}

export interface CreateMeetingParams {
  title: string
  description?: string
  hostId: number
  participantIds?: number[]
  startTime?: string
  endTime?: string
  isRecording?: boolean
  enableScreenShare?: boolean
  enableSubtitle?: boolean
  reminderTime?: number
}

export interface UpdateMeetingParams {
  id: number
  title?: string
  description?: string
  startTime?: string
  endTime?: string
  isRecording?: boolean
  enableScreenShare?: boolean
  enableSubtitle?: boolean
  reminderTime?: number
}

export interface JoinMeetingParams {
  roomId: string
  userId: number
  username: string
}

export interface GetMeetingsParams {
  userId: number
  status?: 'scheduled' | 'ongoing' | 'ended' | 'cancelled'
  page?: number
  pageSize?: number
}

export interface InviteParticipantParams {
  meetingId: number
  userIds: number[]
}

export interface RemoveParticipantParams {
  meetingId: number
  userId: number
}

export const meetingApi = {
  create: (data: CreateMeetingParams) =>
    post<Meeting>('/meetings', data),

  update: (data: UpdateMeetingParams) =>
    put<Meeting>('/meetings', data),

  cancel: (data: { id: number; userId: number }) =>
    del<Meeting>('/meetings/cancel', data),

  getById: (id: number) =>
    get<Meeting>(`/meetings/${id}`),

  getByRoomId: (roomId: string) =>
    get<Meeting>(`/meetings/room/${roomId}`),

  getByUserId: (params: GetMeetingsParams) =>
    get<{ meetings: Meeting[]; total: number }>('/meetings', { params }),

  getScheduled: (userId: number) =>
    get<Meeting[]>(`/meetings/scheduled/${userId}`),

  getOngoing: (userId: number) =>
    get<Meeting[]>(`/meetings/ongoing/${userId}`),

  getHistory: (userId: number, page: number = 1, pageSize: number = 10) =>
    get<{ meetings: Meeting[]; total: number }>(`/meetings/history/${userId}`, {
      params: { page, pageSize }
    }),

  start: (roomId: string) =>
    post<Meeting>(`/meetings/${roomId}/start`),

  end: (roomId: string) =>
    post<Meeting>(`/meetings/${roomId}/end`),

  join: (data: JoinMeetingParams) =>
    post<MeetingParticipant>('/meetings/join', data),

  leave: (data: { meetingId: number; userId: number }) =>
    post<void>('/meetings/leave', data),

  invite: (data: InviteParticipantParams) =>
    post<MeetingParticipant[]>('/meetings/invite', data),

  removeParticipant: (data: RemoveParticipantParams) =>
    post<void>('/meetings/remove-participant', data),

  getParticipants: (meetingId: number) =>
    get<MeetingParticipant[]>(`/meetings/${meetingId}/participants`),

  updateMediaStatus: (data: {
    meetingId: number
    userId: number
    camera?: boolean
    mic?: boolean
    screenSharing?: boolean
  }) =>
    post<MeetingParticipant>('/meetings/media-status', data),
}
