import {
  Injectable,
  NotFoundException,
  ConflictException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Category } from '../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private dataSource: DataSource,
  ) {}

  async findAll() {
    const categories = await this.categoryRepo.find();
    categories.sort(function (a, b) {
      return a.id - b.id;
    });
    return categories;
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: {
        id,
      },
      relations: {
        products: true,
      },
    });
    if (!category) {
      throw new NotFoundException(`Category id: ${id} not found`);
    }
    return category;
  }

  async create(payload: CreateCategoryDto) {
    const existingCategory = await this.categoryRepo.findOneBy({
      name: payload.name,
    });
    if (existingCategory) {
      throw new NotAcceptableException(
        `Category '${existingCategory.name}' already exist with id: ${existingCategory.id}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newCategory = queryRunner.manager.create(Category, payload);
      await queryRunner.manager.save(Category, newCategory);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    const createdCategory = await this.categoryRepo.findOneBy({
      name: payload.name,
    });
    if (!createdCategory) {
      throw new ConflictException(`Category '${payload.name}' was not created`);
    }
    return createdCategory;
  }

  async update(id: number, changes: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (changes.name) {
      const existingCategory = await this.categoryRepo.findOneBy({
        name: changes.name,
      });
      if (existingCategory) {
        throw new NotAcceptableException(
          `Category '${existingCategory.name}' already exist with id: ${existingCategory.id}`,
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const editedCategory = queryRunner.manager.merge(
        Category,
        category,
        changes,
      );
      await queryRunner.manager.save(Category, editedCategory);
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
      await queryRunner.manager.delete(Category, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return {
      messaje: `Category ${id} deleted`,
    };
  }
}
