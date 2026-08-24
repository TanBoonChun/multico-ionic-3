import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);

const originalReadAsArrayBufferMethod = FileReader.prototype.readAsArrayBuffer;

FileReader.prototype.readAsArrayBuffer = function(args) {
  const originalFileReader = this['__zone_symbol__originalInstance'];
  if (originalFileReader) {
    originalFileReader.onloadend = () => {
      this.result = originalFileReader.result;
      this.onload();
    }
    originalFileReader.readAsArrayBuffer(args);
  } else {
    originalReadAsArrayBufferMethod(args);
  }
}