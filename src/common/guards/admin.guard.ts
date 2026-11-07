import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Identifiant de compte utilisateur (UUID) : un jeton de service porte à la
// place un identifiant de service (ex. « service-imagerie »).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Création / modification / suppression des rôles et permissions : réservées à
 * l'administrateur (un rôle « Admin », même règle que les pages d'administration
 * du front) et aux jetons de service. Un utilisateur connecté ordinaire ne peut
 * plus changer ses propres droits ; la lecture reste ouverte aux services.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const payload = context.switchToHttp().getRequest().user ?? {};
    const userId = String(payload.userId ?? payload.sub ?? '');
    const estService = !!userId && !UUID.test(userId);
    const estAdmin =
      Array.isArray(payload.services) &&
      payload.services.some((s: any) => String(s?.roleName ?? '').toLowerCase() === 'admin');
    if (estService || estAdmin) return true;
    throw new ForbiddenException("Réservé à l'administrateur");
  }
}
