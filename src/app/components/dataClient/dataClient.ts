import { Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { AsyncPipe, TitleCasePipe, NgIf, NgFor, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { Navbar } from "../navbar/navbar";
import { FormService } from '../../services/formService';
import { Cliente } from '../../interfaces/client.Interface';
import { FormUtils } from '../../formUtils/form-utils';

@Component({
  selector: 'data-client',
  standalone: true,
  imports: [Navbar, AsyncPipe, TitleCasePipe, NgIf, NgFor, NgClass, ReactiveFormsModule],
  templateUrl: './dataClient.html',
})
export class DataClient {

  private formService = inject(FormService);
  private router = inject(Router);
  public clientes$ = this.formService.getClientes();

  // Estado de edición en línea
  public editingId: number | string | null = null;
  public editedCliente: Cliente | null = null;
  public editForm: FormGroup | null = null;
  // UI state for delete in progress and messages
  public deletingId: number | string | null = null;
  public message: string | null = null;

  // Inicia la edición en la misma fila
  editarCliente(cliente: Cliente) {
    this.editingId = cliente.id ?? null;
    this.editedCliente = { ...cliente };

    // Crear un FormGroup temporal para validar la fila editada
    this.editForm = new FormGroup({
      nombre: new FormControl(cliente.nombre ?? '', [Validators.required, Validators.pattern('^[^0-9]+$')]),
      apellido1: new FormControl(cliente.apellido1 ?? '', [Validators.required, Validators.pattern('^[^0-9]+$')]),
      apellido2: new FormControl(cliente.apellido2 ?? '', [Validators.required, Validators.pattern('^[^0-9]+$')]),
      direccion: new FormControl(cliente.direccion ?? '', [Validators.required, Validators.pattern('^[^0-9]+$')]),
      // telefono: exactly 9 digits
      telefono: new FormControl(cliente.telefono ?? '', [Validators.required, Validators.pattern('^[0-9]{9}$')]),
    });
  }

  // Cancela la edición
  cancelarEdicion() {
    this.editingId = null;
    this.editedCliente = null;
    this.editForm = null;
  }

  // Acepta los cambios y los envía al backend (PUT)
  aceptarEdicion() {
    if (!this.editedCliente || !this.editForm) return;

    // marcar controles como tocados para mostrar errores si existen
    this.editForm.markAllAsTouched();

    if (!this.editForm.valid) return;

    const payload: Cliente = {
      ...this.editedCliente,
      ...this.editForm.getRawValue()
    } as Cliente;

    const llamada = this.formService.actualizarCliente(payload);
    if (!llamada) return;

    llamada.subscribe({
      next: (resp) => {
        this.editingId = null;
        this.editedCliente = null;
        this.editForm = null;
      },
      error: (err) => {
        console.error('Error al actualizar cliente', err);
      }
    });
  }

  // Borra un cliente (pide confirmación y llama al servicio)
  borrarCliente(cliente: Cliente) {
    if (!cliente || !cliente.id) return;
    const confirmed = window.confirm(`¿Eliminar al cliente ${cliente.nombre} ${cliente.apellido1}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    this.deletingId = cliente.id;

    const llamada = this.formService.eliminarCliente(cliente.id);
    if (!llamada) {
      this.deletingId = null;
      return;
    }

    llamada.pipe(
      finalize(() => { this.deletingId = null; })
    ).subscribe({
      next: () => {
        if (this.editingId === cliente.id) this.cancelarEdicion();
        this.message = 'Cliente eliminado correctamente.';
        window.setTimeout(() => this.message = null, 3000);
      },
      error: (err) => {
        console.error('Error al eliminar cliente', err);
        this.message = 'Error al eliminar cliente';
        window.setTimeout(() => this.message = null, 4000);
      }
    });
  }

  // Para enlazar inputs: actualiza la propiedad correspondiente
  updateField(field: keyof Cliente, value: any) {
    if (!this.editedCliente) return;
    // @ts-ignore
    this.editedCliente[field] = value;

    // Si existe el formulario de edición, sincronizar el control
    if (this.editForm && this.editForm.get(String(field))) {
      this.editForm.get(String(field))!.setValue(value, { emitEvent: false });
    }
  }

  // Maneja el input desde la plantilla: limpia dígitos y actualiza el campo y el FormControl
  onInput(field: keyof Cliente, raw: string) {
    if (typeof raw !== 'string') return this.updateField(field, raw);

    // For telefono: remove non-digits. For name-like fields: remove digits.
    const cleaned = field === 'telefono' ? raw.replace(/\D/g, '') : raw.replace(/\d/g, '');
    this.updateField(field, cleaned);
    if (this.editForm && this.editForm.get(String(field))) {
      this.editForm.get(String(field))!.markAsTouched();
      // Keep form control value in sync when user types
      this.editForm.get(String(field))!.setValue(cleaned, { emitEvent: false });
    }
  }

  // Valida que los campos requeridos no estén vacíos y no contengan dígitos
  isRowValid(): boolean {
    if (this.editForm) return this.editForm.valid;
    if (!this.editedCliente) return false;

    const noDigits = (v?: string) => typeof v === 'string' && v.trim().length > 0 && !/\d/.test(v);

    return (
      noDigits(this.editedCliente.nombre) &&
      noDigits(this.editedCliente.apellido1) &&
      noDigits(this.editedCliente.apellido2) &&
      noDigits(this.editedCliente.direccion)
    );
  }

  // Helper para exponer mensajes desde FormUtils en la plantilla
  getFieldError(form: FormGroup | null, field: string) {
    if (!form) return null;
    // Provide a specific message for telefono (exactly 9 digits)
    if (field === 'telefono') {
      const control = form.controls['telefono'];
      if (!control) return null;
      const errs = control.errors ?? {};
      if (errs['required']) return 'Este campo es requerido';
      if (errs['pattern']) return 'El teléfono debe tener 9 dígitos';
      // fallback
      return FormUtils.getFieldError(form, field);
    }

    return FormUtils.getFieldError(form, field);
  }

  fieldHasError(field: string) {
    if (!this.editForm) return false;
    return FormUtils.isValidField(this.editForm, field);
  }

}

