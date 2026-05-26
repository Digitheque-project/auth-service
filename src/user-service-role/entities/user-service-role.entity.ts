import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';

import { User } from '../../user/entities/user.entity';
import { Service } from '../../service/entities/service.entity';
import { Role } from '../../role/entities/role.entity';

@Entity('user_service_roles')
@Unique(['user', 'service'])
export class UserServiceRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 👤 utilisateur
  @ManyToOne(() => User, (user) => user.serviceRoles, {
    onDelete: 'CASCADE',
  })
  user: User;

  // 🏥 service
  @ManyToOne(() => Service, {
    eager: true,
    onDelete: 'CASCADE',
  })
  service: Service;

  // 🔐 rôle
  @ManyToOne(() => Role, {
    eager: true,
    onDelete: 'CASCADE',
  })
  role: Role;
}
