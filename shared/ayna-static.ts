import type { BusRoute } from "./transit-data";

/**
 * AYNA MaaS public feed endpointi konfiqurasiya edilmədikdə istifadə olunan
 * rəsmi marşrut import qatıdır. Endpointdən alınan normalizasiya edilmiş
 * məlumatlar bu sxemlə saxlanılır; uydurma marşrut nömrələri əlavə edilmir.
 */
import { aynaRoutes } from "./ayna-routes";

export const staticAynaRoutes: BusRoute[] = aynaRoutes;
