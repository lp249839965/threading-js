import Thread from './Thread.js';

// Thread Pool for creating multiple threads with the same
// function and running them in parallel
class ThreadPool {

    // whether the pool has available threads
    get ready() {

        return this._activeThreads < this._capacity;

    }

    get activeThreads() {

        return this._activeThreads;

    }

    get capacity() {

        return this._capacity;

    }

    constructor(capacity, func, context = {}, srcs = [], options = {}) {

        this._capacity = capacity;
        this._activeThreads = 0;
        this._threads = [];

        this._threadArgs = [func, context, srcs];

        if (options.initializeImmediately) this._createThreadsUpTo(this.capacity);

    }

    /* Public API */
    run() {

        // Increment the number of running threads up to
        // capacity.
        this._activeThreads = Math.min(this._activeThreads + 1, this._capacity);
        this._createThreadsUpTo(this._activeThreads);

        // Find a thread to run. If we can't find a thread that is
        // ready and able to run, we return null
        const currThread = this._threads.filter(t => !t.running)[0];
        if (!currThread) return null;

        return new Promise((res, rej) => {

            currThread
                .run(...arguments)
                .then(d => {

                    this._activeThreads--;
                    res(d);

                })
                .catch(e => {

                    this._activeThreads--;
                    rej(e);

                });

        });

    }

    dispose() {

        this._capacity = 0;
        this._activeThreads = 0;
        this._threads.forEach(t => t.dispose());
        this._threads = [];

    }

    /* Private Functions */
    _createThread() {

        this._threads.push(new Thread(...this._threadArgs));

    }

    _createThreadsUpTo(count) {

        count = Math.min(count, this.capacity);
        if (count > this._threads.length) this._createThread();

    }

}

export default ThreadPool;
