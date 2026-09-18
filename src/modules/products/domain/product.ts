export interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
  price: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
