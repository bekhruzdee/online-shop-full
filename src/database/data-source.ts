import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Role } from 'src/roles/entities/role.entity';
import { PermissionEntity } from 'src/permissions/entities/permission.entity';

const isTsRuntime = __filename.endsWith('.ts');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Product, Role, PermissionEntity],
  migrations: [
    isTsRuntime
      ? 'src/database/migrations/*.ts'
      : 'dist/database/migrations/*.js',
  ],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
