export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  description: string;
  color: string;
  icon: string;
}
