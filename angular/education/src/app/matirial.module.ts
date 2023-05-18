import { NgModule } from  '@angular/core';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table'

@NgModule({
    imports: [MatFormFieldModule, MatCardModule, MatToolbarModule, MatButtonModule, MatInputModule, MatTableModule],
    exports: [MatFormFieldModule, MatCardModule, MatToolbarModule, MatButtonModule, MatInputModule, MatTableModule],

})

export  class  MyMaterialModule { }