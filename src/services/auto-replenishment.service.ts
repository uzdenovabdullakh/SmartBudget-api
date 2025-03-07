import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AutoReplenishment } from 'src/entities/auto-replenishment.entity';
import { ApiException } from 'src/exceptions/api.exception';
import {
  CreateAutoReplenishmentDto,
  UpdateAutoReplenishmentDto,
} from 'src/validation/auto-replenishment.schema';
import { Repository } from 'typeorm';
import { TranslationService } from './translation.service';

@Injectable()
export class AutoReplenishmentService {
  constructor(
    @InjectRepository(AutoReplenishment)
    private readonly autoReplenishmentRepository: Repository<AutoReplenishment>,
    private readonly t: TranslationService,
  ) {}

  async find(id: string) {
    const autoReplenishment = await this.autoReplenishmentRepository.findOne({
      where: {
        id,
      },
    });
    if (!autoReplenishment) {
      throw ApiException.notFound(
        this.t.tException('not_found', 'auto_replenishment'),
      );
    }
  }

  async create(dto: CreateAutoReplenishmentDto) {
    const { goal, percentage } = dto;
    const autoReplenishment = this.autoReplenishmentRepository.create({
      goal: {
        id: goal,
      },
      percentage,
    });

    await this.autoReplenishmentRepository.save(autoReplenishment);
  }

  async deactivate(id: string) {
    await this.find(id);

    await this.autoReplenishmentRepository.delete(id);
  }

  async update(id: string, dto: UpdateAutoReplenishmentDto) {
    await this.find(id);

    const { percentage } = dto;
    await this.autoReplenishmentRepository.update(id, {
      percentage,
    });
  }
}
