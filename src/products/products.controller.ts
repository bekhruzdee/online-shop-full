import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Express } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { RoleName } from 'src/common/enums/role.enum';
import { Permission } from 'src/common/enums/permission.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.MODERATOR)
  @Permissions(Permission.PRODUCTS_CREATE)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.createProduct(createProductDto, file);
  }

  @Get('all')
  async getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get(':id')
  async getProductById(@Param('id') id: number) {
    return this.productsService.getProductById(+id);
  }

  @Get('search/:name')
  getProductByName(@Param('name') name: string) {
    return this.productsService.getProductByName(name);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.MODERATOR)
  @Permissions(Permission.PRODUCTS_UPDATE)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productsService.updateProduct(+id, updateProductDto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @Permissions(Permission.PRODUCTS_DELETE)
  async deleteProduct(@Param('id') id: number) {
    return this.productsService.deleteProduct(+id);
  }
}
