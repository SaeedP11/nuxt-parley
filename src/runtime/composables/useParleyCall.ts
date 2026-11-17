import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { CallHandlers, CallMediaState, CallMessageSchema, CallPhase, ParticipantStatus } from 'vue-parley'
import { useCallStore } from '../parley'
import { formatDuration } from '../utils/format'

export interface ParleyCallParticipant {
  id: string
  userId: string
  name: string
  isSelf: boolean
  joinedAt?: number
  media?: CallMediaState
  camera?: MediaStream
  screen?: MediaStream
  status: ParticipantStatus
}

export interface UseParleyCallReturn {
  callStore: ReturnType<typeof useCallStore>
  session: ComputedRef<ReturnType<typeof useCallStore>['session']>
  isActive: ComputedRef<boolean>
  isMinimized: ComputedRef<boolean>
  isVideoCall: ComputedRef<boolean>
  channelId: ComputedRef<string | null>
  elapsedTime: ComputedRef<number>
  formattedDuration: ComputedRef<string>
  canShareScreen: ComputedRef<boolean>
  // Media
  isAudioOn: ComputedRef<boolean>
  isVideoOn: ComputedRef<boolean>
  isScreenSharing: ComputedRef<boolean>
  isWhiteboardSharing: ComputedRef<boolean>
  isFlashlightOn: ComputedRef<boolean>
  isFlashlightSupported: ComputedRef<boolean>
  canFlipCamera: ComputedRef<boolean>
  facingMode: ComputedRef<string>
  cameras: ComputedRef<MediaDeviceInfo[]>
  localStream: ComputedRef<MediaStream | null>
  screenStream: ComputedRef<MediaStream | null>
  whiteboardStream: ComputedRef<MediaStream | null>
  // Participants
  participants: ComputedRef<ParleyCallParticipant[]>
  participantCount: ComputedRef<number>
  tileCount: ComputedRef<number>
  phase: ComputedRef<CallPhase>
  remoteVideos: ComputedRef<Record<string, unknown>>
  remoteScreens: ComputedRef<Record<string, unknown>>
  // Actions
  startCall: (channel: string, options?: { video?: boolean }) => void
  endCall: () => void
  minimize: () => void
  maximize: () => void
  toggleMinimize: () => void
  toggleAudio: () => void
  toggleVideo: () => void
  toggleFlashlight: () => void
  toggleScreenShare: () => Promise<void> | undefined
  flipCamera: () => Promise<unknown>
  switchCamera: (deviceId: string) => Promise<unknown>
  retryPeer: (id: string) => void
  startWhiteboardShare: (stream: MediaStream) => Promise<void>
  stopWhiteboardShare: () => void
  observeCall: (message: CallMessageSchema, channel?: string) => void
  ongoingCall: (channel: string | null | undefined) => {
    video: boolean
    count: number
    max: number
    full: boolean
  } | null
  setHandlers: (handlers: CallHandlers) => void
}

/**
 * High-level composable for managing voice and video calls in Nuxt.
 * Exposes reactive call state, active session controls, screen sharing, duration, and signaling helpers.
 */
