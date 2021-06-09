# voronoi relaxation VS n-body simulation

Quick visual experiment to examine defferences and similarities between [voronoi relaxation](https://en.wikipedia.org/wiki/Lloyd%27s_algorithm) and [n-body simulation](https://en.wikipedia.org/wiki/N-body_simulation) as a means to space points apart. Voronoi relaxation is implemented with help from [d3-delaunay](https://en.wikipedia.org/wiki/Lloyd%27s_algorithm) for voronoi partitioning, and n-body simulation is approximated using [barnes-hut simulation](https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation) with help from [js-quadtree](https://www.npmjs.com/package/js-quadtree).


![Alt text](sim1.gif)

🔵 Spawn location
🍏 Barnes-hut simulation
🍎 Voronoi relaxation




## Ideas for furher investigation
* Approximate the difference numerically taking the average of the [cosine similarities](https://en.wikipedia.org/wiki/Cosine_similaries) of calculated forces of both methods.
* Use measure described above to optimize parameters of the models. How much alike can we get them to act?
