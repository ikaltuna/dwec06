import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BooksService } from '../../../services/books.service';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html'
})
export class BookDetailComponent implements OnInit {
  book?: Book;
  loading = false;
  error = '';

  constructor(private route: ActivatedRoute, private booksService: BooksService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.booksService.getById(id).subscribe({
      next: (b) => { this.book = b; this.loading = false; },
      error: () => { this.error = 'No se pudo cargar el libro'; this.loading = false; }
    });
  }
}
