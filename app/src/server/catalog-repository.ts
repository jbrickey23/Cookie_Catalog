/** Domain-facing database boundary; implementation must enforce auth before calls. */
export type ID = string;
export interface ShapeRecord { id: ID; name: string; maker: string | null; notes: string | null }
export interface CutterRecord { id: ID; shapeId: ID; locationId: ID | null; widthMm: number | null; heightMm: number | null; quantity: number }
export interface DesignRecord { id: ID; name: string; notes: string | null }
export interface CatalogRepository {
  getShape(id: ID): Promise<ShapeRecord | null>;
  findShapes(query: string, limit: number): Promise<ShapeRecord[]>;
  getDesign(id: ID): Promise<DesignRecord | null>;
  listCuttersForShape(shapeId: ID): Promise<CutterRecord[]>;
}
