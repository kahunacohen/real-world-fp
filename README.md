# Introducing a Functional Programming Paradigm to Existing Web App Code Bases

In this post I'll briefly discuss what functional programming is, the advantages we can reap from programming in this style and how to integrate elements of functional programming in a real-world, existing project that is generally written in a procedural and/or object-oriented style.


Functional programming is a paradigm wherein we solve larger problems by fitting together (or composing) small, focused, pure functions into a broader whole. Though the paradigm can get very academic, it boils down to the use of pure functions and immutable data structures over stateful objects and mutable data. The ideal result is more of a description of how to achieve the goal, rather than a step-by-step recipe how to get there.  

First, what are pure functions? Pure functions are simply functions that given an input x, always return the same output y. Additionally, a pure function performs no side-effects (such as writing to the screen, writing or reading a file, opening a network connection etc.)  in the process of calculating y. For example, this would not be a pure function:

https://github.com/kahunacohen/real-world-fx/blob/ae5b5345a2ab91b9c5d8af03322099bf83b72d58/src/add-rows-procedural/index.test.js#L3-L11
