import { Injectable, NestMiddleware } from '@nestjs/common';
import { raw } from 'express';
import { hasBody } from 'type-is';

// WhiteboardRT and compatible clients do not always send a Content-Type
// header, so tell the raw parser to check whether a body is present instead.
const rawParserMiddleware = raw({
  type: hasBody,
  limit: process.env.BODY_LIMIT ?? '50mb',
});

@Injectable()
export class RawParserMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    rawParserMiddleware(req, res, next);
  }
}
