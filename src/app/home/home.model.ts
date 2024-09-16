export interface BookRequestResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<any>;
}

export interface BooksResponse extends BookRequestResponse {
  results: Array<Books>;
}

export interface Books {
  id: number;
  title: string;
  authors: Array<string>;
  cover: string;
  epub: string;
  zip: string;
  subjects: Array<string>
  downloadCount: number
}

export interface SearchBookResult {
  id: number;
  title: string;
}

export interface SearchResponse {
  query: string;
  result: Array<SearchBookResult>;
}