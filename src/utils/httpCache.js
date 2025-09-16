import crypto from 'crypto';
import { parse as parseDate } from 'date-fns';

export function computeEtag(payload) {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const hash = crypto.createHash('sha1').update(body).digest('hex');
  return `W/"${hash}"`;
}

// conditionalJson now supports both ETag/If-None-Match and Last-Modified/If-Modified-Since.
// lastModified can be a Date object or an ISO string. If provided, the response will
// include a Last-Modified header and honor If-Modified-Since requests.
export function conditionalJson(req, res, payload, lastModified = null) {
  const etag = computeEtag(payload);

  // ETag handling
  const inm = req.headers['if-none-match'];
  if (inm && inm === etag) {
    // If ETag matches, 304 Not Modified
    res.set('ETag', etag);
    return res.status(304).end();
  }

  // Last-Modified handling
  if (lastModified) {
    const lmDate = typeof lastModified === 'string' ? new Date(lastModified) : new Date(lastModified);
    if (!Number.isNaN(lmDate.getTime())) {
      const ims = req.headers['if-modified-since'];
      if (ims) {
        const imsDate = new Date(ims);
        if (!Number.isNaN(imsDate.getTime()) && lmDate <= imsDate) {
          res.set('ETag', etag);
          res.set('Last-Modified', lmDate.toUTCString());
          return res.status(304).end();
        }
      }
      res.set('Last-Modified', lmDate.toUTCString());
    }
  }

  res.set('ETag', etag);
  // For HEAD requests, return headers without body
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }
  return res.json(payload);
}


