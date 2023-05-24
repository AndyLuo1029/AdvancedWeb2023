import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
              // "https://cdnjs.cloudflare.com/ajax/libs/three.js/92/three.min.js",
              // "https://code.jquery.com/jquery-1.11.1.js",
              
              // "./assets/libs/inflate.min.js",
              // "./assets/libs/Detector.js",
              // "./assets/libs/toon3d.js"