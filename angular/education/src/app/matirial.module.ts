import { NgModule } from  '@angular/core';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
@NgModule({
    imports: [MatFormFieldModule, MatCardModule, MatToolbarModule, MatButtonModule, MatInputModule, MatTableModule, MatProgressSpinnerModule],
    exports: [MatFormFieldModule, MatCardModule, MatToolbarModule, MatButtonModule, MatInputModule, MatTableModule, MatProgressSpinnerModule],

})

export  class  MyMaterialModule { }