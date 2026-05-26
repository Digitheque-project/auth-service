import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Permission } from '../../permission/entities/permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
  // DOCTOR, VIEWER

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Permission, {
    eager: true,
  })
  @JoinTable({
    name: 'role_permissions',
  })
  permissions: Permission[];

  @Column({ default: true })
  isActive: boolean;
}
