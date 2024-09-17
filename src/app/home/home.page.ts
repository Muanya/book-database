import { Component, OnDestroy, OnInit } from '@angular/core';
import { HomeService } from './home.service';
import { BooksResponse, SearchBookResult } from './home.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  public currentPage: number = 1;
  public totalPages: number = 100;
  public searchResults: Array<SearchBookResult> = [];
  searchQuery: string = '';
  searchValue: string = '';

  books!: BooksResponse;
  booksSub!: Subscription;
  paramSub!: Subscription;
  searchSuggestionSub!: Subscription;

  isLoadingBooks: boolean = true;
  searchMode: boolean = false;

  constructor(
    private service: HomeService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.processRoute();
    this.booksSub = this.service.bookResponse.subscribe((books) => {
      if (!books) {
        this.isLoadingBooks = true;
        return;
      }
      this.books = books;
      this.totalPages = Math.ceil(books.count / this.service.booksPerRequest);
      this.isLoadingBooks = false;
    });

    this.searchSuggestionSub = this.service.searchSuggestions.subscribe(
      (suggestions) => {
        this.searchResults = [];

        if (suggestions && this.searchQuery == suggestions.query) {
          this.searchResults = suggestions.result;
        }
      }
    );
  }

  processRoute() {
    this.paramSub = this.activatedRoute.queryParams.subscribe((paramDict) => {
      this.isLoadingBooks = true;
      this.currentPage = 1;
      this.searchMode = false;
      this.searchValue = '';

      if (paramDict['page']) {
        this.currentPage = +paramDict['page'];
      }

      if (paramDict['search']) {
        this.searchMode = true;
        this.searchValue = paramDict['search'];
      }

      this.service.getBooks(
        this.currentPage,
        this.searchMode,
        this.searchValue
      );
    });
  }

  ngOnDestroy(): void {
    this.booksSub.unsubscribe();
    this.paramSub.unsubscribe();
    this.searchSuggestionSub.unsubscribe();
  }

  nextPage() {
    this.currentPage++;
    console.log(this.searchQuery);

    this.updatePage();
  }
  prevPage() {
    this.currentPage--;
    this.updatePage();
  }

  updatePage() {
    this.isLoadingBooks = true;

    const newQueryParams = { page: this.currentPage };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: newQueryParams,
      queryParamsHandling: 'merge', // Merge with existing query params
    });
  }

  handleSearch(event: any) {
    this.searchResults = [];

    if (this.searchQuery.trim() === '') {
      return;
    }
    const query = event.target.value.toLowerCase();
    console.log(this.currentPage);
    this.service.getSearchSuggestions(query);
  }

  selectSuggestion(searchId: number) {
    this.isLoadingBooks = true;
    this.searchResults = [];
    this.router.navigate(['home/detail', searchId]);
  }

  searchSuggestion() {
    this.isLoadingBooks = true;
    this.searchResults = [];

    const newQueryParams = { search: this.searchQuery, page: 1 };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: newQueryParams,
      queryParamsHandling: 'merge', // Merge with existing query params
    });

    this.searchQuery = '';
  }
}
