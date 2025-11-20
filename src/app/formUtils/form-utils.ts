import { FormGroup } from "@angular/forms";


export class FormUtils {


  static isValidField (form: FormGroup, fieldName: string): boolean |null{

    return (
      !! form.controls[fieldName].errors &&
      form.controls[fieldName].touched
    );
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {

    if ( !form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};

    for ( const key of Object.keys(errors)){

      switch(key){
        case 'required': return 'Este campo es requerido';
        case 'minlength': return `Minimo de ${ errors['minlength'].requiredLength} caracteres`;
        case 'maxlength': return `Maximo de ${ errors['maxlength'].requiredLength} caracteres`;
        case 'min': return `Valor minimo de ${ errors['min'].min}`;
        case 'max': return `Valor maximo de ${ errors['max'].max}`;
        case 'pattern': return 'Solo se permiten números';
      }
    }
    return null;
  }

}
