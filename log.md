# First Steps
We need a site that can connect to the puck. The IDE can do this, and we can use the same js file. https://puck-js.com/puck.js

With that we can talk to the puck on the command line.
```
Puck.write('digitalWrite(LED1, true);\n');
```

This writes a string to the puck. That string is `eval()`ed. Any valid puck JS code will work. We called the `digitalWrite` function and told it to turn on `LED1`. Some people might prefer the `LED1.set();` method. Both are perfectly acceptable. It's more of a preference.

## Do something fun
What fun thing can we do now that we can talk to the puck? How about a simple pong game?
The first step is being able to read the button from the puck.

My first attempt is to use a setInterval to pull the puck for the button press. This sort of works. The main issue is that it's slow, it can only check as often as we pull. It also tends to crash my puck. With a pull at `100ms` my puck crashes quickly and I have to pull out the battery to get it working again. Using ingoneto windows helps a lot during this process. Many times killing the page will free up the puck. I imagine it has something to do with the errors I see from the bluethooth TX being sent to the puck.

# Lunar Lander Game
NASA no longer has the budget to send people to other planets. So they developed a remote control lander. They made it almost fool proof. It's just a single button. Press the button down to fire the thrusters, and release it to stop firing. Easy peasy. Although do to the distance between earth and the lander, there is a slight delay. Shouldn't be a problem for an experienced pilot like yourself.


## Debugging Part One:
So there are many things we can do to improve the performance of pulling from the puck. One is to offload some of the work to the puck itself.

Using `console.group` I can see that my loop binding is having issues.

So lets look at what I did. To connect I have code like this:
```
elConnect.addEventListener('click', function() {
  console.log('Starting pull');
  // Turning on the LED will connect
  Puck.write('digitalWrite(LED2, true)\n');
  pullBTN();
});
```

I call the pullBTN event right after attempting to connect, but I haven't waited to connect. So I have a classic async issue. That might actually be part of my connection issues. I flood the puck with data before it can properly connect.

### Puck.write vs Puck.eval

#### Puck.write
When you use the console on the [IDE](https://www.espruino.com/ide/) you are using `Puck.write`. **Important Note** You need to end commands with a `\n`(New Line) in order to execute the code. On the console you type enter, so when using the Puck API you have to remember to send that enter key.

Our Sample Code:
```
function callback() {
  console.log('cb:', arguments);
}
Puck.write('LED3.set();\n', callback);
```

The callback gets an argument of the command plus what looks like a return value. `LED3.set();↵=undefined↵>`. We can test if it is the return value by sending a command that will return something.
```
Puck.write('1+1\n', callback);
```
Sure enough, we get the expected result. `1+1↵=2↵>`.

So it looks like it just sents the entire string from the inital command until the code terminitates. If that is true, we should be able to get logs printed here as well.

Let's Try it!
```
Puck.write('console.log("Meta", 1 + 1);\n', callback);
```
And it works! `console.log("Meta", 1 + 1);↵Meta 2↵=undefined↵>` It logged `Meta 2` which means it did not just repeat what we typed. It evaluated the `console.log` function and that evaulated our `1 + 1` and resulted in the log printing `2`. Because the code does not exicute until the newline. We could feed it several Puck.write lines.
```
Puck.write('LED1.set();');
Puck.write('var i = 1;');
Puck.write('LED2.set();');
Puck.write('i += 1;');
Puck.write('console.log("i", i);');
Puck.write('\n', callback);
```

If we only care about the result, we only need the callback on the write that contains the `\n` newline. If we do it this way, we will only receive the result. ` i);↵i 2↵=undefined↵>`. intrestingly it also contains a little bit of the last command.

And of course we can even read from the button.
```
Puck.write('BTN.read();\n', callback);
```

Make sure you are holding the button down when you run the code. It will return `BTN.read();↵=true↵>` or `BTN.read();↵=false↵>`.


We can use the callback to `Puck.write` to get the result from the commands it ran, their result, and we know when it has finished exciting. In the multiline version we did not put the callback on the commands, just the newline. Because calling things like `LED1.set();` does not execute the code. `\n` does. The callbacks on the non-exicuting lines is just a parrot of the line it recived.


### Puck.eval
This one is deceptive.
```
Puck.eval('LED1.set();', callback);
```
That will turn on `LED1`, but it will also error. `Uncaught SyntaxError: Unexpected token U in JSON at position 0`. Notice we didn't need the newline. Eval works a little differently write.

If you follow the example in the `puck.js` file. You might try `Puck.eval('BTN.read()', callback)` and find that it works as expected. But if you tried `Puck.eval('BTN.read();', callback)` then you where greeted with the JSON error. The diffrence between the two calls is the semicolon.

So why do we get this error? If you read the source, we find that `eval` is just a wrapper for `write`.
```
/// Evaluate an expression and call cb with the result. Creates a connection if it doesn't exist
eval: function(expr, cb) {
  write('\x10Bluetooth.println(JSON.stringify('+expr+'))\n', function(d) {
    if (d!==null) cb(JSON.parse(d)); else cb(null);
  }, true);
},
```

So it takes our string and turns it into a JSON string. Then the result is parsed as JSON before returning. That explains the errors. The return value is not a valid JSON object. (and the value we are passing in is not valid JSON `Uncaught SyntaxError: Got ';' expected ','
`).

So now that we know why we got the error, we can try to fix it. The first step is making sure we pass a valid input. The command with the `;` is not valid, but calling a function is valid. You could do something like this:

```
Puck.eval('!function(){ console.log("true"); }()', callback);
```

Everything consoled log is passed to the return function in `eval` and then to `JSON.parse`. So you could constuct something fancy to craft whatever output you wanted. But you could probably do that more easily with `write` since it uses `\n` newline as a delimiter.

So what good is `Puck.eval`? It is super awesome at the thing it is designed to do. It can call a function and pass the result to your callback. Most of the time we do not want to send a bunch of code to the puck. Every line of code has to be sent over the low energy bluetooth. It would be much faster to have the puck preloaded with the code we want, then we can just call our public functions. If we think of it this way, the puck is like a tiny api server. It provides functions that we can call and get the result.


`Puck.write` runs any number of javascript commands and exicutes with when it sees a `\n` newline. It is great if the result is for a human or you do not care about the result. It sucks when you want the results.

`Puck.eval` runs a function and returns the results. The function does not have to be on the device, but it makes sense to have it stored there. The puck has memmory to store code and the resuting payload sent over bluetooth will be smaller. ** Note: ** Make sure your functons return something. If you `Puck.eval` a function that does not return, we will see a JSON error again.



### Bug fixes.
Now that we understand `Puck.write` and `Puck.eval` better. We can see some of the bugs causing us so many issues before. First, let's wait for the puck to connect before starting the polling loop.

Let's start by writing some better code for the puck. Some APIs that we can call. We can even add some render functions to show that the code is running. Then we update app.js to use the new API.

My idea is to log the button press up and down. Then we can give the user some help by adjusting for lag between devices.


I've found with some experimentation that pulling every 50 or 100 milliseconds will crash the puck. Taking the battery out and back in again will fix the issue. 200 or 250 seem to work. But that is slow enough that the user will have presses that are missed. Let's use the puck `isDown` method to help adjust for this diffrence.


### Puck keeps crashing
So I have an ongoing problem. The puck freezes. I suspect it is because I am sending too many pull requests too fast. I need ot step up my game to handle this communication.
