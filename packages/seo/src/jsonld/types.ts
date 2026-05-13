export type JsonLdPrimitive = string | number | boolean | null;
export type JsonLdValue = JsonLdPrimitive | JsonLd | JsonLdValue[];
export interface JsonLd {
  '@context'?: string;
  '@type': string | string[];
  [key: string]: JsonLdValue | undefined;
}

export interface RelatedEntityRef {
  kind: import('../sitemap/routes').EntityKind;
  slug: string;
  name: string;
}
