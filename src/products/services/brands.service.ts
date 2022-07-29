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

  async findAll() {
    const brands = await this.brandsRepo.find();
    brands.sort((a, b) => {
      return a.id - b.id;
    });
    return brands;
  }

  async findOne(id: number) {
    const brand = await this.brandsRepo.findOne({
      where: {
        id,
      },
      relations: ['products'],
    });
    if (!brand) {
      throw new NotFoundException(`Brand id: ${id} not found`);
    }
    return brand;
  }

  async create(payload: CreateBrandDto) {
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

  async remove(id: number) {
    await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(Brand, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return {
      messaje: `Brand ${id} deleted`,
    };
  }
}
