import { checkAvailability } from '../../app/webpacker/src/javascripts/_availability_buttons';

describe('checkAvailability', () => {
  it('should remove duplicate buttons', () => {
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

    checkAvailability();

    const item1 = document.querySelector('[data-item-id="1"]');
    const itemButtons = item1.querySelectorAll('.result__field');
    expect(itemButtons.length).toEqual(1);
  });
});
