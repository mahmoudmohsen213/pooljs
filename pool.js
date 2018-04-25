/* 
 * A lightweight async task queue that limits the invokation of async tasks, and 
 * queues up any additional async task in their order of addition, until there 
 * is an available slot, and forward the provided callback for each.
 * The only two requirements are that the added async taks accepts a callback as
 * the last argument, and call this callback only once when it finishes.
 */

function Pool(poolSize) {
  if ((poolSize) && (typeof poolSize !== 'number'))
    throw new TypeError('the first argument must be a number');

  const self = this;
  
  self.tasks = [];
  self.tasksArguments = [];
  self.callbacks = [];
  self.poolSize = poolSize || 1;
  self.runningJobs = 0;

  /*
  * Used internally to pop the first task in the queue if there is an available
  * slot to invoke it.
  */
  self.dequeue = function (callbackArgsWrapper) {
    if (callbackArgsWrapper) {
      self.runningJobs--;
      let callback = callbackArgsWrapper.callback;
      let callbackArgs = callbackArgsWrapper.args;
      callback(...callbackArgs);
    }

    if ((self.runningJobs >= self.poolSize) || (self.tasks.length <= 0))
      return;

    let task = self.tasks.shift();
    let taskArguments = self.tasksArguments.shift();
    let taskCallback = self.callbacks.shift();
    
    self.runningJobs++;
    taskArguments.push((...callbackArgs) => {
      self.dequeue({ callback: taskCallback, args: callbackArgs });
    });

    task(...(taskArguments));
    self.dequeue();
  };

  /*
  * accepts the function to be invoked when it is the head of the queue, with a 
  * callback and any combination of arguments to be passed to the function.
  */
  self.enqueue = function (task, callback, ...args) {
    if (typeof task !== 'function')
      throw new TypeError('the first argument must be a function object');

    if (typeof callback !== 'function')
      throw new TypeError('the second argument must be a function object');
    
    self.tasks.push(task);
    self.callbacks.push(callback);
    self.tasksArguments.push(args);
    self.dequeue();
    return self;
  };

  /*
  * removes the specified tasks for the queue.
  */
  self.remove = function (index, howmany) {
    if (typeof index !== 'number')
      throw new TypeError('the first argument must be a number');
    
    if (typeof howmany !== 'number')
      throw new TypeError('the second argument must be a number');
    
    self.tasks.splice(index, howmany);
    self.callbacks.splice(index, howmany);
    self.tasksArguments.splice(index, howmany);
    return self;
  };
}

module.exports = Pool;