const retry = require('bluebird-retry');

const CCCC = require('cloud-compute-cannon-client');
const log = require('./log');

const ccc = CCCC.connect(process.env.CCC);

const cccPromise =
  retry(
    () => {
      log.debug(`Attempting ccc.status at ${process.env.CCC}`);
      return ccc.status()
        .then(status =>
          status
        );
    },
    { max_tries: 50, interval: 1000, max_interval: 10000 }
  )
  .then(() => {
    if (process.env.CCC === 'ccc:9000') {
      log.warn('Dev mode, deleting all jobs');
      return ccc.deleteAllJobs()
        .then((result) => {
          log.info({ m: 'result from ccc.delete all', result });
          return ccc;
        });
    }

    return ccc;
  });

const cccUtils = {
  promise() {
    return cccPromise;
  },
};

module.exports = cccUtils;