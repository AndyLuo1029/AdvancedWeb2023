import { NgModule } from  '@angular/core';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';

@NgModule({
    imports: [MatFormFieldModule, MatCardModule, MatToolbarModule, MatButtonModule, MatInputModule],
    exports: [MatFormFieldModule, MatCardModule, MatToolbarModule, MatButtonModule, MatInputModule],

})

export  class  MyMaterialModule { }