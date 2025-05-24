import pluralize from 'pluralize';

export const expressToOpenAPIPath = (route?: string): string => {
  return (route ?? '').replace(/\/:(\w+)/g, '/{$1}');
};

export const routeToClassName = (route?: string) => {
  const cleanedRoute = (route ?? '')
    .replace(/^\/|\/$/g, '')
    .toLocaleLowerCase();

  const singular = pluralize.singular(cleanedRoute);

  return singular.charAt(0).toUpperCase() + singular.slice(1);
};

export const camelCaseToTitleCase = (input?: string): string => {
  let titleCase = (input ?? '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  return titleCase;
};
