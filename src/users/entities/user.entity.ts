import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: `varchar` })
  username: string;
  @Column({ unique: true, type: 'varchar', nullable: true })
  email: string;
  @Column({ type: `varchar` })
  password: string;
  @Column({ type: 'varchar', default: 'client' })
  role: string;
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
