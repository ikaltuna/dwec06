import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { BooksListComponent } from './pages/books/books-list/books-list.component';
import { BookDetailComponent } from './pages/books/book-detail/book-detail.component';
import { BookFormComponent } from './pages/books/book-form/book-form.component';
import { AboutComponent } from './pages/about/about.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'books', component: BooksListComponent },
  { path: 'books/new', component: BookFormComponent },
  { path: 'books/:id', component: BookDetailComponent },
  { path: 'books/:id/edit', component: BookFormComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
