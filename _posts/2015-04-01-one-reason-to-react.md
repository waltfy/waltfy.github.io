---
  layout: post
  author: Walter
  title: One Reason to Use React
  date: 2015-04-01
---

React's popularity is rapidly overtaking **legendary** status, with – as I write this – nearly 20 thousand stars shining away on its GitHub repository badge, the hype (that completely surrounds our industry), and the recent release of React Native to the general public, alongside an array of exciting stuff coming from Facebook, of course. Yet, the truth is: I, genuinely, do not think that most people talking about React know why it is good. And I am telling you right now it is not the damned **Virtual DOM**<sup>**1**</sup>. Everyone's guiltiy of it, for hyping up something too much and for falling for catchy buzzwords and phrases (like "the V in MVC" phoaaaar) and concepts that we do not understand, but are willing to blindly buy into. Anyway... [I have changed my mind](/2014/01/10/6-reasons-to-use-react.html) and now I am going to try and explain **the one reason** – rather than six – as to why I believe React is a local optima, in the way that we use JavaScript to develop single page applications. Please, challenge my viewpoints. I may be ignorant about a fact or two (or a hundred).

## What I see.

So let me share with you what I see now, what React really is.

`Input -> Something -> Output`

Come again?

`Data -> { Your APP } -> Interface`

Which means that your app is nothing more than a function that has data as input, and a Graphical User Interface (in the form a DOM tree) as output.

`x -> f(x) -> y`

If your app is imagined say, as a function, then if your input is the same your result will always be the same too e.g. `var double = (a) => a * 2;`. And this is **exactly** what React **forces** one to do, without one even realising the goodness behind it. "So what's my input?" – you ask? State. State as in **data**, is your input. Your function? Your render method's body, the template<sup>**2**</sup> (or how to display your data). Your output? Like in all web applications a DOM tree! What happens whenever something changes? The function is called again with a different input. i.e. State has changed. Render my stuff again React, please?

To me this pattern is **the reason** people should be using React and why it is so good. I also love the fact that this also enforces a limitation on how many different ways there are to solve problems with it, meaning that React makes developers think in the same way. It borrows a lot from reactive functional programming, which I do not know a lot about, but I am learning... so bear with me.

<sup>**1**</sup>I'm sorry to hurt your feelings. Don't get me wrong, the Virtual DOM is an amazing **abstraction** and React's popularity is largely due to this easy to understand and performant "feature". However, in my opinion, it should not weigh the most in the list of reasons why people should be using this tool.

<sup>**2**</sup>Sorry again, but template and your data aren't separate concerns. In fact is that separation of concerns mixed with the mutability of data in JavaScript that screws things up.
