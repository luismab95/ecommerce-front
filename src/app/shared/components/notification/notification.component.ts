import { Component } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgClass],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  constructor(public notificationService: NotificationService) {}

  remove(id: string) {
    this.notificationService.remove(id);
  }
}
