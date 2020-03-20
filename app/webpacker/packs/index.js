import * as availability from '../src/javascripts/_availability_buttons';

Blacklight.onLoad(() => {
  availability.checkAvailability();
});
