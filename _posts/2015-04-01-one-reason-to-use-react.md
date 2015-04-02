---
  layout: post
  author: Walter
  title: One Reason to Use React
  date: 2015-04-01
---

React's popularity is rapidly achieving **legendary** status. As I write this, there are nearly _20 thousand_ stars shining away on [its GitHub repository](https://github.com/facebook/react). Adding fuel to the explosion of popularity are: the hype (that completely surrounds our industry) and the recent release of [React Native](https://github.com/facebook/react-native) to the general public. There is also an array of exciting stuff coming from Facebook to OSS, which is great of course. But back to React. The truth is that I, genuinely, do not think that most people talking about React truly know why it is good. And I am telling you: it is not the damn **Virtual DOM**<sup>**1**</sup>.

Everyone's guilty of it. Guilty of hyping up something. Guilty of falling for catchy buzzwords and phrases (like "the V in MVC" – whoaaaaa). Guilty for adhering to maxims that we do not understand but are willing to buy into. The industry is full of it. [I wrote a while back about React](/2014/01/10/6-reasons-to-use-react.html), well... I have changed my mind and now I am going to try explain to you the **one** reason – rather than six – as to why I believe React is a local optima, in the way that we use JavaScript to develop our applications. Please, [challenge my viewpoints](https://www.twitter.com/waltfy). I may be ignorant about a fact or two. Or a hundred.

## What I see...

So let me share with you what I see now, React really is.

`Input -> Something -> Output`

Come again?

`Data -> { Your APP } -> Interface`

Which means that your app can be reasoned about as nothing more than a function that has data as input, and a Graphical User Interface (in the form of a DOM tree) as output.

`x -> f(x) -> y`

If your app is imagined say – as a function – then if your input is always the same, your result will always be the same also e.g. `var double = a => a * 2;`. This is **almost exactly** the conditions that React **forces** one to operate under, without one even realising the goodness behind it. "So what's my input?" – you ask? State. State as in **data**, is your input. Your function? Your root component render method, and effectively the template<sup>**2**</sup> (or how one displays state). Your output? Like in all web applications a DOM tree! What happens whenever something changes? The function is called again with a different input. i.e. State has changed. Render my stuff again please?

So React can be seen as the "function", that operates on your data (state) and produces an output (DOM). And it's damn good at being just that.

To me this pattern is **the one reason** people should be using React and why it is so good. I also really like the fact that this enforces a limit on the number of different ways there are to solve problems while using the framework, meaning that React makes developers think in a very similar way. That's a nice consequence of this way of doing things. It borrows a lot from reactive functional programming, which I do not know a lot about, but I am learning... so bear with me while I learn me some more.

<sup>**1**</sup>I'm sorry to hurt your feelings. Don't get me wrong, the Virtual DOM is an amazing **abstraction** and React's popularity is largely due to this easy to understand and performant "feature". However, in my opinion, it should not weigh the most in the list of reasons why people should be using this tool.

<sup>**2**</sup>Sorry again, but templates and data aren't separate concerns. In fact, that separation of concerns mixed with the mutability of data in JavaScript screws things up. BIG TIME.
