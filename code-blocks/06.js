const bent = require('bent');

const token = '<TOKEN>';
const baseUrl = 'https://api.github.com';

const getJson = bent('json', {
  'User-Agent': 'KodesnuttExample'
});

function getJsonAuthed(url) {
  return getJson(url + `?access_token=${token}`);
}

function getUserData(username) {
  return getJsonAuthed(`${baseUrl}/users/${username}`);
}

const numberOfWatchers = series([
  Promise.race([
    getUserData('mikaelbr'),
    getUserData('torgeir'),
    getUserData('mollerse')
  ]),
  user => getJsonAuthed(user.repos_url),
  repos => Promise.all(repos.map(i => getJsonAuthed(i.subscribers_url))),
  i => i.reduce((prev, next) => prev + next.length, 0)
]);

function series(promises) {
  return promises.reduce(function(pp, pOrFn) {
    return pp.then((...args) => (pOrFn && pOrFn.then ? pOrFn : pOrFn(...args)));
  }, Promise.resolve());
}

numberOfWatchers.then(function(num) {
  console.log('Number of watchers', num);
});
