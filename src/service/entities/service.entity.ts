import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { UserServiceRole } from '../../user-service-role/entities/user-service-role.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;
  // PATIENT, LAB, RADIO

  @Column()
  baseUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserServiceRole, (usr) => usr.service)
  userServiceRoles: UserServiceRole[];
}
