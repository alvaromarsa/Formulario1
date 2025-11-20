import { inject, Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { Cliente } from '../interfaces/client.Interface';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:3000/clientes';
  private reloadCliente$ = new BehaviorSubject<boolean>(true);

  public clientes$ = this.reloadCliente$.pipe(

    switchMap(() => this.getClientesReal())
  );

  public formularioCliente = new FormGroup({
    nombre: new FormControl('', Validators.required),
    apellido1: new FormControl('', Validators.required),
    apellido2: new FormControl('', Validators.required),
    direccion: new FormControl('', Validators.required),
    telefono: new FormControl('',[
      Validators.required,
      Validators.pattern('^[0-9]+$'),
      Validators.minLength(9),
      Validators.maxLength(9),
    ]),
    sexo: new FormControl('', Validators.required),

  })

  enviarDatosCliente():Observable<Cliente> | null{

    if(this.formularioCliente.valid){

      const datosCliente = this.formularioCliente.getRawValue() as Cliente;

      // 🚨 ¡Aquí es la llamada HTTP real al Backend!
     return this.http.post<Cliente>(this.backendUrl, datosCliente).pipe(
      tap(() => this.reloadCliente$.next(true))
     );


    }
      this.formularioCliente.markAllAsTouched();
      return null;

  }

// Método que hace la llamada HTTP GET real
  private getClientesReal(): Observable<Cliente[]> {
      return this.http.get<Cliente[]>(this.backendUrl);
  }

// 3. Método para obtener la lista (solo devuelve la propiedad clientes$ ya encadenada)
  getClientes(): Observable<Cliente[]> {
    return this.clientes$;
  }
}
