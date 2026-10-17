export type CatalogEnvironment='development'|'production';
export function catalogEnvironment(value:unknown):CatalogEnvironment {
 if(value===undefined||value==='development')return 'development';
 if(value==='production')return 'production';
 throw Error('Invalid catalog environment configuration.');
}
