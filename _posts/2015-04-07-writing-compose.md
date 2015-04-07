---
  layout: post
  author: Walter
  title: Writing Compose
  date: 2015-04-07
---

_I wanted to write compose, for my own record and understanding. So I did it._

In JavaScript, the `compose` function is a function that:

- Takes an arbitrary number of functions as its arguments.
- Returns a new function that is the equivalent of running all of the other functions from right to left.

**NOTE**: "from right to left".

Let's create a function that returns a function.

{% highlight js %}
function compose(/* [function] [, function...] */) {
  return function () {};
}
{% endhighlight %}

Exciting! Now we can call the "composed" function as `compose()(); // undefined`. Now let's get an array of length n, consisting of functions to be composed. Let's call that array the `chain`;

{% highlight js %}
function compose(/* [function] [, function...] */) {
  var chain = [].slice.call(arguments).reverse();
  return function () {};
}
{% endhighlight %}

Cool. So, we now have all the functions that we need in one iterable object. Note the `.reverse()` call at the end here, this refers to the "from left to right"<sup>1</sup> note. Moving on. We now need to get the arguments to the resulting function, and stick in an array too. You'll see why later. `compose()` returns **one function**, therefore it returns **one result**. For that reason we will also iterate over the array via a `Array.reduce()`, meaning that we're folding on a result everytime.

{% highlight js %}
function compose(/* [function] [, function...] */) {
  var chain = [].slice.call(arguments).reverse();
  return function () {
    var args = [].slice.call(arguments);
    return chain
      .reduce(function (fold, fn) {
        /* do thing here */
      }, args);
  };
}
{% endhighlight %}

The aim now is to make every function be called with the result of the previous as the parameters. We have arguments as an array, so we can initialise the `fold` as the initial arguments (`args`), and apply the fold to the function everytime. Fold is then the result of the function call, which is then passed to the next iteration, and so on.

{% highlight js %}
function compose(/* [function] [, function...] */) {
  var chain = [].slice.call(arguments).reverse();
  return function () {
    var args = [].slice.call(arguments);
    return chain
      .reduce(function (fold, fn) {
        fold = fn.apply(fn, fold);
        return [fold];
      }, args);
  };
}
{% endhighlight %}

**NOTE**: We are returning the first (and only) element of the resulting array.



Of course, there are improvements that could be made (make it more DRY, avoid a few lines here and there) but there you have it. I've added `compose` to the global scope of this page. Open up your console and go play with it! Check the revisions on the [gist if you want to visualise](https://gist.github.com/waltfy/9f314bc3ea74cfc6c97d/revisions) the code better. (I've also added `double(n)` and `addOne(n)`)

<script type='text/javascript'>
  console.debug("Hey, you're trying it!");
  console.debug('compose(/* functions */) is available');
  console.debug("try running addOneThenDouble(2), you should get 6.");
  console.debug('[1, 2, 3].map(addOneThenDouble)... what happens then?');

  window.compose = function () {
    var chain = [].slice.call(arguments).reverse();
    return function () {
      var args = [].slice.call(arguments);
      return chain
        .reduce(function (fold, fn) {
          return [fn.apply(fn, fold)];
        }, args)[0];
    };
  };
  
  window.double = function (n) {
    return n + n;
  };

  window.addOne = function (n) {
    return n + 1;
  };

  window.addOneThenDouble = compose(double, addOne);
</script>

<sup>1</sup>: The reason this is reversed is so that it matches the composition "nesting", for example:
{% highlight js %}
compose(double, sum)(1, 2); // 6
double(sum(1, 2)); // 6
// double <- sum
{% endhighlight %}
