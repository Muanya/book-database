import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap, take, tap } from 'rxjs';
import {
  BookRequestResponse,
  Books,
  BooksResponse,
  SearchBookResult,
  SearchResponse,
} from './home.model';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private baseUrl: string = 'https://gutendex.com/';
  booksPerRequest: number = 10;
  apiBooksPerRequest: number = 32;
  private suggestionLength: number = 5;
  private _bookResponse = new BehaviorSubject<BooksResponse | null>(null);
  private _searchSuggestions = new BehaviorSubject<SearchResponse | null>(null);

  constructor(private httpClient: HttpClient) {}

  public get bookResponse(): Observable<BooksResponse | null> {
    return this._bookResponse.asObservable();
  }

  public get searchSuggestions(): Observable<SearchResponse | null> {
    return this._searchSuggestions.asObservable();
  }

  getBooks(page: number, isSearch: boolean, searchValue: string = '') {
    const temp = this.booksPerRequest * page;
    const un = temp - 1;
    const ln = temp - this.booksPerRequest;

    const apiPageLow = Math.floor(ln / this.apiBooksPerRequest) + 1;
    const apiPageUpper = Math.floor(un / this.apiBooksPerRequest) + 1;

    const totalResults: Array<Array<any>> = [];

    let url = this.baseUrl + 'books/?';

    if (isSearch) {
      url += `search=${searchValue}&`;
    }

    if (apiPageLow == apiPageUpper) {
      url += `page=${apiPageLow}`;

      this.httpClient
        .get<BookRequestResponse>(url)
        .pipe(
          take(1),
          map((res) => {
            return this.mapResults(res, totalResults, ln, un);
          }),

          tap((res) => {
            this._bookResponse.next(res);
          })
        )
        .subscribe();
    } else {
      const url1 = url + `page=${apiPageLow}`;
      const url2 = url + `page=${apiPageUpper}`;

      this.httpClient
        .get<BookRequestResponse>(url1)
        .pipe(
          take(1),
          switchMap((res) => {
            totalResults.push(this.getResultsFromResponse(res));
            console.log(res);
            return this.httpClient.get<BookRequestResponse>(url2);
          }),
          take(1),
          map((res) => {
            return this.mapResults(res, totalResults, ln, un);
          }),

          tap((res) => {
            this._bookResponse.next(res);
          })
        )
        .subscribe();
    }
  }

  getSearchSuggestions(value: string) {
    const url = this.baseUrl + `books/?search=${value}`;

    this.httpClient
      .get<BookRequestResponse>(url)
      .pipe(
        take(1),
        map((res) => {
          return this.mapSearchResults(res);
        }),

        tap((res) => {
          this._searchSuggestions.next({
            query: value,
            result: res,
          });
        })
      )
      .subscribe();
  }

  private mapResults(
    res: BookRequestResponse,
    totalResults: Array<Array<any>>,
    ln: number,
    un: number
  ) {
    totalResults.push(this.getResultsFromResponse(res));

    let results = this.processBookResults(
      totalResults,
      ln % this.apiBooksPerRequest,
      un % this.apiBooksPerRequest
    );
    res.results = results;
    return res;
  }

  private mapSearchResults(res: BookRequestResponse): Array<SearchBookResult> {
    let suggestions: Array<SearchBookResult> = [];

    let results = res['results'];

    if (!results) {
      return suggestions;
    }

    for (let i = 0; i < Math.min(this.suggestionLength, results.length); i++) {
      suggestions.push({ id: results[i].id, title: results[i].title });
    }

    return suggestions;
  }

  private getResultsFromResponse(res: BookRequestResponse): Array<any> {
    return res.results;
  }

  processBookResults(
    results: Array<Array<any>>,
    low: number,
    upper: number
  ): Array<Books> {
    let processedBooks: Array<Books> = [];

    if (results.length == 1) {
      for (let i = low; i <= Math.min(results[0].length - 1, upper); i++) {
        let element = results[0][i];

        let bk: Books = this.processBookObject(element);

        processedBooks.push(bk);
      }
    } else {
      for (let i = low; i < this.apiBooksPerRequest; i++) {
        let element = results[0][i];

        let bk: Books = this.processBookObject(element);

        processedBooks.push(bk);
      }

      for (let i = 0; i <= Math.min(results[1].length - 1, upper); i++) {
        let element = results[1][i];

        let bk: Books = this.processBookObject(element);

        processedBooks.push(bk);
      }
    }

    return processedBooks;
  }

  processBookObject(element: any): Books {
    let bk: Books = {
      id: element.id,
      title: element.title,
      authors: this.processAuthors(element.authors),
      cover: element.formats['image/jpeg'],
      epub: element.formats['application/epub+zip'],
      zip: element.formats['application/octet-stream'],
      subjects: this.processSubjects(element.subjects),
      downloadCount: element.download_count,
    };

    return bk;
  }

  processAuthors(authors: Array<any>): Array<string> {
    let authorNames: Array<string> = [];

    authors.forEach((element) => {
      authorNames.push(element.name);
    });

    return authorNames;
  }

  processSubjects(subjects: Array<any>): Array<string> {
    let processedSubjects: Array<string> = [];

    subjects.forEach((element) => {
      let temp = (element as string).split('--');
      processedSubjects.push(temp[0]);
    });

    return processedSubjects;
  }

  getBookById(bookid: string): Observable<Books> {
    const url = this.baseUrl + `books/${bookid}`;

    return this.httpClient.get(url).pipe(
      take(1),
      map((res) => {
        let book = this.processBookObject(res);
        console.log(res);
        return book;
      })
    );
  }
}
