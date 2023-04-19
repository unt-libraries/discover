const response = {
  total: 2,
  start: 0,
  entries: [
    {
      id: '12345',
      location: { code: 'x', name: 'Remote Storage' },
      status: { code: '-', display: 'AVAILABLE' },
      holdCount: 0,
    },
    {
      id: '67890',
      location: { code: 'x', name: 'Remote Storage' },
      status: { code: '-', display: 'AVAILABLE' },
      holdCount: 0,
    },
  ],
};

export default function XMLHttpRequest(url) {
  return new Promise((resolve, reject) => {
    // const bibIDs = url.substr('/availability/items?item_id='.length).split(',');
    // const userID = parseInt(url.substr('/users/'.length), 10);
    // process.nextTick(() =>
    //   users[userID]
    //     ? resolve(users[userID])
    //     : reject({
    //       error: `User with ${userID} not found.`,
    //     }),
    // );
    console.log('XMLHttpRequest', url);
    resolve(response);
    reject({ error: 'Error' });
  });
}
