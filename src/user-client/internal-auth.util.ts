import * as jwt from 'jsonwebtoken';

/**
 * En-tête Authorization pour les appels serveur-à-serveur d'auth-service vers
 * user-services, qui passent par la gateway publique (ex: création de compte,
 * recherche par email). La gateway exige un Bearer token valide signé avec le
 * même JWT_SECRET que tous les services du CHU — même mécanisme que
 * buildInternalAuthHeader() côté hospitalisation-back. L'ancien en-tête
 * x-api-key n'est vérifié nulle part (ni par la gateway, ni par
 * user-services) : il laissait passer la requête sans authentification réelle
 * quand la route ne l'exigeait pas, et la faisait échouer silencieusement
 * (401 generique côté auth-service) dès qu'elle l'exigeait.
 */
export function buildInternalAuthHeader(secret?: string): Record<string, string> {
  if (!secret) {
    return {};
  }
  const token = jwt.sign({ userId: 'service-auth', role: 'SERVICE' }, secret, {
    expiresIn: '2m',
  });
  return { Authorization: `Bearer ${token}` };
}
