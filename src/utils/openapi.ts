import pluralize from 'pluralize';

// Converte un percorso Express con parametri (es. /user/:id) in formato OpenAPI (/user/{id})
// Esempio: "/user/:id/orders/:orderId" → "/user/{id}/orders/{orderId}"
export const expressToOpenAPIPath = (route?: string): string => {
  return (route ?? '').replace(/\/:(\w+)/g, '/{$1}');
};

/**
 * Converte un percorso (es. /users/) in un nome di classe in PascalCase al singolare
 * Esempio: "/users/" → "User"
 */
export const routeToClassName = (route?: string) => {
  const cleanedRoute = (route ?? '')
    .replace(/^\/|\/$/g, '')
    .toLocaleLowerCase();

  const singular = pluralize.singular(cleanedRoute);

  return singular.charAt(0).toUpperCase() + singular.slice(1);
};

/**
 * Converte una stringa in camelCase in Title Case separato da spazi
 * Esempio: "userName" → "User Name"
 */
export const camelCaseToTitleCase = (input?: string): string => {
  let titleCase = (input ?? '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  return titleCase;
};
