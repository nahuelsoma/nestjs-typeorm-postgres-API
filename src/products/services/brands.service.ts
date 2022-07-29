import {
  Injectable,
  NotFoundException,
  ConflictException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Brand } from '../entities/brand.entity';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand) private brandsRepo: Repository<Brand>,
    private dataSource: DataSource,
  ) {}

  findAll() {
    return this.brandsRepo.find();
  }

  async findOne(id: number) {
    const product = this.brandsRepo.findOne({
      relations: ['products'],
      where: {
        id,
      },
    });
    if (!product) {
      throw new NotFoundException(`Brand #${id} not found`);
    }
    return product;
  }

  async create(payload: CreateBrandDto) {
    if (!payload) {
      throw new NotAcceptableException(`You must send the new brand data`);
    }

    const existingBrand = await this.brandsRepo.findOneBy({
      name: payload.name,
    });
    if (existingBrand) {
      throw new NotAcceptableException(
        `Brand '${existingBrand.name}' already exist with id: ${existingBrand.id}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newBrand = queryRunner.manager.create(Brand, payload);
      await queryRunner.manager.save(Brand, newBrand);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    const createdBrand = await this.brandsRepo.findOneBy({
      name: payload.name,
    });
    if (!createdBrand) {
      throw new ConflictException(`Brand '${payload.name}' was not created`);
    }
    return createdBrand;
  }

  async update(id: number, changes: UpdateBrandDto) {
    const brand = await this.findOne(id);

    if (changes.name) {
      const existingBrand = await this.brandsRepo.findOneBy({
        name: changes.name,
      });
      if (existingBrand) {
        throw new NotAcceptableException(
          `Brand '${existingBrand.name}' already exist with id: ${existingBrand.id}`,
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const editedBrand = queryRunner.manager.merge(Brand, brand, changes);
      await queryRunner.manager.save(Brand, editedBrand);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return await this.findOne(id);
  }

  async remove(branId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    const brand = await this.findOne(branId);

    if (!brand) {
      throw new NotFoundException(`Brand ${branId} does not exist`);
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(Brand, branId);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return {
      messaje: `Brand ${branId} deleted`,
    };
  }
}
