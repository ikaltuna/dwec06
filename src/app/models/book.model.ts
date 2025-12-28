export interface Book {
  id?: number;        // opcional en Create
  title: string;
  author: string;
  description: string;
  categoryId: number; // usado como userId en JSONPlaceholder
}
