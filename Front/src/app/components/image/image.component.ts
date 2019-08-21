import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter} from '@angular/core';
import { ElementRef } from '@angular/core';
import {environment} from "../../../environments/environment";


@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit, OnChanges{
  URL = (environment.production)? 'http://krul.fachr.at:11009/secure/game/images/segments/': '/api/secure/game/images/segments/';
  @Input() segments: Array<{segment: number, timestamp: number}>;
  @Input() segmentMap: string[][];
  @Input() revealedSegments: Array<{segment: number, timestamp: number}>;
  @Input() dimension: {height: number, width: number, label: {'label': string, 'wordnet height': number}[], annotation: string};
  @Input() opacityMap: Map<number, number>;
  @Input() yourTurn: boolean;
  @Output() messageEvent = new EventEmitter<number>();
  @Output() duplicateEvent = new EventEmitter<boolean>();
  currentSegment;
  constructor(private elRef: ElementRef) { }

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges){
    if(this.revealedSegments) {
      this.revealedSegments.forEach(x => this.opacityMap.set(x.segment, 1));
    }
  }
  onClick(e) {
    if(this.yourTurn) {
      let segment = this.segmentMap[e.pageY - this.elRef.nativeElement.offsetTop][e.pageX - this.elRef.nativeElement.offsetLeft];
      console.log(typeof segment);
      console.log(typeof this.revealedSegments[0]);
      if (this.revealedSegments.map(s => s.segment).includes(parseInt(segment, 10))) {
        if(!this.revealedSegments.map(s => s.segment).includes(this.currentSegment)) {
          this.opacityMap.set(this.currentSegment, 0.5);
        }
        this.currentSegment = null;
        this.sendMessage();
        this.sendDuplicate();
        return;
      }
      if (this.currentSegment && !this.revealedSegments.map(s => s.segment).includes(this.currentSegment)) {
        this.opacityMap.set(this.currentSegment, 0.5);
      }
      console.log(`currentSegment: ${this.currentSegment}, segment: ${segment}`);
      this.opacityMap.set(parseInt(segment, 10), 1);
      this.currentSegment = parseInt(segment, 10);
      this.sendMessage();
    }
  }
  interactionFail() {
    console.log('fail');
  }
  sendMessage() {
    this.messageEvent.emit(this.currentSegment);
  }
  sendDuplicate() {
    this.duplicateEvent.emit(true);
  }
}
