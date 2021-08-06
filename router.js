import Start from "./views/Start.js";
import Selection from "./views/Selection.js";
import Creator from "./views/Creator.js";
import Simulation from "./views/Simulation.js";


const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};


const router = async () => {
    const routes = [
        {path: "/", view: Start},
        {path: "/selection", view: Selection},
        {path: "/creator", view: Creator},
        {path: "/simulation", view: Simulation},
    ];

    // test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

    const view = new match.route.view(); // new instance of the view

    document.querySelector("#app").innerHTML = await view.getHtml();

};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    })
   router();
});
