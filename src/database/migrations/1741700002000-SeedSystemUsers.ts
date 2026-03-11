import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

type SeedUserConfig = {
  username: string;
  email: string;
  password?: string;
  roleName: string;
};

export class SeedSystemUsers1741700002000 implements MigrationInterface {
  name = 'SeedSystemUsers1741700002000';

  private getSeedUsers(): SeedUserConfig[] {
    return [
      {
        username: process.env.SEED_SUPER_ADMIN_USERNAME || 'superadmin',
        email: process.env.SEED_SUPER_ADMIN_EMAIL || 'superadmin@example.com',
        password: process.env.SEED_SUPER_ADMIN_PASSWORD,
        roleName: 'super_admin',
      },
      {
        username: process.env.SEED_ADMIN_USERNAME || 'admin',
        email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
        password: process.env.SEED_ADMIN_PASSWORD,
        roleName: 'admin',
      },
      {
        username: process.env.SEED_MODERATOR_USERNAME || 'moderator',
        email: process.env.SEED_MODERATOR_EMAIL || 'moderator@example.com',
        password: process.env.SEED_MODERATOR_PASSWORD,
        roleName: 'moderator',
      },
    ];
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `
          UPDATE "roles"
          SET "name" = 'user',
              "description" = 'Browse products',
              "updated_at" = NOW()
          WHERE "name" = 'client'
        `,
      );

      await queryRunner.query(
        `
          INSERT INTO "roles" ("name", "description", "created_at", "updated_at")
          VALUES ('user', 'Browse products', NOW(), NOW())
          ON CONFLICT ("name") DO UPDATE
          SET "description" = EXCLUDED."description",
              "updated_at" = EXCLUDED."updated_at"
        `,
      );

      await queryRunner.query(
        `
          INSERT INTO "role_permissions" ("role_id", "permission_id")
          SELECT r."id", p."id"
          FROM "roles" r
          JOIN "permissions" p ON p."name" = 'products:read'
          WHERE r."name" = 'user'
          ON CONFLICT ("role_id", "permission_id") DO NOTHING
        `,
      );

      const seedUsers = this.getSeedUsers().filter((user) => user.password);

      for (const seedUser of seedUsers) {
        const hashedPassword = await bcrypt.hash(seedUser.password!, 10);
        const result = await queryRunner.query(
          `
            INSERT INTO "users" ("username", "email", "password", "created_at", "updated_at")
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT ("email") DO UPDATE
            SET "username" = EXCLUDED."username",
                "password" = EXCLUDED."password",
                "updated_at" = EXCLUDED."updated_at"
            RETURNING "id"
          `,
          [seedUser.username, seedUser.email, hashedPassword],
        );

        const userId = result[0]?.id;

        if (!userId) {
          continue;
        }

        await queryRunner.query(
          `
            INSERT INTO "user_roles" ("user_id", "role_id")
            SELECT $1, r."id"
            FROM "roles" r
            WHERE r."name" = $2
            ON CONFLICT ("user_id", "role_id") DO NOTHING
          `,
          [userId, seedUser.roleName],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      const seedUsers = this.getSeedUsers();

      for (const seedUser of seedUsers) {
        await queryRunner.query(
          `
            DELETE FROM "user_roles"
            WHERE "user_id" IN (
              SELECT "id"
              FROM "users"
              WHERE "email" = $1
            )
          `,
          [seedUser.email],
        );

        await queryRunner.query(`DELETE FROM "users" WHERE "email" = $1`, [
          seedUser.email,
        ]);
      }

      await queryRunner.query(
        `
          DELETE FROM "role_permissions"
          WHERE "role_id" IN (
            SELECT "id"
            FROM "roles"
            WHERE "name" = 'user'
          )
          AND "permission_id" IN (
            SELECT "id"
            FROM "permissions"
            WHERE "name" = 'products:read'
          )
        `,
      );

      await queryRunner.query(
        `
          UPDATE "roles"
          SET "name" = 'client',
              "description" = 'Browse products',
              "updated_at" = NOW()
          WHERE "name" = 'user'
        `,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
