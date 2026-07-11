import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  Unique,
} from 'typeorm';

import { Permission } from '../../permission/entities/permission.entity';

@Entity('roles')
@Unique(['name', 'serviceId'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  serviceId!: string;

  @ManyToMany(() => Permission, {
    eager: true,
  })
  @JoinTable({
    name: 'role_permissions',
  })
  permissions!: Permission[];

  @Column({ default: true })
  isActive!: boolean;
}
