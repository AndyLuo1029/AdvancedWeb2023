import { NgModule } from  '@angular/core';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatListModule} from '@angular/material/list';
@NgModule({
    imports: [MatFormFieldModule, MatCardModule, MatToolbarModule, MatButtonModule, MatInputModule, MatTableModule, MatProgressSpinnerModule,MatListModule],
    exports: [MatFormFieldModule, MatCardModule, MatToolbarModule, MatButtonModule, MatInputModule, MatTableModule, MatProgressSpinnerModule,MatListModule],

})

export  class  MyMaterialModule { }