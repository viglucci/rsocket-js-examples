const {Single} = require('rsocket-flowable');

const statuses = {
  PENDING: "pending",
  CANCELLED: "cancelled"
};

class TimeService {
  currentTime(payload) {
    let status = statuses.PENDING;

    console.log(`requestResponse request`, payload);

    return new Single((subscriber) => {

      /**
       * In the event that the client cancels the request before
       * the server can respond, we will change our status to cancelled
       * and avoid calling `onComplete` on the `subscriber` instance in the
       * `setTimeout` callback.
       */
      function handleCancellation() {
        status = statuses.CANCELLED;
      }

      subscriber.onSubscribe(() => handleCancellation());

      /**
       * If the client cancelled the request before we got to this point,
       * we can return early and avoid doing any of the work below.
       */
      if (status === statuses.CANCELLED) {
        return;
      }

      const msg = `${new Date()}`;

      console.log(`requestResponse response`, msg);

      subscriber.onComplete({
        data: Buffer.from(msg),
        metadata: null, // or new Buffer(...)
      });
    });
  }
}

module.exports = TimeService;
