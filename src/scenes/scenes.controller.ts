import {
  Body,
  Controller,
  Get,
  Header,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { StorageNamespace, StorageService } from '../storage/storage.service';
import { customAlphabet } from 'nanoid';

@Controller('scenes')
export class ScenesController {
  private readonly logger = new Logger(ScenesController.name);
  namespace = StorageNamespace.SCENES;

  constructor(private storageService: StorageService) {}
  @Get(':id')
  @Header('content-type', 'application/octet-stream')
  async findOne(@Param() params, @Res() res: Response): Promise<void> {
    const data = await this.storageService.get(params.id, this.namespace);
    this.logger.debug(`Get scene ${params.id}`);

    if (!data) {
      throw new NotFoundException();
    }

    res.end(data);
  }

  @Post()
  async create(@Body() payload: Buffer) {
    // WhiteboardRT and compatible clients expect numeric ids, so the default
    // nanoid alphabet cannot be used here.
    const nanoid = customAlphabet('0123456789', 16);
    const id = nanoid();

    // Check for collision
    if (await this.storageService.get(id, this.namespace)) {
      throw new InternalServerErrorException();
    }

    await this.storageService.set(id, payload, this.namespace);
    this.logger.debug(`Created scene ${id}`);

    return {
      id,
    };
  }
}
