import crypto from 'crypto';

export function computeEtag(payload) {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const hash = crypto.createHash('sha1').update(body).digest('hex');
  return `W/"${hash}"`;
}

export function conditionalJson(req, res, payload) {
  const etag = computeEtag(payload);
  const inm = req.headers['if-none-match'];
  if (inm && inm === etag) {
    return res.status(304).end();
  }
  res.set('ETag', etag);
  return res.json(payload);
}


