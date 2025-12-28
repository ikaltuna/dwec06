import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, tap } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BooksService {
  private baseUrl = 'https://jsonplaceholder.typicode.com/posts';

  private booksSubject = new BehaviorSubject<Book[]>([]);
  readonly books$ = this.booksSubject.asObservable();

  private loadedOnce = false;

  // Para que los cambios sobre elementos "API" se mantengan en la UI aunque recarguemos desde API:
  private updatedApi = new Map<number, Book>();
  private deletedApi = new Set<number>();

  constructor(private http: HttpClient) {}

  // READ - All: carga desde API y mezcla con estado local
  loadAll(): Observable<Book[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(posts => posts.slice(0, 25).map(p => this.mapPostToBook(p))),
      map(apiList => this.mergeApiWithLocal(apiList)),
      tap(merged => {
        this.booksSubject.next(merged);
        this.loadedOnce = true;
      })
    );
  }

  // READ - ById: primero busca en memoria
  getById(id: number): Observable<Book> {
    const cached = this.booksSubject.getValue().find(b => b.id === id);
    if (cached) return of(cached);

    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(p => this.mapPostToBook(p))
    );
  }

  // CREATE - POST (ejecuta HTTP) + añade al store con id local alto
  create(book: Book): Observable<Book> {
    return this.http.post<any>(this.baseUrl, this.mapBookToPost(book)).pipe(
      map(() => {
        const current = this.booksSubject.getValue();
        const nextId = Math.max(...current.map(b => b.id ?? 1000), 1000) + 1; // 1001+
        return { ...book, id: nextId };
      }),
      tap(created => {
        const current = this.booksSubject.getValue();
        this.booksSubject.next([created, ...current]);
      })
    );
  }

  // UPDATE - PUT (ejecuta HTTP) + actualiza store
  update(id: number, book: Book): Observable<Book> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, this.mapBookToPost(book)).pipe(
      map(() => ({ ...book, id })),
      tap(updated => {
        // Si es un elemento de la API, guardamos la "edición" para que no se pierda al recargar
        if (id < 1000) this.updatedApi.set(id, updated);

        const next = this.booksSubject.getValue().map(b => b.id === id ? updated : b);
        this.booksSubject.next(next);
      })
    );
  }

  // DELETE - DELETE (ejecuta HTTP) + elimina del store
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        if (id < 1000) this.deletedApi.add(id);
        const next = this.booksSubject.getValue().filter(b => b.id !== id);
        this.booksSubject.next(next);
      })
    );
  }

  // -------- Helpers --------

  private mergeApiWithLocal(apiList: Book[]): Book[] {
    const current = this.booksSubject.getValue();

    // Libros creados localmente (id>=1000) se conservan
    const local = current.filter(b => (b.id ?? 0) >= 1000);

    // Aplicar borrados/ediciones sobre la lista API
    const apiFiltered = apiList
      .filter(b => !this.deletedApi.has(b.id ?? -1))
      .map(b => this.updatedApi.get(b.id ?? -1) ?? b);

    // Evitar duplicados por id (por seguridad)
    const byId = new Map<number, Book>();
    for (const b of [...local, ...apiFiltered]) {
      if (b.id != null) byId.set(b.id, b);
    }

    // Orden: primero locales, luego API
    const localsSorted = [...byId.values()].filter(b => (b.id ?? 0) >= 1000).sort((a,b)=> (b.id??0)-(a.id??0));
    const apiSorted = [...byId.values()].filter(b => (b.id ?? 0) < 1000).sort((a,b)=> (a.id??0)-(b.id??0));
    return [...localsSorted, ...apiSorted];
  }

  private mapPostToBook(p: any): Book {
    const userId = Number(p.userId ?? 1);
    return {
      id: Number(p.id),
      title: String(p.title ?? ''),
      author: `Autor ${userId}`,
      description: String(p.body ?? ''),
      categoryId: userId
    };
  }

  private mapBookToPost(book: Book): any {
    return {
      title: book.title,
      body: book.description,
      userId: book.categoryId
    };
  }
}