export function useParleyCall(): UseParleyCallReturn {
  const callStore = useCallStore()

  const session = computed(() => callStore.session)
  const isActive = computed(() => callStore.isActive)
  const isMinimized = computed(() => callStore.isMinimized)
  const isVideoCall = computed(() => callStore.isVideoCall)
  const channelId = computed(() => callStore.channelId)
  const elapsedTime = computed(() => callStore.elapsedTime)
  const canShareScreen = computed(() => callStore.canShareScreen)

  const formattedDuration = computed(() => formatDuration(elapsedTime.value))

  // Media state
  const isAudioOn = computed(() => session.value?.media.isAudioOn.value ?? false)
  const isVideoOn = computed(() => session.value?.media.isVideoOn.value ?? false)
  const isScreenSharing = computed(() => session.value?.media.isScreenSharing.value ?? false)
  const isWhiteboardSharing = computed(() => session.value?.media.isWhiteboardSharing.value ?? false)
  const isFlashlightOn = computed(() => session.value?.media.isFlashlightOn.value ?? false)
  const isFlashlightSupported = computed(() => session.value?.media.isFlashlightSupported.value ?? false)
  const canFlipCamera = computed(() => session.value?.media.canFlipCamera.value ?? false)
  const facingMode = computed(() => session.value?.media.facingMode.value ?? 'user')
  const cameras = computed(() => session.value?.media.cameras.value ?? [])

  // Streams
  const localStream = computed(() => session.value?.media.localStream.value ?? null)
  const screenStream = computed(() => session.value?.media.screenStream.value ?? null)
  const whiteboardStream = computed(() => session.value?.media.whiteboardStream.value ?? null)

  // Remote peers & participants
  const participants = computed<ParleyCallParticipant[]>(() => (session.value?.participants.value as ParleyCallParticipant[]) ?? [])
  const participantCount = computed(() => session.value?.participantCount.value ?? 0)
  const tileCount = computed(() => session.value?.tileCount.value ?? 0)
  const phase = computed<CallPhase>(() => session.value?.phase.value ?? (callStore.isActive ? 'connecting' : 'ended'))
  const remoteVideos = computed(() => session.value?.peers.remoteVideos ?? {})
  const remoteScreens = computed(() => session.value?.peers.remoteScreens ?? {})

  // Controls
  const startCall = (channel: string, options?: { video?: boolean }) => callStore.startCall(channel, options)
  const endCall = () => callStore.endCall()
  const minimize = () => callStore.minimize()
  const maximize = () => callStore.maximize()
  const toggleMinimize = () => {
    if (callStore.isMinimized) callStore.maximize()
    else callStore.minimize()
  }

  const toggleAudio = () => session.value?.media.toggleAudio()
  const toggleVideo = () => session.value?.media.toggleVideo()
  const toggleFlashlight = () => session.value?.media.toggleFlashlight()
  const toggleScreenShare = () => session.value?.toggleScreenShare()
  const flipCamera = async () => session.value?.flipCamera()
  const switchCamera = async (deviceId: string) => session.value?.switchCamera(deviceId)
  const retryPeer = (id: string) => session.value?.retryPeer(id)

  const startWhiteboardShare = async (stream: MediaStream) => {
    await session.value?.startWhiteboardShare(stream)
  }
  const stopWhiteboardShare = () => {
    session.value?.stopWhiteboardShare()
  }

  const observeCall = (message: CallMessageSchema, channel?: string) => {
    callStore.observeCall(message, channel)
  }

  const ongoingCall = (channel: string | null | undefined) => {
    return callStore.ongoingCall(channel)
  }

  const setHandlers = (handlers: CallHandlers) => {
    callStore.setHandlers(handlers)
  }

  return {
    callStore,
    session,
    isActive,
    isMinimized,
    isVideoCall,
    channelId,
    elapsedTime,
    formattedDuration,
    canShareScreen,
    // Media
    isAudioOn,
    isVideoOn,
    isScreenSharing,
    isWhiteboardSharing,
    isFlashlightOn,
    isFlashlightSupported,
    canFlipCamera,
    facingMode,
    cameras,
    localStream,
    screenStream,
    whiteboardStream,
    // Participants
    participants,
    participantCount,
    tileCount,
    phase,
    remoteVideos,
    remoteScreens,
    // Actions
    startCall,
    endCall,
    minimize,
    maximize,
    toggleMinimize,
    toggleAudio,
    toggleVideo,
    toggleFlashlight,
    toggleScreenShare,
    flipCamera,
    switchCamera,
    retryPeer,
    startWhiteboardShare,
    stopWhiteboardShare,
    observeCall,
    ongoingCall,
    setHandlers,
  }
}
