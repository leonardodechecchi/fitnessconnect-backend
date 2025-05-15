export const expressToOpenAPIPath = (route?: string): string => {
  return (route ?? '').replace(/\/:(\w+)/g, '/{$1}');
};

export const camelCaseToTitleCase = (input?: string): string => {
  let titleCase = (input ?? '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  return titleCase;
};
