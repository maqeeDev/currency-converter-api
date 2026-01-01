import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthStore } from '../../../store/auth.store';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly authStore = inject(AuthStore);

  @Input() collapsed = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Convert', route: '/convert', icon: 'currency_exchange' },
    { label: 'Currencies', route: '/currencies', icon: 'attach_money' },
    { label: 'Exchange Rates', route: '/currencies/rates', icon: 'trending_up' },
    { label: 'History', route: '/history', icon: 'history' },
  ];

  adminNavItems: NavItem[] = [
    { label: 'Admin Dashboard', route: '/admin/dashboard', icon: 'admin_panel_settings' },
    { label: 'System Health', route: '/admin/health', icon: 'health_and_safety' },
    { label: 'Cache Management', route: '/admin/cache', icon: 'memory' },
    { label: 'System Logs', route: '/admin/logs', icon: 'article' },
  ];
}
