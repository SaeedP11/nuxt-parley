import { $fetch } from '@nuxt/test-utils/e2e'

/** The page's stylesheets, concatenated. */
export async function pageCss(html: string): Promise<string> {
  const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m => m[1]!)
  const sheets = await Promise.all(hrefs.map(href => $fetch<string>(href, { responseType: 'text' })))
  return sheets.join('\n')
}
