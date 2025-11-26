import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';

import { FormUtils } from '../../formUtils/form-utils';
import { FormService } from '../../services/formService';
import { Navbar } from "../navbar/navbar";
import { Cliente } from '../../interfaces/client.Interface';

@Component({
  selector: 'form1.component',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, Navbar],
  templateUrl: './form1.component.html',
})
export class Form1Component {

  public formService = inject(FormService);
  public formUtils = FormUtils;
  public isLoading: boolean = false;
  public message: string | null = null;

  onSubmit(){

    this.formService.formularioCliente.markAllAsTouched();
    const llamadaBackend = this.formService.enviarDatosCliente();

    if (llamadaBackend) {
      this.isLoading = true;

      // 🚨 La respuesta ahora está tipada como Cliente
      llamadaBackend.subscribe({
        next: (respuesta: Cliente) => {
          // Aquí TypeScript sabe que 'respuesta' tiene 'id', 'nombre', etc.
          console.log(`✅ Cliente ID ${respuesta.id} guardado con éxito.`, respuesta);
          this.formService.formularioCliente.reset();
          this.message = 'Cliente creado correctamente.';
          window.setTimeout(() => this.message = null, 3500);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Error al guardar:', error);
          this.message = 'Error al crear el cliente';
          window.setTimeout(() => this.message = null, 4000);
          this.isLoading = false;
        }
      });
    }
  }
 }
