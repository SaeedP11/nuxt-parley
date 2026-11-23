import { computed, ref } from 'vue'
import { useCallStore } from '../parley'

/**
 * Composable for managing the interactive whiteboard dialog and syncing drawing stream with active calls.
 */
export function useParleyWhiteboard() {
  const callStore = useCallStore()
  const isOpen = ref(false)
  const isFullWindow = ref(false)

  const isSharing = computed(() => callStore.session?.media.isWhiteboardSharing.value ?? false)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    callStore.session?.stopWhiteboardShare()
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
    if (!isOpen.value) {
      callStore.session?.stopWhiteboardShare()
    }
  }

  const setFullWindow = (val: boolean) => {
    isFullWindow.value = val
  }

  const toggleFullWindow = () => {
    isFullWindow.value = !isFullWindow.value
  }

  const startShare = async (stream: MediaStream) => {
    await callStore.session?.startWhiteboardShare(stream)
  }

  const stopShare = () => {
    callStore.session?.stopWhiteboardShare()
  }

  const onStreamStart = (stream: MediaStream) => startShare(stream)
  const onStreamStop = () => stopShare()

  return {
    isOpen,
    isFullWindow,
    isSharing,
    open,
    close,
    toggle,
    setFullWindow,
    toggleFullWindow,
    startShare,
    stopShare,
    onStreamStart,
    onStreamStop,
  }
}
