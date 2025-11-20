import { Component, inject } from '@angular/core';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

import { Navbar } from "../navbar/navbar";
import { FormService } from '../../services/formService';


@Component({
  selector: 'data-client',
  standalone: true,
  imports: [Navbar, AsyncPipe, TitleCasePipe],
  templateUrl: './dataClient.html',

})
export class DataClient {

  private formService = inject(FormService);
  public clientes$ = this.formService.getClientes();


}
