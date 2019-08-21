import { Pipe, PipeTransform } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscriber} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer) {}
  transform(url: string): any {
    return new Observable((observer: Subscriber<any>) => {
      let object = null;
      this.http.get( url, {responseType: 'blob'}).subscribe(obj => {
        object = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(obj));
        observer.next(object);
      }, error => {
      });
      return () => {
        if (object) {
          URL.revokeObjectURL(object);
          object = null;
        }
      };
    });
  }

}
