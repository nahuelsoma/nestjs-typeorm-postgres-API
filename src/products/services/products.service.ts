import {
  Injectable,
  NotFoundException,
  ConflictException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, FindOptionsWhere, In } from 'typeorm';

import { Product } from './../entities/product.entity';
import { Category } from './../entities/category.entity';
import { Brand } from './../entities/brand.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  FilterProductsDto,
} from './../dtos/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    private dataSource: DataSource,
  ) {}

  async findAll(params?: FilterProductsDto) {
    if (Object.keys(params).length !== 0) {
      const where: FindOptionsWhere<Product> = {};
      const { limit, offset } = params;
      const { maxPrice, minPrice } = params;
      if (minPrice && maxPrice) {
        if (maxPrice < minPrice) {
          throw new ConflictException(
            `maxPrice (${maxPrice}) must be higher than minPrice (${minPrice})`,
          );
        }
        where.price = Between(minPrice, maxPrice);
      }
      const productsList = await this.productRepo.find({
        relations: {
          brand: true,
          categories: true,
        },
        where,
        take: limit,
        skip: offset,
      });

      return productsList.sort((a, b) => {
        return a.id - b.id;
      });
    }
    const productsList = await this.productRepo.find({
      relations: {
        brand: true,
        categories: true,
      },
    });

    return productsList.sort((a, b) => {
      return a.id - b.id;
    });
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: {
        id,
      },
      relations: {
        brand: true,
        categories: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product id: ${id} not found`);
    }
    return product;
  }

  async create(payload: CreateProductDto) {
    const existingProduct = await this.productRepo.findOneBy({
      name: payload.name,
    });
    if (existingProduct) {
      throw new NotAcceptableException(
        `Product '${existingProduct.name}' already exist with id: ${existingProduct.id}`,
      );
    }

    const newProduct = this.productRepo.create(payload);

    if (payload.brandId) {
      const brand = await this.brandRepo.findOneBy({
        id: payload.brandId,
      });
      if (!brand) {
        throw new NotFoundException(`Brand id: ${payload.brandId} not found`);
      }
      newProduct.brand = brand;
    }

    if (payload.categoriesIds) {
      for (const categoryId of payload.categoriesIds) {
        const hasCategory = await this.categoryRepo.findOneBy({
          id: categoryId,
        });
        if (!hasCategory) {
          throw new NotFoundException(`Category id: ${categoryId} not found`);
        }
      }

      const categories = await this.categoryRepo.findBy({
        id: In(payload.categoriesIds),
      });
      newProduct.categories = categories;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Product, newProduct);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    const createdProduct = await this.productRepo.findOneBy({
      name: payload.name,
    });
    if (!createdProduct) {
      throw new ConflictException(`Product '${payload.name}' was not created`);
    }
    return this.findOne(createdProduct.id);
  }

  async update(id: number, changes: UpdateProductDto) {
    const product = await this.findOne(id);

    if (changes.name) {
      const existingProduct = await this.productRepo.findOneBy({
        name: changes.name,
      });
      if (existingProduct) {
        throw new NotAcceptableException(
          `Product '${existingProduct.name}' already exist with id: ${existingProduct.id}`,
        );
      }
    }

    if (changes.brandId) {
      const brand = await this.brandRepo.findOneBy({
        id: changes.brandId,
      });
      if (!brand) {
        throw new NotFoundException(`Brand id: ${changes.brandId} not found`);
      }
      product.brand = brand;
    }

    if (changes.categoriesIds) {
      for (const categoryId of changes.categoriesIds) {
        const hasCategory = await this.categoryRepo.findOneBy({
          id: categoryId,
        });
        if (!hasCategory) {
          throw new NotFoundException(`Category id: ${categoryId} not found`);
        }
      }

      const categories = await this.categoryRepo.findBy({
        id: In(changes.categoriesIds),
      });

      product.categories = categories;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const editedProduct = queryRunner.manager.merge(
        Product,
        product,
        changes,
      );
      await queryRunner.manager.save(Product, editedProduct);
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
      await queryRunner.manager.delete(Product, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return {
      messaje: `Product ${id} deleted`,
    };
  }

  async removeCategoryByProduct(productId: number, categoryId: number) {
    const product = await this.findOne(productId);

    const category = await this.categoryRepo.findOneBy({
      id: categoryId,
    });
    if (!category) {
      throw new NotFoundException(`Category #${categoryId} not found`);
    }

    const hasCategory = product.categories.find(
      (category) => category.id === categoryId,
    );
    if (!hasCategory) {
      throw new NotFoundException(
        `Product ${productId} doesn't has Category id: ${categoryId} already`,
      );
    }

    product.categories = product.categories.filter(
      (item) => item.id !== categoryId,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Product, product);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return product;
  }

  async addCategoryToProduct(productId: number, categoryId: number) {
    const product = await this.findOne(productId);

    const category = await this.categoryRepo.findOneBy({
      id: categoryId,
    });
    if (!category) {
      throw new NotFoundException(`Category #${categoryId} not found`);
    }

    if (!product.categories.find((item) => item.id === categoryId)) {
      product.categories.push(category);
    } else {
      throw new ConflictException(
        `Category #${categoryId} is already present in Product ${productId}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(Product, product);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }

    return product;
  }
}
