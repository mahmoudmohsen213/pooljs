# pooljs
A lightweight async task queue that limits the invokation of async tasks, and queues up any additional async task in their order of addition, until there is an available slot, and forward the provided callback for each.

The only two requirements are that the added async taks accepts a callback as the last argument, and calls this callback only once when it finishes.

Note that the added tasks will be invoked immediately, if there is an available slot.

## Use case:
This module works for situations where we want to limit the invokation of some async tasks, for example, if we want to limit the concurrent http requests so that we don't overload the network, we can add these calls in the pool queue, and they will be invoked in their order of addition.

## Installation:
```
npm install @mahmoudmohsen213/pooljs
```

## Usage:
The module exports a constructor function which can be used to create new instances of the object.

The constructor function accepts an optional number parameters, which specifies the pool size. This parameter defaults to 1.
```js
var Pool = require('@mahmoudmohsen213/pooljs');
var pool1 = new Pool();
var pool2 = new Pool(5);
```
here pool1 and pool2 are two distinct objects, where pool2 will allow up to 5 async tasks to be invoked before waiting for any callback.

The module exposes two functions .enqueue(), .remove().

#### .enqueue(task, callback[, ...args])
This function takes a function object as the first argument, which is the async task to be executed, and a function argument as the second argument which is a callback.

The function defintion represented by the first argument must accept a callback as its last parameter, and call this callback only once when it finishes.

When a task finishes, the module will detect that, collect the parameters passed by the task ot its callback, invoke the next async function, and then invoke the callback provided by the user.

The module injects a callback to the task, through which it is notified that the task has finished, to invoke the next task in the queue,

The second argument can be followed by an arbitrary number of parameters, which are forwarded to the task on its invokation, followed by the callback.

#### .remove(index, howmany)
This function removes <i>howmany</i> tasks starting from <i>index</i> from the currently existing tasks in the queue.

## Code sample
```js
var Pool = require('@mahmoudmohsen213/pooljs');
var pool = new Pool(1);

function test1(param1, param2, callback){
  setTimeout(function(){
    console.log('test1: ', param1, param2);
    callback('test1 callback param1');
  }, 6000);
}
 
function test2(param1, param2, param3, callback){
  setTimeout(function(){
    console.log('test2: ', param1, param2, param3);
    callback('test2 callback param1');
  }, 1000);
}

function test3(param1, param2, callback){
  setTimeout(function(){
    console.log('test3: ', param1, param2);
    callback('test3 callback param1', 'test3 callback param2');
  }, 3000);
}

function test1Callback(param1){
  console.log('test1Callback: ', param1);
}

function test2Callback(param1){
  console.log('test2Callback: ', param1);
}

function test3Callback(param1, param2){
  console.log('test3Callback: ', param1, param2);
}

pool
  .enqueue(test1, test1Callback, 'test1param1', 'test1param2')
  .enqueue(test2, test2Callback, 'test2param1', 'test2param2', 'test2param3')
  .enqueue(test1, test1Callback, 'test1param3', 'test1param4')
  .enqueue(test3, test3Callback, 'test3param1', 'test3param2')
  .enqueue(test2, test2Callback, 'test2param4', 'test2param5', 'test2param6');
```

## See also
- [forkjs](https://www.npmjs.com/package/@mahmoudmohsen213/forkjs) A lightweight fork-join node module.