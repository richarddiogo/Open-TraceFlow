import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  template: ''
})
export class BaseTestPage implements OnInit, OnDestroy {
  protected subscriptions: Subscription[] = [];

  constructor(protected router: Router) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      if (sub) sub.unsubscribe();
    });
  }

  navigateBack(): void {
    this.router.navigate(['/test']);
  }
} 