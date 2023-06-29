import browserUpdate from 'browser-update';
import { allowTracking } from './_analytics';

const config = {
  required: {
    e: -3,
    f: -3,
    o: -3,
    s: -1,
    c: -3,
  },
  insecure: true,
  unsupported: true,
  text: {
    msg: 'Your web browser ({brow_name}) is out of date.',
    msgmore: 'Some features on this site may not work.',
    bupdate: 'Update browser',
    bignore: 'Ignore',
    remind: 'You will be reminded in {days} days.',
    bnever: 'Never show again',
  },
  style: 'bottom',
  onshow(info: { browser: { t: string; }; }) {
    console.log(`Browser ${info.browser.t} is out of date.`);
    if (allowTracking()) {
      window.ga('send', 'event', 'Browser Update Banner', 'Banner Shown', info.browser.t, 1, {
        nonInteraction: true,
      });
    }
  },
  onclick(info: { browser: { t: string; }; }) {
    if (allowTracking()) {
      window.ga('send', 'event', 'Browser Update Banner', 'Banner Clicked', info.browser.t, 1);
    }
  },
  onclose(info: { browser: { t: string; }; }) {
    if (allowTracking()) {
      window.ga('send', 'event', 'Browser Update Banner', 'Banner Closed', info.browser.t, 1);
    }
  },
};

export default function runBrowserUpdate() {
  // @ts-ignore
  browserUpdate(config);
}
