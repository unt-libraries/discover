import browserUpdate from 'browser-update';

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
  },
};

export default function runBrowserUpdate() {
  // @ts-ignore
  browserUpdate(config);
}
