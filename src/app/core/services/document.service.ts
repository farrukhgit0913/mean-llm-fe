import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadResponse {
  filename: string;
  chunks: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:3000/api';

  upload(file: File): Observable<UploadResponse> {
    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<UploadResponse>(
      `${this.apiUrl}/documents/upload`,
      formData
    );
  }
}
