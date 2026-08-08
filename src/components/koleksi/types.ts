export type MaterialType = 'Semua' | 'Emas' | 'Kayu' | 'Keramik' | 'Perak' | 'Logam' | string;

export interface Artifact {
  id: string;
  slug: string;
  name: string;
  era: string;
  material: string;
  imageUrl: string;
  type?: string;
  category?: string;
  description_id?: string;
  modelUrl?: string;
}
