import assert from "node:assert/strict"
import { test } from "node:test"

import { initials, stripHtml } from "./format.ts"
import { sanitizeHtml } from "./sanitize.ts"

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

