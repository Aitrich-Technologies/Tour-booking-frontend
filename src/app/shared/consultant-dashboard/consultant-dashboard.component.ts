import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Consultant } from '../models/consultant';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-consultant-dashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './consultant-dashboard.component.html',
  styleUrl: './consultant-dashboard.component.css'
})
export class ConsultantDashboardComponent {

  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private sharedService = inject(SharedService);

  consultants = signal<Consultant[]>([]);
  showModal = signal(false);
  editingConsultant = signal<Consultant | null>(null);
  isLoading = signal(false);
  showPassword = false

  consultantForm: FormGroup;

  constructor() {
    this.consultantForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephoneNo: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadConsultants();
  }

  loadConsultants(): void {

    this.sharedService.getAllUsers().subscribe({
      next: (data) => this.consultants.set(data.filter((user: Consultant) => user.role === 'CONSULTANT')),
      error: (err) => console.error('Failed to load consultants', err)
    });

  }

  openAddModal(): void {
    this.editingConsultant.set(null);
    this.consultantForm.reset();
    this.consultantForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.showModal.set(true);
  }

  editConsultant(consultant: Consultant): void {
    this.editingConsultant.set(consultant);
    this.consultantForm.patchValue(consultant);
    this.consultantForm.get('password')?.clearValidators();
    this.consultantForm.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingConsultant.set(null);
    this.consultantForm.reset();
  }

  saveConsultant(): void {
    if (this.consultantForm.invalid) {
      Object.keys(this.consultantForm.controls).forEach(key => {
        this.consultantForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    const formData = { 
      ...this.consultantForm.value, 
      role: 'CONSULTANT' 
    };

    const consultant = this.editingConsultant();
    const request = consultant
      ? this.sharedService.editUser(consultant.id, formData)
      : this.sharedService.addConsultant(formData);

    request.subscribe({
      next: () => {
        this.loadConsultants();
        this.closeModal();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to save consultant', err);
        this.isLoading.set(false);
        alert('Failed to save consultant: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  viewConsultant(consultant: Consultant): void {
    alert(`View consultant details for: ${consultant.firstName} ${consultant.lastName}`);
    // Navigate to detail page or show detail modal
  }

  togglePassword(){
    this.showPassword = !this.showPassword
  }

  activateConsultant(id: string): void {
    this.http.patch(`/api/v1/consultants/${id}/activate`, {}).subscribe({
      next: () => this.loadConsultants(),
      error: (err) => console.error('Failed to activate consultant', err)
    });
  }

  deactivateConsultant(id: string): void {
    if (confirm('Are you sure you want to deactivate this consultant?')) {
      this.http.patch(`/api/v1/consultants/${id}/deactivate`, {}).subscribe({
        next: () => this.loadConsultants(),
        error: (err) => console.error('Failed to deactivate consultant', err)
      });
    }
  }

  deleteConsultant(id: string): void {
    if (confirm('Are you sure you want to delete this consultant? This action cannot be undone.')) {
      this.sharedService.deleteUser(id).subscribe({
        next: () => this.loadConsultants(),
        error: (err) => console.error('Failed to delete consultant', err)
      });
    }
  }

  getInitials(consultant: Consultant): string {
    return `${consultant.firstName.charAt(0)}${consultant.lastName.charAt(0)}`.toUpperCase();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-success';
      case 'INACTIVE': return 'bg-secondary';
      case 'PENDING': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  getActiveCount(): number {
    return this.consultants().filter(c => c.status === 'ACTIVE').length;
  }

  getPendingCount(): number {
    return this.consultants().filter(c => c.status === 'PENDING').length;
  }

  getTotalBookings(): number {
    return this.consultants().reduce((sum, c) => sum + (c.totalBookings || 0), 0);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.consultantForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

}
