import { enableFetchMocks } from 'jest-fetch-mock';
import { serviceDeskData } from './__mocks__/service_desks';
import { statusDescData } from './__mocks__/availability_statuses';
import { locationData } from './__mocks__/availability_locations';

enableFetchMocks();
jest.mock('../../app/webpacker/src/javascripts/data/service_desks', () => ({
  serviceDeskData,
}));
jest.mock('../../app/webpacker/src/javascripts/data/availability_statuses', () => ({
  statusDescData,
}));
jest.mock('../../app/webpacker/src/javascripts/data/availability_locations', () => ({
  locationData,
}));

import { checkAvailability } from '../../app/webpacker/src/javascripts/_availability_buttons';

import mocked = jest.mocked;

describe('checkAvailability', () => {
  it('should remove duplicate buttons', async () => {
    document.body.innerHTML = `
      <div id="documents">
        <div class="document" data-item-id="1">
          <div class="item-availability">
            <div class="result__field">item</div>
            <div class="result__field">item</div>
          </div>
        </div>
        <div class="document" data-item-id="2">
          <div class="item-availability">
            <div class="result__field" data-online="true">Online</div>
            <div class="result__field" data-online="true">Online</div>
          </div>
        </div>
      </div>
    `;

    await checkAvailability();

    const item1 = document.querySelector('[data-item-id="1"]');
    if (!item1) {
      throw new Error('Item 1 not found');
    }
    const itemButtons = item1.querySelectorAll('.result__field');
    expect(itemButtons.length).toEqual(1);
  });
});
