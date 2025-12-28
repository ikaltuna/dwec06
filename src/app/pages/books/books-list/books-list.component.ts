import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BooksService } from '../../../services/books.service';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html'
})
export class BooksListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  filtered: Book[] = [];

  q = '';
  loading = false;
  error = '';

  private sub?: Subscription;

  constructor(private booksService: BooksService) {}

  ngOnInit(): void {
    // 1) Suscripción SIEMPRE activa al store
    this.sub = this.booksService.books$.subscribe(list => {
      this.books = list;
      this.applyFilter();
    });

    // 2) Carga inicial desde API para llenar el store (si falla, el store seguirá mostrando lo creado localmente)
    this.loading = true;
    this.booksService.loadAll().subscribe({
      next: () => this.loading = false,
      error: () => {
        this.error = 'No se pudo cargar desde la API. La aplicación seguirá funcionando en modo local.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  applyFilter(): void {
    const s = this.q.trim().toLowerCase();
    this.filtered = !s
      ? this.books
      : this.books.filter(b =>
          b.title.toLowerCase().includes(s) ||
          b.description.toLowerCase().includes(s)
        );
  }

  remove(id?: number): void {
    if (!id) return;
    this.booksService.delete(id).subscribe({
      error: () => this.error = 'No se pudo borrar el libro'
    });
  }
}
