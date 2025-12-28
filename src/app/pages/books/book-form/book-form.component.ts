import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BooksService } from '../../../services/books.service';

@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html'
})
export class BookFormComponent implements OnInit {
  id?: number;
  isEdit = false;
  saving = false;
  error = '';

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    author: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    categoryId: [1, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private booksService: BooksService
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.isEdit = true;
      this.id = Number(param);
      this.booksService.getById(this.id).subscribe({
        next: (b) => this.form.patchValue(b),
        error: () => this.error = 'No se pudo cargar el libro para editar'
      });
    }
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const book = this.form.getRawValue();

    const req$ = this.isEdit && this.id
      ? this.booksService.update(this.id, book)
      : this.booksService.create(book);

    req$.subscribe({
      next: (saved) => {
        this.saving = false;
        const id = saved.id ?? this.id;
        if (id) this.router.navigate(['/books', id]);
        else this.router.navigate(['/books']);
      },
      error: () => {
        this.saving = false;
        this.error = 'No se pudo guardar';
      }
    });
  }
}
