import * as availability from '../src/javascripts/_availability_table';
import * as ui from '../src/javascripts/_ui';

Blacklight.onLoad(() => {
  availability.checkAvailability();
  ui.bindShowAvailMoreField();
});
