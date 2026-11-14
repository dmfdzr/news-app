import assert from "node:assert/strict"
import { test } from "node:test"

import { initials, readingTimeMinutes, stripHtml } from "./format.ts"
import { mediaUrl } from "./media.ts"
import { checkRateLimit } from "./rate-limit.ts"
import { sanitizeHtml } from "./sanitize.ts"

test("checkRateLimit", () => {
  const key = "test-limit-" + Date.now()
  assert.equal(checkRateLimit(key, { windowMs: 1000, max: 2 }).success, true)
  assert.equal(checkRateLimit(key, { windowMs: 1000, max: 2 }).success, true)
  assert.equal(checkRateLimit(key, { windowMs: 1000, max: 2 }).success, false)
})

test("readingTimeMinutes", () => {
  assert.equal(readingTimeMinutes("<p>Pendek</p>"), 1)
  assert.equal(readingTimeMinutes(`<p>${"kata ".repeat(410)}</p>`), 3)
})

test("mediaUrl", () => {
  assert.equal(
    mediaUrl("climatestories/cs_thumbnail_123"),
    "/api/media/climatestories/cs_thumbnail_123?v=2"
  )
  assert.equal(mediaUrl("mock-thumb-1"), "/api/media/mock-thumb-1?v=2")
})

test("initials", () => {
  assert.equal(initials("Budi Santoso"), "BS")
  assert.equal(initials("Admin"), "A")
  assert.equal(initials(""), "?")
})

test("stripHtml", () => {
  assert.equal(stripHtml("<p>Halo <strong>dunia</strong>!</p>"), "Halo dunia!")
  assert.equal(stripHtml("Tanpa tag"), "Tanpa tag")
})

test("sanitizeHtml", () => {
  assert.equal(
    sanitizeHtml('<p onclick="alert(1)">Halo</p><script>evil()</script><a href="javascript:alert(1)">x</a>'),
    "<p>Halo</p><a>x</a>"
  )
  assert.equal(
    sanitizeHtml('<a href="https://example.com">link</a>'),
    '<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>'
  )
})

