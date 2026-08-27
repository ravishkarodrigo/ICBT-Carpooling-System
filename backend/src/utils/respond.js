/**
 * Standard JSON response helpers.
 * All successful responses use the envelope: { success: true, data: ... }
 * All error responses use: { success: false, error: { message, details? } }
 */

export function ok(res, data) {
  return res.status(200).json({ success: true, data });
}

export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

export function noContent(res) {
  return res.status(204).end();
}
