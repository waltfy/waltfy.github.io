{{{
  "title" : "My Case for React",
  "category" : "Blogging Javascript",
  "date" : "1-6-2014"
}}}

`React` is Facebook & Instagram's child, a framework that can be, [and has been](http://www.youtube.com/watch?v=XxVg_s8xAms), referred to as "just the view" on the MVC. In this post I will provide a list of reasons as to why React can do for me what EmberJS | Angular | Backbone can't or won't do.

> "A Javascript Library for building user interfaces."
> __The React Team__

## YES!
That is, _exactly_, what I want! I’ve had my fair share of going through steep learning curves just so I could implement simple tasks well. I mean, don't get me wrong—I believe that frameworks like Ember, Angular, Backbone (between many others) are getting a lot of things right—however, in my opinion they also present overcomplicated and sometimes unnecessary functionality as well as options, and they come (jam) packed with those, so now as part of our daily lives on the web development world—which is already quite troublesome—we're having to deal with & solve problems that weren't even there in the first place, simply because we need to follow certain conventions set by the framework’s opinions on how to solve a given problem. Effectively you have to ramp-up and learn more in order to use other frameworks, while React is ‘pure’ JavaScript so you can focus on learning the concept of modular applications, which you will profit from, since Modularity is a concept reusable in pretty much any aspect. Rant over. So, I came across React a few days ago, and—I might eat my words, but...—so far, at least for me, has made complete and absolute sense. And I think I will be using it on my final year project for university, and here are the 5 reasons why:

## 1. Progressive Enhancement & React
In my opinion? Perfect marriage. Why? Well I haven’t played enough with it yet but I coded up [this bin](http://jsbin.com/ubuvokUr/6/edit?html,console,output) which (kinda) shows what I mean. You can see that React is simply replacing the contents inside of the `div` with `id=’subscribe’` why is this perfect? Well with the concept of [progressive enhancement and ‘Hijax’](domscripting.com/presentations/wd06/hijax/), if Javascript fails we will have a fallback right there on HTML. So if and only if, Javascript is available/enabled then we are able to replace the contents of the `div` with React’s components. We can also check for AJAX availability, and this opens up the possibility of one page apps with React. If all fails (JS, CSS) we still have a fully functioning HTML hit-refresh application. What’s cool about this is that a React component can replace its equivalence in pure HTML really simply. This for me is one of, if not, THE biggest reason. I want my apps to be as bullet-proof as possible, React lets me do that with ease when you compare it to other frameworks. Although a few months ago [Tom Dale argued that progressive enhancement was dead](http://tomdale.net/2013/09/progressive-enhancement-is-dead/), I still very much believe in the inclusiveness of PE and the safety-net it provides us.

## 2. "Virtual DOM" & "diff-ed" DOM Updates
React uses a process they call ‘reconciliation’, to keep the UI up-to-date as your data morphs, it basically auto updates views and DOM according to the current data by re-rendering everything altogether. Bad idea? Think again. The `render: function () {}` it's called in order to get a representation of what the component looks like at that point in time. So when something happens to your data `render` is called again adding the changes to a “Virtual DOM” and React’s reconcile acts somewhat like performing a `git diff`, if you like, (between that Virtual DOM and the current DOM, I believe) to compare your representations of a given component after a mutation in data (an update) and renders the update with the minimum possible DOM update cost. Simply brilliant.

## 3. JSX — HTML mixed with JS (via XML)
JSX is “a JavaScript XML syntax transform recommended for use with React.”, it basically allows us to write HTML inside Javascript to allow easier visualisation of the DOM structure within your code. Again, referencing [the bin](http://jsbin.com/ubuvokUr/6/edit?html,console,output) you can observe that I am using the JSX Transformer. Notice the HTML (XML) syntax being `return`ed by Javascript. It’s cool. It’s simple. And it isn’t a requirement, so out of the box React will work without it. It’s worth noticing that in fact the React team advises you to precompile your JSX files for production which basically boils it down to the usual `React.DOM.[element]` format, which if you’re comfortable enough with, scrap JSX altogether.

## 4. Defaults to Modularity
The Components concept, in a way, forces you to think of your application as modules interacting with each other. And that’s a good thing. There is some level of dependency/coupling between modules too, and some nesting can be a little complicated, but all-in-all it seems like a good way to structure your application. It also forces us to see modules everywhere e.g. Take a look at Twitter’s page. In React we may structure our application as:

    — App
        — Twitter Feed
            — Tweet
        — Post Tweet
        — Who To Follow
            — User
This is actually a great way to allocate a role for each module. This allows us to make changes to a component, without breaking another, due to the fact that they are fairly loosely coupled.

## 5. Lightweight & Fast
<a href="http://cl.ly/image/0q2j20352G3L" target="_blank">Compared to other frameworks</a> and weighing in at 26.8 KB ([CDNJS](http://cdnjs.com/#react)), I consider React small, although it does so much (all of the ‘Virtual DOM’ heavy stuff). I will let [this video show you](http://www.youtube.com/watch?feature=player_embedded&v=1OeXsL5mr4g) what I can’t explain with just words. Honestly, it’s pretty impressive.

## 6. Plays nice with others
For myself, this one isn’t so much of a big reason to use React, but for you reading this thinking about giving it a go it’s worth mentioning that React doesn’t really care about the rest of your tech stack. It will play nice, even with the other frameworks mentioned above. Sure, most of them wouldn’t make much sense to add React on top, but from what I have been stumbling across on the web, Backbone in particular, goes nicely with React.

## Conclusion
I’m not sure whether it was a design choice or if it happened by chance, but the fact that it marries perfectly with progressive enhancement quite simply: does it for me. On top of that it does all this cool stuff with the ‘Virtual DOM’ and smart updates, the JSX, its size and its plug-’n-play nature makes React jump to the top of my list of Javascript Frameworks. I got a feeling that 2014 will be a big year for it too. So give React a shot, [watch this intro](http://www.youtube.com/watch?feature=player_embedded&v=XxVg_s8xAms) and let me know what you build with React & any of your thoughts on [twitter](http://www.twitter.com/waltercfilho).

### References
- [React | A JavaScript library for building user interfaces.](http://facebook.github.io/react/)
- [Versus.com](http://versus.com/en/ember-js-vs-react)