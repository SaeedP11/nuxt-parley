import type { MediaDownloadOptions, Message } from 'vue-parley'
import { messageMedia, useMediaStore } from '../parley'

/**
 * Composable for downloading, caching, and handling media files in Parley.
 */
export function useParleyMedia() {
  const mediaStore = useMediaStore()

  const download = (url: string, opts?: MediaDownloadOptions) => mediaStore.download(url, opts)
  const getCachedBlob = (url: string) => mediaStore.getCachedBlob(url)
  const getFileSize = (url: string) => mediaStore.fetchFileSize(url)
  const clearCache = () => mediaStore.clearCache()

  return {
    mediaStore,
    download,
    getCachedBlob,
    getFileSize,
    clearCache,
    messageMedia: (message: Pick<Message, 'media' | 'imageUrl'>) => messageMedia(message),
  }
}
