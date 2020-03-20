import * as availability from '../src/javascripts/_availability_table';

Blacklight.onLoad(() => {
  availability.checkAvailability();
});
