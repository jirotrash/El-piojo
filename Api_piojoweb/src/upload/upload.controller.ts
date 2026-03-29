import { Controller, Post, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import * as fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Controller()
export class UploadController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        ensureUploadDir();
        cb(null, UPLOAD_DIR);
      },
      filename: (req, file, cb) => {
        const name = Date.now() + '-' + Math.random().toString(36).substring(2, 8) + extname(file.originalname);
        cb(null, name);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async uploadFile(@UploadedFile() file: any, @Req() req: Request) {
    if (!file) throw new BadRequestException('No file uploaded');
    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/${UPLOAD_DIR}/${file.filename}`;
    return { url };
  }
}

export default UploadController;
