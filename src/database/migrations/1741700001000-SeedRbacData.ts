import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRbacData1741700001000 implements MigrationInterface {
  name = 'SeedRbacData1741700001000';

  private readonly permissions = [
    {
      name: 'products:create',
      resource: 'products',
      action: 'create',
      description: 'Allow create on products',
    },
    {
      name: 'products:read',
      resource: 'products',
      action: 'read',
      description: 'Allow read on products',
    },
    {
      name: 'products:update',
      resource: 'products',
      action: 'update',
      description: 'Allow update on products',
    },
    {
      name: 'products:delete',
      resource: 'products',
      action: 'delete',
      description: 'Allow delete on products',
    },
    {
      name: 'users:read',
      resource: 'users',
      action: 'read',
      description: 'Allow read on users',
    },
    {
      name: 'users:update',
      resource: 'users',
      action: 'update',
      description: 'Allow update on users',
    },
    {
      name: 'users:delete',
      resource: 'users',
      action: 'delete',
      description: 'Allow delete on users',
    },
    {
      name: 'roles:manage',
      resource: 'roles',
      action: 'manage',
      description: 'Allow manage on roles',
    },
  ];

  private readonly roles = [
    { name: 'super_admin', description: 'Full system access' },
    { name: 'admin', description: 'Manage products and users' },
    { name: 'moderator', description: 'Moderate products and view users' },
    { name: 'client', description: 'Browse products' },
  ];

  private readonly rolePermissionMap: Record<string, string[]> = {
    super_admin: [
      'products:create',
      'products:read',
      'products:update',
      'products:delete',
      'users:read',
      'users:update',
      'users:delete',
      'roles:manage',
    ],
    admin: [
      'products:create',
      'products:read',
      'products:update',
      'products:delete',
      'users:read',
      'users:update',
      'users:delete',
    ],
    moderator: ['products:create', 'products:read', 'products:update', 'users:read'],
    client: ['products:read'],
  };

  private buildValuesPlaceholders(
    rows: number,
    columns: number,
    startAt = 1,
  ): string {
    const tuples: string[] = [];
    let param = startAt;

    for (let r = 0; r < rows; r++) {
      const tuple: string[] = [];
      for (let c = 0; c < columns; c++) {
        tuple.push(`$${param++}`);
      }
      tuples.push(`(${tuple.join(', ')})`);
    }

    return tuples.join(', ');
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      const now = new Date();

      // Bulk upsert permissions
      if (this.permissions.length > 0) {
        const permissionParams = this.permissions.flatMap((p) => [
          p.name,
          p.resource,
          p.action,
          p.description,
          now,
          now,
        ]);
        const permissionValues = this.buildValuesPlaceholders(
          this.permissions.length,
          6,
        );

        await queryRunner.query(
          `
            INSERT INTO "permissions" (
              "name",
              "resource",
              "action",
              "description",
              "created_at",
              "updated_at"
            )
            VALUES ${permissionValues}
            ON CONFLICT ("name") DO UPDATE
            SET
              "resource" = EXCLUDED."resource",
              "action" = EXCLUDED."action",
              "description" = EXCLUDED."description",
              "updated_at" = EXCLUDED."updated_at"
          `,
          permissionParams,
        );
      }

      // Bulk upsert roles
      if (this.roles.length > 0) {
        const roleParams = this.roles.flatMap((r) => [
          r.name,
          r.description,
          now,
          now,
        ]);
        const roleValues = this.buildValuesPlaceholders(this.roles.length, 4);

        await queryRunner.query(
          `
            INSERT INTO "roles" (
              "name",
              "description",
              "created_at",
              "updated_at"
            )
            VALUES ${roleValues}
            ON CONFLICT ("name") DO UPDATE
            SET
              "description" = EXCLUDED."description",
              "updated_at" = EXCLUDED."updated_at"
          `,
          roleParams,
        );
      }

      // Idempotently add required role-permission relations.
      // We do not delete existing relations to avoid breaking current assignments.
      const rolePermissionPairs: Array<[string, string]> = [];
      for (const [roleName, permissionNames] of Object.entries(
        this.rolePermissionMap,
      )) {
        for (const permissionName of permissionNames) {
          rolePermissionPairs.push([roleName, permissionName]);
        }
      }

      if (rolePermissionPairs.length > 0) {
        const pairParams = rolePermissionPairs.flatMap(([role, permission]) => [
          role,
          permission,
        ]);
        const pairValues = this.buildValuesPlaceholders(rolePermissionPairs.length, 2);

        await queryRunner.query(
          `
            INSERT INTO "role_permissions" ("role_id", "permission_id")
            SELECT r."id", p."id"
            FROM (VALUES ${pairValues}) AS rp("role_name", "permission_name")
            JOIN "roles" r ON r."name" = rp."role_name"
            JOIN "permissions" p ON p."name" = rp."permission_name"
            ON CONFLICT ("role_id", "permission_id") DO NOTHING
          `,
          pairParams,
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
      const rolePermissionPairs: Array<[string, string]> = [];
      for (const [roleName, permissionNames] of Object.entries(
        this.rolePermissionMap,
      )) {
        for (const permissionName of permissionNames) {
          rolePermissionPairs.push([roleName, permissionName]);
        }
      }

      if (rolePermissionPairs.length > 0) {
        const pairParams = rolePermissionPairs.flatMap(([role, permission]) => [
          role,
          permission,
        ]);
        const pairValues = this.buildValuesPlaceholders(rolePermissionPairs.length, 2);

        await queryRunner.query(
          `
            DELETE FROM "role_permissions" rp
            USING "roles" r, "permissions" p, (VALUES ${pairValues}) AS x("role_name", "permission_name")
            WHERE rp."role_id" = r."id"
              AND rp."permission_id" = p."id"
              AND r."name" = x."role_name"
              AND p."name" = x."permission_name"
          `,
          pairParams,
        );
      }

      await queryRunner.query(
        `DELETE FROM "roles" WHERE "name" = ANY($1)`,
        [this.roles.map((r) => r.name)],
      );

      await queryRunner.query(
        `DELETE FROM "permissions" WHERE "name" = ANY($1)`,
        [this.permissions.map((p) => p.name)],
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
