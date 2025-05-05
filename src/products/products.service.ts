import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
  ) {
    const imagePath = file ? file.filename : null;

    const newProduct = this.productRepository.create({
      ...createProductDto,
      image: imagePath,
    });

    const savedProduct = await this.productRepository.save(newProduct);

    return {
      success: true,
      message: 'Product created successfully ✅',
      data: savedProduct,
    };
  }

  async getAllProducts() {
    const products = await this.productRepository.find();
    return {
      success: true,
      message: 'All products retrieved successfully ✅',
      data: products,
    };
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found ❌');
    }
    return product;
  }

  async getProductByName(name: string) {
    const products = await this.productRepository.find({
      where: { name: ILike(`%${name}%`) },
    });

    if (!products.length) {
      throw new NotFoundException(`No products found matching "${name}" ❌`);
    }

    return {
      success: true,
      message: `Products matching "${name}" retrieved successfully ✅`,
      data: products,
    };
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    file?: Express.Multer.File,
  ) {
    const product = await this.getProductById(id);
    const imagePath = file ? file.filename : product.image;

    await this.productRepository.update(id, {
      ...updateProductDto,
      image: imagePath,
    });

    const updatedProduct = await this.getProductById(id);
    return {
      success: true,
      message: `Product (${id}) updated successfully ✅`,
      data: updatedProduct,
    };
  }

  async deleteProduct(id: number) {
    await this.getProductById(id); 
    await this.productRepository.delete(id);
    return {
      success: true,
      message: `Product (${id}) deleted successfully ✅`,
    };
  }
}
