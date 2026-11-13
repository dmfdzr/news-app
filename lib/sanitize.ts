// ponytail: regex allowlist sanitizer for TipTap HTML; swap for hast-util-sanitize if arbitrary raw HTML embeds are added
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "h4",
  "blockquote",
  "ul",
  "ol",
  "li",
  "code",
  "pre",
  "a",
])

export function sanitizeHtml(html: string): string {
  if (!html) return ""
  return html
    .replace(/<(script|style|iframe|object|embed|form|svg|math)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|meta|link)[^>]*\/?>/gi, "")
    .replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (match, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase()
      if (!ALLOWED_TAGS.has(tag)) return ""
      if (match.startsWith("</")) return `</${tag}>`
      if (tag === "br") return "<br>"
      if (tag === "a") {
        const hrefMatch = rawAttrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
        const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "").trim()
        if (/^https?:\/\/|^mailto:|^\/[^/]/i.test(href)) {
          const safeHref = href.replace(/"/g, "&quot;")
          return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`
        }
        return "<a>"
      }
      return `<${tag}>`
    })
}

